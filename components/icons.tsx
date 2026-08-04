// shorts.shiipiit — jeu d'icônes (tracé Lucide-like, 1.75 px).
// Aucune icône n'existe dans les sources shiipiit : substitution assumée.

import type { CSSProperties } from "react";

export const Ic = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4-4",
  x: "M6 6l12 12M18 6L6 18",
  vol: "M4 9v6h4l5 4V5L8 9zM16.5 9.5a4 4 0 0 1 0 5M19 7a7.5 7.5 0 0 1 0 10",
  mute: "M4 9v6h4l5 4V5L8 9zM17 10l4 4M21 10l-4 4",
  play: "M8 5l11 7-11 7z",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M15.5 8.5l-2 5-5 2 2-5z",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  wifi: "M3 8a16 16 0 0 1 5-3M21 8a16 16 0 0 0-5-3M6.5 12a10 10 0 0 1 3-1.7M17.5 12a10 10 0 0 0-3-1.7M9.5 15.5a5 5 0 0 1 5 0M12 19h.01M3 3l18 18",
  alert: "M12 4l9 16H3zM12 10v4M12 17h.01",
  up: "M7 14l5-5 5 5",
  down: "M7 10l5 5 5-5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z",
  // Menu « burger » — n'apparaît qu'en tablette et mobile, où la barre de
  // navigation n'a pas la place d'afficher les liens en clair.
  menu: "M4 7h16M4 12h16M4 17h16",
  left: "M14 6l-6 6 6 6",
  right: "M10 6l6 6-6 6",
  arrow: "M5 12h13M13 6l6 6-6 6",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
} as const;

export function Icon({
  d,
  size = 20,
  stroke = "currentColor",
  width = 1.75,
  fill = "none",
  style,
}: {
  d: string;
  size?: number;
  stroke?: string;
  width?: number;
  fill?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none", display: "block", ...style }}
      aria-hidden="true"
    >
      {d
        .split("M")
        .filter(Boolean)
        .map((p, i) => (
          <path key={i} d={"M" + p} />
        ))}
    </svg>
  );
}
