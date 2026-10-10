"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameCtx } from "@/lib/client/game";
import type { AttemptResponse } from "@/lib/types";
import { CompassBadge, btnGhost, useNow } from "./shared";

interface FileItem {
  name: string;
  body: string;
}

// Harmless, client-side flavor files. Contain NO puzzle answers.
const LOCAL_FILES: FileItem[] = [
  {
    name: "case_brief.txt",
    body: `CASE BRIEF — CONFIDENTIAL
Client: the sister of Dr. Ada Voss
Subject: Dr. Ada Voss, archivist, Meridian Institute
Status: missing, last contact 48 hours ago

Assignment:
Find out what happened to Ada. She left one message behind:
"If you're reading this, I got too close. Start at the beginning."

This laptop is hers. The browser still has her bookmarks. Her inbox is
still syncing. Work together, write down everything, and share what
matters with the rest of the room.

Fee: paid in advance. Questions: none, apparently.`,
  },
  {
    name: "readme.txt",
    body: `FIELD NOTES FOR WHOEVER USES THIS MACHINE

- Browser: type an address in the bar, or tap a bookmark.
  Every page has a "View Source" button. Images have "File Info".
  Black bars can be tapped to reveal what's underneath.
- Notes: private by default. Tap "Share to room" when it matters.
  Tag fragments (name / year / ID / cipher key / address).
- Email: keep an eye on it. Ada leaves voicemails.
- Decoder: Ada keeps it in "Ada's Tools", inside her personal
  folder. She never could resist a security question.
- Stuck? The hints panel can ask Ada for a nudge.`,
  },
  {
    name: "todo.txt",
    body: `- back up the archive (again)
- call sis back
- stop drawing compasses on everything
- renew domain before it lapses`,
  },
];

// In Ada's Tools. Points to the binary lesson; contains no answers.
const SYLLABUS: FileItem = {
  name: "cs110_syllabus.txt",
  body: `HARBOUR COMMUNITY COLLEGE — EVENING STUDIES
CS 110: How Computers Count
Tuesdays 6:30–8:30pm, Room 12
Instructor: W. Okafor

Week 1  What is a computer, really?       (handout)
Week 2  Switches: on and off              (handout)
Week 3  Binary: counting with two fingers
        Lesson + practice quiz online:
        harbourcc.edu/cs110/binary
        Pass the quiz to install the class
        Binary translator on your machine.
Week 4  Passwords, and why yours is bad

Bring a pencil. Laptops welcome. Phones face down.

---
(Ada, in the margin:)
W. writes EVERYTHING in her class code now.
Shopping lists. Door codes. Probably passwords.
Learn it.`,
};

const PIN_LEN = 4;

