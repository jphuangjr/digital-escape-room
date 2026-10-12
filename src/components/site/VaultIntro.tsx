"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";

/**
 * Lobby entrance: a vault door whose wheel spins, bolts retract, then swings open and the view pushes
 * through into the lobby. Plays once per browser session; tap to skip; never for reduced motion.
 *
 * The overlay is in the server HTML so the lobby doesn't flash before it. A tiny inline script right
 * after it hides it before first paint when it shouldn't play (seen this session / reduced motion).
 * The keyframes end hidden on their own, so the page is never stuck behind it, even without JS.
 */

const SEEN_KEY = "escape_vault_seen";
const TOTAL_MS = 2800;

declare global {
  interface Window {
    __vaultDone?: boolean;
  }
}

const GATE_SCRIPT = `(function(){try{var e=document.getElementById("vault-intro");if(!e)return;var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(r||sessionStorage.getItem("${SEEN_KEY}")){e.setAttribute("data-skip","1")}else{sessionStorage.setItem("${SEEN_KEY}","1")}}catch(_){}})();`;

const BOLTS = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
const RIVETS = Array.from({ length: 16 }, (_, i) => i * 22.5);
const SPOKES = [0, 120, 240];
const NOTCHES = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);

export function VaultIntro() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  // Client-side navigation back to the lobby: already played in this tab, don't render at all.
  const [gone, setGone] = useState(() => typeof window !== "undefined" && Boolean(window.__vaultDone));
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    window.__vaultDone = true;
    if (el.dataset.skip) {
      setGone(true);
      return;
    }
    const id = window.setTimeout(() => setGone(true), TOTAL_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!skipping) return;
    const id = window.setTimeout(() => setGone(true), 260);
    return () => window.clearTimeout(id);
  }, [skipping]);

  if (gone) return null;
  return (
    <>
      <div
        id="vault-intro"
        ref={ref}
        suppressHydrationWarning
        aria-hidden
        onClick={() => setSkipping(true)}
        className={`vault-intro ${skipping ? "is-skipping" : ""}`}
      >
        <div className="vi-stage">
          <div className="vi-hole">
            <div className="vi-light" />
            <div className="vi-door">
              <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
                <defs>
                  <radialGradient id="vi-steel" cx="38%" cy="32%" r="80%">
                    <stop offset="0%" stopColor="#4a4a53" />
                    <stop offset="55%" stopColor="#2a2a31" />
                    <stop offset="100%" stopColor="#141418" />
                  </radialGradient>
                  <linearGradient id="vi-brass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f0d36a" />
                    <stop offset="55%" stopColor="#c9a227" />
                    <stop offset="100%" stopColor="#7a5f12" />
                  </linearGradient>
                </defs>
                {/* Locking bolts, sticking out into the frame until they retract */}
                {BOLTS.map((a) => (
                  <g key={a} transform={`rotate(${a} 100 100)`}>
                    <rect className="vi-bolt" x="94" y="0" width="12" height="20" rx="2" fill="url(#vi-brass)" stroke="#5c4710" strokeWidth="0.8" />
                  </g>
                ))}
                <circle cx="100" cy="100" r="88" fill="url(#vi-steel)" stroke="#5a5a64" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#0d0d10" strokeWidth="2" opacity="0.7" />
                {RIVETS.map((a) => (
                  <circle
                    key={a}
                    cx={100 + Math.cos((a * Math.PI) / 180) * 84}
                    cy={100 + Math.sin((a * Math.PI) / 180) * 84}
                    r="1.8"
                    fill="#77746c"
                  />
                ))}
                <circle cx="100" cy="100" r="62" fill="none" stroke="#3b3b44" strokeWidth="5" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="#111114" strokeWidth="1" />
                <circle cx="100" cy="100" r="44" fill="#1a1a1f" stroke="#3b3b44" strokeWidth="1.5" />
                {/* Handle wheel with a compass hub (seven notches) */}
                <g className="vi-wheel">
                  {SPOKES.map((a) => (
                    <g key={a} transform={`rotate(${a} 100 100)`}>
                      <rect x="97.5" y="62" width="5" height="38" rx="2" fill="url(#vi-brass)" />
                      <circle cx="100" cy="60" r="6" fill="url(#vi-brass)" stroke="#5c4710" strokeWidth="0.8" />
                    </g>
                  ))}
                  <circle cx="100" cy="100" r="16" fill="url(#vi-brass)" stroke="#5c4710" strokeWidth="1" />
                  <circle cx="100" cy="100" r="11" fill="#1a1a1f" />
                  {NOTCHES.map((a) => (
                    <line key={a} x1="100" y1="89.5" x2="100" y2="92" stroke="#c9a227" strokeWidth="1" transform={`rotate(${a} 100 100)`} />
                  ))}
                  <path d="M100 100 L103 92" stroke="#e3bf4a" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M100 100 L98.5 104" stroke="#e3bf4a" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1.2 1.2" />
                </g>
                <circle className="vi-glint" cx="100" cy="100" r="88" fill="none" stroke="#e3bf4a" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <p className="vi-status font-mono">
            <span className="vi-status-a">{t("site.vault.unlocking")}</span>
            <span className="vi-status-b">{t("site.vault.granted")}</span>
          </p>
        </div>
        <p className="vi-skip font-mono">{t("site.vault.skip")}</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
    </>
  );
}
