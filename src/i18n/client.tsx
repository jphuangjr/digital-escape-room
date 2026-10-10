"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { IntlProvider, useIntl } from "react-intl";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_NAMES, LOCALES, type Locale } from "./config";
import type { Messages } from "./messages";

export function IntlClientProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={messages}>
      {children}
    </IntlProvider>
  );
}

type Values = Record<string, string | number | boolean | null | undefined | Date>;

/** `const t = useT(); t("shell.dock.room")`. Use <FormattedMessage> when a message has rich-text tags. */
export function useT() {
  const intl = useIntl();
  return useCallback((id: string, values?: Values) => intl.formatMessage({ id }, values), [intl]);
}

export function useLocale(): Locale {
  return useIntl().locale as Locale;
}

/** Saves the choice for a year and re-renders server components with the new messages (client state is kept). */
export function useSetLocale() {
  const router = useRouter();
  return useCallback(
    (locale: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = locale;
      router.refresh();
    },
    [router],
  );
}

/** Compact two-way switcher ("English · 한국어"). `tone` matches the surrounding surface. */
export function LanguageSwitcher({ className = "", tone = "noir" }: { className?: string; tone?: "noir" | "shell" }) {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useT();
  const active = tone === "noir" ? "text-noir-brass" : "text-amber-300";
  const idle = tone === "noir" ? "text-noir-ink-faint" : "text-stone-500";
  return (
    <div role="group" aria-label={t("common.language")} className={`flex items-center gap-1 text-sm ${className}`}>
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className={idle} aria-hidden>·</span>}
          <button
            type="button"
            lang={l}
            aria-pressed={l === locale}
            onClick={() => l !== locale && setLocale(l)}
            className={`min-h-11 px-2 ${l === locale ? `font-semibold ${active}` : idle}`}
          >
            {LOCALE_NAMES[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
