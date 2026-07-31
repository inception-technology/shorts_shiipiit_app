// Petit wrapper de tracking. Envoie à Plausible si disponible (script chargé via
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN), et journalise toujours dans la console en dev.
// Événements clés pour la validation (voir VALIDATION.md) :
//   page_view · segment_switch · video_open · outbound_click

type Props = Record<string, unknown>;

export function track(event: string, props: Props = {}): void {
  if (typeof window !== "undefined") {
    const plausible = (window as unknown as { plausible?: (e: string, o?: { props: Props }) => void }).plausible;
    if (typeof plausible === "function") plausible(event, { props });
  }
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[track]", event, props);
  }
}
