// shorts.shiipiit — détection de robots côté serveur.
//
// Pourquoi : les prévisualisations de lien (WhatsApp, Slack, Discord, Telegram,
// X/Twitter, LinkedIn…) et les crawlers PRÉCHARGENT les URL partagées. Chacune
// de ces requêtes toucherait `/go/[id]` et gonflerait artificiellement le CTR.
//
// Règle non négociable : on ne bloque JAMAIS la redirection. Un faux positif
// doit coûter une mesure manquante, jamais un visiteur perdu.

const BOT_UA =
  /bot\b|crawler|spider|crawl|slurp|preview|facebookexternalhit|whatsapp|slack|discord|telegram|twitter|linkedin|embedly|quora|pinterest|reddit|applebot|bingpreview|headless|lighthouse|gtmetrix|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http-client|okhttp|java\/|libwww|scrapy|postman|insomnia/i;

/**
 * Vrai si la requête ressemble à un robot.
 * Un user-agent absent ou anormalement court est traité comme un robot : aucun
 * navigateur réel n'en envoie.
 */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || ua.trim().length < 15) return true;
  return BOT_UA.test(ua);
}

/**
 * Vrai si la requête provient d'une page du site lui-même.
 * Signal secondaire : la politique de referrer par défaut des navigateurs
 * (`strict-origin-when-cross-origin`) transmet bien l'origine en same-origin,
 * mais certains navigateurs stricts la suppriment — d'où l'usage en
 * complément du user-agent, jamais seul.
 */
export function isSameOriginReferer(referer: string | null | undefined, origin: string): boolean {
  if (!referer) return false;
  try {
    return new URL(referer).origin === origin;
  } catch {
    return false;
  }
}
