import { error, json, readBody } from "@/server/http";
import { emailEnabled, sendEmail } from "@/server/email";
import { CODE_TTL_MS, issueCode, normalizeEmail } from "@/server/emailCode";
import { getT } from "@/i18n/server";

/**
 * POST {email} → emails a 6-digit sign-in code. The same answer whether or not the address has an account, so it
 * can't be used to find out who plays. Rate limited per address and per IP (429 with retryAfterSec).
 */
export async function POST(req: Request) {
  const t = await getT();
  if (!emailEnabled) return error(404, t("api.account.emailOff"));
  const email = normalizeEmail((await readBody(req))?.email);
  if (!email) return error(400, t("api.account.badEmail"));
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
  const issued = await issueCode(email, ip);
  if (!issued.ok) return error(429, t("api.account.tooMany"), { retryAfterSec: issued.retryAfterSec });
  const minutes = CODE_TTL_MS / 60_000;
  const sent = await sendEmail({
    to: email,
    subject: t("api.account.mail.subject", { code: issued.code }),
    text: t("api.account.mail.text", { code: issued.code, minutes }),
    html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#111">
<p>${t("api.account.mail.intro")}</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px;font-family:ui-monospace,monospace">${issued.code}</p>
<p style="color:#555">${t("api.account.mail.expires", { minutes })}</p>
<p style="color:#555">${t("api.account.mail.ignore")}</p></div>`,
  });
  if (!sent) return error(502, t("api.account.sendFailed"));
  return json({ ok: true });
}
