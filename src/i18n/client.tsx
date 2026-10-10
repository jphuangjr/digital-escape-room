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

/**
 * Language picker: a globe, the current language and a native <select> laid over them, so phones show
 * their own picker and it scales to any number of languages. `tone` matches the surrounding surface.
 */
export function LanguageSwitcher({ className = "", tone = "noir" }: { className?: string; tone?: "noir" | "shell" }) {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useT();
  const color = tone === "noir" ? "text-noir-ink-dim" : "text-stone-400";
  return (
    <label className={`relative inline-flex min-h-11 items-center gap-1.5 px-2 text-sm ${color} ${className}`}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
      <span lang={locale} className="whitespace-nowrap">
        {LOCALE_NAMES[locale]}
      </span>
      <span aria-hidden className="text-xs">
        ▾
      </span>
      <select
        aria-label={t("common.language")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
