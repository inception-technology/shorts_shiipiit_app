import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// `/go/` et `/p/` sont exclus volontairement : la première est une redirection
// de mesure, la seconde une fiche de repli sans contenu propre. Les indexer
// diluerait le référencement sur des pages qui n'apportent rien au visiteur.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/go/", "/p/", "/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
