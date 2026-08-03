import "server-only";

// shorts.shiipiit — couche d'abstraction vidéo (partie privilégiée).
//
// ⚠️ **Serveur uniquement.** Ce module porte la clé d'API Bunny. L'import
// `server-only` en tête fait échouer la compilation si un composant client
// l'importe par erreur — c'est une barrière, pas une convention.
//
// Sert au téléversement depuis la France (chaîne de production actée en ADR-02 :
// masters déposés sur Google Drive depuis la Chine, téléversés d'ici).
//
// Variables d'environnement :
//   BUNNY_STREAM_API_KEY      clé de la bibliothèque (secrète)
//   BUNNY_STREAM_LIBRARY_ID   identifiant de la bibliothèque
//   BUNNY_API_BASE            (tests uniquement) URL de base alternative
//
// API Bunny utilisée (documentation officielle) :
//   POST https://video.bunnycdn.com/library/{libraryId}/videos     → crée l'entrée
//   PUT  https://video.bunnycdn.com/library/{libraryId}/videos/{id} → envoie le fichier
//   En-tête d'authentification : `AccessKey`.

import { analyserNomMaster, type VideoId } from "@/lib/video";

// Surchargeable pour les tests d'intégration ; en production, laisser vide.
const BASE = process.env.BUNNY_API_BASE ?? "https://video.bunnycdn.com";
const TIMEOUT_META_MS = 10_000;
const TIMEOUT_UPLOAD_MS = 30 * 60_000; // un master de plusieurs centaines de Mo

export interface VideoMeta {
  id: VideoId;
  titre: string;
  /** 0 = en file, 1–3 = traitement, 4 = prêt, 5 = échec (statuts Bunny). */
  statut: number;
  pret: boolean;
  dureeSec?: number;
  largeur?: number;
  hauteur?: number;
}

export class VideoAdminError extends Error {
  constructor(message: string, readonly statusHttp?: number) {
    super(message);
    this.name = "VideoAdminError";
  }
}

function config(): { key: string; library: string } {
  const key = process.env.BUNNY_STREAM_API_KEY;
  const library = process.env.BUNNY_STREAM_LIBRARY_ID;
  if (!key || !library) {
    throw new VideoAdminError(
      "BUNNY_STREAM_API_KEY ou BUNNY_STREAM_LIBRARY_ID manquant : téléversement impossible."
    );
  }
  return { key, library };
}

async function appel<T>(
  chemin: string,
  init: RequestInit,
  timeoutMs: number
): Promise<T> {
  const { key, library } = config();
  const res = await fetch(`${BASE}/library/${library}${chemin}`, {
    ...init,
    headers: { AccessKey: key, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) {
    const corps = await res.text().catch(() => "");
    throw new VideoAdminError(
      `Bunny a répondu ${res.status} sur ${chemin}${corps ? ` — ${corps.slice(0, 300)}` : ""}`,
      res.status
    );
  }
  return (await res.json().catch(() => ({}))) as T;
}

interface ReponseBunny {
  guid?: string;
  title?: string;
  status?: number;
  length?: number;
  width?: number;
  height?: number;
}

function versMeta(r: ReponseBunny): VideoMeta {
  return {
    id: r.guid ?? "",
    titre: r.title ?? "",
    statut: r.status ?? 0,
    pret: r.status === 4,
    dureeSec: r.length,
    largeur: r.width,
    hauteur: r.height,
  };
}

/** Crée l'entrée vidéo et retourne son identifiant, avant tout envoi de fichier. */
export async function creer(titre: string): Promise<VideoMeta> {
  const r = await appel<ReponseBunny>(
    "/videos",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: titre }),
    },
    TIMEOUT_META_MS
  );
  if (!r.guid) throw new VideoAdminError("Réponse Bunny sans identifiant de vidéo.");
  return versMeta(r);
}

/** Envoie le fichier sur une entrée déjà créée. */
export async function envoyerFichier(id: VideoId, fichier: Uint8Array | Blob): Promise<void> {
  await appel<unknown>(
    `/videos/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "content-type": "application/octet-stream" },
      body: fichier as BodyInit,
    },
    TIMEOUT_UPLOAD_MS
  );
}

/** État d'une vidéo — utile pour attendre la fin de l'encodage avant publication. */
export async function etat(id: VideoId): Promise<VideoMeta> {
  return versMeta(await appel<ReponseBunny>(`/videos/${encodeURIComponent(id)}`, { method: "GET" }, TIMEOUT_META_MS));
}

export interface ResultatTeleversement {
  id: VideoId;
  titre: string;
  /** SKU déduit du nom de fichier, quand la convention est respectée. */
  sku: string | null;
  /** Signalé quand le nom ne suit pas `SKU_sujet_vNN.mp4`. */
  avertissement?: string;
}

/**
 * Téléverse un master : création puis envoi, en une opération.
 *
 * Le titre est dérivé du nom de fichier. Si celui-ci respecte la convention
 * `SKU_sujet_vNN.mp4`, le SKU est extrait et retourné — c'est lui qui permettra
 * de rapprocher la vidéo de sa fiche produit sans saisie manuelle. Sinon, le
 * téléversement se fait quand même mais **avec un avertissement** : mieux vaut
 * une vidéo en ligne mal nommée qu'un échec bloquant, à condition de le voir.
 */
export async function televerserMaster(
  nomFichier: string,
  contenu: Uint8Array | Blob
): Promise<ResultatTeleversement> {
  const analyse = analyserNomMaster(nomFichier);
  const titre = nomFichier.replace(/\.(mp4|mov)$/i, "");

  const cree = await creer(titre);
  await envoyerFichier(cree.id, contenu);

  return {
    id: cree.id,
    titre,
    sku: analyse?.sku ?? null,
    avertissement: analyse
      ? undefined
      : `Nom de fichier hors convention : « ${nomFichier} ». Attendu : SKU_sujet_vNN.mp4. Le rapprochement automatique avec la fiche produit ne sera pas possible.`,
  };
}
