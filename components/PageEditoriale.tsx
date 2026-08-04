"use client";

// shorts.shiipiit — contenu de la page « À propos & Contact ».
//
// ⚠️ Les passages entre crochets `[…]` sont à compléter : identité du créateur
// de contenu, adresse de contact, mentions de l'entreprise. Ils sont laissés
// visibles plutôt que remplis d'un texte plausible — un « à compléter » se
// corrige, une invention passe en production sans qu'on la remarque.

import { T, tr, type Locale } from "@/lib/i18n";
import CoquilleEditoriale from "@/components/CoquilleEditoriale";
import { Ic, Icon } from "@/components/icons";

type Bloc = { titre: Record<Locale, string>; paras: Record<Locale, string>[] };

const CHAPO: Record<Locale, string> = {
  fr: "Faire bénéficier de produits de consommation au prix sortie d’usine, et montrer l’envers du décor : la Chine, ses ateliers, et ce que c’est que d’y vivre.",
  en: "Bringing consumer products at factory-gate prices, and showing what is behind the scenes: China, its workshops, and what living there actually means.",
  zh: "以出厂价提供消费品，并展示幕后：中国、工厂，以及在这里生活的真实样子。",
};

const BLOCS: Bloc[] = [
  {
    titre: {
      fr: "Le prix sortie d’usine, sans l’intermédiaire",
      en: "Factory-gate prices, without the middleman",
      zh: "出厂价，没有中间商",
    },
    paras: [
      {
        fr: "Entre l’atelier chinois et le magasin européen, un produit passe par un importateur, un grossiste, puis une enseigne. Chacun prend une marge, et c’est légitime : il porte un risque, un stock, une garantie. Le problème n’est pas la marge, c’est l’empilement.",
        en: "Between a Chinese workshop and a European store, a product goes through an importer, a wholesaler, then a retailer. Each takes a margin, and rightly so: they carry risk, stock, a warranty. The problem is not the margin, it is the stacking.",
        zh: "从中国工厂到欧洲门店，商品要经过进口商、批发商、零售商。每一环都要利润，这本身合理：他们承担风险、库存和保修。问题不在利润，而在层层叠加。",
      },
      {
        fr: "Notre pari est de réduire la chaîne à un seul maillon : sélection sur place, vérification de la conformité par nous-mêmes, expédition en direct. La marge existe toujours — elle est unique.",
        en: "Our bet is to shorten the chain to a single link: selection on site, compliance verified by us, direct shipping. The margin still exists — there is just one.",
        zh: "我们的做法是把链条缩短到一环：实地甄选、自行验证合规、直接发货。利润依然存在，但只有一层。",
      },
    ],
  },
  {
    titre: {
      fr: "L’envers du décor",
      en: "Behind the scenes",
      zh: "幕后",
    },
    paras: [
      {
        fr: "Un produit sur une photo de catalogue ne raconte rien. Nous filmons ce qu’il y a derrière : l’atelier de Foshan où le bois est cintré à la vapeur, la ligne d’assemblage de Shenzhen, le geste qui fait la différence entre deux finitions apparemment identiques.",
        en: "A product in a catalogue photo tells you nothing. We film what is behind it: the Foshan workshop where wood is steam-bent, the Shenzhen assembly line, the gesture that separates two apparently identical finishes.",
        zh: "目录照片说明不了什么。我们拍摄它背后的东西：佛山蒸汽弯木的车间、深圳的组装线，以及决定两种看似相同工艺差别的那一个动作。",
      },
      {
        fr: "C’est aussi une manière de rendre vérifiable ce que nous affirmons. Montrer l’usine, c’est accepter d’être jugé sur ce qu’on y voit.",
        en: "It is also a way of making our claims verifiable. Showing the factory means accepting to be judged on what is seen there.",
        zh: "这也是让我们的说法可被验证的方式。展示工厂，就意味着接受别人根据所见来评判。",
      },
    ],
  },
  {
    titre: {
      fr: "Vivre en Chine",
      en: "Living in China",
      zh: "在中国生活",
    },
    paras: [
      {
        fr: "Le sourcing se fait depuis place, pas depuis un catalogue en ligne. Cela suppose d’y vivre : comprendre comment on négocie, ce qu’un fournisseur entend par « conforme », pourquoi un échantillon ne ressemble pas toujours à la série.",
        en: "Sourcing happens on the ground, not from an online catalogue. That means living there: understanding how negotiation works, what a supplier means by « compliant », why a sample does not always match the production run.",
        zh: "选品在当地进行，而不是靠线上目录。这意味着要住在这里：理解如何谈判、供应商说的「合规」是什么意思、为什么样品不总是等于大货。",
      },
      {
        fr: "Ces apprentissages ne servent pas qu’à nous. Ils sont partagés dans les actualités — nouveautés, conseils, erreurs faites et corrigées.",
        en: "Those lessons are not just for us. They are shared in the news section — updates, tips, mistakes made and corrected.",
        zh: "这些经验不只属于我们。它们会分享在资讯栏目里：动态、经验、犯过并纠正的错误。",
      },
    ],
  },
];

