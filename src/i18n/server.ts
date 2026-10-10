import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createIntl, createIntlCache, type IntlShape } from "react-intl";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, pickLocale, type Locale } from "./config";
import { MESSAGES } from "./messages";

/** The request's locale: the `lang` cookie if set, else the browser's Accept-Language. */
export const getLocale = cache(async (): Promise<Locale> => {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(c)) return c;
  return pickLocale((await headers()).get("accept-language"));
});

const intlCache = createIntlCache();

export function intlFor(locale: Locale): IntlShape {
  return createIntl({ locale, defaultLocale: DEFAULT_LOCALE, messages: MESSAGES[locale] }, intlCache);
}

/** For server components and route handlers: `const t = await getT(); t("api.room.notFound")`. */
export async function getT() {
  const intl = intlFor(await getLocale());
  return (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);
}
