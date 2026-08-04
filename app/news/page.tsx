// shorts.shiipiit — liste des actualités.
//
// Les articles sont la seule surface de référencement durable du site : une
// vidéo courte ne se positionne pas sur une requête, un article oui. C'est
// aussi ce qui donne une voix au projet, qu'un catalogue n'a pas.

import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import NewsListe from "@/components/NewsListe";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Nouveautés du catalogue, coulisses du sourcing en Chine et conseils pour vivre et acheter sur place.",
  alternates: { canonical: `${siteUrl()}/news` },
  openGraph: {
    type: "website",
    url: `${siteUrl()}/news`,
    title: "Actualités — shorts.shiipiit",
    description: "Nouveautés, coulisses du sourcing et conseils d’expatriation en Chine.",
  },
};

export default function NewsPage() {
  return <NewsListe />;
}
