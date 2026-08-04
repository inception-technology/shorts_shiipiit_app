// shorts.shiipiit — articles de la rubrique « News ».
//
// Deux familles de contenus, volontairement mêlées dans le même fil :
//   - les **nouveautés** du catalogue et du projet ;
//   - les **conseils d'expatriation** en Chine — sourcing, marchés, vie
//     quotidienne, démarches.
//
// Pourquoi c'est ici et pas sur un blog séparé. Ces articles sont la seule
// surface de référencement durable du site : une vidéo courte ne se positionne
// pas sur une requête, un article oui. C'est aussi ce qui donne au projet une
// voix — un catalogue n'en a pas.
//
// Le contenu vit dans ce fichier tant qu'il tient en quelques articles. Le jour
// où la rédaction devient régulière, ce module devient l'interface d'un vrai
// gestionnaire de contenu, sans que les pages changent.

import type { I18n } from "@/lib/i18n";

export type NewsCategorie = "nouveaute" | "chine" | "coulisses";

export interface NewsArticle {
  /** Identifiant d'URL : `/news/<slug>`. Stable, jamais renommé après publication. */
  slug: string;
  categorie: NewsCategorie;
  /** Date ISO `AAAA-MM-JJ`. Sert au tri et à la date affichée. */
  date: string;
  titre: I18n;
  /** Résumé d'une à deux phrases, repris dans la liste et dans les partages. */
  chapo: I18n;
  /** Image d'illustration, en 3:2. */
  image?: string;
  /** Corps de l'article, un élément par paragraphe. */
  corps: I18n[];
  /** Temps de lecture affiché, en minutes. */
  minutes: number;
}

