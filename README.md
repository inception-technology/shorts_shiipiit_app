# shorts.shiipiit — vitrine de découverte vidéo (Next.js)

Vitrine de **découverte produit en vidéo courte** : grille masonry de vignettes
9:16 → lecteur vertical immersif → clic sortant vers la fiche produit de la
boutique. Les prix ne vivent **pas** ici : cette application fait la découverte
et le CTA, la boutique fait la transaction.

Les mêmes vidéos sont publiées sur TikTok, Instagram Reels, YouTube Shorts,
Facebook et Pinterest — ce sont ces plateformes qui apportent le trafic, cette
vitrine en est la surface d'atterrissage.

## Démarrer

```bash
npm install
cp .env.example .env.local     # puis renseigner (voir « Configuration »)
npm run dev                    # http://localhost:3000
```

Build de production : `npm run build && npm start`.

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` / `npm start` | build et service de production |
| `npm run lint` | ESLint |
| `npm run verif:bunny` | **vérifie la configuration vidéo de bout en bout** (voir plus bas) |

## Fonctionnalités

- **Grille masonry responsive** — vignettes 9:16, tuiles « héro » sur 2 colonnes,
  nombre de colonnes déduit de la largeur mesurée (2 → 10), aperçu animé au
  survol, chargé uniquement au survol.
- **Lecteur vertical immersif** — `scroll-snap` (une vidéo par écran), lecture
  **HLS adaptative**, autoplay muet + bascule du son, progression segmentée,
  sous-titres, navigation clavier (`↑`/`↓`, `Échap`, `m`) et flèches sur desktop.
- **Navigation** — 6 univers, filtres cumulables, recherche, défilement infini.
- **Deux mises en page** — mobile (barre d'onglets basse) et desktop (recherche
  en en-tête + footer), au point de rupture 900 px.
- **i18n FR / EN / 中文**, thème clair / sombre, états de chargement et vides.
- **Formulaire de rétractation** — route serveur `/api/retractation` (obligation
  légale applicable depuis le 19 juin 2026, absente de Shopify).

## Vidéo — Bunny Stream

ADR-02 (`../docs/DECISION-VIDEO.md`) retient **Bunny Stream**. Deux modules,
séparés volontairement :

| Module | Rôle | Secrets |
|---|---|---|
| [`lib/video.ts`](lib/video.ts) | dérivation d'URL **pure**, isomorphe | aucun |
| [`lib/video-admin.ts`](lib/video-admin.ts) | téléversement et métadonnées | **porte la clé d'API** |

`lib/video-admin.ts` commence par `import "server-only"` : un composant client
qui l'importerait **ferait échouer la compilation**. C'est une barrière, pas une
convention.

Aucun composant ne construit d'URL à la main. Changer de prestataire = réécrire
`lib/video.ts`, pas l'application.

### Lecture HLS et `hls.js`

Bunny diffuse en HLS adaptatif. **Seul Safari lit le HLS nativement** : sur
Chrome, Firefox et Edge, un `<video>` pointé sur un `.m3u8` reste **noir sans
lever d'erreur**. [`components/HlsVideo.tsx`](components/HlsVideo.tsx) encapsule
`hls.js`, en **import dynamique** — la bibliothèque (~130 ko compressés) n'est
chargée qu'à l'ouverture du lecteur, jamais pour qui ne fait que parcourir la
grille. Le repli natif est tenté en premier sur les navigateurs qui savent lire
le HLS.

⚠️ `hls.js` remplit sa mémoire tampon **dès qu'il est attaché**, indépendamment
de `preload="none"`. Seules la diapositive active et ses voisines montent un
lecteur : sinon quatorze flux se téléchargent en parallèle. C'est aussi pourquoi
la lecture est pilotée par `HlsVideo` lui-même et non par le composant parent.

### Vérifier la configuration

```bash
npm run verif:bunny
```

Le script authentifie la clé, liste l'état d'encodage des vidéos, **va chercher
réellement chaque URL sur le CDN**, puis contrôle le master contre la spec
d'ADR-02 (format, définition, débit réel, cadence, durée, nommage). Il distingue
erreur réseau et refus d'accès, et explique chaque cas.

Deux pièges qu'il diagnostique, tous deux au symptôme trompeur :

- le tableau de bord Bunny affiche le **sous-domaine seul** de la pull zone ;
  sans `.b-cdn.net` le nom ne résout pas ;
- les domaines autorisés comparent le nom d'hôte **avec son port** :
  `localhost` est refusé, `localhost:3000` accepté. Une image en 403 n'affiche
  aucun message — la page semble simplement vide.

## Configuration

Copie `.env.example` en `.env.local`. `.env*.local` est ignoré par git : **ne
jamais commiter de clé**.

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_VIDEO_CDN_HOST` | hôte de la pull zone, ex. `vz-xxxxxxx-xxx.b-cdn.net` |
| `NEXT_PUBLIC_VIDEO_LIBRARY_ID` | identifiant de bibliothèque (public) |
| `BUNNY_STREAM_API_KEY` | clé **de bibliothèque** — pas l'Account API Key |
| `BUNNY_STREAM_LIBRARY_ID` | identifiant de bibliothèque (serveur) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `PLAUSIBLE_DOMAIN` | mesure d'audience |
| `PLAUSIBLE_SEGMENTED_EVENTS` | `1` si le plan Plausible n'a pas les propriétés |
| `RETRACTATION_ALLOWED_ORIGIN` | origine autorisée pour le formulaire |
| `RESEND_API_KEY` | accusé de réception de rétractation |
| `NEXT_PUBLIC_SITE_URL` | URL publique, requise pour les métadonnées de partage |

