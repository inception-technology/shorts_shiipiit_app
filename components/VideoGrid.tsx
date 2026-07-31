"use client";

import type { VideoItem } from "@/lib/data";

export default function VideoGrid({
  items,
  onOpen,
}: {
  items: VideoItem[];
  onOpen: (index: number) => void;
}) {
  return (
    <div className="masonry">
      {items.map((it, i) => (
        <button key={it.id} className="card" onClick={() => onOpen(i)} aria-label={it.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.poster} alt={it.title} loading="lazy" />
          <div className="overlay">
            <span className="play">▶</span>
          </div>
          <div className="cap">
            <span className="title">{it.title}</span>
            {it.price ? <span className="price">{it.price}</span> : null}
          </div>
        </button>
      ))}
    </div>
  );
}
