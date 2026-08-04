"use client";

// shorts.shiipiit — section « à la une ».
//
// Un carrousel horizontal de cartes larges, placé au-dessus de la grille. Il
// porte les contenus mis en avant et les messages promotionnels.
//
// Trois décisions de conception, chacune avec sa raison :
//
// 1. **Défilement natif plutôt que translation calculée.** Le carrousel est un
//    conteneur `overflow-x: auto` avec `scroll-snap`. On hérite gratuitement du
//    geste tactile, de l'inertie, de la molette horizontale et du clavier — que
//    reproduire à la main coûte beaucoup de code et fonctionne moins bien.
//
// 2. **Nombre de cartes déduit de la largeur mesurée**, comme la grille, et non
//    de requêtes média. Le composant est utilisé dans deux coquilles (mobile et
//    desktop) : se fier au viewport donnerait un résultat faux dans l'une des
//    deux. Trois cartes en desktop, deux en tablette, une en mobile.
//
// 3. **Une seule vidéo lit à la fois** — celle qui est le plus au centre. Faire
//    tourner trois flux en parallèle sur la page d'accueil consommerait de la
//    bande passante pour des vidéos que le visiteur ne regarde pas : c'est
//    exactement le risque R-01, et la page d'accueil est la page la plus vue.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HERO, type HeroItem } from "@/lib/hero";
import { T, tr, type Locale } from "@/lib/i18n";
import { Ic, Icon } from "@/components/icons";
import { poster as posterUrl, sources } from "@/lib/video";
import HlsVideo from "@/components/HlsVideo";

/** Cartes visibles simultanément, selon la largeur mesurée du conteneur. */
function cartesVisibles(largeur: number): number {
  if (largeur < 640) return 1;
  if (largeur < 1024) return 2;
  return 3;
}

const ECART = 14;

/** Fond d'une carte `message`, qui n'a pas d'image. */
function fondMessage(ton: HeroItem["ton"]): string {
  if (ton === "accent") return "var(--color-accent)";
  if (ton === "sombre") return "var(--anthracite)";
  return "var(--gradient-brand)";
}

