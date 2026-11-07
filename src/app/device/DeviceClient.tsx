"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n/client";
import { SIDE_RAIL_MIN_RIGHT } from "@/lib/sideRail";

interface Snapshot {
  window: string;
  screen: string;
  ratio: string;
  orientation: string;
  safe: { top: number; right: number; bottom: number; left: number };
  standalone: boolean;
  posture: string | null;
  segments: boolean;
  sideRail: boolean;
  userAgent: string;
}

/**
 * Live device facts for checking layouts on unusual hardware (the iPhone Duo, folded and unfolded). Everything
 * updates on resize, which folding, unfolding and rotating all fire. Safe-area insets only exist in CSS, so a
 * hidden probe carries them as padding and we read its computed style.
 */
export function DeviceClient() {
  const t = useT();
  const probe = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    const read = () => {
      const s = probe.current ? getComputedStyle(probe.current) : null;
      const px = (v: string | undefined) => Math.round(parseFloat(v ?? "") || 0);
      const nav = navigator as Navigator & { devicePosture?: { type?: string }; standalone?: boolean };
      setSnap({
        window: `${innerWidth} × ${innerHeight}`,
        screen: `${screen.width} × ${screen.height}`,
        ratio: String(Math.round(devicePixelRatio * 100) / 100),
        orientation: screen.orientation?.type ?? "",
        safe: { top: px(s?.paddingTop), right: px(s?.paddingRight), bottom: px(s?.paddingBottom), left: px(s?.paddingLeft) },
        standalone: matchMedia("(display-mode: standalone)").matches || nav.standalone === true,
        posture: nav.devicePosture?.type ?? null,
        segments: "viewport" in window,
        sideRail: document.documentElement.classList.contains("side-rail"),
        userAgent: navigator.userAgent,
      });
    };
    read();
    // The side-rail script also listens for resize; read after it has run.
    const onResize = () => requestAnimationFrame(read);
    addEventListener("resize", onResize);
    screen.orientation?.addEventListener?.("change", onResize);
    return () => {
      removeEventListener("resize", onResize);
      screen.orientation?.removeEventListener?.("change", onResize);
    };
  }, []);

  const yesNo = (b: boolean) => (b ? t("device.yes") : t("device.no"));
  const rows: [string, string][] = snap
    ? [
        [t("device.window"), snap.window],
        [t("device.screen"), snap.screen],
        [t("device.ratio"), snap.ratio],
        [t("device.orientation"), snap.orientation || t("device.notAvailable")],
        [t("device.safeTop"), `${snap.safe.top}px`],
        [t("device.safeRight"), `${snap.safe.right}px`],
        [t("device.safeBottom"), `${snap.safe.bottom}px`],
        [t("device.safeLeft"), `${snap.safe.left}px`],
        [t("device.standalone"), yesNo(snap.standalone)],
        [t("device.posture"), snap.posture ?? t("device.notAvailable")],
        [t("device.segments"), snap.segments ? t("device.available") : t("device.notAvailable")],
        [t("device.sideRail", { min: SIDE_RAIL_MIN_RIGHT }), yesNo(snap.sideRail)],
      ]
    : [];

  return (
    <main className="noir-vignette min-h-dvh px-edge pt-edge pb-safe">
      <div
        ref={probe}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 h-0 w-0"
        style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}
      />
      <div className="mx-auto flex max-w-xl flex-col gap-5 pb-12">
        <Link href="/profile" className="text-sm text-noir-ink-faint">
          ← {t("device.back")}
        </Link>
        <header>
          <p className="font-mono text-11px uppercase tracking-[0.3em] text-noir-ink-faint">{t("device.eyebrow")}</p>
          <h1 className="font-serif text-3xl text-noir-ink">{t("device.title")}</h1>
          <p className="mt-1 text-sm text-noir-ink-dim">{t("device.intro")}</p>
        </header>
        {!snap ? (
          <p className="text-noir-ink-faint">{t("common.loading")}</p>
        ) : (
          <>
            <dl className="divide-y divide-noir-line overflow-hidden rounded-xl border border-noir-line bg-noir-bg-2/90">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-noir-ink-dim">{label}</dt>
                  <dd className="text-right font-mono text-sm text-noir-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <section className="rounded-xl border border-noir-line bg-noir-bg-2/90 px-4 py-3">
              <h2 className="text-sm text-noir-ink-dim">{t("device.browser")}</h2>
              <p className="mt-1 break-words font-mono text-xs leading-relaxed text-noir-ink">{snap.userAgent}</p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
