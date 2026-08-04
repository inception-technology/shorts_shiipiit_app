import type { MetadataRoute } from "next";
import { ITEMS } from "@/lib/data";
import { NEWS } from "@/lib/news";
import { siteUrl } from "@/lib/site";

// Une entrée par vidéo : ce sont les pages `/v/[id]` qui portent le contenu et
// les métadonnées de partage, donc les seules qui méritent d'être indexées.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    // Les pages éditoriales portent le référencement durable : une vidéo courte
    // ne se positionne pas sur une requête, un article oui.
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/news`, changeFrequency: "weekly" as const, priority: 0.9 },
    ...NEWS.map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...ITEMS.map((it) => ({
      url: `${base}/v/${it.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
