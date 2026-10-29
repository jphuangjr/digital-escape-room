"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/client";
import { roomCodeFromScan } from "@/lib/scanCode";

/** Chrome/Android's built-in detector; Safari has none, so we fall back to jsQR (loaded only when scanning). */
interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: {
      new (opts: { formats: string[] }): Detector;
      getSupportedFormats(): Promise<string[]>;
    };
  }
}

async function makeDecoder(): Promise<(video: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<string | null>> {
  const BD = window.BarcodeDetector;
  if (BD && (await BD.getSupportedFormats().catch(() => [] as string[])).includes("qr_code")) {
    const detector = new BD({ formats: ["qr_code"] });
    return async (video) => (await detector.detect(video).catch(() => []))[0]?.rawValue ?? null;
  }
  const { default: jsQR } = await import("jsqr");
  return async (video, canvas) => {
    // Scan a downscaled frame: plenty for a QR code at arm's length, and fast on older phones.
    const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * scale);
    const h = Math.round(video.videoHeight * scale);
    if (!w || !h) return null;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return (
      jsQR(ctx.getImageData(0, 0, w, h).data, w, h, {
        inversionAttempts: "dontInvert",
      })?.data ?? null
    );
  };
}

/** A camera button that opens a full-screen scanner and hands back the room code from an invite QR code. */
export function QrScanButton({ onCode, className = "" }: { onCode: (code: string) => void; className?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("site.scan.button")}
        title={t("site.scan.button")}
        className={`flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-noir-line bg-noir-bg-3 text-noir-ink active:bg-noir-bg ${className}`}
      >
        <ScanIcon />
      </button>
      {/* On <body>: an ancestor with a transform (page animations) would otherwise trap `fixed` inside the card. */}
      {open &&
        createPortal(
          <QrScanner
            onClose={() => setOpen(false)}
            onCode={(code) => {
              setOpen(false);
              onCode(code);
            }}
          />,
          document.body,
        )}
    </>
  );
}

function QrScanner({ onCode, onClose }: { onCode: (code: string) => void; onClose: () => void }) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"starting" | "scanning" | "denied" | "unavailable">("starting");
  const [notRoom, setNotRoom] = useState(false);
  const done = useRef(onCode);
  done.current = onCode;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const canvas = document.createElement("canvas");

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setStatus("unavailable");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch (err) {
        const name = (err as Error)?.name;
        return setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      }
      const video = videoRef.current;
      if (stopped || !video) return stream.getTracks().forEach((tr) => tr.stop());
      video.srcObject = stream;
      await video.play().catch(() => {});
      const decode = await makeDecoder();
      setStatus("scanning");

      const tick = async () => {
        if (stopped) return;
        const text = video.readyState >= 2 ? await decode(video, canvas) : null;
        if (stopped) return;
        if (text) {
          const code = roomCodeFromScan(text);
          if (code) {
            navigator.vibrate?.(40);
            return done.current(code);
          }
          setNotRoom(true);
        }
        timer = setTimeout(tick, 150);
      };
      void tick();
    })();

    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const message =
    status === "denied"
      ? t("site.scan.denied")
      : status === "unavailable"
        ? t("site.scan.unavailable")
        : notRoom
          ? t("site.scan.notRoom")
          : t("site.scan.hint");

  return (
    <div role="dialog" aria-modal="true" aria-label={t("site.scan.button")} className="fixed inset-0 z-50 flex flex-col bg-black">
      <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
      {/* Viewfinder: a clear square with brass corners over a dimmed frame. */}
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="relative aspect-square w-[min(70vw,18rem)] rounded-2xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.55)]">
            {[
              "left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl",
              "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
            ].map((c) => (
              <span key={c} className={`absolute h-10 w-10 border-noir-brass ${c}`} />
            ))}
          </div>
        </div>
      )}
      <div className="relative flex justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("site.scan.close")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-2xl text-white"
        >
          ×
        </button>
      </div>
      <p
        role="status"
        className="relative mx-4 mt-auto mb-[max(2rem,env(safe-area-inset-bottom))] rounded-lg bg-black/70 px-4 py-3 text-center text-base text-white"
      >
        {message}
      </p>
    </div>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 16h3" />
    </svg>
  );
}
