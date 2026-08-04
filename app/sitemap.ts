import type { MetadataRoute } from "next";
import { ITEMS } from "@/lib/data";
import { siteUrl } from "@/lib/site";

// Une entrée par vidéo : ce sont les pages `/v/[id]` qui portent le contenu et
// les métadonnées de partage, donc les seules qui méritent d'être indexées.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...ITEMS.map((it) => ({
      url: `${base}/v/${it.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
