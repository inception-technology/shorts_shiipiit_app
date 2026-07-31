import { NextResponse } from "next/server";
import { videos } from "@/lib/data";

// Redirection tracée : compte le clic sortant côté serveur (indépendant des
// bloqueurs de scripts), puis renvoie 302 vers la fiche produit de ta boutique.
// En prod, remplace le console.log par une écriture en base / un event analytics.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = videos.find((v) => v.id === id);

  // eslint-disable-next-line no-console
  console.log(
    "[outbound_click]",
    JSON.stringify({
      id,
      segment: item?.segment ?? null,
      cta: item?.cta ?? null,
      at: new Date().toISOString(),
    })
  );

  const target = item?.productUrl ?? "/";
  return NextResponse.redirect(target, 302);
}
