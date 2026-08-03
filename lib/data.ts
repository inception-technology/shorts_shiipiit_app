// shorts.shiipiit — contenu de démonstration.
//
// Le modèle porte à la fois le contenu éditorial (titres/sous-titres i18n, boutique,
// tags, segment) ET les champs qui font tourner la mesure de CTR sortant :
//   - `productUrl` → fiche produit de TA boutique (cible du CTA, via /go/[id]).
//   - `cta` → 'buy' (« Voir le produit », corail) ou 'quote' (« Demander un devis », dégradé).
// Remplace `poster`, `src` et `productUrl` par tes vraies vidéos verticales et tes
// fiches produit. Les prix ne sont volontairement PAS gérés ici : ils vivent dans le
// catalogue / la boutique. shorts.shiipiit ne fait que la découverte + le CTA.

import type { I18n, Locale, Segment } from "@/lib/i18n";

export type { Segment } from "@/lib/i18n";
export type Cta = "buy" | "quote";

export interface VideoItem {
  id: string;
  /** Segment / univers produit. */
  seg: Segment;
  /** 'buy' = achat direct ; 'quote' = demande de devis. */
  cta: Cta;
  /** Tuile « héro » sur 2 colonnes quand span === 2. */
  span: 1 | 2;
  /** Filtres applicables (voir FILTERS dans lib/i18n). */
  tags: string[];
  shop: string;
  title: I18n;
  /** Sous-titre / accroche. */
  cap: I18n;
  /**
   * Identifiant de la vidéo chez le prestataire (GUID Bunny Stream, ADR-02).
   * Renseigné → la lecture HLS, le poster et l'aperçu animé sont dérivés par
   * `lib/video.ts`. Absent → repli sur `poster` et `src` ci-dessous.
   * C'est ce champ, et lui seul, qui fait basculer une fiche de la
   * démonstration aux vraies vidéos.
   */
  videoId?: string;
  /**
   * Langues des pistes de sous-titres **effectivement déposées** sur le CDN.
   * Ne jamais y déclarer une langue non déposée : le lecteur afficherait une
   * option qui échoue en silence.
   */
  captionLangs?: Locale[];
  /** Poster vertical 9:16 — repli quand `videoId` est absent. */
  poster: string;
  /** URL de la vidéo (mp4/HLS). Vide = seul le poster s'affiche. */
  src?: string;
  /** Fiche produit de TA boutique (cible du CTA sortant). */
  productUrl: string;
}

// Poster de démonstration (à remplacer). Vertical 9:16.
const poster = (seed: string) => `https://picsum.photos/seed/${seed}/450/800`;
// Vidéo de démonstration verticale-friendly (à remplacer par tes vraies vidéos).
const demo = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
// Fiche produit factice de démonstration (à remplacer par ta boutique).
const shopUrl = (slug: string) => `https://ta-boutique.example/p/${slug}`;

