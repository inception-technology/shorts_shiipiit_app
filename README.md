# shorts.shiipiit — landing de test (Next.js)

Vitrine de **découverte produit en vidéo courte** : grille masonry de vignettes
9:16 → lecteur vertical immersif. Objectif immédiat : **mesurer le CTR sortant**
(clic vers la fiche produit) avant de développer le MVP. La grille et le lecteur
sont pensés comme les composants réutilisables du futur produit.

Portée du prototype de design (Claude Design) : seul le **produit** est repris —
le harnais de revue (bascule device/thème/état, annotations) n'a pas été porté.

## Démarrer

```bash
npm install
npm run dev
# http://localhost:3000
```

Build de production : `npm run build && npm start`.

## Fonctionnalités

- **Grille masonry responsive** — vignettes 9:16, tuiles « héro » sur 2 colonnes,
  nombre de colonnes déduit de la largeur (2 → 5), aperçu muet au survol.
- **Lecteur vertical immersif** — `scroll-snap` (une vidéo par écran), autoplay
  muet + bascule du son, progression segmentée, sous-titres, navigation clavier
  (`↑`/`↓`, `Échap`, `m`) et flèches sur desktop, lecture `<video>` réelle.
- **Navigation** — 6 univers (Tout, Electronics, Furniture, Audio, Éclairage,
  Bureau), filtres cumulables, recherche, défilement infini.
- **Deux mises en page** — mobile (barre d'onglets basse Découvrir / Rechercher /
  Univers) et desktop (recherche en en-tête + footer), choisies au point de
  rupture 900 px.
- **i18n FR / EN / 中文** avec sélecteur de langue.
- **Thème clair / sombre** (design system shiipiit).
- **États** — squelette de chargement, vide, aucun résultat.

## Design system

Les tokens shiipiit (couleurs, typographie, espacement, effets, thème sombre)
vivent dans [`app/globals.css`](app/globals.css). Les composants du système
(`Button`, `Chip`, `Badge`) sont portés en React typé dans
[`components/ds.tsx`](components/ds.tsx). Le CTA corail (`buy`) et le CTA dégradé
bleu-violet (`quote`) en sont issus.

## Ce qui est mesuré (tracking)

**Le serveur fait foi.** Le clic sortant est compté par la route `/go/[id]`
([`app/go/[id]/route.ts`](app/go/%5Bid%5D/route.ts)) : elle enregistre le clic,
puis redirige en 302 vers la fiche produit. Le comptage survit donc aux
bloqueurs de scripts. Le navigateur n'émet **plus** `outbound_click` — le
compter des deux côtés doublerait le CTR sur la part non bloquée du trafic.

| Émis par | Événements |
|---|---|
| Navigateur ([`lib/analytics.ts`](lib/analytics.ts)) | `page_view`, `segment_switch`, `video_open`, `lang_switch` |
| Serveur ([`lib/plausible-server.ts`](lib/plausible-server.ts)) | `outbound_click` (+ propriétés : `id`, `segment`, `cta`, `lang`, `shop`, `destination`) |

- **Sans configuration** : rien n'est mesuré en production. `PLAUSIBLE_DOMAIN`
  absent ⇒ l'événement est seulement journalisé en avertissement.
