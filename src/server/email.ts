import "server-only";

/**
 * Outgoing email through Resend's HTTP API (no SDK). Configured by RESEND_API_KEY and EMAIL_FROM
 * ("Escape Escape <login@your-domain>", a sender on a domain verified in Resend). Outside production, without a
 * key, messages are printed to the server log instead so sign-in can be tried locally.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM;
// EMAIL_LOG=1 forces logging in a local production build (`next start`); never set it on Vercel.
const devLog = !apiKey && (process.env.NODE_ENV !== "production" || process.env.EMAIL_LOG === "1");

/** Email can be sent (or, in local development, logged). */
export const emailEnabled = Boolean(apiKey && from) || devLog;

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(msg: OutgoingEmail): Promise<boolean> {
  if (devLog) {
    console.info(`[email] to ${msg.to}: ${msg.subject}\n${msg.text}`);
    return true;
  }
  if (!apiKey || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    });
    if (!res.ok) console.warn(`[email] send failed: ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`);
    return res.ok;
  } catch (err) {
    console.warn("[email] send failed", err instanceof Error ? err.message : err);
    return false;
  }
}
