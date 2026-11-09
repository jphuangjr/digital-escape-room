"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ROLE_INFO, type Role, type Team } from "@/lib/allhands/types";
import { markTourSeen, turnTipsOff, type Tip } from "@/lib/allhands/tutorial";

const TEAM_STYLE: Record<Team, { label: string; tone: string }> = {
  company: { label: "The company", tone: "border-lime-300/40 text-lime-300" },
  moles: { label: "The Moles", tone: "border-rose-400/50 text-rose-300" },
  burnout: { label: "On their own", tone: "border-violet-300/40 text-violet-300" },
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

const DEMO_NAMES = ["Priya", "Marcus", "Jen", "Theo"];

interface Slide {
  title: string;
  body: string;
  demo?: () => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    title: "Welcome to Synergr",
    body: "You all work at a startup, and a few of your coworkers are secretly Moles planted by a rival. Find them and fire them before they lay everyone else off. If you've played Mafia or Werewolf, you already know the rules.",
    demo: () => (
      <ul className="grid grid-cols-2 gap-2 text-sm">
        <li className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <span aria-hidden className="text-2xl">🗣️</span>
          <p className="mt-1 font-semibold">Play out loud</p>
          <p className="text-slate-400">Sit together. All the talking happens at the table.</p>
        </li>
        <li className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <span aria-hidden className="text-2xl">📱</span>
          <p className="mt-1 font-semibold">Your phone is your badge</p>
          <p className="text-slate-400">It shows your secret role and runs the clock.</p>
        </li>
      </ul>
    ),
  },
  {
    title: "Your badge is a secret",
    body: "When the game starts, everyone is dealt a secret role. Press and hold your badge to read it, then let go. Try it now.",
    demo: () => <DemoBadge />,
  },
  {
    title: "Who's who",
    body: "Most of the team are Employees with no powers. A few people have something extra.",
    demo: () => (
      <div className="flex flex-col gap-3">
        {rolesByTeam().map(([team, roles]) => (
          <div key={team} className="flex flex-col gap-1.5">
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${TEAM_STYLE[team]?.tone ?? "text-slate-400"}`}>
              {TEAM_STYLE[team]?.label ?? team}
            </p>
            {roles.map((r) => (
              <div key={r} className={`rounded-xl border bg-slate-900 px-3 py-2 ${TEAM_STYLE[team]?.tone ?? "border-slate-700"}`}>
                <p className="text-sm font-bold">
                  {ROLE_INFO[r].name} <span className="font-normal text-slate-500">({ROLE_INFO[r].classic})</span>
                </p>
                <p className="text-sm text-slate-300">{ROLE_INFO[r].power}</p>
              </div>
            ))}
          </div>
        ))}
        <p className="text-xs text-slate-500">Not every role is in every game. It depends on how many play and what the host turns on.</p>
      </div>
    ),
  },
  {
    title: "After hours",
    body: "Heads down, screens close. Everyone taps a name, so nobody can tell who has a power. The Moles pick someone to lay off, and anyone with a power uses it. Everyone else answers a silly poll. Tap one to try it.",
    demo: () => <DemoPick prompt="Who replies-all to everything?" />,
  },
  {
    title: "Morning Slack, then all-hands",
    body: "In the morning the app says who got laid off. They're out. Then put your phones down and argue: accuse, defend, bluff. The Moles are lying to you.",
    demo: () => (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 font-black text-slate-950">S</span>
          <p className="font-bold">
            Synergr Bot <span className="ml-1 rounded bg-slate-800 px-1 text-11px font-normal text-slate-400">APP</span>
          </p>
        </div>
        <p className="mt-2 text-slate-200">
          <span className="text-sky-300">@channel</span> Marcus is no longer with the company. We wish them well in their next chapter. 💼
        </p>
      </div>
    ),
  },
  {
    title: "Performance review",
    body: "When the clock runs out, everyone votes. The most votes gets fired. If it's a tie, or Let's circle back gets as many votes, nobody goes. Votes are public. Try one.",
    demo: () => <DemoVote />,
  },
  {
    title: "How to win",
    body: "Rounds repeat (after hours, morning, all-hands, review) until one side wins.",
    demo: () => (
      <div className="flex flex-col gap-2 text-sm">
        <p className="rounded-xl border border-lime-300/40 bg-slate-900 p-3">
          <span className="font-bold text-lime-300">The company</span> wins when every Mole has been fired.
        </p>
        <p className="rounded-xl border border-rose-400/50 bg-slate-900 p-3">
          <span className="font-bold text-rose-300">The Moles</span> win when there are as many of them as everyone else still employed.
        </p>
        <p className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-300">
          Out of the game? You&apos;re &ldquo;on LinkedIn&rdquo;: you can see every role, but stay quiet and keep a straight face.
        </p>
        <p className="text-xs text-slate-500">Forget something mid-game? 📖 Rules in the top bar has every role, and ? brings this tour back.</p>
      </div>
    ),
  },
];

/** The how-to-play walkthrough: a full-screen sheet of short steps with small try-it demos. Skippable, and replayable. */
export function HowToPlayTour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];
  const close = () => {
    markTourSeen();
    onClose();
  };
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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-slate-100 backdrop-blur" role="dialog" aria-modal="true" aria-label="How to play All Hands">
      <div
        className="mx-auto flex h-full w-full max-w-xl flex-col px-edge"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)", paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="flex items-center justify-between py-2">
          <p className="text-11px font-semibold uppercase tracking-[0.25em] text-lime-300">
            How to play · {i + 1} of {SLIDES.length}
          </p>
          <button type="button" onClick={close} className="min-h-11 rounded-lg px-3 text-sm text-slate-400 active:bg-slate-800">
            {last ? "Close" : "Skip"}
          </button>
        </div>
        <div aria-hidden className="flex gap-1">
          {SLIDES.map((_, n) => (
            <span key={n} className={`h-1 flex-1 rounded-full ${n <= i ? "bg-lime-300" : "bg-slate-800"}`} />
          ))}
        </div>

        <div key={i} className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain py-6">
          <h2 className="text-3xl font-black">{slide.title}</h2>
          <p className="leading-relaxed text-slate-300">{slide.body}</p>
          {slide.demo?.()}
        </div>

        <div className="flex gap-2 pt-2">
          {i > 0 && (
            <button type="button" onClick={() => setI(i - 1)} className="min-h-12 rounded-xl border border-slate-700 px-5 font-semibold active:bg-slate-800">
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? close() : setI(i + 1))}
            className="min-h-12 flex-1 rounded-xl bg-lime-300 px-4 font-bold text-slate-950 active:bg-lime-200"
          >
            {last ? "Got it, let's play" : "Next"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** A practice badge: the same press-and-hold as the real one, with a made-up role. */
function DemoBadge() {
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
        aria-label="Practice badge: hold to see it"
        className={`w-full select-none rounded-3xl border p-5 text-left transition [-webkit-touch-callout:none] ${
          shown ? "border-sky-300/50 bg-sky-300/10 text-sky-300" : "border-slate-700 bg-slate-900"
        }`}
      >
        {shown ? (
          <div>
            <p className="text-11px font-semibold uppercase tracking-[0.25em] opacity-80">Synergr · Practice badge</p>
            <p className="mt-1 text-3xl font-black">{ROLE_INFO.it.name}</p>
            <p className="mt-2 text-sm text-slate-300">{ROLE_INFO.it.power}</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-2xl">🪪</span>
            <div>
              <p className="font-bold">Hold to see your badge</p>
              <p className="text-sm text-slate-400">Press and hold. Keep it close to your chest.</p>
            </div>
          </div>
        )}
      </button>
      <p className="text-sm text-slate-400" aria-live="polite">
        {tried ? "That's it. Let go and it hides again, so nobody peeks over your shoulder." : "This one is just for practice."}
      </p>
    </div>
  );
}

function DemoPick({ prompt }: { prompt: string }) {
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
        {pick ? "From across the table, that looked exactly like a Mole picking a layoff. That's the point." : "You can change your pick until time runs out."}
      </p>
    </div>
  );
}

function DemoVote() {
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
                <span className="font-semibold">{o === "skip" ? "Let's circle back" : o}</span>
                <span className="font-mono text-lg tabular-nums">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-slate-400" aria-live="polite">
        {vote === null
          ? "Everyone sees who voted for whom, so votes are clues too."
          : vote === "Priya"
            ? "Priya has 3 votes and gets fired. Hope she was a Mole."
            : vote === "Jen"
              ? "Now it's a 2–2 tie between Priya and Jen, so nobody gets fired."
              : vote === "skip"
                ? "Circling back ties with Priya, so nobody gets fired."
                : "Priya still has the most votes, so she gets fired."}
      </p>
    </div>
  );
}

/** A small card with advice for the moment, shown during a player's first game. */
export function FirstGameTip({ tip, onClose, onTour }: { tip: Tip; onClose: () => void; onTour: () => void }) {
  return (
    <div className="rounded-2xl border border-lime-300/40 bg-lime-300/5 p-3 text-sm">
      <div className="flex items-start gap-2">
        <span aria-hidden className="text-lg leading-5">💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-11px font-semibold uppercase tracking-[0.2em] text-lime-300">First game tip</p>
          <p className="mt-1 text-slate-200">{tip.text}</p>
          <div className="mt-1 flex flex-wrap gap-x-4">
            <button type="button" onClick={onTour} className="min-h-9 text-xs text-slate-400 underline">
              How to play
            </button>
            <button
              type="button"
              onClick={() => {
                turnTipsOff();
                onClose();
              }}
              className="min-h-9 text-xs text-slate-400 underline"
            >
              Turn tips off
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Hide this tip" className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 active:bg-slate-800">
          ✕
        </button>
      </div>
    </div>
  );
}
