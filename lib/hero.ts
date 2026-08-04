// shorts.shiipiit — contenus de la section « à la une ».
//
// Cette section est la première chose que voit un visiteur arrivant depuis un
// réseau social. Elle sert à deux choses, et à deux choses seulement :
//   - mettre en avant un contenu (une vidéo, un produit, un sujet) ;
//   - porter un message promotionnel (arrivage, opération, annonce).
//
// **Plafond de dix éléments, volontaire.** Un carrousel que personne ne fait
// défiler jusqu'au bout ne met rien en avant : au-delà de quelques cartes, les
// dernières ne sont jamais vues et donnent la fausse impression d'avoir
// communiqué. Le plafond force à choisir.

import type { I18n } from "@/lib/i18n";

/** Nombre maximal de cartes affichées. Voir l'explication ci-dessus. */
export const HERO_MAX = 10;

export interface HeroItem {
  id: string;
  /**
   * `video` affiche un poster et laisse la carte visible se lire en boucle ;
   * `image` reste fixe ; `message` est une carte purement typographique, pour
   * une annonce qui n'a pas de visuel.
   */
  kind: "video" | "image" | "message";
  /** Surtitre court : « Nouveauté », « Arrivage », « -20 % »… */
  eyebrow?: I18n;
  title: I18n;
  body?: I18n;
  /** Image de fond, ou poster de la vidéo. Absente pour une carte `message`. */
  image?: string;
  /**
   * Identifiant Bunny. Renseigné → la carte visible lit la vidéo en boucle et
   * en silence. Les autres cartes restent sur leur poster : faire tourner trois
   * flux en parallèle sur la page d'accueil coûterait de la bande passante pour
   * des vidéos que le visiteur ne regarde pas (risque R-01).
   */
  videoId?: string;
  /** Destination au clic. Chemin interne (`/v/v01`) ou URL complète. */
  href?: string;
  /** Libellé du bouton. Sans lui, la carte entière reste cliquable. */
  cta?: I18n;
  /**
   * Habillage d'une carte `message`, quand il n'y a pas d'image :
   * `accent` = corail, `brand` = dégradé bleu-violet, `sombre` = anthracite.
   */
  ton?: "accent" | "brand" | "sombre";
}

// Contenu de démonstration — à remplacer par les vraies mises en avant.
// Les images de démonstration viennent de picsum, comme dans `lib/data.ts`.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/600`;

const BRUT: HeroItem[] = [
  {
    id: "h01",
    kind: "message",
    ton: "brand",
    eyebrow: { fr: "Le principe", en: "The idea", zh: "理念" },
    title: {
      fr: "Le prix sortie d’usine, sans l’intermédiaire",
      en: "Factory-gate prices, without the middleman",
      zh: "出厂价，没有中间商",
    },
    body: {
      fr: "On sélectionne en Chine, on vérifie sur place, on expédie en direct.",
      en: "We source in China, check on site, and ship direct.",
      zh: "在中国甄选，实地验货，直接发货。",
    },
    href: "/about",
    cta: { fr: "Notre démarche", en: "How we work", zh: "了解我们" },
  },
  {
    id: "h02",
    kind: "video",
    eyebrow: { fr: "À la une", en: "Featured", zh: "精选" },
    title: {
      fr: "Dans les ateliers de Foshan",
      en: "Inside the Foshan workshops",
      zh: "走进佛山工厂",
    },
    body: {
      fr: "Là où sont fabriqués les meubles que tu verras ici.",
      en: "Where the furniture you see here is made.",
      zh: "这里的家具就在这里诞生。",
    },
    image: img("foshan-atelier"),
    href: "/v/v06",
  },
  {
    id: "h03",
    kind: "image",
    eyebrow: { fr: "Arrivage", en: "New in", zh: "新到" },
    title: {
      fr: "Stockage Gen5 — la nouvelle série",
      en: "Gen5 storage — the new series",
      zh: "Gen5 存储 · 全新系列",
    },
    image: img("gen5-arrivage"),
    href: "/v/v01",
    cta: { fr: "Découvrir", en: "Discover", zh: "查看" },
  },
  {
    id: "h04",
    kind: "message",
    ton: "accent",
    eyebrow: { fr: "Bientôt", en: "Coming soon", zh: "即将上线" },
    title: {
      fr: "La boutique ouvre bientôt",
      en: "The shop opens soon",
      zh: "商城即将开业",
    },
    body: {
      fr: "Paiement en plusieurs fois prévu dès l’ouverture.",
      en: "Instalment payment planned from day one.",
      zh: "开业即支持分期付款。",
    },
  },
  {
    id: "h05",
    kind: "image",
    eyebrow: { fr: "Vivre en Chine", en: "Life in China", zh: "在中国生活" },
    title: {
      fr: "L’envers du décor",
      en: "Behind the scenes",
      zh: "幕后故事",
    },
    body: {
      fr: "Conseils, marchés, usines : ce qu’on ne voit pas depuis l’Europe.",
      en: "Tips, markets, factories — what you don’t see from Europe.",
      zh: "经验、市场、工厂：欧洲看不到的一面。",
    },
    image: img("chine-envers"),
    href: "/news",
    cta: { fr: "Lire les articles", en: "Read the posts", zh: "阅读文章" },
  },
];

/**
 * Cartes effectivement affichées.
 *
 * Le plafond est appliqué ici, une fois, plutôt que laissé à la vigilance de
 * chaque appelant : une contrainte qu'on doit se rappeler de respecter n'en est
 * pas une.
 */
export const HERO: HeroItem[] = BRUT.slice(0, HERO_MAX);

if (process.env.NODE_ENV !== "production" && BRUT.length > HERO_MAX) {
  // Avertissement de développement : le contenu au-delà du plafond ne serait
  // jamais affiché, et l'auteur croirait l'avoir publié.
  console.warn(
    `[hero] ${BRUT.length} cartes définies, ${HERO_MAX} affichées. ` +
      `Les ${BRUT.length - HERO_MAX} dernières sont ignorées.`
  );
}