function Carte({
  item,
  lang,
  actif,
}: {
  item: HeroItem;
  lang: Locale;
  /** Carte la plus centrée : c'est la seule qui a le droit de lire une vidéo. */
  actif: boolean;
}) {
  const hls = item.videoId ? sources(item.videoId)?.hls : undefined;
  const image = item.image ? posterUrl(item.videoId, item.image) : undefined;
  const message = item.kind === "message" || !image;

  const contenu = (
    <>
      {/* Média de fond */}
      {message ? (
        <div style={{ position: "absolute", inset: 0, background: fondMessage(item.ton) }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "var(--surface-sunken)" }}>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {hls && actif && (
            <HlsVideo
              src={hls}
              poster={image}
              actif
              muted
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      )}

      {/* Voile de lisibilité : sans lui, un texte blanc sur une photo claire
          devient illisible, et le contraste tombe sous le seuil d'accessibilité. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: message
            ? "linear-gradient(to top,rgba(9,12,20,.30) 0%,rgba(9,12,20,0) 60%)"
            : "linear-gradient(to top,rgba(9,12,20,.86) 0%,rgba(9,12,20,.42) 45%,rgba(9,12,20,.08) 100%)",
        }}
      />

      {/* Texte */}
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 6,
          padding: "var(--space-4)",
          color: "#fff",
        }}
      >
        {item.eyebrow && (
          <span
            style={{
              alignSelf: "flex-start",
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(255,255,255,.18)",
              backdropFilter: "blur(6px)",
              font: "700 10.5px/1 var(--font-sans)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            {tr(item.eyebrow, lang)}
          </span>
        )}
        <h3
          style={{
            margin: 0,
            font: "800 19px/1.24 var(--font-sans)",
            letterSpacing: "-.02em",
            textShadow: "0 1px 12px rgba(0,0,0,.35)",
          }}
        >
          {tr(item.title, lang)}
        </h3>
        {item.body && (
          <p
            style={{
              margin: 0,
              font: "500 13px/1.45 var(--font-sans)",
              color: "rgba(255,255,255,.86)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tr(item.body, lang)}
          </p>
        )}
        {item.cta && item.href && (
          <span
            style={{
              marginTop: 4,
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 36,
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              background: "#fff",
              color: "var(--anthracite, #12161f)",
              font: "700 13px/1 var(--font-sans)",
            }}
          >
            {tr(item.cta, lang)}
            <Icon d={Ic.arrow} size={14} />
          </span>
        )}
      </div>
    </>
  );

  const style: React.CSSProperties = {
    position: "relative",
    display: "block",
    scrollSnapAlign: "start",
    flex: "0 0 var(--hero-carte)",
    // 4:3 : assez haut pour porter un titre et un bouton, assez bas pour ne pas
    // repousser la grille sous la ligne de flottaison.
    aspectRatio: "4 / 3",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    border: 0,
    padding: 0,
    background: "var(--surface-sunken)",
  };

  if (!item.href) return <div style={style}>{contenu}</div>;
  // `Link` pour un chemin interne — navigation sans rechargement complet ; une
  // ancre simple pour une URL externe, que le routeur ne sait pas prendre en
  // charge.
  if (item.href.startsWith("/"))
    return (
      <Link href={item.href} style={style} aria-label={tr(item.title, lang)}>
        {contenu}
      </Link>
    );
  return (
    <a href={item.href} style={style} aria-label={tr(item.title, lang)} rel="noopener noreferrer">
      {contenu}
    </a>
  );
}

export default function HeroCarousel({ lang }: { lang: Locale }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const piste = useRef<HTMLDivElement>(null);
  const [visibles, setVisibles] = useState(1);
  const [largeurCarte, setLargeurCarte] = useState(0);
  const [position, setPosition] = useState(0);

  // Largeur des cartes recalculée à chaque redimensionnement du conteneur.
  useEffect(() => {
    const el = conteneur.current;
    if (!el) return;
    const mesurer = () => {
      const l = el.clientWidth;
      if (!l) return;
      const n = cartesVisibles(l);
      setVisibles(n);
      setLargeurCarte((l - ECART * (n - 1)) / n);
    };
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Carte la plus proche du bord gauche : c'est elle qui a le droit de lire.
  const surDefilement = useCallback(() => {
    const el = piste.current;
    if (!el || !largeurCarte) return;
    setPosition(Math.round(el.scrollLeft / (largeurCarte + ECART)));
  }, [largeurCarte]);

  if (HERO.length === 0) return null;

  const pages = Math.max(1, HERO.length - visibles + 1);
  const debut = position <= 0;
  const fin = position >= HERO.length - visibles;

  return (
    <section
      ref={conteneur}
      aria-label={tr(T.heroTitle, lang)}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <h2 style={{ margin: 0, font: "var(--type-label)", color: "var(--text-strong)" }}>
          {tr(T.heroTitle, lang)}
        </h2>
        <div style={{ flex: 1 }} />
        {/* Flèches réservées aux écrans qui ont la place : en mobile, le geste
            tactile suffit et deux boutons de plus encombrent pour rien. */}
        {visibles > 1 &&
          ([
            ["prev", -1, Ic.left, T.heroPrev, debut],
            ["next", 1, Ic.right, T.heroNext, fin],
          ] as const).map(([cle, sens, icone, libelle, inactif]) => (
            <button
              key={cle}
              type="button"
              // La référence est lue ici, dans le gestionnaire d'événement, et
              // non dans une fonction partagée : React interdit d'accéder à une
              // référence pendant le rendu, et une fonction créée au rendu est
              // traitée comme telle.
              onClick={() => {
                const el = piste.current;
                if (!el) return;
                el.scrollBy({ left: sens * (largeurCarte + ECART) * visibles, behavior: "smooth" });
              }}
              disabled={inactif}
              aria-label={tr(libelle, lang)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                cursor: inactif ? "default" : "pointer",
                border: "1px solid var(--border-default)",
                background: "var(--surface-card)",
                color: "var(--text-strong)",
                opacity: inactif ? 0.4 : 1,
              }}
            >
              <Icon d={icone} size={17} />
            </button>
          ))}
      </div>

      <div
        ref={piste}
        onScroll={surDefilement}
        className="shp-hero-piste"
        style={
          {
            "--hero-carte": largeurCarte ? `${largeurCarte}px` : "100%",
            display: "flex",
            gap: ECART,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            // Sans cela, un défilement horizontal déclenche parfois le geste de
            // retour arrière du navigateur sur les pavés tactiles.
            overscrollBehaviorX: "contain",
          } as React.CSSProperties
        }
      >
        {HERO.map((item, i) => (
          <Carte key={item.id} item={item} lang={lang} actif={i === position} />
        ))}
      </div>

      {/* Indicateur de position : sur mobile, sans flèches, c'est le seul signe
          qu'il reste des cartes à droite. */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 5 }} aria-hidden="true">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === position ? 16 : 6,
                height: 6,
                borderRadius: 999,
                background: i === position ? "var(--color-accent)" : "var(--border-default)",
                transition: "width 180ms, background 180ms",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