export const ITEMS: VideoItem[] = [
  { id: "v01", seg: "electronics", cta: "buy", span: 2, tags: ["new", "demo"], shop: "Nordvolt",
    title: { fr: "SSD NVMe Gen5 — 14 000 Mo/s", en: "Gen5 NVMe SSD — 14,000 MB/s", zh: "Gen5 NVMe 固态硬盘 · 14,000 MB/s" },
    cap: { fr: "Transfert d’un projet 4K en huit secondes.", en: "A 4K project copied in eight seconds.", zh: "八秒完成一个 4K 项目的传输。" },
    // TEST 2026-08-03 — première vraie vidéo Bunny branchée sur la tuile héro.
    // Le titre et l'accroche restent ceux de la démonstration : seul le média est
    // réel. À déplacer sur la bonne fiche produit, ou à retirer, quand le
    // catalogue arrivera. Pas de `captionLangs` : aucune piste .vtt n'est encore
    // déposée, et en déclarer une produirait un 404 silencieux dans le lecteur.
    poster: poster("ssd-gen5"), videoId: "9ba80a3e-08f5-4038-af79-0e954f341012",
    src: demo, productUrl: shopUrl("ssd-nvme-gen5") },
  { id: "v02", seg: "furniture", cta: "quote", span: 1, tags: ["matiere"], shop: "Atelier Vernier",
    title: { fr: "Fauteuil Lign — chêne cintré", en: "Lign armchair — bent oak", zh: "Lign 扶手椅 · 弯曲橡木" },
    cap: { fr: "Le dossier est cintré à la vapeur en une pièce.", en: "The back is steam-bent in a single piece.", zh: "椅背由整块木材蒸汽弯曲成型。" },
    poster: poster("fauteuil-lign"), productUrl: shopUrl("fauteuil-lign") },
  { id: "v03", seg: "electronics", cta: "buy", span: 1, tags: ["unbox"], shop: "Kaido Optics",
    title: { fr: "Carte mère X870 — VRM 18 phases", en: "X870 board — 18-phase VRM", zh: "X870 主板 · 18 相供电" },
    cap: { fr: "Dix-huit phases, zéro throttling sous charge.", en: "Eighteen phases, no throttling under load.", zh: "十八相供电，满载不降频。" },
    poster: poster("carte-x870"), productUrl: shopUrl("carte-mere-x870") },
  { id: "v04", seg: "lighting", cta: "quote", span: 1, tags: ["atelier"], shop: "Maison Reval",
    title: { fr: "Suspension Orbe — verre soufflé", en: "Orbe pendant — blown glass", zh: "Orbe 吊灯 · 手工吹制玻璃" },
    cap: { fr: "Soufflée à la bouche, chaque orbe est unique.", en: "Mouth-blown — every orb differs.", zh: "每一颗玻璃球均为手工吹制。" },
    poster: poster("suspension-orbe"), productUrl: shopUrl("suspension-orbe") },
  { id: "v05", seg: "audio", cta: "buy", span: 1, tags: ["demo", "new"], shop: "Halo Acoustics",
    title: { fr: "Moniteur de studio A5 — 92 dB", en: "A5 studio monitor — 92 dB", zh: "A5 录音室监听 · 92 dB" },
    cap: { fr: "Réponse plate de 45 Hz à 22 kHz.", en: "Flat from 45 Hz to 22 kHz.", zh: "45 Hz 至 22 kHz 平直响应。" },
    poster: poster("moniteur-a5"), src: demo, productUrl: shopUrl("moniteur-studio-a5") },
  { id: "v06", seg: "furniture", cta: "quote", span: 2, tags: ["matiere", "atelier"], shop: "Studio Loft",
    title: { fr: "Table Meridian — noyer massif", en: "Meridian table — solid walnut", zh: "Meridian 餐桌 · 实心胡桃木" },
    cap: { fr: "Trois mètres, un seul plateau, aucun raccord.", en: "Three metres, one top, no joint.", zh: "三米长桌面，整块无拼接。" },
    poster: poster("table-meridian"), productUrl: shopUrl("table-meridian") },
  { id: "v07", seg: "desk", cta: "buy", span: 1, tags: ["setup"], shop: "Nordvolt",
    title: { fr: "Station d’accueil Thunderbolt 5", en: "Thunderbolt 5 dock", zh: "Thunderbolt 5 扩展坞" },
    cap: { fr: "Trois écrans, un seul câble.", en: "Three displays, one cable.", zh: "三块屏幕，一根线缆。" },
    poster: poster("dock-tb5"), productUrl: shopUrl("station-thunderbolt-5") },
  { id: "v08", seg: "furniture", cta: "quote", span: 1, tags: ["matiere"], shop: "Atelier Vernier",
    title: { fr: "Buffet Kaso — laque cendrée", en: "Kaso sideboard — ash lacquer", zh: "Kaso 餐边柜 · 灰烬漆面" },
    cap: { fr: "Sept couches de laque, poncées à la main.", en: "Seven lacquer coats, hand-sanded.", zh: "七层漆面，全手工打磨。" },
    poster: poster("buffet-kaso"), productUrl: shopUrl("buffet-kaso") },
  { id: "v09", seg: "electronics", cta: "buy", span: 1, tags: ["demo"], shop: "Kaido Optics",
    title: { fr: "Refroidissement AIO 360 — 22 dBA", en: "AIO 360 cooler — 22 dBA", zh: "AIO 360 水冷 · 22 dBA" },
    cap: { fr: "Plus silencieux qu’une pièce vide.", en: "Quieter than an empty room.", zh: "比空房间还安静。" },
    poster: poster("aio-360"), productUrl: shopUrl("refroidissement-aio-360") },
  { id: "v10", seg: "lighting", cta: "quote", span: 1, tags: ["setup"], shop: "Maison Reval",
    title: { fr: "Applique Trace — laiton brossé", en: "Trace sconce — brushed brass", zh: "Trace 壁灯 · 拉丝黄铜" },
    cap: { fr: "Le laiton se patine en six mois.", en: "The brass patinas within six months.", zh: "黄铜将在六个月内自然氧化。" },
    poster: poster("applique-trace"), productUrl: shopUrl("applique-trace") },
  { id: "v11", seg: "audio", cta: "buy", span: 1, tags: ["unbox", "new"], shop: "Halo Acoustics",
    title: { fr: "Casque de référence R2 — 250 Ω", en: "R2 reference headphones — 250 Ω", zh: "R2 监听耳机 · 250 Ω" },
    cap: { fr: "Coussinets en velours remplaçables.", en: "Replaceable velour pads.", zh: "可更换绒面耳罩。" },
    poster: poster("casque-r2"), productUrl: shopUrl("casque-reference-r2") },
  { id: "v12", seg: "desk", cta: "quote", span: 1, tags: ["setup", "atelier"], shop: "Studio Loft",
    title: { fr: "Bureau assis-debout Alto", en: "Alto sit-stand desk", zh: "Alto 升降办公桌" },
    cap: { fr: "De 68 à 124 cm en neuf secondes.", en: "68 to 124 cm in nine seconds.", zh: "九秒内从 68 升至 124 厘米。" },
    poster: poster("bureau-alto"), productUrl: shopUrl("bureau-assis-debout-alto") },
  { id: "v13", seg: "electronics", cta: "buy", span: 1, tags: ["new"], shop: "Nordvolt",
    title: { fr: "Alimentation 1200 W — Titanium", en: "1200 W PSU — Titanium", zh: "1200 W 电源 · 钛金牌" },
    cap: { fr: "Rendement 94 % à pleine charge.", en: "94 % efficiency at full load.", zh: "满载效率 94 %。" },
    poster: poster("psu-1200w"), productUrl: shopUrl("alimentation-1200w-titanium") },
  { id: "v14", seg: "furniture", cta: "quote", span: 1, tags: ["atelier"], shop: "Maison Reval",
    title: { fr: "Paravent Sōmi — frêne et papier", en: "Sōmi screen — ash and paper", zh: "Sōmi 屏风 · 白蜡木与和纸" },
    cap: { fr: "Le papier washi est tendu à la main.", en: "The washi paper is stretched by hand.", zh: "和纸由手工绷制。" },
    poster: poster("paravent-somi"), productUrl: shopUrl("paravent-somi") },
];

/** Alias rétro-compatible. */
export const videos = ITEMS;
