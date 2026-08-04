"use client";

// shorts.shiipiit — affichage d'un article.
//
// Le corps est un tableau de paragraphes traduits, pas du HTML : rien n'est
// injecté dans le document, donc aucune surface d'injection possible le jour où
// la rédaction passera par un outil externe. Le prix à payer est l'absence de
// mise en forme riche — acceptable tant que les articles sont du texte suivi.

import { CATEGORIES, articleParSlug, dateLisible } from "@/lib/news";
import { T, tr, type Locale } from "@/lib/i18n";
import { Ic, Icon } from "@/components/icons";
import CoquilleEditoriale from "@/components/CoquilleEditoriale";
import Link from "next/link";

export default function NewsArticleVue({ slug }: { slug: string }) {
  const a = articleParSlug(slug);
  // La route a déjà renvoyé 404 dans ce cas ; ce garde-fou protège seulement
  // d'un usage direct du composant.
  if (!a) return null;

  return (
    <CoquilleEditoriale>
      {(lang: Locale) => (
        <>
          <Link
            href="/news"
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              font: "600 13.5px/1 var(--font-sans)",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            <Icon d={Ic.left} size={15} />
            {tr(T.newsBack, lang)}
          </Link>

          <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                font: "var(--type-caption)",
                color: "var(--text-muted)",
              }}
            >
              <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
                {tr(CATEGORIES.find((c) => c.id === a.categorie)!.label, lang)}
              </span>
              <span>{dateLisible(a.date, lang)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon d={Ic.clock} size={13} />
                {a.minutes} {tr(T.newsMinutes, lang)}
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                font: "800 clamp(26px, 3.6vw, 38px)/1.16 var(--font-sans)",
                letterSpacing: "-.03em",
                color: "var(--text-strong)",
              }}
            >
              {tr(a.titre, lang)}
            </h1>
            <p style={{ margin: 0, font: "500 17px/1.55 var(--font-sans)", color: "var(--text-body)" }}>
              {tr(a.chapo, lang)}
            </p>
          </header>

          {a.image && (
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                aspectRatio: "3 / 2",
                background: "var(--surface-sunken)",
              }}
            >
              <img
                src={a.image}
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <article style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {a.corps.map((p, i) => (
              <p key={i} style={{ margin: 0, font: "400 17px/1.75 var(--font-sans)", color: "var(--text-body)" }}>
                {tr(p, lang)}
              </p>
            ))}
          </article>
        </>
      )}
    </CoquilleEditoriale>
  );
}
