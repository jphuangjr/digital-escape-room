"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ROLE_INFO, type Role, type Team } from "@/lib/allhands/types";
import { markTourSeen, turnTipsOff, type Tip } from "@/lib/allhands/tutorial";
import { FormattedMessage } from "react-intl";
import { useT } from "@/i18n/client";

const TEAM_STYLE: Record<Team, { tone: string }> = {
  company: { tone: "border-lime-300/40 text-lime-300" },
  moles: { tone: "border-rose-400/50 text-rose-300" },
  burnout: { tone: "border-violet-300/40 text-violet-300" },
};

/** Colours a side's name inside a translated sentence. */
const side = (cls: string) => {
  const Side = (chunks: React.ReactNode) => (
    <span key={cls} className={`font-bold ${cls}`}>
      {chunks}
    </span>
  );
  return Side;
};

/** Every role, grouped by side. Read from ROLE_INFO, so a new role shows up here without touching this file. */
function rolesByTeam(): [Team, Role[]][] {
  const groups = new Map<Team, Role[]>();
  for (const r of Object.keys(ROLE_INFO) as Role[]) {
    const t = ROLE_INFO[r].team;
    groups.set(t, [...(groups.get(t) ?? []), r]);
  }
  return [...groups.entries()];
}

/** "@channel" highlighted inside a translated sentence. */
const atChannel = (chunks: React.ReactNode) => (
  <span key="at" className="text-sky-300">
    {chunks}
  </span>
);

const DEMO_NAMES = ["Priya", "Marcus", "Jen", "Theo"];

type T = ReturnType<typeof useT>;