const QUI: Record<Locale, string> = {
  fr: "Le contenu vidéo est réalisé depuis la Chine par [prénom / nom du créateur de contenu], installé à [ville]. Il assure le sourcing, la relation avec les usines et le tournage. La sélection, la conformité européenne et la vente sont assurées depuis la France par [prénom / nom].",
  en: "The video content is produced from China by [content creator’s name], based in [city]. He handles sourcing, factory relations and filming. Selection, European compliance and sales are handled from France by [name].",
  zh: "视频内容由常驻[城市]的[创作者姓名]在中国制作，负责选品、工厂对接与拍摄。甄选、欧洲合规与销售由[姓名]在法国负责。",
};

export default function PageEditoriale({ variante }: { variante: "about" }) {
  // Un seul gabarit pour l'instant. Le paramètre existe pour que l'ajout d'une
  // seconde page éditoriale statique ne demande pas de renommer ce composant.
  void variante;

  return (
    <CoquilleEditoriale>
      {(lang) => (
        <>
          <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h1
              style={{
                margin: 0,
                font: "800 clamp(28px, 4vw, 40px)/1.14 var(--font-sans)",
                letterSpacing: "-.03em",
                color: "var(--text-strong)",
              }}
            >
              {tr(T.navAbout, lang)}
            </h1>
            <p
              style={{
                margin: 0,
                font: "500 17px/1.55 var(--font-sans)",
                color: "var(--text-body)",
              }}
            >
              {tr(CHAPO, lang)}
            </p>
          </header>

          {BLOCS.map((b) => (
            <section key={b.titre.fr} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <h2
                style={{
                  margin: 0,
                  font: "700 21px/1.25 var(--font-sans)",
                  letterSpacing: "-.02em",
                  color: "var(--text-strong)",
                }}
              >
                {tr(b.titre, lang)}
              </h2>
              {b.paras.map((p, i) => (
                <p key={i} style={{ margin: 0, font: "400 16px/1.7 var(--font-sans)", color: "var(--text-body)" }}>
                  {tr(p, lang)}
                </p>
              ))}
            </section>
          ))}

          {/* Qui parle — le bloc de confiance. Volontairement en dernier :
              on explique d'abord ce qu'on fait, ensuite qui le fait. */}
          <section
            style={{
              padding: "var(--space-5)",
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-default)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <h2 style={{ margin: 0, font: "700 18px/1.3 var(--font-sans)", color: "var(--text-strong)" }}>
              {tr({ fr: "Qui est derrière", en: "Who is behind it", zh: "我们是谁" }, lang)}
            </h2>
            <p style={{ margin: 0, font: "400 15.5px/1.65 var(--font-sans)", color: "var(--text-body)" }}>
              {tr(QUI, lang)}
            </p>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h2 style={{ margin: 0, font: "700 21px/1.25 var(--font-sans)", color: "var(--text-strong)" }}>
              {tr(T.contact, lang)}
            </h2>
            <p style={{ margin: 0, font: "400 16px/1.7 var(--font-sans)", color: "var(--text-body)" }}>
              {tr(
                {
                  fr: "Une question sur un produit, une demande de devis, une proposition de partenariat : écris-nous.",
                  en: "A question about a product, a quote request, a partnership proposal: write to us.",
                  zh: "关于产品的问题、报价请求或合作提议，欢迎来信。",
                },
                lang
              )}
            </p>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? ""}`}
              style={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 48,
                padding: "13px 22px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent)",
                color: "var(--text-on-accent)",
                boxShadow: "var(--shadow-accent)",
                font: "700 15px/1 var(--font-sans)",
                textDecoration: "none",
              }}
            >
              <Icon d={Ic.mail} size={17} />
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "[adresse de contact à renseigner]"}
            </a>
          </section>
        </>
      )}
    </CoquilleEditoriale>
  );
}
