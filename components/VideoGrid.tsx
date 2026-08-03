"use client";

// shorts.shiipiit — grille masonry de vignettes 9:16 + carte vidéo.

import { useEffect, useRef, useState } from "react";
import type { VideoItem } from "@/lib/data";
import { tr, type Locale } from "@/lib/i18n";
import { Ic, Icon } from "@/components/icons";
import { poster as posterUrl, sources } from "@/lib/video";

/**
 * Média 9:16 avec léger zoom au survol.
 *
 * L'URL n'est jamais construite ici : `poster()` décide seule entre l'image du
 * CDN et le repli fourni dans les données (ADR-02). Tant que la vidéo n'a pas
 * de `videoId`, la vignette de démonstration continue de s'afficher — la
 * bascule vers les vraies vidéos se fait donnée par donnée, sans branche de code.
 */
function Poster({ item, preview }: { item: VideoItem; preview: boolean }) {
  // L'aperçu animé n'est demandé qu'au survol : le charger d'emblée sur toute
  // la grille multiplierait la bande passante par le nombre de vignettes
  // visibles, pour un média que l'immense majorité des visiteurs ne verra pas.
  const [apercuDemande, setApercuDemande] = useState(false);
  useEffect(() => {
    if (preview) setApercuDemande(true);
  }, [preview]);

  const src = posterUrl(item.videoId, item.poster);
  const apercu = apercuDemande ? sources(item.videoId)?.preview : undefined;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--surface-sunken)" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: preview ? "scale(1.045)" : "scale(1)",
          transition: "transform 320ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={tr(item.title, "fr")}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {apercu && (
          // Superposé plutôt que substitué : si l'aperçu tarde ou échoue, la
          // vignette reste visible dessous au lieu de laisser un trou.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={apercu}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: preview ? 1 : 0,
              transition: "opacity 220ms ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
}

export function VideoCard({
  item,
  lang,
  onOpen,
  span = 1,
}: {
  item: VideoItem;
  lang: Locale;
  onOpen?: (item: VideoItem, el: HTMLElement | null) => void;
  span?: number;
}) {
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={tr(item.title, lang)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      onClick={() => onOpen && onOpen(item, ref.current)}
      style={{
        gridColumn: "span " + span,
        gridRow: "span " + span,
        position: "relative",
        height: "100%",
        minHeight: 0,
        border: 0,
        padding: 0,
        margin: 0,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--surface-sunken)",
        display: "block",
        textAlign: "left",
        boxShadow: hov ? "var(--shadow-md)" : "none",
        transition: "box-shadow var(--transition-base)",
      }}
    >
      <Poster item={item} preview={hov} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(to top,rgba(9,12,20,.78) 0%,rgba(9,12,20,.34) 26%,rgba(9,12,20,0) 52%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <span style={{ font: "600 11px/1.3 var(--font-sans)", color: "rgba(255,255,255,.72)", letterSpacing: ".01em" }}>
          {item.shop}
        </span>
        <span
          style={{
            font: "700 13px/1.34 var(--font-sans)",
            letterSpacing: "-.01em",
            color: "#fff",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tr(item.title, lang)}
        </span>
      </div>
      <span
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 26,
          height: 26,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: "rgba(9,12,20,.5)",
          color: "#fff",
          opacity: hov ? 0 : 1,
          transition: "opacity var(--transition-base)",
        }}
      >
        <Icon d={Ic.play} size={12} fill="#fff" stroke="none" />
      </span>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: "rgba(255,255,255,.28)",
          opacity: hov ? 1 : 0,
          transition: "opacity 120ms",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            background: "var(--color-accent)",
            width: hov ? "100%" : "0%",
            transition: hov ? "width 4.5s linear" : "none",
          }}
        />
      </span>
    </button>
  );
}

/** Nombre de colonnes déduit de la largeur mesurée (responsive sans détection de viewport).
 *  La grille occupant désormais toute la largeur de l'écran en desktop, les paliers
 *  montent jusqu'à 8 colonnes : sans cela, une vignette ferait ~500 px de large sur
 *  un écran 2560 px et la grille perdrait son effet de densité. La cible est une
 *  vignette de ~190 à 260 px de large à tous les paliers. */
function colsFor(width: number): number {
  if (width < 520) return 2;
  if (width < 760) return 3;
  if (width < 1000) return 4;
  // Au-delà, on ne fige plus de paliers : on vise une vignette d'environ 240 px
  // de large, plafonnée à 10 colonnes (au-delà, les vignettes deviennent
  // trop petites pour lire le titre et la boutique).
  return Math.min(10, Math.max(5, Math.round(width / 240)));
}

export default function MasonryGrid({
  items,
  lang,
  onOpen,
  cols,
  allowSpan = true,
}: {
  items: VideoItem[];
  lang: Locale;
  onOpen?: (item: VideoItem, el: HTMLElement | null) => void;
  /** Colonnes forcées ; sinon calculées d'après la largeur. */
  cols?: number;
  allowSpan?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rowH, setRowH] = useState(0);
  const [autoCols, setAutoCols] = useState(cols ?? 2);
  const GAP = 12;
  const nCols = cols ?? autoCols;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (!w) return;
      const c = cols ?? colsFor(w);
      setAutoCols(c);
      setRowH(((w - GAP * (c - 1)) / c) * 16 / 9);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols]);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${nCols},minmax(0,1fr))`,
        gridAutoRows: rowH ? rowH + "px" : "auto",
        gridAutoFlow: "dense",
        gap: GAP,
      }}
    >
      {rowH > 0 &&
        items.map((it, i) => (
          <VideoCard
            key={it.id + "-" + i}
            item={it}
            lang={lang}
            onOpen={onOpen}
            span={allowSpan && it.span === 2 && nCols > 1 ? 2 : 1}
          />
        ))}
    </div>
  );
}

/** Squelette de chargement. `cols` omis = même calcul de colonnes que la grille
 *  réelle, pour que le passage squelette → contenu ne fasse pas sauter la mise en page. */
export function SkeletonGrid({ cols, count = 8 }: { cols?: number; count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [autoCols, setAutoCols] = useState(cols ?? 2);
  const nCols = cols ?? autoCols;

  useEffect(() => {
    if (cols) return;
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w) setAutoCols(colsFor(w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols]);

  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: `repeat(${nCols},minmax(0,1fr))`, gap: "var(--space-3)" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shp-skel"
          style={{
            aspectRatio: "9 / 16",
            borderRadius: "var(--radius-lg)",
            gridColumn: "span " + (i === 0 && nCols > 1 ? 2 : 1),
          }}
        />
      ))}
    </div>
  );
}
