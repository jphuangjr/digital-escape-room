"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/client";

/**
 * "Add to your home screen" for phone visitors in a browser tab. Android/Chrome gets an Install button
 * (the browser's beforeinstallprompt); iOS has no such event, so it gets the Share → Add to Home Screen
 * steps. Never inside the installed app, never during a game, and a dismissal holds for a few weeks.
 */

const DISMISS_KEY = "escape_install_dismissed";
const SNOOZE_MS = 21 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 4000; // after the lobby's vault intro

/** Pages a visitor browses between games. Rooms (/r/...) are the games themselves. */
const SHOW_ON = /^\/($|play\/|profile)/;

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

function isIOS() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

function isPhone() {
  return isIOS() || /Android/.test(navigator.userAgent);
}

function snoozed() {
  try {
    return Date.now() - Number(localStorage.getItem(DISMISS_KEY) || 0) < SNOOZE_MS;
  } catch {
    return false;
  }
}

export function InstallBanner() {
  const t = useT();
  const pathname = usePathname();
  const [mode, setMode] = useState<"ios" | "android" | null>(null);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (!isPhone() || isStandalone() || snoozed()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const showLater = (m: "ios" | "android") => {
      timer = setTimeout(() => setMode(m), SHOW_AFTER_MS);
    };
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
      clearTimeout(timer);
      showLater("android");
    };
    const onInstalled = () => setMode(null);
    if (isIOS()) showLater("ios");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setMode(null);
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setMode(null);
    else dismiss();
  }

  if (!mode || !SHOW_ON.test(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-safe pb-safe" role="region" aria-label={t("site.install.title")}>
      <div className="m-3 flex items-start gap-3 rounded-xl border border-noir-line bg-noir-bg-2/95 p-4 shadow-2xl backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-11 w-11 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg leading-tight text-noir-ink">{t("site.install.title")}</p>
          <p className="mt-1 text-sm leading-relaxed text-noir-ink-dim">
            {mode === "ios" ? (
              <>
                {t("site.install.iosBefore")}
                <ShareIcon />
                {t("site.install.iosAfter")}
              </>
            ) : (
              t("site.install.body")
            )}
          </p>
          {mode === "android" && (
            <button
              type="button"
              onClick={install}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-noir-brass px-5 font-semibold text-noir-bg"
            >
              {t("site.install.button")}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("site.install.dismiss")}
          className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center text-xl text-noir-ink-faint"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/** Safari's Share glyph, inline with the text. */
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="mx-1 inline h-4 w-4 -translate-y-0.5 text-noir-brass" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}
