// shorts.shiipiit — couche d'abstraction vidéo (partie publique, isomorphe).
//
// ADR-02 : le prestataire retenu est **Bunny Stream**. Ce module est la SEULE
// porte d'entrée du reste du code vers la vidéo. Aucun composant, aucune page ne
// doit connaître le nom du prestataire ni construire une URL à la main —
// c'est ce qui rend la décision réversible (changer de prestataire = réécrire ce
// fichier, pas l'application).
//
// ⚠️ Séparation volontaire en deux fichiers :
//   - `lib/video.ts`       (ici)  → dérivation d'URL **pure**, sans secret,
//                                    utilisable côté client comme serveur ;
//   - `lib/video-admin.ts`        → téléversement et lecture de métadonnées,
//                                    **serveur uniquement**, porte la clé d'API.
// Ne jamais importer `video-admin` depuis un composant client : la clé finirait
// dans le bundle.
//
// Variables d'environnement (publiques, sans secret) :
//   NEXT_PUBLIC_VIDEO_CDN_HOST   nom d'hôte de la pull zone (ex. vz-xxxx.b-cdn.net)
//   NEXT_PUBLIC_VIDEO_LIBRARY_ID identifiant de la bibliothèque Bunny Stream

import type { Locale } from "@/lib/i18n";

/** Identifiant d'une vidéo chez le prestataire (GUID côté Bunny). */
export type VideoId = string;

export interface VideoSources {
  /** Playlist HLS adaptative, à donner à <video> ou au lecteur. */
  hls: string;
  /** Image fixe 9:16 utilisée comme poster de la grille. */
  poster: string;
  /** Prévisualisation animée, pour l'aperçu au survol. */
  preview: string;
}

export interface VideoCaption {
  lang: Locale;
  url: string;
  label: string;
}

/**
 * Motifs de chemins sur le CDN.
 *
 * Vérifiés le 2026-08-03 contre la documentation officielle Bunny
 * (https://bunny.net/docs/stream/storage-structure) : la base est
 * `https://{pull_zone}.b-cdn.net/{video_id}/`, puis `playlist.m3u8`,
 * `thumbnail.jpg`, `preview.webp`, `captions/{code_langue}.vtt`.
 *
 * Deux réserves connues, à lever au premier téléversement réel :
 *   - le nom du poster est **configurable par vidéo** (champ `thumbnailFileName`
 *     de l'API) ; `thumbnail.jpg` n'est que la valeur par défaut ;
 *   - les pistes de sous-titres n'existent que si elles ont été déposées
 *     (cf. ADR-02 : fichiers séparés, jamais incrustés).
 *
 * Tout est regroupé ici pour qu'une correction tienne en une ligne.
 */
const CHEMINS = {
  hls: (id: VideoId) => `${id}/playlist.m3u8`,
  poster: (id: VideoId) => `${id}/thumbnail.jpg`,
  preview: (id: VideoId) => `${id}/preview.webp`,
  caption: (id: VideoId, lang: string) => `${id}/captions/${lang}.vtt`,
} as const;

const CDN_HOST = process.env.NEXT_PUBLIC_VIDEO_CDN_HOST ?? "";

/** Vrai si la configuration publique est présente. */
export function videoConfigure(): boolean {
  return CDN_HOST.length > 0;
}

function base(): string {
  return `https://${CDN_HOST.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
}

/**
 * Construit les URL de lecture d'une vidéo.
 * Retourne `null` si la configuration est absente : l'appelant retombe alors sur
 * le poster statique de `lib/data.ts`, ce qui permet de développer sans compte.
 */
export function sources(id: VideoId | undefined): VideoSources | null {
  if (!id || !videoConfigure()) return null;
  const b = base();
  return {
    hls: `${b}/${CHEMINS.hls(id)}`,
    poster: `${b}/${CHEMINS.poster(id)}`,
    preview: `${b}/${CHEMINS.preview(id)}`,
  };
}

/** Libellés des pistes de sous-titres, dans la langue de la piste. */
const LIBELLES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  zh: "中文",
};

/**
 * Pistes de sous-titres disponibles. `langs` provient des métadonnées de la
 * vidéo : on ne déclare jamais une piste qui n'existe pas, sinon le lecteur
 * affiche une option qui échoue silencieusement.
 */
export function captions(id: VideoId | undefined, langs: Locale[]): VideoCaption[] {
  if (!id || !videoConfigure()) return [];
  const b = base();
  return langs.map((lang) => ({
    lang,
    url: `${b}/${CHEMINS.caption(id, lang)}`,
    label: LIBELLES[lang],
  }));
}

/**
 * Poster d'une vidéo, avec repli sur l'image fournie dans les données.
 * C'est la fonction que doivent appeler la grille et le lecteur : elle gère
 * seule la transition entre le contenu de démonstration et les vraies vidéos.
 */
export function poster(id: VideoId | undefined, repli: string): string {
  return sources(id)?.poster ?? repli;
}

/**
 * Convention de nommage des masters : `SKU_sujet_vNN.mp4`.
 * Permet de rapprocher automatiquement une vidéo de sa fiche produit.
 * Retourne `null` si le nom ne suit pas la convention — à traiter comme une
 * erreur de dépôt, pas comme un cas normal.
 */
export function analyserNomMaster(
  nom: string
): { sku: string; sujet: string; version: number } | null {
  const m = /^([A-Z0-9-]+)_([a-z0-9-]+)_v(\d{2})\.(mp4|mov)$/i.exec(nom.trim());
  if (!m) return null;
  return { sku: m[1]!.toUpperCase(), sujet: m[2]!.toLowerCase(), version: Number(m[3]) };
}
