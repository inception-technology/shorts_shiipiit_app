#!/usr/bin/env node
// shorts.shiipiit — vérification de bout en bout de la configuration Bunny Stream.
//
// Ce script ne modifie rien. Il répond à quatre questions, dans cet ordre :
//   1. la clé d'API et l'identifiant de bibliothèque sont-ils valides ?
//   2. la bibliothèque contient-elle des vidéos, et sont-elles encodées ?
//   3. les URL publiques dérivées par `lib/video.ts` répondent-elles vraiment ?
//   4. le master respecte-t-il le cahier des charges d'ADR-02 ?
//
// Le point 3 est celui qui compte : il confirme les motifs de chemins CDN
// (playlist.m3u8 / thumbnail.jpg / preview.webp / captions/xx.vtt) sur une
// bibliothèque réelle, plutôt que sur la documentation.
//
// Usage :
//   npm run verif:bunny
//
// Variables lues (depuis .env.local si présent, sinon l'environnement) :
//   BUNNY_STREAM_API_KEY, BUNNY_STREAM_LIBRARY_ID, NEXT_PUBLIC_VIDEO_CDN_HOST
//   BUNNY_API_BASE  (tests uniquement)
//   VERIF_REFERER   (optionnel) origine à envoyer en en-tête Referer — nécessaire
//                   si la bibliothèque restreint l'accès par domaine autorisé.

import { readFileSync, existsSync } from "node:fs";

// --- configuration -------------------------------------------------------

