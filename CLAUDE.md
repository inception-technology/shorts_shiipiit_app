# Conventions du dépôt — shorts.shiipiit

> Ce fichier est lu par les assistants de code (Claude Code, Cowork) au
> démarrage. Il vaut aussi pour un humain qui arrive sur le projet.

## Langue

**Tout le code est commenté en français.** Pas de commentaires en anglais, même
partiels. Les identifiants peuvent rester en anglais quand c'est l'usage du
domaine technique (`poster`, `preview`, `sitemap`), mais **l'explication est en
français**.

La documentation, les messages de commit et les messages d'erreur destinés à un
humain suivent la même règle.

## Ce qu'un commentaire doit contenir

Un commentaire qui paraphrase le code ne sert à rien : le code se lit. Ce qui ne
se lit pas, c'est **la raison**. Commente donc :

- **pourquoi** ce choix plutôt qu'un autre, quand l'alternative était crédible ;
- **ce qui casse** si on modifie sans savoir — c'est le commentaire le plus
  précieux du dépôt ;
- **les pièges au symptôme trompeur** : une panne qui ne produit aucun message
  d'erreur mérite deux phrases, elle coûte des heures autrement ;
- **les décisions renvoyant à un ADR** (`../docs/DECISION-*.md`), avec le nom du
  document.

Écris en phrases complètes, lisibles à voix haute. Un commentaire est destiné à
quelqu'un qui découvre le fichier dans six mois — souvent toi.

```ts
// ⚠️ hls.js remplit sa mémoire tampon dès qu'il est attaché, indépendamment de
// `preload="none"`. Monter les quatorze diapositives ferait télécharger
// quatorze flux en parallèle : sur mobile, c'est la lecture de la vidéo
// regardée qui en pâtirait.
```

Plutôt que :

```ts
// on ne monte que les slides proches
```

## Ce que ce projet a appris — à ne pas réapprendre

Ces trois pièges ont coûté du temps. Ils ont tous la même forme : **rien ne
signale l'erreur**.

1. **Le HLS ne se lit nativement que sur Safari.** Ailleurs, un `<video>` pointé
   sur un `.m3u8` reste noir, sans exception ni message. D'où
   `components/HlsVideo.tsx`.
2. **Sans `metadataBase`, Next.js émet des URL Open Graph relatives**, que les
   réseaux sociaux ignorent en silence : l'aperçu partagé sort sans image.
   D'où `lib/site.ts`.
3. **L'application se dégrade en silence quand une variable manque** — vignettes
   de démonstration, mesure absente. D'où `npm run verif:env`, qui exige que
   toute `process.env` lue soit décrite dans `.env.example`, **avec une phrase
   disant ce qui se passe quand elle est absente**.

## Frontière client / serveur

`lib/video-admin.ts` porte la clé d'API Bunny et commence par
`import "server-only"`. Un composant client qui l'importerait **ferait échouer
la compilation** : c'est une barrière, pas une convention. Ne jamais la
contourner — la CI ne verrait rien d'autre que le build, et le build est
précisément ce qui l'attrape.

Tout ce qui touche à une URL vidéo passe par `lib/video.ts`. Aucun composant ne
construit d'URL à la main : c'est ce qui rend ADR-02 réversible.

## Avant de proposer un changement

```bash
npm run lint          # eslint, zéro avertissement toléré
npx tsc --noEmit      # types
npm run verif:env     # variables documentées
npm run build         # attrape aussi les fuites client/serveur
```

La CI (`.github/workflows/ci.yml`) rejoue exactement ces quatre étapes.

## Effets et état React

Ne pas appeler `setState` directement dans un `useEffect` : React le signale
comme une erreur (rendu en cascade), et la règle est active en lint. Les deux
solutions utilisées ici :

- **état initial calculé au premier rendu** (`useState(() => …)`) quand la valeur
  découle d'une prop connue dès le départ — voir l'ouverture du lecteur sur
  `/v/[id]` dans `components/AppShell.tsx` ;
- **comparaison pendant le rendu** avec la valeur précédente, quand un
  changement de prop doit réinitialiser un état — voir la remise à zéro de la
  pagination dans `useFeed`, ou celle de la progression dans
  `components/ImmersivePlayer.tsx`.

## Documentation

La roadmap et les décisions vivent **hors du dépôt**, dans `../docs/` :
`ROADMAP.md` fait foi, `DECISION-*.md` portent les ADR. Le `ROADMAP.md` de ce
dépôt n'est qu'un renvoi. Ne pas créer de seconde roadmap ici : deux roadmaps
concurrentes divergent toujours.
