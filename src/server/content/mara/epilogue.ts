import "server-only";
import type { Locale } from "@/i18n/config";
import { maraText } from ".";

/** Ending-screen section for teams who got into Mara's HarbourMail. */
export function maraEpilogue(loc: Locale): string {
  return maraText(loc).epilogue.join("\n\n");
}