- **Avec Plausible** : copie `.env.example` en `.env.local` et renseigne
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` **et** `PLAUSIBLE_DOMAIN`.
- ⚠️ Sur Plausible Cloud, les propriétés personnalisées exigent le plan
  Growth. Sans elles tu n'as qu'un CTR global. Mets alors
  `PLAUSIBLE_SEGMENTED_EVENTS=1` : chaque clic émet aussi un événement nommé
  `outbound_click_<univers>_<cta>`, lisible sur tous les plans.

**Robots.** Les prévisualisations de lien (WhatsApp, Slack, Discord…) et les
crawlers préchargent les URL partagées. `/go/[id]` les redirige mais ne les
compte pas ([`lib/bots.ts`](lib/bots.ts)). La redirection n'est jamais bloquée :
un faux positif coûte une mesure, jamais un visiteur.

**Cache.** La route est `force-dynamic` et répond `no-store`. Une 302 mise en
cache ne repasserait plus par le serveur : les clics suivants ne seraient pas
comptés.

**Destination.** Tant qu'un `productUrl` pointe encore vers le domaine de
démonstration (`.example`, réservé par la RFC 2606, il ne résout jamais), le
visiteur est redirigé vers la page interne
[`/p/[id]`](app/p/%5Bid%5D/page.tsx) plutôt que vers une erreur DNS. Dès qu'une
vraie URL est renseignée, ce repli cesse tout seul.

### Quels taux lire

Le CTA n'existe que dans le lecteur immersif, pas sur les vignettes. Lis donc
**deux** taux séparés, jamais un seul :

- **Taux d'ouverture** = `video_open ÷ page_view` — le format donne-t-il envie
  d'ouvrir une vidéo ?
- **Taux de clic** = `outbound_click ÷ video_open` — la vidéo donne-t-elle envie
  d'aller au produit ? *C'est le signal des hypothèses H1 et H3.*

À lire par univers et par type de CTA (`buy` vs `quote`, hypothèse H2). Voir
`../docs/ROADMAP.md` (phase PV) et `../docs/VALIDATION.md` pour les seuils.

## Brancher tes vraies données

Le contenu de démo est dans [`lib/data.ts`](lib/data.ts) (tableau `ITEMS`). Par
item :

- `poster` → vignette verticale 9:16 (remplace les posters de démo picsum).
- `src` → URL de la vidéo (mp4/HLS, embed Bunny/Cloudflare). Vide = poster seul.
- `productUrl` → fiche produit de **ta boutique** (cible du CTA sortant).
- `cta` → `"buy"` (achat direct, CTA corail) ou `"quote"` (devis, CTA dégradé).
- `seg`, `tags`, `shop`, `title` / `cap` (i18n `{ fr, en, zh }`), `span` (1 ou 2).

Les libellés d'univers, filtres et chaînes d'interface (multilingues) sont dans
[`lib/i18n.ts`](lib/i18n.ts).

### Tester achat direct vs devis

Pour le mobilier haut de gamme, l'hypothèse « achat en ligne direct » est risquée.
Certaines fiches sont déjà en `cta: "quote"` : compare le taux de clic des deux
CTA pour décider du bon modèle sur ce segment (hypothèse H2, voir
[ROADMAP.md](ROADMAP.md)).

## Structure

```
app/
  layout.tsx          # layout + préconnexions polices + Plausible optionnel
  page.tsx            # coquille responsive : MobileApp / DesktopApp, feed, lecteur
  globals.css         # tokens du design system + base + utilitaires
  go/[id]/route.ts    # redirection tracée des clics sortants (source de vérité)
  p/[id]/page.tsx     # fiche produit de repli tant que la boutique n'est pas ouverte
components/
  ds.tsx              # design system porté : Button / Chip / Badge
  icons.tsx           # jeu d'icônes SVG
  ui.tsx              # recherche, onglets, filtres, langue, thème, bottom nav, états
  VideoGrid.tsx       # grille masonry 9:16 + carte vidéo + skeleton
  ImmersivePlayer.tsx # lecteur vertical (scroll-snap, son, sous-titres, CTA)
lib/
  data.ts             # contenu de démo (ITEMS) — à remplacer
  i18n.ts             # dictionnaires FR/EN/中文, univers, filtres, helper tr()
  analytics.ts        # wrapper de tracking navigateur
  plausible-server.ts # envoi d'événements Plausible côté serveur
  bots.ts             # détection des robots et prévisualisations de lien
```

## Déploiement

Hébergé sur **Vercel** (équipe `inceptiontech`, projet `shorts-shiipiit-app`).
Chaque push sur `main` de `inception-technology/shorts_shiipiit_app` déclenche un
déploiement de production.

- **Production (publique)** : https://shorts-shiipiit-app.vercel.app
- Les URLs de preview / déploiement (alias de branche, hash) sont protégées par
  Vercel Authentication (SSO équipe). Le domaine de production, lui, est ouvert.

> Pour un test de CTR sur visiteurs anonymes, garde le domaine de production
> public (Vercel *Standard Protection* le laisse ouvert par défaut).

## Roadmap

Étapes de validation puis chemin vers le MVP : voir [ROADMAP.md](ROADMAP.md).
