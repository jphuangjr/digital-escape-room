"use client";

import { useEffect, useState } from "react";
import { useLocale, useT } from "@/i18n/client";
import { pick } from "@/i18n/config";
import type { Block, ImageFileInfo, SitePage } from "@/lib/types";
import type { GameCtx } from "@/lib/client/game";
import { THEMES, type ThemeStyle } from "./themes";
import { SiteForm } from "./SiteForms";

/** In-site (story) strings: `const x = useStory(); x({ en, ko })`. */
function useStory() {
  return pick(useLocale());
}

export interface RenderEnv {
  t: ThemeStyle;
  ctx: GameCtx;
  host: string;
  navigate: (href: string) => void;
  onSolved: () => void;
}

export function SiteRenderer({
  page,
  ctx,
  onNavigate,
  onSolved,
}: {
  page: SitePage;
  ctx: GameCtx;
  onNavigate: (address: string) => void;
  onSolved: () => void;
}) {
  const t = THEMES[page.theme] ?? THEMES.meridian;
  const host = page.address.split("/")[0];
  const env: RenderEnv = {
    t,
    ctx,
    host,
    onSolved,
    navigate: (href) => onNavigate(resolveHref(href, host)),
  };
  return (
    <div className={`min-h-full w-full ${t.root}`} style={t.font}>
      <div className={`mx-auto w-full ${t.container} space-y-5 px-4 py-6 pb-16 break-words`}>
        <BlockList blocks={page.blocks} env={env} />
      </div>
    </div>
  );
}

export function resolveHref(href: string, host: string): string {
  const h = href.trim();
  if (h.startsWith("/")) return `${host}${h}`;
  return h;
}

export function BlockList({ blocks, env }: { blocks: Block[]; env: RenderEnv }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} env={env} />
      ))}
    </>
  );
}

