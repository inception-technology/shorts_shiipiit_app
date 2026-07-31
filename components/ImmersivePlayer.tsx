"use client";

import { useEffect, useRef } from "react";
import type { VideoItem } from "@/lib/data";
import { track } from "@/lib/analytics";

export default function ImmersivePlayer({
  items,
  startIndex,
  onClose,
}: {
  items: VideoItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const slidesRef = useRef<HTMLDivElement>(null);

  // Positionne le lecteur sur la vidéo cliquée.
  useEffect(() => {
    const el = slidesRef.current?.children[startIndex] as HTMLElement | undefined;
    el?.scrollIntoView();
  }, [startIndex]);

  // Autoplay muet de la vidéo visible ; pause des autres.
  useEffect(() => {
    const root = slidesRef.current;
    if (!root) return;
    const vids = Array.from(root.querySelectorAll("video"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.6 }
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  // Fermer avec Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="player" role="dialog" aria-modal="true">
      <button className="close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>
      <div className="slides" ref={slidesRef}>
        {items.map((it) => (
          <section className="slide" key={it.id}>
            {it.src ? (
              <video
                src={it.src}
                poster={it.poster}
                muted
                loop
                playsInline
                onClick={(e) => {
                  e.currentTarget.muted = !e.currentTarget.muted;
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.poster} alt={it.title} />
            )}
            {it.src ? <span className="hint-tap">Touchez pour le son</span> : null}
            <div className="info">
              <h2>{it.title}</h2>
              {it.price ? <div className="price">{it.price}</div> : null}
              <a
                className={"cta " + it.cta}
                href={`/go/${it.id}`}
                onClick={() =>
                  track("outbound_click", { id: it.id, segment: it.segment, cta: it.cta })
                }
              >
                {it.cta === "buy" ? "Acheter →" : "Demander un devis →"}
              </a>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