/** A step of the tour: its title and body are allhands.tour.<n>.title/body. */
interface Slide {
  demo?: (t: T) => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    demo: (t) => (
      <ul className="grid grid-cols-2 gap-2 text-sm">
        <li className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <span aria-hidden className="text-2xl">🗣️</span>
          <p className="mt-1 font-semibold">{t("allhands.tour.1.loudTitle")}</p>
          <p className="text-slate-400">{t("allhands.tour.1.loudBody")}</p>
        </li>
        <li className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <span aria-hidden className="text-2xl">📱</span>
          <p className="mt-1 font-semibold">{t("allhands.tour.1.phoneTitle")}</p>
          <p className="text-slate-400">{t("allhands.tour.1.phoneBody")}</p>
        </li>
      </ul>
    ),
  },
  {
    demo: () => <DemoBadge />,
  },
  {
    demo: (t) => (
      <div className="flex flex-col gap-3">
        {rolesByTeam().map(([team, roles]) => (
          <div key={team} className="flex flex-col gap-1.5">
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${TEAM_STYLE[team]?.tone ?? "text-slate-400"}`}>
              {t(`allhands.team.${team}`)}
            </p>
            {roles.map((r) => (
              <div key={r} className={`rounded-xl border bg-slate-900 px-3 py-2 ${TEAM_STYLE[team]?.tone ?? "border-slate-700"}`}>
                <p className="text-sm font-bold">
                  {t(`allhands.role.${r}.name`)} <span className="font-normal text-slate-500">({t(`allhands.role.${r}.classic`)})</span>
                </p>
                <p className="text-sm text-slate-300">{t(`allhands.role.${r}.power`)}</p>
              </div>
            ))}
          </div>
        ))}
        <p className="text-xs text-slate-500">{t("allhands.tour.3.note")}</p>
      </div>
    ),
  },
  {
    demo: (t) => <DemoPick prompt={t("allhands.tour.4.prompt")} />,
  },
  {
    demo: (t) => (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 font-black text-slate-950">S</span>
          <p className="font-bold">
            {t("allhands.slack.bot")} <span className="ml-1 rounded bg-slate-800 px-1 text-11px font-normal text-slate-400">{t("allhands.slack.app")}</span>
          </p>
        </div>
        <p className="mt-2 text-slate-200">
          <FormattedMessage id="allhands.morning.laidOff" values={{ name: "Marcus", at: atChannel }} />
        </p>
      </div>
    ),
  },
  {
    demo: () => <DemoVote />,
  },
  {
    demo: (t) => (
      <div className="flex flex-col gap-2 text-sm">
        <p className="rounded-xl border border-lime-300/40 bg-slate-900 p-3">
          <FormattedMessage id="allhands.tour.7.company" values={{ company: side("text-lime-300") }} />
        </p>
        <p className="rounded-xl border border-rose-400/50 bg-slate-900 p-3">
          <FormattedMessage id="allhands.tour.7.moles" values={{ moles: side("text-rose-300") }} />
        </p>
        <p className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-300">
          {t("allhands.tour.7.out")}
        </p>
        <p className="text-xs text-slate-500">{t("allhands.tour.7.help")}</p>
      </div>
    ),
  },
];

/** The how-to-play walkthrough: a full-screen sheet of short steps with small try-it demos. Skippable, and replayable. */
export function HowToPlayTour({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];
  const close = () => {
    markTourSeen();
    onClose();
  };
  // The page underneath doesn't scroll while the tour is open.
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = before;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setI((n) => Math.min(SLIDES.length - 1, n + 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    // A solid background, not a translucent blur: iOS Safari draws a screen-sized backdrop-filter layer only in part,
    // so on a scrolled phone page the tour showed as a band with the page through it. px-safe keeps it clear of a
    // side rail (iPhone Duo).
    <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-slate-950 px-safe text-slate-100" role="dialog" aria-modal="true" aria-label={t("allhands.tour.label")}>
      <div
        className="mx-auto flex h-full w-full max-w-xl flex-col px-edge"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)", paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="flex items-center justify-between py-2">
          <p className="text-11px font-semibold uppercase tracking-[0.25em] text-lime-300">
            {t("allhands.tour.progress", { n: i + 1, total: SLIDES.length })}
          </p>
          <button type="button" onClick={close} className="min-h-11 rounded-lg px-3 text-sm text-slate-400 active:bg-slate-800">
            {last ? t("allhands.tour.close") : t("allhands.tour.skip")}
          </button>
        </div>
        <div aria-hidden className="flex gap-1">
          {SLIDES.map((_, n) => (
            <span key={n} className={`h-1 flex-1 rounded-full ${n <= i ? "bg-lime-300" : "bg-slate-800"}`} />
          ))}
        </div>

        <div key={i} className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain py-6">
          <h2 className="text-3xl font-black">{t(`allhands.tour.${i + 1}.title`)}</h2>
          <p className="leading-relaxed text-slate-300">{t(`allhands.tour.${i + 1}.body`)}</p>
          {slide.demo?.(t)}
        </div>

        <div className="flex gap-2 pt-2">
          {i > 0 && (
            <button type="button" onClick={() => setI(i - 1)} className="min-h-12 rounded-xl border border-slate-700 px-5 font-semibold active:bg-slate-800">
              {t("allhands.tour.back")}
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? close() : setI(i + 1))}
            className="min-h-12 flex-1 rounded-xl bg-lime-300 px-4 font-bold text-slate-950 active:bg-lime-200"
          >
            {last ? t("allhands.tour.done") : t("allhands.tour.next")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** A practice badge: the same press-and-hold as the real one, with a made-up role. */
function DemoBadge() {
  const t = useT();
  const [shown, setShown] = useState(false);
  const [tried, setTried] = useState(false);
  const show = () => {
    setShown(true);
    setTried(true);
  };
  const hide = () => setShown(false);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onPointerDown={show}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && show()}
        onKeyUp={hide}
        onBlur={hide}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={t("allhands.tour.2.label")}
        className={`w-full select-none rounded-3xl border p-5 text-left transition [-webkit-touch-callout:none] ${
          shown ? "border-sky-300/50 bg-sky-300/10 text-sky-300" : "border-slate-700 bg-slate-900"
        }`}
      >
        {shown ? (
          <div>
            <p className="text-11px font-semibold uppercase tracking-[0.25em] opacity-80">{t("allhands.tour.2.practice")}</p>
            <p className="mt-1 text-3xl font-black">{t("allhands.role.it.name")}</p>
            <p className="mt-2 text-sm text-slate-300">{t("allhands.role.it.power")}</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-2xl">🪪</span>
            <div>
              <p className="font-bold">{t("allhands.badge.hold")}</p>
              <p className="text-sm text-slate-400">{t("allhands.badge.press")}</p>
            </div>
          </div>
        )}
      </button>
      <p className="text-sm text-slate-400" aria-live="polite">
        {tried ? t("allhands.tour.2.tried") : t("allhands.tour.2.untried")}
      </p>
    </div>
  );
}

function DemoPick({ prompt }: { prompt: string }) {
  const t = useT();
  const [pick, setPick] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm text-slate-400">
        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">#random</span>
        {prompt}
      </p>
      <ul className="grid grid-cols-2 gap-2">
        {DEMO_NAMES.map((n) => (
          <li key={n}>
            <button
              type="button"
              aria-pressed={pick === n}
              onClick={() => setPick(n)}
              className={`min-h-12 w-full rounded-2xl border px-3 text-left font-semibold ${
                pick === n ? "border-lime-300 bg-lime-300/10" : "border-slate-800 bg-slate-900 active:bg-slate-800"
              }`}
            >
              {n}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-400" aria-live="polite">
        {pick ? t("allhands.tour.4.picked") : t("allhands.tour.4.change")}
      </p>
    </div>
  );
}

function DemoVote() {
  const t = useT();
  const [vote, setVote] = useState<string | null>(null);
  const base: Record<string, number> = { Priya: 2, Jen: 1, skip: 1 };
  const options = [...DEMO_NAMES.filter((n) => n !== "Marcus"), "skip"];
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {options.map((o) => {
          const count = (base[o] ?? 0) + (vote === o ? 1 : 0);
          return (
            <li key={o}>
              <button
                type="button"
                aria-pressed={vote === o}
                onClick={() => setVote(o)}
                className={`flex min-h-12 w-full items-center justify-between rounded-2xl border px-3 text-left ${
                  vote === o ? "border-lime-300 bg-lime-300/10" : "border-slate-800 bg-slate-900 active:bg-slate-800"
                }`}
              >
                <span className="font-semibold">{o === "skip" ? t("allhands.vote.skip") : o}</span>
                <span className="font-mono text-lg tabular-nums">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-slate-400" aria-live="polite">
        {t(
          vote === null
            ? "allhands.tour.6.none"
            : vote === "Priya"
              ? "allhands.tour.6.priya"
              : vote === "Jen"
                ? "allhands.tour.6.jen"
                : vote === "skip"
                  ? "allhands.tour.6.skip"
                  : "allhands.tour.6.other",
        )}
      </p>
    </div>
  );
}

/** A small card with advice for the moment, shown during a player's first game. */
export function FirstGameTip({ tip, onClose, onTour }: { tip: Tip; onClose: () => void; onTour: () => void }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-lime-300/40 bg-lime-300/5 p-3 text-sm">
      <div className="flex items-start gap-2">
        <span aria-hidden className="text-lg leading-5">💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-11px font-semibold uppercase tracking-[0.2em] text-lime-300">{t("allhands.tip.label")}</p>
          <p className="mt-1 text-slate-200">{t(tip.text)}</p>
          <div className="mt-1 flex flex-wrap gap-x-4">
            <button type="button" onClick={onTour} className="min-h-9 text-xs text-slate-400 underline">
              {t("allhands.tip.tour")}
            </button>
            <button
              type="button"
              onClick={() => {
                turnTipsOff();
                onClose();
              }}
              className="min-h-9 text-xs text-slate-400 underline"
            >
              {t("allhands.tip.off")}
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t("allhands.tip.hide")} className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 active:bg-slate-800">
          ✕
        </button>
      </div>
    </div>
  );
}
