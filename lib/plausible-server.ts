// shorts.shiipiit — envoi d'événements Plausible depuis le serveur (Events API).
//
// C'est CETTE voie qui fait foi pour le CTR sortant : elle est insensible aux
// bloqueurs de scripts, contrairement au tracking navigateur. Le clic n'est donc
// plus émis côté client (sinon il serait compté deux fois, et le CTR serait
// surestimé d'un facteur proche de 2 sur la part non bloquée du trafic).
//
// Variables d'environnement (côté serveur, SANS préfixe NEXT_PUBLIC_) :
//
//   PLAUSIBLE_DOMAIN            Domaine déclaré dans Plausible.
//                               Repli : NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
//   PLAUSIBLE_HOST              https://plausible.io par défaut. À changer pour
//                               une instance auto-hébergée.
//   PLAUSIBLE_SEGMENTED_EVENTS  "1" pour émettre EN PLUS un événement dont le
//                               nom porte l'univers et le CTA, par exemple
//                               `outbound_click_furniture_quote`.
//
// ⚠️ Sur Plausible Cloud, les **propriétés personnalisées** (props) ne sont
// lisibles qu'à partir du plan Growth. Sans elles, tu n'obtiens qu'un CTR
// global : le CTR par univers et par type de CTA — donc l'hypothèse H2
// (achat direct vs devis) — n'est pas mesurable. Dans ce cas, active
// PLAUSIBLE_SEGMENTED_EVENTS=1 : chaque combinaison devient un objectif
// distinct, lisible sur tous les plans. Coût : un événement facturé de plus
// par clic.

type Props = Record<string, string | number | boolean>;

export interface EventContext {
  /** URL de la page à laquelle rattacher l'événement. */
  url: string;
  /** User-agent du visiteur — Plausible s'en sert pour l'attribution. */
  userAgent: string | null;
  /** IP du visiteur — sert au comptage des visiteurs uniques, jamais stockée. */
  ip: string | null;
  referrer: string | null;
}

const TIMEOUT_MS = 1500;

function plausibleDomain(): string | undefined {
  return process.env.PLAUSIBLE_DOMAIN || process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
}

function plausibleEndpoint(): string {
  const host = (process.env.PLAUSIBLE_HOST || "https://plausible.io").replace(/\/+$/, "");
  return `${host}/api/event`;
}

export function segmentedEventsEnabled(): boolean {
  return process.env.PLAUSIBLE_SEGMENTED_EVENTS === "1";
}

export function segmentedEventName(base: string, seg: string, cta: string): string {
  return `${base}_${seg}_${cta}`;
}

/**
 * Envoie un événement à Plausible. Ne lève jamais : une panne de la mesure ne
 * doit pas empêcher le visiteur d'atteindre sa destination.
 * Retourne `true` si l'événement a bien été accepté.
 */
export async function sendPlausibleEvent(
  name: string,
  ctx: EventContext,
  props: Props = {}
): Promise<boolean> {
  const domain = plausibleDomain();

  if (!domain) {
    // Pas de domaine configuré : on journalise en clair pour ne pas perdre le
    // signal en développement. En production, renseigne PLAUSIBLE_DOMAIN —
    // sinon AUCUN clic n'est mesuré.
    // eslint-disable-next-line no-console
    console.warn("[plausible] non configuré — événement perdu", JSON.stringify({ name, props }));
    return false;
  }

  try {
    const res = await fetch(plausibleEndpoint(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Sans ces deux en-têtes, Plausible attribuerait TOUS les clics au
        // serveur Vercel : un seul visiteur, un seul pays, aucun sens.
        "user-agent": ctx.userAgent ?? "",
        "x-forwarded-for": ctx.ip ?? "",
      },
      body: JSON.stringify({
        name,
        domain,
        url: ctx.url,
        referrer: ctx.referrer ?? "",
        props,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn("[plausible] refus", res.status, await res.text().catch(() => ""));
    }
    return res.ok;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[plausible] échec d'envoi", err instanceof Error ? err.message : err);
    return false;
  }
}
