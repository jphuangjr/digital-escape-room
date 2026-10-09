"use client";

import { useEffect, useState } from "react";
import type { AttemptResponse, Block, PuzzleId } from "@/lib/types";
import { BlockList, type RenderEnv } from "./SiteRenderer";

type Feedback = { tone: "success" | "error" | "info"; text: string } | null;

function useAttempt(env: RenderEnv, puzzleId: PuzzleId) {
  const { ctx } = env;
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!retryUntil) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= retryUntil) {
        setRetryUntil(null);
        setFeedback(null);
      }
    }, 500);
    return () => clearInterval(id);
  }, [retryUntil]);

  const retryLeft = retryUntil ? Math.max(0, Math.ceil((retryUntil - now) / 1000)) : 0;

  async function submit(input: string) {
    if (busy || retryLeft > 0) return;
    setBusy(true);
    setFeedback(null);
    const res = await ctx.api<AttemptResponse>("/attempt", { method: "POST", body: { puzzleId, input } });
    setBusy(false);
    if (res.status === 429 || res.data?.rateLimited) {
      const sec = res.data?.retryAfterSec ?? 30;
      setNow(Date.now());
      setRetryUntil(Date.now() + sec * 1000);
      setFeedback({ tone: "info", text: res.data?.message ?? "Too many attempts. The system is cooling down." });
      return;
    }
    if (!res.ok || !res.data) {
      setFeedback({ tone: "error", text: "Connection error. Try again." });
      return;
    }
    if (res.data.correct) {
      setFeedback({ tone: "success", text: res.data.message ?? "Accepted." });
      ctx.toast(res.data.message ?? "Correct!", "success");
      await ctx.refresh();
      env.onSolved();
    } else {
      setFeedback({ tone: "error", text: res.data.message ?? "Rejected. That's not it." });
    }
  }

  return { busy, feedback, retryLeft, submit, solved: ctx.state.progress.solved.includes(puzzleId) };
}

function FeedbackLine({ feedback, retryLeft }: { feedback: Feedback; retryLeft: number }) {
  if (!feedback && !retryLeft) return null;
  const color =
    feedback?.tone === "success" ? "text-emerald-500" : feedback?.tone === "error" ? "text-red-500" : "opacity-80";
  return (
    <p role="status" className={`text-sm font-semibold ${color}`}>
      {feedback?.text}
      {retryLeft > 0 && ` Retry in ${retryLeft}s.`}
    </p>
  );
}

const inputProps = {
  autoCapitalize: "off",
  autoCorrect: "off",
  autoComplete: "off",
  spellCheck: false,
} as const;

export function SiteForm({
  form,
  prompt,
  env,
}: {
  form: "shift-key" | "intranet-login" | "final-phrase";
  prompt: string;
  env: RenderEnv;
}) {
  if (form === "shift-key") return <ShiftKeyForm prompt={prompt} env={env} />;
  if (form === "intranet-login") return <LoginForm prompt={prompt} env={env} />;
  return <FinalPhraseForm prompt={prompt} env={env} />;
}

function ShiftKeyForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const { t, ctx } = env;
  const a = useAttempt(env, "shift-key");
  const [n, setN] = useState(1);
  const [preview, setPreview] = useState<Block[] | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const wrap = (v: number) => ((v % 26) + 26) % 26;

  async function doPreview() {
    setPreviewing(true);
    const res = await ctx.api<{ blocks: Block[] }>("/decode", { method: "POST", body: { shift: n } });
    setPreviewing(false);
    if (res.ok && res.data?.blocks) setPreview(res.data.blocks);
    else ctx.toast("Preview failed", "error");
  }

  return (
    <section className={`${t.card} space-y-3`}>
      <p className="font-semibold">{prompt}</p>
      {a.solved && <p className="text-sm font-semibold text-emerald-600">✓ Listings decoded for the whole room.</p>}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setN((v) => wrap(v - 1))}
          aria-label="Decrease shift"
          className={`h-14 w-14 text-3xl font-bold ${t.buttonGhost}`}
        >
          −
        </button>
        <output aria-live="polite" className="w-20 text-center font-mono text-4xl font-bold tabular-nums">
          {n}
        </output>
        <button
          type="button"
          onClick={() => setN((v) => wrap(v + 1))}
          aria-label="Increase shift"
          className={`h-14 w-14 text-3xl font-bold ${t.buttonGhost}`}
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={doPreview} disabled={previewing} className={`min-h-11 px-4 ${t.buttonGhost} disabled:opacity-60`}>
          {previewing ? "Decoding…" : "Preview"}
        </button>
        <button
          type="button"
          onClick={() => a.submit(String(n))}
          disabled={a.busy || a.retryLeft > 0}
          className={`min-h-11 px-5 font-semibold ${t.button} disabled:opacity-60`}
        >
          {a.busy ? "Checking…" : "Apply key"}
        </button>
      </div>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
      {preview && (
        <div className="space-y-3 border-t border-current/20 pt-3">
          <div className="flex items-center justify-between">
            <p className={`text-xs uppercase tracking-wider ${t.muted}`}>Preview · shift {n} (only you can see this)</p>
            <button type="button" onClick={() => setPreview(null)} className={`min-h-11 px-2 text-sm ${t.link}`}>
              Hide
            </button>
          </div>
          <BlockList blocks={preview} env={env} />
        </div>
      )}
    </section>
  );
}

function LoginForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const { t } = env;
  const a = useAttempt(env, "intranet-login");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  return (
    <form
      className={`${t.card} mx-auto max-w-sm space-y-3`}
      onSubmit={(e) => {
        e.preventDefault();
        void a.submit(`${user.trim()}:${pass}`);
      }}
    >
      <p className="font-semibold">{prompt}</p>
      {a.solved && <p className="text-sm font-semibold text-emerald-600">✓ Session active.</p>}
      <label className="block text-sm">
        Username
        <input
          {...inputProps}
          value={user}
          onChange={(e) => setUser(e.target.value)}
          enterKeyHint="next"
          className={`mt-1 h-11 w-full px-3 text-base ${t.input}`}
        />
      </label>
      <label className="block text-sm">
        Vault code
        <div className="mt-1 flex gap-2">
          <input
            {...inputProps}
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            enterKeyHint="go"
            className={`h-11 min-w-0 flex-1 px-3 text-base ${t.input}`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-pressed={show}
            className={`min-h-11 px-3 text-sm ${t.buttonGhost}`}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={a.busy || a.retryLeft > 0 || !user.trim() || !pass}
        className={`min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? "Signing in…" : "Sign in"}
      </button>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
    </form>
  );
}

function FinalPhraseForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const { t } = env;
  const a = useAttempt(env, "final-phrase");
  const [v, setV] = useState("");
  return (
    <form
      className={`${t.card} space-y-3`}
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) void a.submit(v);
      }}
    >
      <label className="block font-semibold" htmlFor="final-phrase">
        {prompt}
      </label>
      <div className="flex gap-2">
        <span aria-hidden className="self-center font-mono">
          &gt;
        </span>
        <input
          id="final-phrase"
          {...inputProps}
          value={v}
          onChange={(e) => setV(e.target.value)}
          enterKeyHint="send"
          className={`h-12 min-w-0 flex-1 px-3 font-mono text-base ${t.input}`}
        />
      </div>
      <button
        type="submit"
        disabled={a.busy || a.retryLeft > 0 || !v.trim()}
        className={`min-h-12 w-full font-bold uppercase tracking-widest ${t.button} disabled:opacity-60`}
      >
        {a.busy ? "Transmitting…" : "Transmit"}
      </button>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
    </form>
  );
}