function PinPad({ ctx }: { ctx: GameCtx }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const now = useNow(500);
  const waiting = retryUntil !== null && retryUntil > now;

  const submit = useCallback(
    async (value: string) => {
      setBusy(true);
      setError(null);
      const res = await ctx.api<AttemptResponse>("/attempt", {
        method: "POST",
        body: { puzzleId: "bonus-pin", input: value },
      });
      setBusy(false);
      const d = res.data;
      if (res.status === 429 || d?.rateLimited) {
        const sec = d?.retryAfterSec ?? 60;
        setRetryUntil(Date.now() + sec * 1000);
        setError(d?.message ?? "Too many attempts.");
        setPin("");
        return;
      }
      if (!res.ok || !d) {
        setError("Couldn't reach the server. Try again.");
        setPin("");
        return;
      }
      if (d.correct) {
        ctx.toast("Folder unlocked", "success");
        await ctx.refresh();
      } else {
        setError(d.message ?? "Wrong PIN.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setPin("");
      }
    },
    [ctx],
  );

  function press(d: string) {
    if (busy || waiting) return;
    setError(null);
    if (pin.length >= PIN_LEN) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LEN) void submit(next);
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-5 py-6">
      <div className="text-center">
        <div className="mb-1 text-3xl" aria-hidden>
          🔒
        </div>
        <h3 className="text-base font-semibold text-zinc-100">Ada&apos;s Personal</h3>
        <p className="text-xs text-zinc-500">Enter 4-digit PIN</p>
      </div>
      <div className={`flex gap-4 ${shake ? "animate-pulse" : ""}`} aria-label={`${pin.length} of 4 digits entered`}>
        {Array.from({ length: PIN_LEN }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < pin.length ? "border-amber-400 bg-amber-400" : "border-zinc-600"
            } ${error && !waiting ? "border-red-500" : ""}`}
          />
        ))}
      </div>
      <div className="min-h-5 text-center text-sm" aria-live="polite">
        {waiting ? (
          <span className="text-amber-300">
            Locked out. Retry in {Math.ceil(((retryUntil ?? 0) - now) / 1000)}s
          </span>
        ) : busy ? (
          <span className="text-zinc-400">Checking…</span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : null}
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {keys.map((k) => {
          const isDigit = /^\d$/.test(k);
          return (
            <button
              key={k}
              type="button"
              disabled={busy || waiting || (!isDigit && pin.length === 0)}
              onClick={() => {
                if (isDigit) press(k);
                else if (k === "del") setPin((p) => p.slice(0, -1));
                else setPin("");
              }}
              className={`flex h-16 items-center justify-center rounded-2xl border text-2xl font-semibold disabled:opacity-40 ${
                isDigit
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 active:bg-zinc-800"
                  : "border-transparent text-sm uppercase tracking-wider text-zinc-400 active:bg-zinc-900"
              }`}
            >
              {k === "del" ? "⌫" : k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SecurityQuestion({ ctx }: { ctx: GameCtx }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const now = useNow(500);
  const waiting = retryUntil !== null && retryUntil > now;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = answer.trim();
    if (!value || busy || waiting) return;
    setBusy(true);
    setError(null);
    const res = await ctx.api<AttemptResponse>("/attempt", {
      method: "POST",
      body: { puzzleId: "tools-folder", input: value },
    });
    setBusy(false);
    const d = res.data;
    if (res.status === 429 || d?.rateLimited) {
      setRetryUntil(Date.now() + (d?.retryAfterSec ?? 60) * 1000);
      setError(d?.message ?? "Too many attempts.");
      return;
    }
    if (!d) {
      setError("Couldn't reach the server. Try again.");
      return;
    }
    if (d.correct) {
      ctx.toast("Folder unlocked", "success");
      await ctx.refresh();
    } else {
      setError(d.message ?? "That's not it.");
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-xs flex-col gap-4 py-6">
      <div className="text-center">
        <div className="mb-1 text-3xl" aria-hidden>
          🔒
        </div>
        <h3 className="text-base font-semibold text-zinc-100">Ada&apos;s Tools</h3>
        <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">Security question</p>
        <p className="mt-1 font-serif text-lg text-zinc-100">Who was Dad&apos;s weather?</p>
      </div>
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-label="Security answer"
        className="min-h-12 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-100 placeholder:text-zinc-600"
      />
      <button
        type="submit"
        disabled={busy || waiting || !answer.trim()}
        className="min-h-12 rounded-lg bg-amber-400 font-semibold text-zinc-950 disabled:opacity-50"
      >
        {busy ? "Checking…" : "Unlock"}
      </button>
      <div className="min-h-5 text-center text-sm" aria-live="polite">
        {waiting ? (
          <span className="text-amber-300">Locked out. Retry in {Math.ceil(((retryUntil ?? 0) - now) / 1000)}s</span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : null}
      </div>
    </form>
  );
}

type View =
  | { kind: "root" }
  | { kind: "personal" }
  | { kind: "tools" }
  | { kind: "file"; file: FileItem; from: "root" | "personal" | "tools" };

export function FilesApp({ ctx }: { ctx: GameCtx }) {
  const { state } = ctx;
  const unlocked = state.progress.solved.includes("bonus-pin");
  const toolsUnlocked = state.progress.solved.includes("tools-folder");
  const hasCompass = state.progress.badges.includes("compass");
  const [view, setView] = useState<View>({ kind: "root" });
  const [personal, setPersonal] = useState<FileItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!unlocked || view.kind !== "personal" || personal) return;
    let cancelled = false;
    setLoading(true);
    ctx
      .api<{ locked: true } | { locked: false; files: FileItem[] }>("/files")
      .then((res) => {
        if (cancelled) return;
        if (res.ok && res.data && !res.data.locked) setPersonal(res.data.files);
        else ctx.toast("Couldn't open the folder", "error");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [unlocked, view.kind, personal, ctx]);

  const header = (title: string, back?: () => void) => (
    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-2 py-2">
      {back ? (
        <button onClick={back} className="min-h-11 min-w-11 rounded-lg px-3 text-sm font-semibold text-amber-300 active:bg-zinc-900">
          ‹ Back
        </button>
      ) : (
        <span className="px-2 text-zinc-500" aria-hidden>
          ▤
        </span>
      )}
      <h2 className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-300">{title}</h2>
      {hasCompass && <CompassBadge label="Compass" />}
    </div>
  );

  const row = (icon: string, name: string, sub: string, onClick: () => void) => (
    <li key={name}>
      <button onClick={onClick} className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left active:bg-zinc-900">
        <span className="w-8 text-center text-xl" aria-hidden>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-sm text-zinc-100">{name}</span>
          <span className="block text-xs text-zinc-500">{sub}</span>
        </span>
        <span className="text-zinc-600" aria-hidden>
          ›
        </span>
      </button>
    </li>
  );

  if (view.kind === "file") {
    const back = () => setView({ kind: view.from });
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        {header(view.file.name, back)}
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-zinc-200">
            {view.file.body}
          </pre>
        </div>
      </div>
    );
  }

  if (view.kind === "tools") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        {header("~/Ada's Personal/Ada's Tools", () => setView({ kind: "personal" }))}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!toolsUnlocked ? (
            <SecurityQuestion ctx={ctx} />
          ) : (
            <ul className="divide-y divide-zinc-900">
              {row("🧭", "Decoder", "app · Caesar shift, A1Z26 and binary", () => ctx.openApp("decoder"))}
              {row("📄", SYLLABUS.name, "text file", () => setView({ kind: "file", file: SYLLABUS, from: "tools" }))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (view.kind === "personal") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        {header("~/Ada's Personal", () => setView({ kind: "root" }))}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!unlocked ? (
            <PinPad ctx={ctx} />
          ) : loading || !personal ? (
            <p className="p-10 text-center text-sm text-zinc-500">Opening…</p>
          ) : (
            <>
              {hasCompass && (
                <div className="m-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">
                  <CompassBadge /> <span className="ml-1">You found Ada&apos;s personal folder.</span>
                </div>
              )}
              <ul className="divide-y divide-zinc-900">
                {row(
                  toolsUnlocked ? "📂" : "🔒",
                  "Ada's Tools",
                  toolsUnlocked ? "folder · unlocked" : "folder · security question",
                  () => setView({ kind: "tools" }),
                )}
                {personal.map((f) =>
                  row("📄", f.name, "text file", () => setView({ kind: "file", file: f, from: "personal" })),
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      {header("~/")}
      <ul className="min-h-0 flex-1 divide-y divide-zinc-900 overflow-y-auto overscroll-contain">
        {row(unlocked ? "📂" : "🔒", "Ada's Personal", unlocked ? "folder · unlocked" : "folder · PIN required", () =>
          setView({ kind: "personal" }),
        )}
        {LOCAL_FILES.map((f) => row("📄", f.name, "text file", () => setView({ kind: "file", file: f, from: "root" })))}
      </ul>
      <div className="shrink-0 border-t border-zinc-900 p-2 text-center">
        <button className={`${btnGhost} w-full`} onClick={() => ctx.openApp("notes")}>
          Open Notes
        </button>
      </div>
    </div>
  );
}