function chargerEnvLocal() {
  for (const f of [".env.local", ".env"]) {
    if (!existsSync(f)) continue;
    for (const ligne of readFileSync(f, "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(ligne);
      if (!m) continue;
      const valeur = m[2].split("#")[0].trim().replace(/^["']|["']$/g, "");
      if (valeur && process.env[m[1]] === undefined) process.env[m[1]] = valeur;
    }
  }
}

chargerEnvLocal();

const CLE = process.env.BUNNY_STREAM_API_KEY;
const BIBLIO = process.env.BUNNY_STREAM_LIBRARY_ID;
const HOTE_BRUT = (process.env.NEXT_PUBLIC_VIDEO_CDN_HOST ?? "").replace(/\/+$/, "");
const HOTE = HOTE_BRUT.replace(/^https?:\/\//, "");
// En production le schéma est toujours https, comme dans lib/video.ts. Un http://
// explicite n'est honoré que pour pointer un serveur local pendant les tests.
const SCHEMA = HOTE_BRUT.startsWith("http://") ? "http" : "https";
const BASE = process.env.BUNNY_API_BASE ?? "https://video.bunnycdn.com";
const REFERER = process.env.VERIF_REFERER ?? "";

const V = "✓";
const X = "✗";
const T = "!";

// Tarifs Bunny affiches publiquement (« a partir de »), en dollars.
// Les regions hors Europe/Amerique du Nord coutent davantage : ces montants sont
// donc un PLANCHER. A remplacer par la facture reelle des que le trafic existe.
const TARIF_STOCKAGE_GO = 0.01; // $/Go/mois
const TARIF_DIFFUSION_GO = 0.005; // $/Go diffuse

/**
 * Volume diffuse pour une vue complete, en Mo.
 * Hypothese : le lecteur adaptatif se stabilise autour de 2,5 Mbit/s (720p), ce
 * qui est le palier courant sur mobile pour une video verticale. `[Hypothese]` —
 * a remplacer par la mesure reelle des statistiques Bunny.
 */
function estimerMoParVue(dureeSec) {
  const MBIT_PAR_SEC = 2.5;
  return (dureeSec * MBIT_PAR_SEC) / 8;
}

let echecs = 0;
const dire = (etat, texte) => {
  if (etat === X) echecs++;
  console.log(`${etat} ${texte}`);
};
const note = (texte) => console.log(`    ${texte}`);

const STATUTS = {
  0: "en file",
  1: "televersee",
  2: "traitement",
  3: "encodage",
  4: "prete",
  5: "echec",
  6: "presentee",
  7: "en attente d'upload",
};

/** Aide affichée quand le CDN répond 403 : ce n'est jamais un problème de chemin. */
function aideSur403() {
  note("Bunny a repondu, le chemin est donc correct : c'est un refus d'acces.");
  note("Tableau de bord > Stream > bibliotheque > Securite, dans cet ordre :");
  note("  1. « Enable Direct Play » / « Direct Play » doit etre ACTIVE.");
  note("     Sans lui, seule la lecture via le lecteur iframe de Bunny fonctionne,");
  note("     ce qui nous ferait perdre le controle du lecteur vertical immersif.");
  note("  2. « Block direct URL file access » doit etre DESACTIVE, ou bien les");
  note("     domaines autorises doivent inclure le site appelant.");
  note("  3. « Allowed / Blocked domains » : verifier que shorts.shiipiit.com y est");
  note("     (sans http://) et qu'aucun domaine utile n'est bloque.");
  note("  4. « Token authentication » et « MediaCage DRM » doivent etre DESACTIVES");
  note("     pour l'instant — ils imposent une signature sur chaque URL.");
  note("Si des domaines autorises sont configures, ce script est refuse par nature");
  note("(un appel serveur n'envoie pas de Referer). Relancer alors avec :");
  note("  VERIF_REFERER=https://shorts.shiipiit.com/ npm run verif:bunny");
}

async function main() {
  // --- 1. configuration présente -----------------------------------------

  console.log("\n=== 1. Configuration ===");
  if (!CLE) dire(X, "BUNNY_STREAM_API_KEY absente");
  else dire(V, `BUNNY_STREAM_API_KEY presente (${CLE.length} caracteres)`);

  if (!BIBLIO) dire(X, "BUNNY_STREAM_LIBRARY_ID absent");
  else dire(V, `BUNNY_STREAM_LIBRARY_ID = ${BIBLIO}`);

  if (!HOTE) {
    dire(X, "NEXT_PUBLIC_VIDEO_CDN_HOST absent (ex. vz-xxxxxxx-xxx.b-cdn.net)");
  } else if (!HOTE.includes(".")) {
    // Erreur la plus probable : le tableau de bord affiche le sous-domaine seul.
    // Sans suffixe le nom ne resout pas, et l'echec ressemble a un mauvais
    // chemin alors que c'est un probleme de DNS.
    dire(X, `NEXT_PUBLIC_VIDEO_CDN_HOST = ${HOTE} — nom d'hote incomplet`);
    note(`Il manque le domaine. Attendu : ${HOTE}.b-cdn.net`);
  } else {
    dire(V, `NEXT_PUBLIC_VIDEO_CDN_HOST = ${HOTE}`);
  }

  if (REFERER) dire(V, `Referer envoye pour les tests CDN : ${REFERER}`);

  if (!CLE || !BIBLIO) {
    console.log("\nConfiguration incomplete : arret avant tout appel reseau.\n");
    return 1;
  }

  // --- 2. API : la bibliothèque répond -----------------------------------

  console.log("\n=== 2. API Bunny ===");

  async function api(chemin) {
    const res = await fetch(`${BASE}/library/${BIBLIO}${chemin}`, {
      headers: { AccessKey: CLE, accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const corps = await res.text().catch(() => "");
      throw new Error(
        `HTTP ${res.status} sur ${chemin}${corps ? ` — ${corps.slice(0, 200)}` : ""}`
      );
    }
    return res.json();
  }

  let videos = [];
  try {
    const liste = await api("/videos?page=1&itemsPerPage=10&orderBy=date");
    videos = liste.items ?? [];
    dire(
      V,
      `authentification acceptee — ${liste.totalItems ?? videos.length} video(s) dans la bibliotheque`
    );
  } catch (e) {
    dire(X, `appel API en echec : ${e.message}`);
    note("Causes frequentes : cle d'API d'une autre bibliotheque, ou Account API Key");
    note("du compte utilisee a la place de la cle de bibliotheque Stream.");
    return 1;
  }

  if (videos.length === 0) {
    console.log(
      "\nBibliotheque vide : les chemins CDN ne peuvent pas etre verifies." +
        "\nTeleversez une video puis relancez.\n"
    );
    return echecs ? 1 : 0;
  }

  for (const v of videos.slice(0, 5)) {
    const etat = STATUTS[v.status] ?? `statut ${v.status}`;
    dire(
      v.status === 4 ? V : T,
      `${v.guid} — « ${v.title} » — ${etat} — ${v.width}x${v.height}, ${v.length}s`
    );
  }

  const cible = videos.find((v) => v.status === 4);
  if (!cible) {
    console.log("\nAucune video encodee (statut 4) : reessayez dans quelques minutes.\n");
    return echecs ? 1 : 0;
  }

  // --- 3. chemins CDN ----------------------------------------------------

  console.log(`\n=== 3. Chemins CDN (video ${cible.guid}) ===`);

  if (!HOTE || !HOTE.includes(".")) {
    console.log(
      "Hote CDN absent ou incomplet : impossible de verifier les chemins publics." +
        "\nCorriger NEXT_PUBLIC_VIDEO_CDN_HOST dans .env.local, puis relancer.\n"
    );
    return 1;
  }

  const racine = `${SCHEMA}://${HOTE}/${cible.guid}`;

  // Ces motifs DOIVENT rester alignes sur `CHEMINS` dans lib/video.ts.
  const aTester = [
    { nom: "HLS       ", url: `${racine}/playlist.m3u8`, requis: true },
    { nom: "poster    ", url: `${racine}/thumbnail.jpg`, requis: true },
    { nom: "preview   ", url: `${racine}/preview.webp`, requis: true },
  ];

  if (cible.thumbnailFileName && cible.thumbnailFileName !== "thumbnail.jpg") {
    aTester.push({
      nom: "poster*   ",
      url: `${racine}/${cible.thumbnailFileName}`,
      requis: false,
      apres: `nom de poster personnalise renvoye par l'API : ${cible.thumbnailFileName}`,
    });
  }

  for (const piste of cible.captions ?? []) {
    aTester.push({
      nom: `vtt ${String(piste.srclang).padEnd(6)}`,
      url: `${racine}/captions/${piste.srclang}.vtt`,
      requis: false,
      siEchec:
        "piste declaree par l'API mais absente du CDN — verifier le depot du .vtt, " +
        "ou reessayer dans quelques minutes (propagation).",
    });
  }

  let vu403 = false;
  const enTetes = { range: "bytes=0-511" };
  if (REFERER) {
    enTetes.referer = REFERER;
    try {
      enTetes.origin = new URL(REFERER).origin;
    } catch {
      /* referer libre : on n'invente pas d'origine */
    }
  }

  for (const t of aTester) {
    try {
      const res = await fetch(t.url, {
        method: "GET",
        headers: enTetes,
        signal: AbortSignal.timeout(15000),
      });
      const type = res.headers.get("content-type") ?? "?";
      // Toujours vider le corps : laisser une reponse ouverte fait planter
      // Node a la sortie du processus sous Windows (assertion libuv).
      await res.arrayBuffer().catch(() => {});
      if (res.ok || res.status === 206) {
        dire(V, `${t.nom} ${res.status} ${type}`);
      } else {
        dire(t.requis ? X : T, `${t.nom} ${res.status} — ${t.url}`);
        if (res.status === 403) vu403 = true;
        if (t.siEchec) note(t.siEchec);
      }
    } catch (e) {
      // Distinguer « le serveur a repondu non » de « je n'ai pas pu joindre le
      // serveur » : deux causes opposees, et la seconde ne dit rien des chemins.
      const cause = e?.cause?.code ?? e?.code ?? "";
      const reseau = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ECONNRESET|CERT/i.test(
        `${cause} ${e.message}`
      );
      dire(t.requis ? X : T, `${t.nom} injoignable — ${e.message}${cause ? ` (${cause})` : ""}`);
      if (reseau) {
        note(`Probleme de connexion, pas de chemin : verifier que ${HOTE} est bien`);
        note("le nom d'hote complet de la pull zone (il se termine par .b-cdn.net).");
      }
      if (t.siEchec) note(t.siEchec);
    }
    if (t.apres) note(t.apres);
  }

  if (vu403) {
    console.log("");
    aideSur403();
  }

  // --- 4. conformité du master (ADR-02) ----------------------------------
  //
  // Ces controles ne font jamais echouer le script : ils portent sur le contenu,
  // pas sur la configuration. Mais un master hors spec se voit a l'ecran et ne se
  // rattrape pas apres coup — mieux vaut le savoir au televersement.

  console.log("\n=== 4. Conformite du master (ADR-02) ===");

  // La fiche detaillee porte des champs absents de la liste : messages de
  // transcodage, resolutions produites, poids stocke. C'est ce qui permet de
  // distinguer « master de mauvaise qualite » de « probleme d'encodage ».
  let detail = cible;
  try {
    detail = { ...cible, ...(await api(`/videos/${encodeURIComponent(cible.guid)}`)) };
  } catch {
    note("fiche detaillee indisponible — controle sur les donnees de la liste");
  }

  const l = detail.width ?? 0;
  const h = detail.height ?? 0;
  const d = detail.length ?? 0;

  if (!l || !h) {
    dire(T, "dimensions inconnues — controle impossible");
  } else {
    const ratio = l / h;
    const attendu = 9 / 16;
    if (Math.abs(ratio - attendu) < 0.01) dire(V, `format ${l}x${h} — 9:16 conforme`);
    else
      dire(
        T,
        `format ${l}x${h} — ratio ${ratio.toFixed(3)} au lieu de ${attendu.toFixed(3)} (9:16). ` +
          "Le lecteur ajoutera des bandes ou recadrera."
      );

    if (h >= 1920) dire(V, `definition ${l}x${h} — conforme (1080x1920 attendu)`);
    else
      dire(
        T,
        `definition ${l}x${h} — tres en dessous de 1080x1920. Voir le diagnostic ` +
          "d'origine ci-dessous avant de conclure."
      );
  }

  // Regle ADR-02, assouplie le 2026-08-03 : objectif 30-65 s, bornes d'alerte a
  // 15 s et 90 s. Entre les deux, c'est hors objectif mais acceptable — le sujet
  // commande. Voir MONETISATION-VIDEO.md pour le seuil de monetisation TikTok
  // (1 minute), qui reste hors d'atteinte au volume actuel.
  if (!d) dire(T, "duree inconnue");
  else if (d >= 30 && d <= 65) dire(V, `duree ${d}s — dans l'objectif 30-65s`);
  else if (d < 15)
    dire(
      T,
      `duree ${d}s — sous la borne de 15s. Trop court pour montrer un produit : ` +
        "la vidéo sera vue mais ne dira rien."
    );
  else if (d > 90)
    dire(
      T,
      `duree ${d}s — au-dela de la borne de 90s. Rien ne l'interdit (YouTube va ` +
        "jusqu'a 3 min), mais la complétion chute, donc la diffusion, donc le trafic " +
        "boutique — et la bande passante double tous les 30s (R-01)."
    );
  else dire(V, `duree ${d}s — hors objectif 30-65s mais dans les bornes acceptables`);

  // --- 4bis. diagnostic d'origine du fichier ------------------------------
  //
  // Quand la definition est basse, la question n'est pas « est-ce mauvais » mais
  // « d'ou vient la perte ». Ces trois indices repondent presque toujours :
  //   - les resolutions produites reflètent la source (Bunny n'invente pas de pixels) ;
  //   - le poids stocke rapporte a la duree donne le debit reel ;
  //   - les messages de transcodage contiennent les avertissements de Bunny.

  const res = detail.availableResolutions;
  const fps = detail.framerate;
  const poids = detail.storageSize;
  const rotation = detail.rotation;

  if (res || fps || poids) {
    console.log("");
    if (res) dire(T, `resolutions produites : ${res}`);
    if (fps) {
      const n = Number(fps);
      if (n === 30 || n === 60) dire(V, `images par seconde : ${fps}`);
      else if (Math.abs(n - 29.97) < 0.02 || Math.abs(n - 59.94) < 0.02)
        dire(T, `images par seconde : ${fps} — cadence NTSC, ADR-02 demande 30 exact`);
      else dire(T, `images par seconde : ${fps} — attendu 30 constant (ADR-02)`);
    }
    if (poids && d) {
      // ⚠️ `storageSize` est le poids TOTAL stocke par Bunny pour cette video :
      // l'original ET tous les rendus. Ce n'est donc PAS le debit du master, et
      // en deduire un Mbit/s source serait faux. On s'en sert pour deux choses
      // legitimes : le cout de stockage, et un plancher de qualite (un total
      // tres bas ne peut pas contenir un master 1080p correct).
      const mo = poids / 1024 / 1024;
      const go = poids / 1024 ** 3;
      // Le stockage est structurellement negligeable : on l'exprime pour 100
      // videos, sinon le chiffre est illisible et n'apprend rien.
      const cent = go * 100 * TARIF_STOCKAGE_GO;
      dire(V, `poids stocke ${mo.toFixed(1)} Mo (original + rendus) — ~${cent.toFixed(2)} $/mois pour 100 videos de ce poids`);
      // Ordre de grandeur : un master 1080p de 30 s pese au moins ~20 Mo, et les
      // rendus autant. Sous ~1 Mo par seconde de video, la source etait deja
      // compressee avant de nous parvenir.
      if (mo / d < 1) {
        dire(T, `soit ${(mo / d).toFixed(2)} Mo par seconde — trop peu pour un master 1080p`);
        note("La perte est ANTERIEURE au televersement : le fichier recu etait deja");
        note("compresse. Bunny ne peut pas restituer des pixels absents de la source.");
        note("Pistes : transit par une messagerie (WeChat recompresse au-dela de 25 Mo),");
        note("fichier recupere depuis une plateforme sociale, ou export en preset « web ».");
      }
      // Cout de diffusion : c'est lui qui porte le risque R-01, pas le stockage.
      const moParVue = estimerMoParVue(d);
      const mille = (moParVue * 1000) / 1024 * TARIF_DIFFUSION_GO;
      dire(
        V,
        `diffusion estimee ~${moParVue.toFixed(0)} Mo par vue complete — ` +
          `~${mille.toFixed(2)} $ pour 1 000 vues completes`
      );
    }
    if (rotation) dire(T, `rotation declaree : ${rotation}° — verifier l'orientation reelle`);
  }

  const messages = detail.transcodingMessages;
  if (Array.isArray(messages) && messages.length) {
    console.log("");
    for (const m of messages) {
      const texte = typeof m === "string" ? m : (m.message ?? JSON.stringify(m));
      dire(T, `message de transcodage : ${texte}`);
    }
  }

  const nom = String(detail.title ?? "").trim();
  if (/^[A-Z0-9-]+_[a-z0-9-]+_v\d{2}(\.(mp4|mov))?$/i.test(nom))
    dire(V, `nommage « ${nom} » — conforme a SKU_sujet_vNN`);
  else
    dire(
      T,
      `nommage « ${nom} » — hors convention SKU_sujet_vNN. Le rapprochement ` +
        "automatique avec la fiche produit ne sera pas possible."
    );

  console.log(
    echecs === 0
      ? `\n${V} Chemins confirmes sur une bibliotheque reelle. lib/video.ts peut etre branche dans la grille et le lecteur.\n`
      : `\n${X} ${echecs} verification(s) en echec.\n`
  );
  return echecs ? 1 : 0;
}

// `process.exit()` coupe le processus alors que des connexions restent ouvertes,
// ce qui declenche une assertion libuv sous Windows. On pose le code de sortie et
// on laisse Node terminer proprement.
main().then(
  (code) => {
    process.exitCode = code;
  },
  (e) => {
    console.error(`\n${X} Erreur inattendue : ${e?.stack ?? e}\n`);
    process.exitCode = 1;
  }
);
