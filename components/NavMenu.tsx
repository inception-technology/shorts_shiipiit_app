"use client";

// shorts.shiipiit — navigation secondaire (pages éditoriales).
//
// Deux liens seulement : « À propos & Contact » et « Actualités ». Ils ne sont
// pas dans la navigation principale — celle-ci sert à parcourir le catalogue —
// mais ils ne doivent pas être introuvables pour autant : ce sont les deux
// pages qui donnent une voix au projet et qui portent son référencement.
//
// **Le seuil est à 1024 px, pas au point de rupture de l'application (900 px).**
// Une tablette de 1000 px utilise la coquille desktop, mais n'a pas la place
// d'afficher deux libellés en clair à côté de la recherche, du thème et de la
// langue. Le menu replié couvre donc tablette et mobile.

import { useEffect, useRef, useState } from "react";
import { T, tr, type Locale } from "@/lib/i18n";
import { Ic, Icon } from "@/components/icons";
import Link from "next/link";

const LIENS = [
  { href: "/about", cle: "navAbout" as const },
  { href: "/news", cle: "navNews" as const },
];

/** Vrai au-dessus de 1024 px : la barre a la place d'afficher les liens. */
function useLarge(): boolean {
  const [large, setLarge] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const appliquer = () => setLarge(mq.matches);
    appliquer();
    mq.addEventListener("change", appliquer);
    return () => mq.removeEventListener("change", appliquer);
  }, []);
  return large;
}

export default function NavMenu({ lang }: { lang: Locale }) {
  const large = useLarge();
  const [ouvert, setOuvert] = useState(false);
  const panneau = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  // Fermeture au clic extérieur et à la touche Échap. Un menu qu'on ne peut
  // fermer qu'en rouvrant le bouton est une impasse au clavier.
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: MouseEvent) => {
      const c = e.target as Node;
      if (panneau.current?.contains(c) || bouton.current?.contains(c)) return;
      setOuvert(false);
    };
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        bouton.current?.focus();
      }
    };
    document.addEventListener("mousedown", clic);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", clic);
      document.removeEventListener("keydown", touche);
    };
  }, [ouvert]);

  const styleLien: React.CSSProperties = {
    font: "var(--type-label)",
    fontSize: "13.5px",
    color: "var(--text-body)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    padding: "8px 2px",
  };

  if (large) {
    return (
      <nav aria-label={tr(T.menu, lang)} style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
        {LIENS.map((l) => (
          <Link key={l.href} href={l.href} style={styleLien}>
            {tr(T[l.cle], lang)}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={bouton}
        type="button"
        aria-label={tr(T.menu, lang)}
        aria-expanded={ouvert}
        aria-haspopup="menu"
        onClick={() => setOuvert((o) => !o)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          border: "1px solid var(--border-default)",
          background: "var(--surface-card)",
          color: "var(--text-strong)",
        }}
      >
        <Icon d={ouvert ? Ic.x : Ic.menu} size={18} />
      </button>

      {ouvert && (
        <div
          ref={panneau}
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 40,
            minWidth: 210,
            padding: 6,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            background: "var(--surface-card)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {LIENS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOuvert(false)}
              style={{
                ...styleLien,
                padding: "11px 12px",
                borderRadius: "var(--radius-sm)",
                // Cible tactile d'au moins 44 px de haut : en dessous, le lien
                // se rate au pouce sur un téléphone.
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              {tr(T[l.cle], lang)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
