// shorts.shiipiit — article d'actualité.
//
// Route prérendue : le contenu vient d'un module statique, donc rien ne justifie
// un rendu à la demande. Un identifiant inconnu renvoie 404 plutôt qu'une page
// vide — un article supprimé ne doit pas laisser une coquille indexée.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NEWS, articleParSlug } from "@/lib/news";
import { siteUrl } from "@/lib/site";
import NewsArticleVue from "@/components/NewsArticleVue";

export const dynamicParams = false;

export function generateStaticParams() {
  return NEWS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = articleParSlug(slug);
  if (!a) return { title: "Article introuvable" };
  const url = `${siteUrl()}/news/${a.slug}`;
  return {
    title: a.titre.fr,
    description: a.chapo.fr,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: a.titre.fr,
      description: a.chapo.fr,
      publishedTime: a.date,
      ...(a.image ? { images: [{ url: a.image, width: 1200, height: 800, alt: a.titre.fr }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: a.titre.fr,
      description: a.chapo.fr,
      ...(a.image ? { images: [a.image] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!articleParSlug(slug)) notFound();
  return <NewsArticleVue slug={slug} />;
}
