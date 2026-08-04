#!/usr/bin/env node
// shorts.shiipiit — vérification de la documentation des variables d'environnement.
//
// Pourquoi ce contrôle existe.
// Cette application est conçue pour **se dégrader en silence** quand une
// variable manque : sans `NEXT_PUBLIC_VIDEO_CDN_HOST` elle affiche les vignettes
// de démonstration, sans `PLAUSIBLE_DOMAIN` elle ne mesure rien, sans
// `metadataBase` les aperçus de partage sortent sans image. C'est un bon choix
// — mieux vaut un site qui tourne qu'un site qui plante — mais il a un prix :
// **rien ne signale l'oubli**. La seule protection possible est que toute
// variable lue par le code soit décrite quelque part.
//
// Le script échoue donc si une lecture d'environnement apparaît dans les sources sans
// figurer dans `.env.example`. Ce n'est pas du zèle : les deux pannes les plus
// coûteuses rencontrées sur ce projet — poster CDN absent, aperçu de partage
// sans image — avaient exactement cette forme.
//
// Usage : npm run verif:env

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const DOSSIERS = ["app", "components", "lib", "scripts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

// Variables fournies par la plateforme ou par l'outillage : elles n'ont rien à
// faire dans `.env.example`, qui décrit ce que TU dois renseigner.
const FOURNIES = new Set([
  "NODE_ENV", // Node
  "VERCEL", // Vercel
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "CI",
  "VERIF_REFERER", // option de scripts/verifier-bunny.mjs, jamais en production
]);

function fichiers(dossier) {
  if (!existsSync(dossier)) return [];
  const out = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) out.push(...fichiers(chemin));
    else if (EXTENSIONS.has(extname(nom))) out.push(chemin);
  }
  return out;
}

// --- 1. variables lues par le code ---------------------------------------

/** @type {Map<string, string[]>} nom de variable → fichiers où elle apparaît */
const lues = new Map();
for (const dossier of DOSSIERS) {
  for (const f of fichiers(dossier)) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
      const nom = m[1];
      if (!lues.has(nom)) lues.set(nom, []);
      if (!lues.get(nom).includes(f)) lues.get(nom).push(f);
    }
  }
}

// --- 2. variables documentées --------------------------------------------

if (!existsSync(".env.example")) {
  console.error("✗ .env.example introuvable : impossible de vérifier quoi que ce soit.");
  process.exitCode = 1;
} else {
  const doc = readFileSync(".env.example", "utf8");
  const documentees = new Set(
    [...doc.matchAll(/^\s*([A-Z0-9_]+)\s*=/gm)].map((m) => m[1])
  );

  const manquantes = [...lues.keys()]
    .filter((n) => !FOURNIES.has(n) && !documentees.has(n))
    .sort();

  // L'inverse est un simple avertissement : une variable documentée mais plus
  // utilisée n'est pas dangereuse, seulement trompeuse.
  const orphelines = [...documentees]
    .filter((n) => !lues.has(n) && !FOURNIES.has(n))
    .sort();

  console.log(`Variables lues par le code : ${lues.size}`);
  console.log(`Variables documentées      : ${documentees.size}`);

  if (orphelines.length) {
    console.log(`\n! documentées mais plus lues : ${orphelines.join(", ")}`);
    console.log("  (sans danger, mais la documentation ment sur ce qui sert)");
  }

  if (manquantes.length) {
    console.error("\n✗ Variables lues par le code mais ABSENTES de .env.example :\n");
    for (const nom of manquantes) {
      console.error(`  ${nom}`);
      for (const f of lues.get(nom)) console.error(`      ${f}`);
    }
    console.error(
      "\nAjoute-les à .env.example, avec une phrase disant ce qui se passe" +
        "\nquand elles sont absentes — c'est cette phrase qui a de la valeur.\n"
    );
    process.exitCode = 1;
  } else {
    console.log("\n✓ Toute variable lue par le code est documentée dans .env.example.\n");
  }
}