export const CATEGORIES: { id: NewsCategorie; label: I18n }[] = [
  { id: "nouveaute", label: { fr: "Nouveautés", en: "What's new", zh: "新动态" } },
  { id: "chine", label: { fr: "Vivre en Chine", en: "Life in China", zh: "在中国生活" } },
  { id: "coulisses", label: { fr: "Coulisses", en: "Behind the scenes", zh: "幕后" } },
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

// ⚠️ Contenu de démonstration. Les textes ci-dessous donnent le ton et la
// structure attendus ; ils doivent être réécrits par le créateur de contenu
// avant toute mise en ligne publique.
const ARTICLES: NewsArticle[] = [
  {
    slug: "pourquoi-prix-sortie-usine",
    categorie: "nouveaute",
    date: "2026-08-01",
    minutes: 4,
    image: img("prix-usine"),
    titre: {
      fr: "Pourquoi le même produit coûte trois fois moins cher à la sortie de l’usine",
      en: "Why the same product costs three times less at the factory gate",
      zh: "为什么同样的商品在工厂门口便宜三倍",
    },
    chapo: {
      fr: "Entre l’atelier de Foshan et le magasin européen, le prix est multiplié par trois sans que le produit change. Voici où part la différence.",
      en: "Between a Foshan workshop and a European store, the price triples without the product changing. Here is where the difference goes.",
      zh: "从佛山工厂到欧洲门店，商品没变，价格却翻了三倍。差价去哪了？",
    },
    corps: [
      {
        fr: "Un canapé qui sort d’usine à un certain prix arrive en magasin européen à trois fois ce montant. Le produit est le même, les matériaux aussi, souvent la chaîne de fabrication également. Ce qui change, c’est le nombre de mains par lesquelles il passe.",
        en: "A sofa leaving the factory at a given price reaches a European store at three times that amount. Same product, same materials, often the same production line. What changes is the number of hands it passes through.",
        zh: "一张沙发出厂价与欧洲门店价相差三倍。产品相同，材料相同，往往生产线也相同。不同的只是经手的环节数量。",
      },
      {
        fr: "Chaque intermédiaire prend sa marge, et c’est légitime : il porte un risque, un stock, une garantie. Le problème n’est pas la marge, c’est leur empilement. Un importateur, puis un grossiste, puis une enseigne : trois marges pour un seul produit.",
        en: "Each middleman takes a margin, and rightly so: they carry risk, stock, a warranty. The problem is not the margin, it is the stacking. An importer, then a wholesaler, then a retailer: three margins on one product.",
        zh: "每个中间环节都要利润，这本身合理：他们承担风险、库存和保修。问题不在利润本身，而在层层叠加。",
      },
      {
        fr: "Notre pari est simple : réduire la chaîne à un seul maillon. Nous sélectionnons sur place, nous vérifions la conformité nous-mêmes, et nous expédions en direct. La marge existe toujours — elle est unique.",
        en: "Our bet is simple: shorten the chain to a single link. We select on site, verify compliance ourselves, and ship direct. The margin still exists — there is just one.",
        zh: "我们的做法很简单：把链条缩短到一环。实地甄选、自行验证合规、直接发货。利润依然存在，但只有一层。",
      },
      {
        fr: "Ce n’est pas sans contrepartie. Contrôler la conformité européenne d’un produit soi-même demande du travail, des essais en laboratoire et un dossier technique. C’est ce travail que nous vous montrons en vidéo.",
        en: "It is not free. Verifying European compliance yourself takes work, lab testing and a technical file. That work is what we show you on video.",
        zh: "这不是没有代价的。自行确保欧洲合规需要投入工作、实验室检测和技术文件。我们用视频展示这些过程。",
      },
    ],
  },
  {
    slug: "wechat-compresse-vos-videos",
    categorie: "chine",
    date: "2026-07-28",
    minutes: 3,
    image: img("wechat-video"),
    titre: {
      fr: "WeChat détruit vos vidéos, et personne ne vous le dit",
      en: "WeChat destroys your videos, and nobody tells you",
      zh: "微信会毁掉你的视频，却没人告诉你",
    },
    chapo: {
      fr: "Envoyer un fichier « en vidéo » plutôt qu’« en fichier » sur WeChat divise sa définition par cinq. La perte est définitive.",
      en: "Sending a file « as a video » rather than « as a file » on WeChat cuts its resolution fivefold. The loss is permanent.",
      zh: "在微信上以「视频」而非「文件」方式发送，清晰度会降到五分之一，且不可恢复。",
    },
    corps: [
      {
        fr: "C’est le genre de détail qu’on n’apprend qu’en se faisant avoir. WeChat recompresse automatiquement toute vidéo envoyée comme vidéo — sa limite est de 25 Mo. Un fichier de tournage correct pèse davantage : il est donc dégradé, silencieusement.",
        en: "This is the kind of detail you only learn the hard way. WeChat automatically re-encodes any video sent as a video — its limit is 25 MB. A proper camera file weighs more, so it gets degraded, silently.",
        zh: "这种细节往往只有吃过亏才知道。微信会自动压缩以「视频」发送的文件，上限 25 MB。正常拍摄的素材更大，因此被悄悄压缩。",
      },
      {
        fr: "Le contournement tient en un geste : envoyer le même fichier en mode « fichier » (文件) et non « vidéo ». Sous 100 Mo, il passe intact.",
        en: "The workaround is one gesture: send the same file as a « file » (文件) rather than as a « video ». Under 100 MB it goes through untouched.",
        zh: "解决办法只有一步：以「文件」而非「视频」发送。100 MB 以内可保持原画质。",
      },
      {
        fr: "Pour tout ce qui compte, la règle reste le stockage partagé. Une messagerie est faite pour discuter, pas pour transporter des masters.",
        en: "For anything that matters, shared storage remains the rule. A messaging app is for talking, not for carrying master files.",
        zh: "重要素材仍应走共享云盘。聊天工具用来沟通，不是用来传输母版的。",
      },
    ],
  },
  {
    slug: "premier-tournage-atelier",
    categorie: "coulisses",
    date: "2026-07-20",
    minutes: 5,
    image: img("tournage-atelier"),
    titre: {
      fr: "Filmer dans une usine chinoise : ce qu’on n’avait pas prévu",
      en: "Filming inside a Chinese factory: what we did not expect",
      zh: "在中国工厂拍摄：我们没料到的事",
    },
    chapo: {
      fr: "Lumière, bruit, autorisation, format vertical : le premier tournage a surtout servi à apprendre ce qui ne marche pas.",
      en: "Light, noise, permission, vertical format: the first shoot mostly taught us what does not work.",
      zh: "光线、噪音、许可、竖屏格式：第一次拍摄主要教会了我们什么行不通。",
    },
    corps: [
      {
        fr: "Une usine n’est pas un studio. L’éclairage au néon vire au vert, les machines couvrent la voix, et les allées ne laissent pas reculer assez pour cadrer un meuble entier.",
        en: "A factory is not a studio. Neon lighting goes green, machines drown out the voice, and the aisles do not let you step back far enough to frame a whole piece of furniture.",
        zh: "工厂不是摄影棚。荧光灯偏绿，机器盖过人声，过道也退不开足够距离拍下整件家具。",
      },
      {
        fr: "Le format vertical impose sa propre discipline. Un plan large de 9:16 sur un canapé de trois mètres ne montre rien. Il faut filmer les détails — la couture, le cintrage, la finition — et laisser le plan large à la fiche produit.",
        en: "The vertical format brings its own discipline. A 9:16 wide shot of a three-metre sofa shows nothing. Film the details — the stitching, the bending, the finish — and leave the wide shot to the product page.",
        zh: "竖屏格式有自己的规矩。9:16 的全景拍三米沙发什么也看不清。要拍细节——缝线、弯曲、收边——全景留给商品页。",
      },
      {
        fr: "Enfin, l’autorisation de filmer se demande avant, pas pendant. Un fournisseur qui découvre une caméra dans son atelier a de bonnes raisons de s’inquiéter de ce qu’on montre de ses procédés.",
        en: "Finally, permission to film is asked beforehand, not during. A supplier who discovers a camera in their workshop has good reason to worry about what is being shown of their processes.",
        zh: "最后，拍摄许可要事先取得。供应商突然看到摄像机，自然会担心自己的工艺被曝光。",
      },
    ],
  },
];

/** Articles du plus récent au plus ancien — l'ordre d'affichage attendu. */
export const NEWS: NewsArticle[] = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

export function articleParSlug(slug: string): NewsArticle | undefined {
  return NEWS.find((a) => a.slug === slug);
}

/** Date lisible dans la langue courante, sans dépendance externe. */
export function dateLisible(iso: string, lang: "fr" | "en" | "zh"): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const locale = lang === "fr" ? "fr-FR" : lang === "zh" ? "zh-CN" : "en-GB";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}
