// shorts.shiipiit — configuration ESLint (format « flat », requis par ESLint 9).
//
// `next lint` a été retiré de Next.js 16 : le script `npm run lint` du dépôt
// pointait dans le vide, et personne ne s'en apercevait puisque `next build` ne
// lance pas le lint. C'est la mise en place de la CI qui l'a révélé.
//
// `eslint-config-next` 16 exporte directement des configurations « flat » —
// pas besoin de la couche de compatibilité `FlatCompat`, qui échoue d'ailleurs
// sur cette version.
//
// Le jeu de règles apporte notamment React Hooks, qui attrape les dépendances
// manquantes dans un `useEffect` — source classique de lecteurs vidéo qui ne se
// remettent pas en pause.

import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const configuration = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "_to_delete/**",
      "next-env.d.ts",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Le projet utilise `<img>` volontairement : les vignettes viennent d'un
      // CDN externe (Bunny) déjà dimensionné et mis en cache, et `next/image`
      // imposerait une configuration de domaines distants pour un gain nul ici.
      // La règle est donc désactivée sciemment, pas par lassitude.
      "@next/next/no-img-element": "off",
    },
  },
];

export default configuration;
