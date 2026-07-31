// Données de test. Remplace `poster`, `src` et `productUrl` par tes vraies vidéos
// (Bunny/Cloudflare) et tes fiches produit. `cta` vaut 'buy' (achat direct) ou
// 'quote' (demande de devis) — sert à comparer les deux appels à l'action,
// notamment sur Furniture (voir VALIDATION.md, hypothèse H2).

export type Segment = "electronics" | "furniture";

export interface VideoItem {
  id: string;
  segment: Segment;
  title: string;
  price?: string;
  /** Image de couverture verticale (poster). */
  poster: string;
  /** URL de la vidéo (mp4/HLS). Vide = seul le poster s'affiche. */
  src?: string;
  /** Fiche produit de TA boutique (cible du CTA). */
  productUrl: string;
  /** 'buy' = achat direct ; 'quote' = demande de devis. */
  cta: "buy" | "quote";
}

// Poster de démonstration (à remplacer). Vertical 400x700.
const poster = (seed: string) => `https://picsum.photos/seed/${seed}/400/700`;
// Vidéo de démonstration (à remplacer par tes vraies vidéos verticales).
const demo = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const videos: VideoItem[] = [
  // ---------------- Electronics (achat direct) ----------------
  { id: "e1", segment: "electronics", title: "SSD NVMe PCIe 4.0 1 To", price: "89 €", poster: poster("ssd-nvme-4"), src: demo, productUrl: "https://ta-boutique.example/p/ssd-nvme-4-1to", cta: "buy" },
  { id: "e2", segment: "electronics", title: "SSD NVMe PCIe 5.0 2 To", price: "179 €", poster: poster("ssd-nvme-5"), productUrl: "https://ta-boutique.example/p/ssd-nvme-5-2to", cta: "buy" },
  { id: "e3", segment: "electronics", title: "SSD NVMe PCIe 3.0 512 Go", price: "49 €", poster: poster("ssd-nvme-3"), productUrl: "https://ta-boutique.example/p/ssd-nvme-3-512", cta: "buy" },
  { id: "e4", segment: "electronics", title: "Boîtier SSD USB-C 10 Gbps", price: "29 €", poster: poster("ssd-enclosure"), productUrl: "https://ta-boutique.example/p/boitier-ssd-usbc", cta: "buy" },
  { id: "e5", segment: "electronics", title: "Barrette RAM DDR5 32 Go", price: "119 €", poster: poster("ram-ddr5"), productUrl: "https://ta-boutique.example/p/ram-ddr5-32", cta: "buy" },
  { id: "e6", segment: "electronics", title: "Dissipateur SSD M.2", price: "15 €", poster: poster("heatsink"), productUrl: "https://ta-boutique.example/p/dissipateur-m2", cta: "buy" },
  { id: "e7", segment: "electronics", title: "Adaptateur PCIe → M.2", price: "22 €", poster: poster("pcie-adapter"), productUrl: "https://ta-boutique.example/p/adaptateur-pcie-m2", cta: "buy" },
  { id: "e8", segment: "electronics", title: "Clé USB 4.0 1 To", price: "99 €", poster: poster("usb4"), productUrl: "https://ta-boutique.example/p/cle-usb4-1to", cta: "buy" },

  // ---------------- Furniture (test achat direct vs devis) ----------------
  { id: "f1", segment: "furniture", title: "Canapé modulaire cuir pleine fleur", price: "2 400 €", poster: poster("sofa-leather"), src: demo, productUrl: "https://ta-boutique.example/p/canape-modulaire-cuir", cta: "buy" },
  { id: "f2", segment: "furniture", title: "Table à manger marbre sur mesure", price: "sur devis", poster: poster("marble-table"), productUrl: "https://ta-boutique.example/p/table-marbre", cta: "quote" },
  { id: "f3", segment: "furniture", title: "Fauteuil design velours", price: "690 €", poster: poster("armchair-velvet"), productUrl: "https://ta-boutique.example/p/fauteuil-velours", cta: "buy" },
  { id: "f4", segment: "furniture", title: "Lit ultra-luxe tête capitonnée", price: "sur devis", poster: poster("luxury-bed"), productUrl: "https://ta-boutique.example/p/lit-capitonne", cta: "quote" },
  { id: "f5", segment: "furniture", title: "Buffet bois massif nature", price: "1 350 €", poster: poster("sideboard-wood"), productUrl: "https://ta-boutique.example/p/buffet-bois", cta: "buy" },
  { id: "f6", segment: "furniture", title: "Bibliothèque haute sur mesure", price: "sur devis", poster: poster("bookshelf"), productUrl: "https://ta-boutique.example/p/bibliotheque-sur-mesure", cta: "quote" },
  { id: "f7", segment: "furniture", title: "Chaise minimaliste (lot de 4)", price: "480 €", poster: poster("chairs-4"), productUrl: "https://ta-boutique.example/p/chaises-lot4", cta: "buy" },
  { id: "f8", segment: "furniture", title: "Console d'entrée laquée", price: "540 €", poster: poster("console-lacquer"), productUrl: "https://ta-boutique.example/p/console-laquee", cta: "buy" },
];
