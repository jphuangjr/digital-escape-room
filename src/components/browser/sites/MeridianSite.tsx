"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/i18n/client";
import { pick } from "@/i18n/config";
import type { Block, SitePage } from "@/lib/types";
import { PHOTOS } from "../art/Photos";

/**
 * The Meridian Institute's public website gets a polished institutional frame: masthead with crest,
 * menu bar, hero (home) or title band (inner pages), and a dark footer. Only presentation changes:
 * every block the server sends is still rendered (the nav, h1 and footer are re-homed into the
 * chrome; the loose compass block becomes the crest), so no clue text is added, removed or altered.
 */

const NAVY = "#1f2a44";
const BRASS = "#c9a36b";

type Link = { text: string; href: string };

function Crest({ size = 44 }: { size?: number }) {
  const notches = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x1: 50 + Math.cos(a) * 34, y1: 50 + Math.sin(a) * 34, x2: 50 + Math.cos(a) * 42, y2: 50 + Math.sin(a) * 42 };
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="shrink-0">
      <circle cx="50" cy="50" r="47" fill="none" stroke={BRASS} strokeWidth="3" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={BRASS} strokeWidth="1.2" opacity="0.6" />
      {notches.map((n, i) => (
        <line key={i} {...n} stroke={BRASS} strokeWidth="4" strokeLinecap="round" />
      ))}
      <polygon points="50,50 46,46 61,17 54,48" fill={BRASS} />
      <polygon points="47,55 52,58 40,80 42,62" fill={BRASS} opacity="0.55" />
      <circle cx="50" cy="50" r="3.5" fill={BRASS} />
    </svg>
  );
}

export function MeridianSite({
  page,
  navigate,
  renderBlocks,
}: {
  page: SitePage;
  navigate: (href: string) => void;
  renderBlocks: (blocks: Block[]) => ReactNode;
}) {
  const x = pick(useLocale());
  const host = page.address.split("/")[0];
  const nav = page.blocks.find((b): b is Extract<Block, { type: "nav" }> => b.type === "nav");
  const footer = page.blocks.find((b): b is Extract<Block, { type: "footer" }> => b.type === "footer");
  const titleIdx = page.blocks.findIndex((b) => b.type === "heading" && (b.level ?? 2) === 1);
  const title = titleIdx >= 0 ? (page.blocks[titleIdx] as Extract<Block, { type: "heading" }>).text : page.title;
  const body = page.blocks.filter((b, i) => b !== nav && b !== footer && b.type !== "compass" && i !== titleIdx);
  const isHome = page.address === host;
  const links: Link[] = nav?.links ?? [];
  const isActive = (l: Link) => l.href.replace(/\/+$/, "") === page.address;
  const isExternal = (l: Link) => !l.href.startsWith(host);
  const home = links[0];
  const current = links.find(isActive);

  const name = x({ en: "The Meridian Institute", ko: "메리디언 연구소", "zh-TW": "子午研究院", es: "Instituto Meridian", ja: "メリディアン研究所", "pt-BR": "Instituto Meridian" });
  const tagline = x({ en: "Archive · Library · Reading Room", ko: "기록관 · 도서관 · 열람실", "zh-TW": "檔案館 · 圖書館 · 閱覽室", es: "Archivo · Biblioteca · Sala de lectura", ja: "アーカイブ・図書館・閲覧室", "pt-BR": "Arquivo · Biblioteca · Sala de leitura" });
  const Hero = PHOTOS["archive-building"];

  return (
    <div className="min-h-full w-full bg-[#f4efe2] text-[#2b2620]" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
      {/* Masthead */}
      <header style={{ background: NAVY }} className="text-[#f4efe2]">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => home && navigate(home.href)} className="flex min-w-0 items-center gap-3 text-left" aria-label={name}>
            <Crest />
            <span className="min-w-0">
              <span className="block truncate text-xl leading-tight tracking-wide sm:text-2xl">{name}</span>
              <span className="block truncate text-11px uppercase tracking-[0.22em]" style={{ color: BRASS }}>
                {tagline}
              </span>
            </span>
          </button>
        </div>
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${BRASS}, #8a6a3a 60%, transparent)` }} />
      </header>

      {/* Menu bar */}
      {links.length > 0 && (
        <nav className="sticky top-0 z-10 border-b border-[#d8cfb8] bg-[#fbf8f0]/95 backdrop-blur">
          <ul className="mx-auto flex max-w-4xl overflow-x-auto px-2" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
            {links.map((l) => (
              <li key={l.href}>
                <button
                  type="button"
                  onClick={() => navigate(l.href)}
                  aria-current={isActive(l) ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-1 whitespace-nowrap border-b-2 px-3 text-13px font-medium tracking-wide ${
                    isActive(l) ? "border-[#c9a36b] text-[#1f2a44]" : "border-transparent text-[#5b5244]"
                  }`}
                >
                  {l.text}
                  {isExternal(l) && <span aria-hidden className="text-10px opacity-70">↗</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Hero (home) or title band (inner pages) */}
      {isHome && Hero ? (
        <section className="relative isolate h-56 overflow-hidden sm:h-72">
          <div className="absolute inset-0 -z-10">
            <Hero />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1f2a44]/90 via-[#1f2a44]/40 to-transparent" />
          <div className="mx-auto flex h-full max-w-4xl flex-col justify-end px-4 pb-5">
            <h1 className="text-3xl font-normal leading-tight text-[#f4efe2] drop-shadow sm:text-4xl">{title}</h1>
            <span className="mt-2 block h-[2px] w-16" style={{ background: BRASS }} />
          </div>
        </section>
      ) : (
        <section className="border-b border-[#d8cfb8] bg-[#ece4d1]">
          <div className="mx-auto max-w-4xl px-4 py-5">
            {current && home && current !== home && (
              <p className="mb-1 text-11px uppercase tracking-[0.18em] text-[#8a7d66]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
                <button type="button" className="underline-offset-2 hover:underline" onClick={() => navigate(home.href)}>
                  {home.text}
                </button>{" "}
                / {current.text}
              </p>
            )}
            <h1 className="text-3xl font-normal leading-tight text-[#1f2a44]">{title}</h1>
          </div>
        </section>
      )}

      {/* Page body */}
      <main className="mx-auto w-full max-w-3xl space-y-5 break-words px-4 py-7">{renderBlocks(body)}</main>

      {/* Footer */}
      <footer style={{ background: NAVY }} className="mt-6 text-[#cfc6b3]">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-3">
            <Crest size={36} />
            <span className="text-lg text-[#f4efe2]">{name}</span>
          </div>
          {links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
              {links.map((l) => (
                <li key={l.href}>
                  <button type="button" onClick={() => navigate(l.href)} className="min-h-11 text-[#e8dcc0] underline-offset-2 hover:underline">
                    {l.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {footer && <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed">{footer.text}</p>}
        </div>
      </footer>
    </div>
  );
}
