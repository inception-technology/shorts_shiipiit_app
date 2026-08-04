"use client";

// shorts.shiipiit — liste des actualités, avec filtre par rubrique.
//
// Le filtre est un état local et non un paramètre d'URL : sur trois rubriques,
// une URL par filtre créerait des pages quasi identiques que les moteurs
// traiteraient comme du contenu dupliqué. La page canonique reste `/news`.

import { useState } from "react";
import { CATEGORIES, NEWS, dateLisible, type NewsCategorie } from "@/lib/news";
import { T, tr, type Locale } from "@/lib/i18n";
import { Ic, Icon } from "@/components/icons";
import CoquilleEditoriale from "@/components/CoquilleEditoriale";
import Link from "next/link";

export default function NewsListe() {
  const [rubrique, setRubrique] = useState<NewsCategorie | "all">("all");
  const articles = rubrique === "all" ? NEWS : NEWS.filter((a) => a.categorie === rubrique);

  return (
    <CoquilleEditoriale>
      {(lang: Locale) => (
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
              {tr(T.navNews, lang)}
            </h1>
            <p style={{ margin: 0, font: "500 17px/1.55 var(--font-sans)", color: "var(--text-body)" }}>
              {tr(T.newsLead, lang)}
            </p>
          </header>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[{ id: "all" as const, label: T.newsAll }, ...CATEGORIES].map((c) => {
              const actif = rubrique === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setRubrique(c.id as NewsCategorie | "all")}
                  aria-pressed={actif}
                  style={{
                    minHeight: 36,
                    padding: "8px 14px",
                    borderRadius: 999,
                    cursor: "pointer",
                    font: "600 13px/1 var(--font-sans)",
                    border: `1px solid ${actif ? "transparent" : "var(--border-default)"}`,
                    background: actif ? "var(--text-strong)" : "var(--surface-card)",
                    color: actif ? "var(--surface-card)" : "var(--text-body)",
                  }}
                >
                  {tr(c.label, lang)}
                </button>
              );
            })}
          </div>

          {articles.length === 0 ? (
            <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-muted)" }}>
              {tr(T.newsEmpty, lang)}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/news/${a.slug}`}
                  style={{
                    display: "grid",
                    // Vignette à gauche, texte à droite ; la vignette disparaît
                    // sous 560 px, où elle prendrait plus de place qu'elle
                    // n'apporte d'information.
                    gridTemplateColumns: "minmax(0, 1fr)",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-default)",
                    background: "var(--surface-card)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  className="shp-news-carte"
                >
                  {a.image && (
                    <div
                      className="shp-news-vignette"
                      style={{
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        aspectRatio: "3 / 2",
                        background: "var(--surface-sunken)",
                      }}
                    >
                      <img
                        src={a.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
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
                    <h2
                      style={{
                        margin: 0,
                        font: "700 20px/1.28 var(--font-sans)",
                        letterSpacing: "-.02em",
                        color: "var(--text-strong)",
                      }}
                    >
                      {tr(a.titre, lang)}
                    </h2>
                    <p style={{ margin: 0, font: "400 15px/1.6 var(--font-sans)", color: "var(--text-body)" }}>
                      {tr(a.chapo, lang)}
                    </p>
                    <span
                      style={{
                        marginTop: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        font: "700 13.5px/1 var(--font-sans)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {tr(T.newsRead, lang)}
                      <Icon d={Ic.arrow} size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </CoquilleEditoriale>
  );
}
