// shorts.shiipiit — URL publique du site.
//
// Elle sert aux métadonnées de partage : Open Graph exige des URL **absolues**,
// une URL relative est ignorée par les réseaux sociaux. Sans variable définie on
// retombe sur le domaine cible plutôt que sur `localhost`, sinon les aperçus
// générés en préproduction pointeraient vers une machine locale.

const DEFAUT = "https://shorts.shiipiit.com";

export function siteUrl(): string {
  const brut =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : DEFAUT);
  return brut.replace(/\/+$/, "");
}
