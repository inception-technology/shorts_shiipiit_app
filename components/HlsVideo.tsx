"use client";

// shorts.shiipiit — élément vidéo capable de lire une playlist HLS.
//
// Pourquoi ce composant existe.
// Bunny Stream diffuse en HLS adaptatif (`playlist.m3u8`), qui est le bon format
// : une seule URL, et le débit s'ajuste au réseau du visiteur. Mais **seul Safari
// lit le HLS nativement**. Chrome, Firefox et Edge l'ignorent : un `<video
// src="…m3u8">` y reste noir, sans erreur visible. Il faut donc `hls.js`, qui
// découpe la playlist et alimente l'élément via Media Source Extensions.
//
// Deux décisions de mise en œuvre :
//   - `hls.js` est **importé dynamiquement**, et seulement quand il est
//     nécessaire. C'est une bibliothèque d'environ 130 ko compressés : la
//     charger sur la page d'accueil, où la majorité des visiteurs ne fait que
//     parcourir la grille, serait payer le coût pour tout le monde.
//   - le repli natif est essayé **en premier** sur les navigateurs qui savent
//     lire le HLS : moins de code exécuté, décodage matériel, meilleure
//     autonomie sur mobile.
//
// Ce composant ne connaît ni Bunny ni aucun prestataire : il reçoit une URL.

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

export interface HlsVideoProps {
  /** Playlist HLS, ou fichier vidéo simple (mp4/webm). */
  src: string;
  poster?: string;
  muted?: boolean;
  loop?: boolean;
  style?: CSSProperties;
  className?: string;
  /** Pistes de sous-titres réellement disponibles. */
  tracks?: Array<{ lang: string; url: string; label: string }>;
  /** Langue de piste à activer par défaut, si elle existe. */
  langParDefaut?: string;
  /**
   * Diapositive au premier plan. C'est le composant qui déclenche lui-même
   * lecture et pause : laisser le parent piloter les éléments par requête DOM
   * casse dès qu'on ne monte plus toutes les vidéos à la fois.
   */
  actif?: boolean;
}

function estHls(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

export default function HlsVideo({
  src,
  poster,
  muted = true,
  loop = true,
  style,
  className,
  tracks,
  langParDefaut,
  actif = true,
}: HlsVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  // Lecture et son pilotés ici, pas depuis le parent.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = muted;
    if (actif) {
      // `play()` peut être refusé (politique d'autoplay, onglet en arrière-plan) :
      // c'est un cas normal, pas une erreur à faire remonter.
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [actif, muted]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    // Cas simple : fichier direct, ou navigateur sachant lire le HLS (Safari,
    // iOS, et tout WebKit). On laisse faire le navigateur.
    if (!estHls(src) || video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    // Cas HLS sans support natif : on charge hls.js à la demande.
    let annule = false;
    let instance: { destroy: () => void } | null = null;

    (async () => {
      try {
        const { default: Hls } = await import("hls.js");
        if (annule) return;
        if (!Hls.isSupported()) {
          // Navigateur sans Media Source Extensions : on tente quand même
          // l'attribution directe, faute de mieux.
          video.src = src;
          return;
        }
        const hls = new Hls({
          // La grille peut monter plusieurs lecteurs : on limite ce que chacun
          // met en mémoire tampon pour ne pas saturer un mobile.
          maxBufferLength: 20,
          // Démarrer bas puis monter donne une première image plus rapide, ce
          // qui compte davantage qu'un premier segment en 1080p sur un format
          // où le visiteur fait défiler vite.
          startLevel: -1,
        });
        instance = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
      } catch {
        // Échec de chargement du module : on ne casse pas la page, le poster
        // reste affiché.
        if (!annule) video.removeAttribute("src");
      }
    })();

    return () => {
      annule = true;
      instance?.destroy();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      data-slide-video
      poster={poster}
      muted={muted}
      loop={loop}
      playsInline
      preload="none"
      className={className}
      style={style}
      crossOrigin={tracks && tracks.length ? "anonymous" : undefined}
    >
      {tracks?.map((t) => (
        <track
          key={t.lang}
          kind="subtitles"
          src={t.url}
          srcLang={t.lang}
          label={t.label}
          default={t.lang === langParDefaut}
        />
      ))}
    </video>
  );
}
