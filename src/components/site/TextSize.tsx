"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/i18n/client";

/**
 * The player's text size, per device: `--text-scale` in globals.css multiplies every text-* size (layout and
 * spacing stay put). Stored in localStorage and applied as <html data-text-size> by TEXT_SIZE_SCRIPT before the
 * page paints, so a chosen size never flashes back to default. The game shells ask for it once per device, as the
 * first step of onboarding; the room menu can change it any time.
 */
export const TEXT_SIZES = ["default", "large", "larger"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

const KEY = "text_size";
const EVENT = "escape:textsize";

const isTextSize = (v: unknown): v is TextSize => typeof v === "string" && (TEXT_SIZES as readonly string[]).includes(v);

/** Inline in <head> (layout.tsx): sets the saved size before first paint. Keep in step with KEY and the CSS. */
export const TEXT_SIZE_SCRIPT = `try{var s=localStorage.getItem("${KEY}");if(s==="large"||s==="larger")document.documentElement.dataset.textSize=s}catch(e){}`;

function storedTextSize(): TextSize | null {
  try {
    const v = localStorage.getItem(KEY);
    return isTextSize(v) ? v : null;
  } catch {
    return null;
  }
}

function applyTextSize(size: TextSize) {
  if (size === "default") delete document.documentElement.dataset.textSize;
  else document.documentElement.dataset.textSize = size;
}

/** The current size and a setter that applies, saves and tells every other control on the page. */
export function useTextSize(): [TextSize, (size: TextSize) => void] {
  const [size, setSize] = useState<TextSize>("default");
  useEffect(() => {
    setSize(storedTextSize() ?? "default");
    const onChange = (e: Event) => setSize((e as CustomEvent<TextSize>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  const set = useCallback((next: TextSize) => {
    applyTextSize(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }, []);
  return [size, set];
}

/** Three "Aa" buttons, smallest to largest. Changes apply instantly. */
export function TextSizeControl({ className = "" }: { className?: string }) {
  const t = useT();
  const [size, setSize] = useTextSize();
  // Fixed pixel sizes on purpose: the buttons show the steps, and shouldn't grow with the setting themselves.
  const sample: Record<TextSize, string> = { default: "15px", large: "18px", larger: "21px" };
  return (
    <div role="radiogroup" aria-label={t("textSize.label")} className={`grid grid-cols-3 gap-2 ${className}`}>
      {TEXT_SIZES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={size === s}
          onClick={() => setSize(s)}
          className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 ${
            size === s ? "border-amber-400 bg-amber-500/10 text-amber-200" : "border-stone-700 text-stone-300 active:bg-stone-900"
          }`}
        >
          <span aria-hidden className="font-serif leading-none" style={{ fontSize: sample[s] }}>
            Aa
          </span>
          <span className="text-xs">{t(`textSize.${s}`)}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * The onboarding step: until this device has picked a size, `pending` is true and `element` asks for one (above the
 * game's intro). Shells hold their tour back while it's pending, so the tour measures the final layout.
 */
export function useTextSizeStep(): { pending: boolean; element: React.ReactNode } {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (storedTextSize() === null) setPending(true);
  }, []);
  const element = pending ? <TextSizeCard onDone={() => setPending(false)} /> : null;
  return { pending, element };
}

function TextSizeCard({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [size, setSize] = useTextSize();
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center" role="dialog" aria-modal="true" aria-labelledby="textsize-title">
      <div className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl border border-stone-700 bg-stone-950 p-5 shadow-2xl">
        <h2 id="textsize-title" className="font-serif text-2xl text-stone-100">
          {t("textSize.title")}
        </h2>
        <p className="mt-2 text-sm text-stone-400">{t("textSize.body")}</p>
        <p className="mt-4 rounded-lg border border-stone-800 bg-stone-900/60 p-3 font-serif text-base leading-relaxed text-stone-200">{t("textSize.sample")}</p>
        <TextSizeControl className="mt-4" />
        <button
          type="button"
          onClick={() => {
            setSize(size); // saves "default" too, so the question isn't asked again
            onDone();
          }}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-lg bg-amber-500 font-semibold text-stone-950 active:bg-amber-400"
        >
          {t("textSize.continue")}
        </button>
        <p className="mt-2 text-center text-xs text-stone-500">{t("textSize.later")}</p>
      </div>
    </div>
  );
}
