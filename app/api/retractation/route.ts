import { NextResponse } from "next/server";

// Fonctionnalité de rétractation en ligne.
//   - Article L221-21 (dernier alinéa) — ordonnance n° 2026-2 du 5 janvier 2026.
//   - Article D221-5 — décret n° 2026-3 du 5 janvier 2026, art. 2.
// En vigueur depuis le 19 juin 2026. Les contrats en cours à cette date restent
// régis par les dispositions antérieures.
//
// D221-5 impose que l'accusé de réception mentionne « notamment le contenu de la
// déclaration de rétractation ainsi que la date et l'heure de son envoi ».
//
// Cette route reçoit le formulaire hébergé sur shiipiit.com (page Shopify),
// envoie un **accusé de réception horodaté** au consommateur sur support durable,
// notifie la boutique, et journalise la demande comme preuve de transmission.
//
// Pourquoi ici plutôt que dans Shopify : la preuve de l'accusé de réception doit
// pouvoir être produite à la demande. En la logeant dans une infrastructure que
// l'on contrôle, on ne dépend ni d'un forfait, ni d'une application tierce.
//
// Variables d'environnement :
//   RETRACTATION_ALLOWED_ORIGIN   origine autorisée (ex. https://shiipiit.com)
//   RETRACTATION_NOTIFY_TO        adresse qui reçoit les demandes côté boutique
//   RESEND_API_KEY                clé d'envoi d'e-mail (facultative en dev)
//   RESEND_FROM                   expéditeur vérifié (ex. contact@shiipiit.com)

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_ORIGIN = process.env.RETRACTATION_ALLOWED_ORIGIN || "https://shiipiit.com";

function corsHeaders(origin: string | null): Record<string, string> {
  const ok = origin === ALLOWED_ORIGIN;
  return {
    "access-control-allow-origin": ok ? ALLOWED_ORIGIN : "null",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

interface Demande {
  /** D221-5 a) — nom et prénom. */
  nom: string;
  prenom: string;
  /** D221-5 c) — moyen électronique choisi pour recevoir l'accusé de réception.
   *  Ce n'est pas nécessairement l'adresse utilisée lors de la commande. */
  email: string;
  /** D221-5 b) — indications détaillées permettant d'identifier le contrat. */
  commande: string;
  dateCommande?: string;
  produits?: string;
  /** Champ piège : rempli uniquement par les robots. */
  site?: string;
}

function invalide(d: Partial<Demande>): string | null {
  if (!d.nom || d.nom.trim().length < 2) return "nom";
  if (!d.prenom || d.prenom.trim().length < 2) return "prenom";
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return "email";
  if (!d.commande || d.commande.trim().length < 2) return "commande";
  return null;
}

async function envoyerEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    // En développement, on journalise : ne jamais échouer silencieusement en prod.
    // eslint-disable-next-line no-console
    console.warn("[retractation] e-mail non configuré", JSON.stringify({ to, subject }));
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error("[retractation] échec d'envoi", res.status, await res.text().catch(() => ""));
    }
    return res.ok;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[retractation] erreur d'envoi", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function POST(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));

  let d: Partial<Demande>;
  try {
    d = (await req.json()) as Partial<Demande>;
  } catch {
    return NextResponse.json({ ok: false, erreur: "format" }, { status: 400, headers });
  }

  // Champ piège : on répond 200 pour ne pas renseigner les robots, sans rien faire.
  if (d.site) return NextResponse.json({ ok: true }, { status: 200, headers });

  const champ = invalide(d);
  if (champ) {
    return NextResponse.json({ ok: false, erreur: "champ", champ }, { status: 422, headers });
  }

  const recu = new Date();
  const horodatage = recu.toISOString();
  const reference = `RETR-${recu.getUTCFullYear()}${String(recu.getUTCMonth() + 1).padStart(2, "0")}${String(
    recu.getUTCDate()
  ).padStart(2, "0")}-${Math.abs(
    [...`${d.email}${d.commande}${horodatage}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 6)}`;

  const envoiLe = recu.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

  // Contenu de la déclaration, reproduit tel quel dans l'accusé de réception
  // conformément à D221-5.
  const resume = [
    `Référence : ${reference}`,
    `Date et heure d'envoi de la déclaration : ${envoiLe} (heure de Paris)`,
    `Nom et prénom : ${d.prenom} ${d.nom}`,
    `Contrat concerné : commande ${d.commande}${d.dateCommande ? ` du ${d.dateCommande}` : ""}`,
    d.produits ? `Produits concernés : ${d.produits}` : "Produits concernés : toute la commande",
    `Moyen électronique choisi pour l'accusé de réception : ${d.email}`,
  ].join("\n");

  // 1) Accusé de réception au consommateur — support durable, exigence D221-5.
  const accuse = await envoyerEmail(
    d.email!,
    `Accusé de réception de votre rétractation — ${reference}`,
    `Bonjour ${d.prenom},

Nous accusons réception de votre décision de vous rétracter du contrat conclu à
distance.

Contenu de votre déclaration de rétractation :

${resume}

Ce message vaut accusé de réception sur support durable (art. D221-5 du code de
la consommation). Conservez-le.

Suite de la procédure :
1. Renvoyez le ou les biens au plus tard 14 jours après cet e-mail.
2. Nous vous remboursons au plus tard 14 jours après avoir été informés de votre
   décision, par le même moyen de paiement, frais de livraison standard inclus.
   Nous pouvons différer le remboursement jusqu'à récupération du bien ou preuve
   de son expédition.

Pour toute question, répondez simplement à ce message.

shiipiit`
  );

  // 2) Notification à la boutique.
  const notif = process.env.RETRACTATION_NOTIFY_TO;
  if (notif) {
    await envoyerEmail(notif, `Rétractation reçue — ${reference}`, resume);
  }

  // 3) Journalisation : preuve de transmission à conserver.
  // eslint-disable-next-line no-console
  console.log(
    "[retractation]",
    JSON.stringify({
      reference,
      horodatage,
      email: d.email,
      commande: d.commande,
      dateCommande: d.dateCommande ?? null,
      accuse,
    })
  );

  return NextResponse.json({ ok: true, reference, accuse }, { status: 200, headers });
}