⚠️ **Sans les variables vidéo, l'application retombe silencieusement sur les
vignettes de démonstration** — sans erreur. C'est le mode de défaillance à
connaître au moment de déployer.

## Partage social et référencement

Les réseaux sociaux sont le moteur de trafic : les mêmes vidéos y sont publiées,
et c'est de là que viennent les visiteurs. Deux conséquences dans le code.

**Lien profond `/v/[id]`.** Sans lui, tout partage ramène sur la grille et le
visiteur doit retrouver lui-même la vidéo qui l'a fait cliquer — c'est là que se
perd l'essentiel du trafic social. `/v/<id>` ouvre directement la bonne vidéo.
La route est prérendue statiquement (`generateStaticParams`), un identifiant
inconnu renvoie 404 plutôt qu'une page vide. L'URL suit aussi le lecteur :
ouvrir une vidéo depuis la grille met à jour la barre d'adresse
(`replaceState`, pour que « retour » ne remonte pas le fil des vidéos vues).

**Métadonnées Open Graph par vidéo** — titre, description, poster Bunny et flux
HLS. ⚠️ `metadataBase` est indispensable : sans elle Next.js émet des URL
relatives, que les réseaux sociaux **ignorent en silence**. L'aperçu partagé
apparaît sans image, et rien ne le signale. C'est le rôle de
[`lib/site.ts`](lib/site.ts) et de `NEXT_PUBLIC_SITE_URL`.

Le poster est vertical (9:16) et les plateformes recadrent au centre — d'où les
zones de sécurité imposées au tournage (10 % en haut, 20 % en bas).

`app/robots.ts` et `app/sitemap.ts` complètent l'ensemble : les pages `/v/[id]`
sont indexables, `/go/`, `/p/` et `/api/` sont exclues — ce sont respectivement
une redirection de mesure, une fiche de repli sans contenu propre, et des routes
techniques.

## Ce qui est mesuré

**Le serveur fait foi.** Le clic sortant est compté par
[`app/go/[id]/route.ts`](app/go/%5Bid%5D/route.ts) : elle enregistre le clic puis
redirige en 302. Le comptage survit donc aux bloqueurs de scripts. Le navigateur
n'émet **plus** `outbound_click` — le compter des deux côtés doublerait le CTR
sur la part non bloquée du trafic.

| Émis par | Événements |
|---|---|
| Navigateur ([`lib/analytics.ts`](lib/analytics.ts)) | `page_view`, `segment_switch`, `video_open`, `lang_switch` |
| Serveur ([`lib/plausible-server.ts`](lib/plausible-server.ts)) | `outbound_click` (+ `id`, `segment`, `cta`, `lang`, `shop`, `destination`) |

**Robots.** Les prévisualisations de lien préchargent les URL partagées :
`/go/[id]` les redirige mais ne les compte pas ([`lib/bots.ts`](lib/bots.ts)). La
redirection n'est jamais bloquée — un faux positif coûte une mesure, jamais un
visiteur.

**Cache.** La route est `force-dynamic` et répond `no-store` : une 302 mise en
cache ne repasserait plus par le serveur.

