# shorts.shiipiit — landing de test (Next.js)

Mini-vitrine pour **mesurer le CTR sortant** avant de développer le MVP (voir
`docs/VALIDATION.md`). Réutilisable comme base du produit : la grille masonry et
le lecteur vertical immersif sont les composants du futur MVP.

## Démarrer

```bash
npm install
npm run dev
# http://localhost:3000
```

Build de production : `npm run build && npm start`.

## Ce qui est mesuré (tracking)

Événements envoyés (voir `lib/analytics.ts`) : `page_view`, `segment_switch`,
`video_open`, `outbound_click`. Les clics sortants passent aussi par la route
serveur `/go/[id]` (`app/go/[id]/route.ts`), qui journalise le clic **puis**
redirige vers la fiche produit — comptage fiable même avec un bloqueur de scripts.

- **Sans configuration** : les événements s'affichent dans la console (navigateur
  pour le client, terminal pour `/go`).
- **Avec Plausible** (recommandé, RGPD-friendly) : copie `.env.example` en
  `.env.local` et renseigne `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Le script se charge
  automatiquement et reçoit les événements personnalisés.

CTR sortant = `outbound_click ÷ page_view`, à lire **par segment** (Electronics /
Furniture) et **par type de CTA** (`buy` vs `quote`).

## Brancher tes vraies données

Tout est dans `lib/data.ts` :

- `poster` → ta vignette verticale (remplace les posters de démo picsum).
- `src` → l'URL de ta vidéo (embed Bunny/Cloudflare ou mp4). Vide = poster seul.
- `productUrl` → la fiche produit de **ta boutique** (cible du CTA).
- `cta` → `"buy"` (achat direct) ou `"quote"` (demande de devis).

### Tester achat direct vs devis (Furniture)

Pour le mobilier haut de gamme, l'hypothèse « achat en ligne direct » est risquée.
Certaines fiches sont déjà en `cta: "quote"` : compare le taux de clic des deux
CTA pour décider du bon modèle sur ce segment (voir `docs/VALIDATION.md`, H2).

## Structure

```
app/
  layout.tsx        # layout + chargement Plausible optionnel
  page.tsx          # segments + grille + ouverture du lecteur
  globals.css       # thème + masonry (colonnes CSS) + lecteur immersif
  go/[id]/route.ts  # redirection tracée des clics sortants
components/
  VideoGrid.tsx     # grille masonry de vignettes
  ImmersivePlayer.tsx # lecteur vertical plein écran (scroll-snap, autoplay muet)
lib/
  data.ts           # données de test (à remplacer)
  analytics.ts      # wrapper de tracking
```

## Prochaines étapes vers le MVP

Ajouter i18n (next-intl), la vraie source de contenu (Payload CMS), la recherche
(Meilisearch) et le prestataire vidéo retenu (Bunny) — voir `docs/ARCHITECTURE.md`
et `docs/ROADMAP.md`.
