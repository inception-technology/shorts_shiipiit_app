// shorts.shiipiit — lien profond vers une vidéo.
//
// Pourquoi cette route existe.
// Les vidéos sont publiées sur TikTok, Instagram, YouTube Shorts, Facebook et
// Pinterest : ce sont ces plateformes qui apportent le trafic. Sans lien
// profond, tout partage ramène sur la grille, et le visiteur doit retrouver
// lui-même la vidéo qui l'a fait cliquer — c'est là que se perd l'essentiel du
// trafic social. `/v/<id>` ouvre directement la bonne vidéo, et porte les
// métadonnées Open Graph qui décident de l'aspect de l'aperçu partagé.
//
// La page est indexable : contrairement à `/p/[id]` (fiche de repli), elle
// présente un vrai contenu et constitue la surface SEO du catalogue vidéo.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ITEMS } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { poster as posterUrl, sources } from "@/lib/video";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ITEMS.map((it) => ({ id: it.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = ITEMS.find((v) => v.id === id);
  if (!item) return { title: "Vidéo introuvable — shorts.shiipiit" };

  const titre = tr(item.title, "fr");
  const description = tr(item.cap, "fr");
  const image = posterUrl(item.videoId, item.poster);
  const video = sources(item.videoId)?.hls;
  const url = `${siteUrl()}/v/${item.id}`;

  return {
    title: `${titre} — ${item.shop}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "video.other",
      url,
      siteName: "shorts.shiipiit",
      title: titre,
      description,
      // Le poster est vertical (9:16). Les plateformes recadrent au centre :
      // c'est acceptable, et c'est la raison des zones de sécurité imposées au
      // tournage (10 % en haut, 20 % en bas).
      images: [{ url: image, width: 1080, height: 1920, alt: titre }],
      ...(video ? { videos: [{ url: video, type: "application/vnd.apple.mpegurl" }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description,
      images: [image],
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ITEMS.some((v) => v.id === id)) notFound();
  return <AppShell videoInitial={id} />;
}
