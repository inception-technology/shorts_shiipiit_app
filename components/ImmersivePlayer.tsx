"use client";

// shorts.shiipiit — lecteur vertical immersif (scroll-snap, autoplay muet, CTA).
// Fidèle au prototype, avec lecture vidéo réelle et suivi du clic sortant (/go/[id]).

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { VideoItem } from "@/lib/data";
import { T, tr, type Locale } from "@/lib/i18n";
import { Ic, Icon } from "@/components/icons";
import HlsVideo from "@/components/HlsVideo";
import { captions, poster as posterUrl, sources } from "@/lib/video";

/** CTA sortant : ancre stylée comme un bouton du design system. */
function CtaLink({ item, lang }: { item: VideoItem; lang: Locale }) {
  const buy = item.cta === "buy";
  const variant: CSSProperties = buy
    ? { background: "var(--color-accent)", color: "var(--text-on-accent)", boxShadow: "var(--shadow-accent)" }
    : { background: "var(--gradient-brand)", color: "var(--text-on-brand)", boxShadow: "var(--shadow-brand)" };
  return (
    // Le clic sortant n'est PLUS compté ici : /go/[id] le compte côté serveur,
    // ce qui résiste aux bloqueurs de scripts. Émettre aussi l'événement
    // navigateur doublerait le CTR sur la part non bloquée du trafic.
    // La langue est transmise pour enrichir la mesure et pour la page de repli.
    <a
      href={`/go/${item.id}?lang=${lang}`}
      style={{
        display: "inline-flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        minHeight: 48,
        padding: "13px 24px",
        borderRadius: "var(--radius-md)",
        border: "1px solid transparent",
        font: "700 15px/1.2 var(--font-sans)",
        letterSpacing: "var(--tracking-snug)",
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...variant,
      }}
    >
      {tr(buy ? T.ctaBuy : T.ctaQuote, lang)}
      <span style={{ font: "700 15px/1 var(--font-sans)" }}>→</span>
    </a>
  );
}

function Slide({
  item,
  lang,
  active,
  proche,
  muted,
  onToggleSound,
  desktop,
}: {
  item: VideoItem;
  lang: Locale;
  active: boolean;
  /**
   * Diapositive voisine de la diapositive active. On ne monte le lecteur que
   * là : `hls.js` commence à remplir sa mémoire tampon dès qu'il est attaché,
   * indépendamment de `preload`. Instancier les quatorze lecteurs d'un coup
   * ferait télécharger quatorze flux en parallèle — sur mobile, c'est la
   * lecture de la vidéo regardée qui en pâtirait.
   */
  proche: boolean;
  muted: boolean;
  onToggleSound: () => void;
  desktop: boolean;
}) {
  // Une seule source de vérité pour le média : `sources()` si la vidéo est
  // hébergée chez le prestataire, sinon les champs de démonstration. Aucune URL
  // n'est construite ici — c'est ce qui rend ADR-02 réversible.
  const cdn = sources(item.videoId);
  const media = cdn?.hls ?? item.src;
  const affiche = posterUrl(item.videoId, item.poster);
  const pistes = captions(item.videoId, item.captionLangs ?? []);

  return (
    <section
      style={{
        position: "relative",
        height: "100%",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        flex: "none",
        display: "grid",
        placeItems: "center",
        background: "#000",
      }}
    >
      <div style={{ position: "relative", height: "100%", aspectRatio: "9 / 16", maxWidth: "100%", overflow: "hidden" }}>
        {media && proche ? (
          <HlsVideo
            src={media}
            poster={affiche}
            actif={active}
            muted={muted}
            tracks={pistes.map((p) => ({ lang: p.lang, url: p.url, label: p.label }))}
            langParDefaut={lang}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, animation: active ? "shp-kb 14s ease-out both" : "none" }}>
            <img src={affiche} alt={tr(item.title, lang)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {/* zone de tap : bascule du son */}
        <button
          type="button"
          aria-label={tr(T.soundOff, lang)}
          onClick={onToggleSound}
          style={{ position: "absolute", inset: 0, border: 0, background: "transparent", cursor: "pointer", zIndex: 2 }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(to top,rgba(0,0,0,.86) 0%,rgba(0,0,0,.5) 28%,rgba(0,0,0,0) 55%,rgba(0,0,0,.45) 100%)",
          }}
        />

        {/* sous-titres */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: desktop ? 150 : 142,
            pointerEvents: "none",
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <span
            style={{
              display: "inline-block",
              maxWidth: "92%",
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(0,0,0,.55)",
              color: "#fff",
              font: "600 15px/1.45 var(--font-sans)",
              textShadow: "0 1px 3px rgba(0,0,0,.9)",
            }}
          >
            {tr(item.cap, lang)}
          </span>
        </div>

        {/* overlay bas : boutique, titre, CTA */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "0 16px 22px",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ font: "600 12px/1.3 var(--font-sans)", color: "rgba(255,255,255,.74)" }}>{item.shop}</span>
            <h2 style={{ margin: 0, font: "800 19px/1.3 var(--font-sans)", letterSpacing: "-.02em", color: "#fff" }}>
              {tr(item.title, lang)}
            </h2>
          </div>
          <CtaLink item={item} lang={lang} />
        </div>
      </div>
    </section>
  );
}

