import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ITEMS } from "@/lib/data";
import { SEGMENTS, T, tr, type Locale } from "@/lib/i18n";

// shorts.shiipiit — page produit de repli.
//
// Elle n'existe que pour la phase de validation (PV) : tant que la boutique
// n'est pas ouverte, `/go/[id]` redirige ici au lieu d'envoyer le visiteur sur
// une URL de démonstration qui ne résout pas. Le clic sortant devient donc
// mesurable (hypothèse H1) sans page morte.
//
// Dès qu'un `productUrl` pointe vers une vraie fiche, `/go/[id]` cesse
// automatiquement de passer par ici : aucun code à retirer.
//
// Non indexable : cette page ne doit pas capter de trafic organique.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const LOCALES: Locale[] = ["fr", "en", "zh"];

function asLocale(v: string | string[] | undefined): Locale {
  const s = Array.isArray(v) ? v[0] : v;
  return LOCALES.includes(s as Locale) ? (s as Locale) : "fr";
}

export default async function ProductFallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const lang = asLocale(sp.lang);

  const item = ITEMS.find((v) => v.id === id);
  if (!item) notFound();

  const segment = SEGMENTS.find((s) => s.id === item.seg);
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const subject = encodeURIComponent(`${tr(item.title, lang)} — ${item.shop}`);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--surface-page)",
        color: "var(--text-strong)",
        font: "var(--type-body)",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            font: "var(--type-label)",
            color: "var(--text-body)",
            textDecoration: "none",
            marginBottom: "var(--space-6)",
          }}
        >
          ← {tr(T.backHome, lang)}
        </Link>

        <div
          style={{
            // Flex + wrap plutôt que grid : les colonnes passent l'une sous
            // l'autre sur mobile sans media query (styles en ligne).
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-8)",
            alignItems: "flex-start",
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-md)",
            padding: "var(--space-6)",
          }}
        >
          <img
            src={item.poster}
            alt={tr(item.title, lang)}
            style={{
              flex: "1 1 200px",
              maxWidth: 260,
              width: "100%",
              aspectRatio: "9 / 16",
              objectFit: "cover",
              borderRadius: "var(--radius-lg)",
              display: "block",
              background: "var(--surface-sunken)",
            }}
          />

          <div style={{ flex: "3 1 300px", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {segment ? (
                <span
                  style={{
                    font: "var(--type-caption)",
                    background: "var(--surface-primary-soft)",
                    color: "var(--color-primary)",
                    borderRadius: "var(--radius-pill)",
                    padding: "4px 10px",
                  }}
                >
                  {tr(segment.label, lang)}
                </span>
              ) : null}
              <span
                style={{
                  font: "var(--type-caption)",
                  background: "var(--surface-sunken)",
                  color: "var(--text-body)",
                  borderRadius: "var(--radius-pill)",
                  padding: "4px 10px",
                }}
              >
                {item.shop}
              </span>
            </div>

            <h1 style={{ font: "var(--type-section)", margin: 0, letterSpacing: "var(--tracking-tight)" }}>
              {tr(item.title, lang)}
            </h1>
            <p style={{ margin: 0, color: "var(--text-body)" }}>{tr(item.cap, lang)}</p>

            <hr style={{ border: 0, borderTop: "1px solid var(--border-default)", margin: "var(--space-2) 0" }} />

            <h2 style={{ font: "var(--type-subtitle)", margin: 0 }}>{tr(T.soonTitle, lang)}</h2>
            <p style={{ margin: 0, color: "var(--text-body)" }}>{tr(T.soonBody, lang)}</p>

            {contact ? (
              <a
                href={`mailto:${contact}?subject=${subject}`}
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  minHeight: 48,
                  padding: "13px 24px",
                  marginTop: "var(--space-2)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid transparent",
                  font: "700 15px/1.2 var(--font-sans)",
                  letterSpacing: "var(--tracking-snug)",
                  textDecoration: "none",
                  background: "var(--gradient-brand)",
                  color: "var(--text-on-brand)",
                  boxShadow: "var(--shadow-brand)",
                }}
              >
                {tr(T.soonContact, lang)} →
              </a>
            ) : (
              // Sans NEXT_PUBLIC_CONTACT_EMAIL, la page reste utile (le clic est
              // compté) mais n'offre aucun moyen de recontact : le visiteur
              // intéressé est perdu. À renseigner avant d'envoyer du trafic.
              <p style={{ margin: 0, font: "var(--type-caption)", color: "var(--color-danger)" }}>
                NEXT_PUBLIC_CONTACT_EMAIL n&apos;est pas renseigné.
              </p>
            )}

            <p style={{ margin: "var(--space-2) 0 0", font: "var(--type-caption)", color: "var(--text-muted)" }}>
              {tr(T.soonNote, lang)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