function BlockView({ block: b, env }: { block: Block; env: RenderEnv }) {
  const x = useStory();
  const { t } = env;
  switch (b.type) {
    case "heading": {
      const lvl = b.level ?? 2;
      if (lvl === 1) return <h1 className={t.h1}>{b.text}</h1>;
      if (lvl === 3) return <h3 className={t.h3}>{b.text}</h3>;
      return <h2 className={t.h2}>{b.text}</h2>;
    }
    case "paragraph":
      return <p className={`whitespace-pre-line ${t.p}`}>{b.text}</p>;
    case "link":
      return (
        <p>
          <SiteLink href={b.href} env={env}>
            {b.text}
          </SiteLink>
        </p>
      );
    case "nav":
      return (
        <nav className="-mx-4 overflow-x-auto px-4">
          <ul className="flex w-max min-w-full gap-1">
            {b.links.map((l, i) => (
              <li key={i}>
                <button
                  onClick={() => env.navigate(l.href)}
                  className={`min-h-11 whitespace-nowrap px-3 text-sm ${t.buttonGhost}`}
                >
                  {l.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      );
    case "image":
      return <ImageBlock alt={b.alt} caption={b.caption} art={b.art} info={b.fileInfo} t={t} />;
    case "redacted":
      return (
        <p className={t.p}>
          {b.label && <span className={`mr-2 text-xs uppercase tracking-wider ${t.muted}`}>{b.label}</span>}
          <Redacted text={b.text} dark={t.dark} />
        </p>
      );
    case "list":
      return (
        <ul className={`list-disc space-y-1 pl-6 ${t.p}`}>
          {b.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "staff":
      return (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {b.people.map((p, i) => (
            <li key={i} className={`flex gap-3 ${t.card}`}>
              <StaffPhoto photo={p.photo} t={t} name={p.name} />
              <div className="min-w-0">
                <p className="font-semibold">{p.name}</p>
                <p className={`text-sm italic ${t.muted}`}>{p.role}</p>
                <p className="mt-1 text-sm leading-relaxed">{p.bio}</p>
                {p.link && (
                  <p className="mt-1 text-sm">
                    <SiteLink href={p.link.href} env={env}>
                      {p.link.text}
                    </SiteLink>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    case "post":
      return (
        <article className={t.card}>
          {b.series && <p className={`text-xs uppercase tracking-[0.2em] ${t.accent}`}>{b.series}</p>}
          <h3 className={`mt-1 text-xl font-semibold`}>{b.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-sm font-semibold ${t.dark ? "bg-white/10" : "bg-black/5"}`}>
              <span aria-hidden>📅</span> {b.date}
            </span>
            {b.time && (
              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-sm font-semibold ${t.dark ? "bg-white/10" : "bg-black/5"}`}>
                <span aria-hidden>🕒</span> {b.time}
              </span>
            )}
            {b.author && <span className={`text-sm ${t.muted}`}>{x({ en: `by ${b.author}`, ko: `작성자 ${b.author}` })}</span>}
          </div>
          <p className={`mt-3 whitespace-pre-line ${t.p}`}>{b.body}</p>
        </article>
      );
    case "listing":
      return (
        <article className={t.card}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-bold">{b.title}</h3>
            {b.petId && (
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-sm font-bold ${t.dark ? "bg-white/10" : "bg-black/5"}`}>
                {x({ en: `ID #${b.petId}`, ko: `등록번호 #${b.petId}` })}
              </span>
            )}
          </div>
          <p className={`text-sm ${t.muted}`}>{b.meta}</p>
          <p className="mt-2 whitespace-pre-line font-mono text-sm leading-relaxed tracking-wide">{b.body}</p>
        </article>
      );
    case "diff":
      return (
        <figure className={t.card}>
          <figcaption className="mb-2 text-sm font-bold">{b.label}</figcaption>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded border border-red-400/50 bg-red-500/10 p-2">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">{x({ en: "− Before", ko: "− 변경 전" })}</p>
              <p className="mt-1 whitespace-pre-line text-sm">{b.before}</p>
            </div>
            <div className="rounded border border-green-500/50 bg-green-500/10 p-2">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">{x({ en: "+ After", ko: "+ 변경 후" })}</p>
              <p className="mt-1 whitespace-pre-line text-sm">{b.after}</p>
            </div>
          </div>
        </figure>
      );
    case "memo":
      return (
        <article className={`${t.card} font-mono text-sm`}>
          <p className="mb-2 font-bold uppercase tracking-wider">{b.heading}</p>
          <p className="whitespace-pre-line leading-loose">
            {b.parts.map((part, i) =>
              "redacted" in part ? <Redacted key={i} text={part.redacted} dark={t.dark} /> : <span key={i}>{part.text}</span>,
            )}
          </p>
        </article>
      );
    case "countdown":
      return <Countdown seconds={b.seconds} label={b.label} t={t} />;
    case "form":
      return <SiteForm form={b.form} prompt={b.prompt} env={env} />;
    case "table":
      return (
        <figure className={t.p}>
          {b.caption && <figcaption className={`mb-2 text-sm ${t.muted}`}>{b.caption}</figcaption>}
          <div className={`max-h-96 overflow-auto overscroll-contain ${t.card} p-0`}>
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0">
                <tr>
                  {b.columns.map((c) => (
                    <th key={c} className={`px-3 py-2 font-semibold ${t.frame}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i} className="border-t border-current/10">
                    {r.map((c, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-1.5 font-mono tabular-nums">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
    case "bits":
      return <BitsWidget t={t} />;
    case "notice": {
      const tone = {
        info: "border-sky-500/60 bg-sky-500/10",
        warning: "border-amber-500/70 bg-amber-500/10",
        danger: "border-red-500/70 bg-red-500/15",
        success: "border-emerald-500/70 bg-emerald-500/10",
      }[b.tone];
      return (
        <div role={b.tone === "danger" ? "alert" : "note"} className={`border-l-4 p-3 text-sm ${tone}`}>
          <span className="whitespace-pre-line">{b.text}</span>
        </div>
      );
    }
    case "footer":
      return (
        <footer className={`mt-8 pt-4 ${t.footer}`}>
          <Compass size={28} className="mx-auto mb-2 opacity-60" />
          {b.text}
        </footer>
      );
    case "compass":
      return (
        <div className="flex justify-center py-2">
          <Compass size={120} />
        </div>
      );
    default:
      return null;
  }
}

function SiteLink({ href, env, children }: { href: string; env: RenderEnv; children: React.ReactNode }) {
  return (
    <a
      href={`#${href}`}
      onClick={(e) => {
        e.preventDefault();
        env.navigate(href);
      }}
      className={`inline-flex min-h-11 items-center ${env.t.link}`}
    >
      {children}
    </a>
  );
}

export function Redacted({ text, dark }: { text: string; dark?: boolean }) {
  const tr = useT();
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? tr("browser.redacted.revealed", { text }) : tr("browser.redacted.hidden")}
      onClick={() => setOn((v) => !v)}
      className={`mx-0.5 inline min-h-6 rounded-[2px] px-1 py-0.5 text-left align-baseline [box-decoration-break:clone] transition-colors ${
        on
          ? dark
            ? "bg-white/15 text-inherit outline outline-1 outline-current/40"
            : "bg-yellow-200/70 text-inherit outline outline-1 outline-black/20"
          : "select-none bg-black text-transparent"
      }`}
      style={!on && dark ? { boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)" } : undefined}
    >
      {text}
    </button>
  );
}

function StaffPhoto({ photo, t, name }: { photo: string | null; t: ThemeStyle; name: string }) {
  const x = useStory();
  if (!photo) {
    return (
      <div className={`flex h-20 w-16 shrink-0 flex-col items-center justify-center ${t.frame}`} aria-label={x({ en: `${name}: no photo`, ko: `${name}: 사진 없음` })}>
        <svg viewBox="0 0 40 40" className="h-10 w-10 opacity-40" aria-hidden>
          <circle cx="20" cy="14" r="7" fill="currentColor" />
          <path d="M6 38c0-8 6.3-13 14-13s14 5 14 13z" fill="currentColor" />
        </svg>
        <span className="mt-0.5 text-[9px] uppercase tracking-wider opacity-60">{x({ en: "no photo", ko: "사진 없음" })}</span>
      </div>
    );
  }
  return (
    <div className={`flex h-20 w-16 shrink-0 items-center justify-center text-3xl ${t.frame}`} aria-label={x({ en: `Photo of ${name}`, ko: `${name}의 사진` })}>
      {photo.length <= 4 ? photo : "👤"}
    </div>
  );
}

function ImageBlock({
  alt,
  caption,
  art,
  info,
  t,
}: {
  alt: string;
  caption?: string;
  art: string;
  info: ImageFileInfo;
  t: ThemeStyle;
}) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  const isGlyph = [...art].length <= 6;
  return (
    <figure className="space-y-2">
      <div className={`relative flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden ${t.frame}`} role="img" aria-label={alt}>
        {isGlyph ? (
          <span className="text-7xl leading-none drop-shadow">{art}</span>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-70">
            <svg viewBox="0 0 48 36" className="h-16 w-20" aria-hidden>
              <rect x="1" y="1" width="46" height="34" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="14" cy="12" r="4" fill="currentColor" />
              <path d="M4 32l12-12 8 8 6-6 14 10z" fill="currentColor" />
            </svg>
            <span className="font-mono text-xs">{art}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="absolute bottom-2 right-2 min-h-11 rounded bg-black/75 px-3 text-xs font-semibold text-white"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          {tr("browser.fileInfo.button")}
        </button>
      </div>
      {caption && <figcaption className={`text-sm italic ${t.muted}`}>{caption}</figcaption>}
      {open && (
        <div
          className="max-w-md rounded-md border border-stone-600 bg-stone-900 p-3 text-stone-100 shadow-lg"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">{tr("browser.fileInfo.title")}</p>
            <button onClick={() => setOpen(false)} className="min-h-11 min-w-11 text-sm text-stone-400" aria-label={tr("browser.fileInfo.close")}>
              ✕
            </button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
            {(
              [
                [tr("browser.fileInfo.filename"), info.filename],
                [tr("browser.fileInfo.author"), info.author],
                [tr("browser.fileInfo.camera"), info.camera],
                [tr("browser.fileInfo.date"), info.date],
                [tr("browser.fileInfo.dimensions"), info.dimensions],
                [tr("browser.fileInfo.comment"), info.comment],
              ] as [string, string | undefined][]
            )
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-stone-400">{k}</dt>
                  <dd className="break-all">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}
    </figure>
  );
}

export function Compass({ size = 120, className = "" }: { size?: number; className?: string }) {
  const x = useStory();
  const notches = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return {
      x1: 50 + Math.cos(a) * 36,
      y1: 50 + Math.sin(a) * 36,
      x2: 50 + Math.cos(a) * 45,
      y2: 50 + Math.sin(a) * 45,
    };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={x({ en: "A compass with a broken needle and seven notches", ko: "바늘이 부러지고 눈금이 일곱 개인 나침반" })}
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {notches.map((n, i) => (
        <line key={i} {...n} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* broken needle: upper half points off-north, lower half snapped and displaced */}
      <polygon points="50,50 46,46 61,17 54,48" fill="currentColor" />
      <polygon points="47,55 52,58 40,80 42,62" fill="currentColor" opacity="0.55" />
      <path d="M45 52 l3 1 -2 2 3 1" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

const PLACE_VALUES = [16, 8, 4, 2, 1];

/** Tap-to-flip place-value demo for the binary lesson. Generic: 5 bits, A = 1. */
function BitsWidget({ t }: { t: ThemeStyle }) {
  const x = useStory();
  const [bits, setBits] = useState([0, 1, 0, 0, 0]);
  const value = bits.reduce((sum, b, i) => sum + b * PLACE_VALUES[i], 0);
  const letter = value >= 1 && value <= 26 ? String.fromCharCode(64 + value) : "?";
  return (
    <div className={`${t.card} space-y-3`}>
      <div className="grid grid-cols-5 gap-2">
        {bits.map((b, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={b === 1}
            aria-label={
              b
                ? x({ en: `Switch worth ${PLACE_VALUES[i]}, on`, ko: `${PLACE_VALUES[i]}짜리 스위치, 켜짐` })
                : x({ en: `Switch worth ${PLACE_VALUES[i]}, off`, ko: `${PLACE_VALUES[i]}짜리 스위치, 꺼짐` })
            }
            onClick={() => setBits((cur) => cur.map((v, j) => (j === i ? 1 - v : v)))}
            className={`flex min-h-16 flex-col items-center justify-center gap-0.5 font-mono ${b ? t.button : t.buttonGhost}`}
          >
            <span className="text-2xl font-bold">{b}</span>
            <span className="text-[11px] opacity-80">{PLACE_VALUES[i]}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-center font-mono text-lg">
        {bits.join("")} = {bits.map((b, i) => (b ? PLACE_VALUES[i] : null)).filter(Boolean).join(" + ") || "0"} = {value} ={" "}
        <span className={`text-2xl font-bold ${t.accent}`}>{letter}</span>
      </p>
      {letter === "?" && <p className={`text-center text-xs ${t.muted}`}>{value === 0
            ? x({ en: "All off is zero, not a letter.", ko: "전부 꺼지면 0이에요. 글자가 아니에요." })
            : x({ en: "Past 26: no letter for that one.", ko: "26을 넘으면 해당하는 글자가 없어요." })}</p>}
    </div>
  );
}

function Countdown({ seconds, label, t }: { seconds: number; label: string; t: ThemeStyle }) {
  const x = useStory();
  const start = Math.max(1, Math.floor(seconds));
  const [left, setLeft] = useState(start);
  const [holding, setHolding] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setHolding(true);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!holding) return;
    const id = setTimeout(() => {
      setHolding(false);
      setLeft(start);
    }, 4000);
    return () => clearTimeout(id);
  }, [holding, start]);
  return (
    <div className={`text-center ${t.card}`} aria-live="off">
      <p className={`text-xs uppercase tracking-[0.3em] ${t.muted}`}>{label}</p>
      <p className={`mt-2 font-mono text-4xl font-bold tabular-nums sm:text-5xl ${holding ? "animate-pulse" : ""}`}>
        {holding ? x({ en: "SIGNAL HOLDING", ko: "신호 유지 중" }) : fmt(left)}
      </p>
    </div>
  );
}
