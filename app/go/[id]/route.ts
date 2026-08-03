import { NextResponse } from "next/server";
import { ITEMS } from "@/lib/data";
import { isBotUserAgent } from "@/lib/bots";
import {
  sendPlausibleEvent,
  segmentedEventName,
  segmentedEventsEnabled,
  type EventContext,
} from "@/lib/plausible-server";

// shorts.shiipiit — redirection tracée du clic sortant.
//
// C'est LA source de vérité du CTR : le comptage se fait côté serveur, avant la
// redirection, donc il survit aux bloqueurs de scripts. Le tracking navigateur
// n'émet plus cet événement (double comptage évité).
//
// Invariants :
//  1. Jamais de cache. Une 302 mise en cache par le CDN ou le navigateur ne
//     repasserait plus par cette route : les clics suivants ne seraient pas
//     comptés. D'où `force-dynamic` + `no-store`.
//  2. Les robots et prévisualisations de lien sont redirigés mais PAS comptés.
//  3. La mesure ne bloque jamais la redirection (tout est encapsulé).
//  4. Aucun 500 : id inconnu ou fiche produit non renseignée → repli interne.

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const NO_STORE: Record<string, string> = {
  "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
  "x-robots-tag": "noindex, nofollow",
};

/**
 * Vrai si l'URL de fiche produit est encore une URL de démonstration.
 * `.example`, `.test` et `.invalid` sont des domaines RÉSERVÉS (RFC 2606) :
 * ils ne résolvent jamais. Tant qu'une vraie fiche n'est pas renseignée, on
 * redirige vers la page interne `/p/[id]` — un visiteur qui atterrit sur une
 * erreur DNS ne se comporte pas normalement et fausse la mesure.
 */
function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return true;
    return (
      hostname === "localhost" ||
      hostname.endsWith(".example") ||
      hostname.endsWith(".test") ||
      hostname.endsWith(".invalid") ||
      hostname.endsWith(".localhost")
    );
  } catch {
    return true;
  }
}

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

const LOCALES = new Set(["fr", "en", "zh"]);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reqUrl = new URL(req.url);
  const rawLang = reqUrl.searchParams.get("lang");
  const lang = rawLang && LOCALES.has(rawLang) ? rawLang : "fr";

  const item = ITEMS.find((v) => v.id === id);

  // Id inconnu (lien partagé obsolète, crawler, faute de frappe) : repli sur
  // l'accueil. L'URL DOIT être absolue — `NextResponse.redirect("/")` lève une
  // TypeError et renverrait un 500.
  if (!item) {
    return NextResponse.redirect(new URL("/", req.url), { status: 302, headers: NO_STORE });
  }

  const placeholder = isPlaceholderUrl(item.productUrl);
  const target = placeholder
    ? new URL(`/p/${item.id}?lang=${encodeURIComponent(lang)}`, req.url)
    : new URL(item.productUrl);

  const ua = req.headers.get("user-agent");

  if (!isBotUserAgent(ua)) {
    const ctx: EventContext = {
      // Plausible rattache l'événement à cette URL : on garde le chemin /go/[id]
      // pour distinguer nettement le clic sortant d'une simple page vue.
      url: `${reqUrl.origin}/go/${item.id}`,
      userAgent: ua,
      ip: clientIp(req),
      referrer: req.headers.get("referer"),
    };
    const props = {
      id: item.id,
      segment: item.seg,
      cta: item.cta,
      lang,
      shop: item.shop,
      // « interne » = la boutique n'est pas encore branchée : le clic compte
      // pour H1 (le format fait-il cliquer ?) mais pas pour H2/H3.
      destination: placeholder ? "interne" : "boutique",
    };

    // Attendu volontairement : sur un runtime serverless, la réponse peut
    // terminer l'invocation et couper une requête sortante encore en vol.
    // Le timeout de 1,5 s et le try/catch interne bornent le risque.
    const events = [sendPlausibleEvent("outbound_click", ctx, props)];
    if (segmentedEventsEnabled()) {
      events.push(
        sendPlausibleEvent(segmentedEventName("outbound_click", item.seg, item.cta), ctx, props)
      );
    }
    await Promise.allSettled(events);
  }

  return NextResponse.redirect(target, { status: 302, headers: NO_STORE });
}
