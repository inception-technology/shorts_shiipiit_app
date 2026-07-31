"use client";

import { useEffect, useState } from "react";
import { videos, type Segment } from "@/lib/data";
import VideoGrid from "@/components/VideoGrid";
import ImmersivePlayer from "@/components/ImmersivePlayer";
import { track } from "@/lib/analytics";

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "electronics", label: "Electronics" },
  { key: "furniture", label: "Furniture" },
];

export default function Home() {
  const [segment, setSegment] = useState<Segment>("electronics");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    track("page_view", { path: "/" });
  }, []);

  const list = videos.filter((v) => v.segment === segment);

  return (
    <main className="wrap">
      <div className="head">
        <h1>
          <span>short.shiipiit</span> — test de format
        </h1>
        <p>Grille façon Pinterest, lecture verticale immersive. Mesure du CTR sortant par segment.</p>
      </div>

      <div className="tabs" role="tablist">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            className={"tab" + (s.key === segment ? " active" : "")}
            onClick={() => {
              setSegment(s.key);
              track("segment_switch", { segment: s.key });
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <VideoGrid
        items={list}
        onOpen={(i) => {
          setOpenIndex(i);
          track("video_open", { id: list[i].id, segment });
        }}
      />

      {openIndex !== null ? (
        <ImmersivePlayer items={list} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      ) : null}
    </main>
  );
}
