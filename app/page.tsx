// shorts.shiipiit — page d'accueil.
//
// La coquille applicative vit dans `components/AppShell.tsx` : elle est
// partagée avec la route `/v/[id]`, qui est la même page ouverte directement
// sur une vidéo. Cette page-ci reste un composant serveur, ce qui permet à
// Next.js d'y attacher des métadonnées de partage sans expédier de JavaScript
// supplémentaire.

import AppShell from "@/components/AppShell";

export default function Home() {
  return <AppShell />;
}