**Destination.** Tant qu'un `productUrl` pointe vers le domaine de démonstration
(`.example`, réservé par la RFC 2606, il ne résout jamais), le visiteur est
redirigé vers [`/p/[id]`](app/p/%5Bid%5D/page.tsx) plutôt que vers une erreur
DNS. Dès qu'une vraie URL est renseignée, ce repli cesse tout seul.

### Quels taux lire

Le CTA n'existe que dans le lecteur, pas sur les vignettes. Lis **deux** taux,
jamais un seul :

- **Taux d'ouverture** = `video_open ÷ page_view` — le format donne-t-il envie
  d'ouvrir ?
- **Taux de clic** = `outbound_click ÷ video_open` — la vidéo donne-t-elle envie
  d'aller au produit ?

À lire par univers et par type de CTA (`buy` vs `quote`).

## Brancher tes vraies données

Le contenu de démo est dans [`lib/data.ts`](lib/data.ts) (tableau `ITEMS`).

| Champ | Rôle |
|---|---|
| `videoId` | **GUID Bunny**. Renseigné → HLS, poster et aperçu dérivés automatiquement. C'est ce seul champ qui fait basculer une fiche de la démo au réel. |
| `captionLangs` | langues des `.vtt` **effectivement déposés**. En déclarer un absent produit un 404 silencieux. |
| `poster` | vignette de repli quand `videoId` est absent |
| `src` | vidéo simple (mp4) — repli hérité de la démo |
| `productUrl` | fiche produit de **ta boutique**, cible du CTA sortant |
| `cta` | `"buy"` (corail) ou `"quote"` (dégradé) |
| `seg`, `tags`, `shop`, `title`/`cap` (i18n), `span` | contenu éditorial |

Les libellés d'univers, filtres et chaînes d'interface sont dans
[`lib/i18n.ts`](lib/i18n.ts).

## Structure

```
app/
  layout.tsx            # layout, préconnexions polices, Plausible optionnel
  page.tsx              # coquille responsive, feed, lecteur
  globals.css           # tokens du design system
  v/[id]/page.tsx       # lien profond vers une vidéo + métadonnées Open Graph
  go/[id]/route.ts      # redirection tracée des clics sortants (source de vérité)
  p/[id]/page.tsx       # fiche de repli tant que la boutique n'est pas ouverte
  api/retractation/     # formulaire de rétractation (obligation légale)
  robots.ts             # règles d'indexation
  sitemap.ts            # une entrée par vidéo
components/
  AppShell.tsx          # coquille applicative, partagée par / et /v/[id]
  ds.tsx                # design system : Button / Chip / Badge
  icons.tsx             # icônes SVG
  ui.tsx                # recherche, onglets, filtres, langue, thème, états
  VideoGrid.tsx         # grille masonry 9:16 + carte + squelette
  ImmersivePlayer.tsx   # lecteur vertical (scroll-snap, son, sous-titres, CTA)
  HlsVideo.tsx          # <video> capable de lire du HLS (hls.js à la demande)
lib/
  data.ts               # contenu de démo (ITEMS) — à remplacer
  site.ts               # URL publique du site (métadonnées absolues)
  i18n.ts               # dictionnaires FR/EN/中文, univers, filtres, tr()
  video.ts              # URL vidéo — public, sans secret
  video-admin.ts        # téléversement Bunny — server-only, porte la clé
  analytics.ts          # tracking navigateur
  plausible-server.ts   # événements Plausible côté serveur
  bots.ts               # robots et prévisualisations de lien
scripts/
  verifier-bunny.mjs    # vérification de la configuration vidéo
```

## Déploiement

Hébergé sur **Vercel** (équipe `inceptiontech`, projet `shorts-shiipiit-app`).
Chaque push sur `main` de `inception-technology/shorts_shiipiit_app` déclenche un
déploiement de production.

À faire avant que la vidéo fonctionne en ligne :

1. renseigner les variables `NEXT_PUBLIC_VIDEO_*` et `NEXT_PUBLIC_SITE_URL`
   **sur Vercel** ;
2. ajouter le domaine de production aux **domaines autorisés Bunny** ;
3. raccorder `shorts.shiipiit.com` au projet.

Les URL de prévisualisation changent à chaque push et ne peuvent pas être
listées à l'avance chez Bunny — la vidéo n'y fonctionnera pas sans ajout
ponctuel.

## Roadmap

La roadmap fait foi dans **`../docs/ROADMAP.md`**, avec sa vue rendue
`../docs/roadmap.html`. Le [`ROADMAP.md`](ROADMAP.md) de ce dépôt n'est qu'un
renvoi : deux roadmaps concurrentes divergent toujours.
