import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteUrl } from "@/lib/site";

// Métadonnées par défaut. Chaque route peut les surcharger — c'est ce que fait
// `/v/[id]`, où le titre, la description et l'image d'aperçu deviennent ceux de
// la vidéo partagée.
//
// `metadataBase` est indispensable : sans elle, Next.js émet des URL relatives
// dans les balises Open Graph, que les réseaux sociaux **ignorent en silence**.
// L'aperçu partagé apparaît alors sans image, sans que rien ne signale l'erreur.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "shorts.shiipiit — Découverte produit en vidéo courte",
    template: "%s — shorts.shiipiit",
  },
  description:
    "Mobilier, électronique et objets sélectionnés, présentés en vidéo courte verticale. Un format, une envie, un produit.",
  applicationName: "shorts.shiipiit",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "shorts.shiipiit",
    locale: "fr_FR",
    alternateLocale: ["en_US", "zh_CN"],
    title: "shorts.shiipiit — Découverte produit en vidéo courte",
    description:
      "Mobilier, électronique et objets sélectionnés, présentés en vidéo courte verticale.",
  },
  twitter: {
    card: "summary_large_image",
    title: "shorts.shiipiit",
    description: "Découverte produit en vidéo courte verticale.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