export default function ImmersivePlayer({
  items,
  startIndex,
  onClose,
  lang = "fr",
  desktop = false,
}: {
  items: VideoItem[];
  startIndex: number;
  onClose: () => void;
  lang?: Locale;
  desktop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Position initiale sur la vidéo cliquée.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = startIndex * el.clientHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progression segmentée (~9 s par vidéo).
  // Le compteur est remis à zéro **pendant le rendu**, en comparant l'indice
  // courant au précédent, plutôt que dans l'effet : appeler `setTick(0)` depuis
  // un effet déclenche un rendu en cascade, que React signale comme une erreur.
  const [indicePrecedent, setIndicePrecedent] = useState(index);
  if (indicePrecedent !== index) {
    setIndicePrecedent(index);
    setTick(0);
  }
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [index]);

  // La lecture et le son sont pilotés par chaque diapositive (`HlsVideo`), et
  // non plus par une requête DOM depuis ici : seules les diapositives voisines
  // montent un lecteur, donc l'indice d'un élément dans le document ne
  // correspond plus à l'indice de la vidéo.

  const go = useCallback(
    (d: number) => {
      const el = ref.current;
      if (!el) return;
      const n = Math.max(0, Math.min(items.length - 1, index + d));
      el.scrollTo({ top: n * el.clientHeight, behavior: "smooth" });
    },
    [index, items.length]
  );

  const toggle = useCallback(() => {
    setMuted((m) => {
      const nm = !m;
      setToast(tr(nm ? T.soundOff : T.soundOn, lang));
      setTimeout(() => setToast(null), 1200);
      return nm;
    });
  }, [lang]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "m" || e.key === "M") toggle();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go, onClose, toggle]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const n = Math.round(el.scrollTop / el.clientHeight);
    if (n !== index) setIndex(n);
  };

  const pct = Math.min(100, (tick * 100) / 90);

  return (
    <div
      data-theme="dark"
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, background: "#000", zIndex: 100, display: "flex", flexDirection: "column" }}
    >
      {/* progression segmentée */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 12, display: "flex", gap: 3, padding: "10px 12px 0" }}>
        {items.slice(0, 12).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 2.5, borderRadius: 999, background: "rgba(255,255,255,.28)", overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                height: "100%",
                background: "#fff",
                width: i < index ? "100%" : i === index ? pct + "%" : "0%",
                transition: "width 120ms linear",
              }}
            />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={tr(T.close, lang)}
        style={{
          position: "absolute",
          top: 26,
          right: 14,
          zIndex: 14,
          width: 44,
          height: 44,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          border: 0,
          cursor: "pointer",
          background: "rgba(255,255,255,.14)",
          color: "#fff",
        }}
      >
        <Icon d={Ic.x} size={19} />
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-label={tr(muted ? T.soundOn : T.soundOff, lang)}
        style={{
          position: "absolute",
          top: 26,
          right: 66,
          zIndex: 14,
          width: 44,
          height: 44,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          border: 0,
          cursor: "pointer",
          background: "rgba(255,255,255,.14)",
          color: "#fff",
        }}
      >
        <Icon d={muted ? Ic.mute : Ic.vol} size={18} />
      </button>

      {muted && (
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 16,
            zIndex: 13,
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,.14)",
            color: "#fff",
            font: "600 11px/1 var(--font-sans)",
            pointerEvents: "none",
          }}
        >
          {tr(T.tapSound, lang)}
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 15,
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            background: "rgba(0,0,0,.72)",
            color: "#fff",
            font: "700 14px/1 var(--font-sans)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
            animation: "shp-pop 160ms cubic-bezier(.22,1,.36,1)",
          }}
        >
          <Icon d={muted ? Ic.mute : Ic.vol} size={18} />
          {toast}
        </div>
      )}

      {desktop && (
        <div
          style={{
            position: "absolute",
            right: 22,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {([["up", -1], ["down", 1]] as const).map(([k, d]) => {
            const off = k === "up" ? index === 0 : index === items.length - 1;
            return (
              <button
                key={k}
                type="button"
                onClick={() => go(d)}
                aria-label={k === "up" ? "Vidéo précédente" : "Vidéo suivante"}
                disabled={off}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.22)",
                  background: "rgba(255,255,255,.08)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  opacity: off ? 0.35 : 1,
                }}
              >
                <Icon d={k === "up" ? Ic.up : Ic.down} size={20} />
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={ref}
        onScroll={onScroll}
        className="shp-snap"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollSnapType: "y mandatory", display: "flex", flexDirection: "column" }}
      >
        {items.map((it, i) => (
          <Slide
            key={it.id + i}
            item={it}
            lang={lang}
            active={i === index}
            proche={Math.abs(i - index) <= 1}
            muted={i === index ? muted : true}
            onToggleSound={toggle}
            desktop={desktop}
          />
        ))}
      </div>
    </div>
  );
}
