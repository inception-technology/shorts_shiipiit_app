"use client";

// shorts.shiipiit — coquille des pages éditoriales (À propos, Actualités).
//
// Ces pages ne montrent pas de catalogue : ni onglets d'univers, ni filtres, ni
// recherche. Elles gardent en revanche l'en-tête, le menu, la langue et le
// thème — sans quoi le visiteur aurait l'impression d'avoir quitté le site.
//
// La langue et le thème sont un état local, comme dans la coquille principale.
// C'est un doublon assumé : les deux coquilles ne se voient jamais en même
// temps, et partager cet état imposerait un contexte global pour deux valeurs.

import { useEffect, useState, type ReactNode } from "react";
import { T, tr, type Locale } from "@/lib/i18n";
import { LangSwitcher, ThemeToggle, Wordmark } from "@/components/ui";
import NavMenu from "@/components/NavMenu";
import Link from "next/link";

export default function CoquilleEditoriale({
  children,
}: {
  /** Reçoit la langue courante : le contenu est multilingue. */
  children: (lang: Locale) => ReactNode;
}) {
  const [lang, setLang] = useState<Locale>("fr");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface-page)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "14px var(--shell-gutter)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
          }}
        >
          <Link href="/" aria-label={tr(T.navHome, lang)} style={{ display: "flex", textDecoration: "none" }}>
            <Wordmark size={19} />
          </Link>
          <div style={{ flex: 1 }} />
          <NavMenu lang={lang} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <LangSwitcher lang={lang} setLang={setLang} dense />
        </div>
      </header>

      {/* Largeur de lecture bornée à 76 caractères environ : au-delà, l'œil perd
          le début de la ligne suivante et la lecture ralentit nettement. */}
      <main
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
          padding: "var(--space-8) var(--space-5) var(--space-10)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {children(lang)}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border-default)",
          padding: "var(--space-6) var(--shell-gutter)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          alignItems: "center",
          justifyContent: "center",
          font: "var(--type-caption)",
          color: "var(--text-muted)",
        }}
      >
        <span>{tr(T.footer, lang)}</span>
        <Link href="/about" style={{ color: "inherit" }}>
          {tr(T.contact, lang)}
        </Link>
      </footer>
    </div>
  );
}
