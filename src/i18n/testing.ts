// Tests only: render a message id in English, the way a phone set to English would see it.
import { IntlMessageFormat } from "intl-messageformat";
import { MESSAGES } from "./messages";

export function enT(id: string | undefined, values?: Record<string, string | number>): string {
  if (!id) return "";
  const msg = MESSAGES.en[id];
  if (msg === undefined) throw new Error(`No English message ${id}`);
  return String(new IntlMessageFormat(msg, "en").format(values));
}
