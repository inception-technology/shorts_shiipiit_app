// shorts.shiipiit — page « À propos & Contact ».
//
// Cette page répond à la question que se pose tout visiteur arrivé depuis un
// réseau social : *qui parle, et pourquoi lui faire confiance ?* Sur un site
// marchand neuf, sans avis clients ni notoriété, c'est la seule réponse
// disponible — et c'est un des leviers de conversion les plus directs
// (risque R-17, « confiance d'un site neuf »).
//
// Rendue côté serveur, sans état : elle doit être indexable et lisible même si
// le JavaScript ne s'exécute pas.

import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import PageEditoriale from "@/components/PageEditoriale";

export const metadata: Metadata = {
  title: "À propos & Contact",
  description:
    "Qui est derrière shiipiit, pourquoi nous vendons au prix sortie d’usine, et ce que nous montrons de la Chine et de ses ateliers.",
  alternates: { canonical: `${siteUrl()}/about` },
  openGraph: {
    type: "profile",
    url: `${siteUrl()}/about`,
    title: "À propos & Contact — shorts.shiipiit",
    description:
      "Le prix sortie d’usine, l’envers du décor, et la vie en Chine racontée depuis place.",
  },
};

export default function AboutPage() {
  return <PageEditoriale variante="about" />;
}
