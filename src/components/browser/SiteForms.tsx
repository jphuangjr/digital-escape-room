"use client";

import { useEffect, useState } from "react";
import { useLocale, useT } from "@/i18n/client";
import { pick } from "@/i18n/config";
import type { AttemptResponse, Block, PuzzleId, SiteFormId } from "@/lib/types";
import { BlockList, type RenderEnv } from "./SiteRenderer";

/** In-site (story) labels: `const x = useStory(); x({ en, ko })`. */
function useStory() {
  return pick(useLocale());
}

type Feedback = { tone: "success" | "error" | "info"; text: string } | null;

function useAttempt(env: RenderEnv, puzzleId: PuzzleId) {
  const { ctx } = env;
  const tr = useT();
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
      setFeedback({ tone: "info", text: res.data?.message ?? tr("browser.form.cooling") });
      return;
    }
    if (!res.ok || !res.data) {
      setFeedback({ tone: "error", text: tr("browser.form.connectionError") });
      return;
    }
    if (res.data.correct) {
      setFeedback({ tone: "success", text: res.data.message ?? tr("browser.form.accepted") });
      ctx.toast(res.data.message ?? tr("browser.form.correct"), "success");
      await ctx.refresh();
      env.onSolved();
    } else {
      setFeedback({ tone: "error", text: res.data.message ?? tr("browser.form.rejected") });
    }
  }

  return { busy, feedback, retryLeft, submit, solved: ctx.state.progress.solved.includes(puzzleId) };
}

function FeedbackLine({ feedback, retryLeft }: { feedback: Feedback; retryLeft: number }) {
  const tr = useT();
  if (!feedback && !retryLeft) return null;
  const color =
    feedback?.tone === "success" ? "text-emerald-500" : feedback?.tone === "error" ? "text-red-500" : "opacity-80";
  return (
    <p role="status" className={`text-sm font-semibold ${color}`}>
      {feedback?.text}
      {retryLeft > 0 && ` ${tr("browser.form.retryIn", { s: retryLeft })}`}
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
  form: SiteFormId;
  prompt: string;
  env: RenderEnv;
}) {
  if (form === "shift-key") return <ShiftKeyForm prompt={prompt} env={env} />;
  if (form === "binary-quiz") return <BinaryQuizForm code={prompt} env={env} />;
  if (form === "admin-login") return <AdminLoginForm prompt={prompt} env={env} />;
  if (form === "intranet-login") return <LoginForm prompt={prompt} env={env} />;
  return <FinalPhraseForm prompt={prompt} env={env} />;
}

function ShiftKeyForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
  const { t, ctx } = env;
  const tr = useT();
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
    else ctx.toast(tr("browser.form.previewFailed"), "error");
  }

  return (
    <section className={`${t.card} space-y-3`}>
      <p className="font-semibold">{prompt}</p>
      {a.solved && <p className="text-sm font-semibold text-emerald-600">{tr("browser.form.shiftSolved")}</p>}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setN((v) => wrap(v - 1))}
          aria-label={tr("browser.form.decreaseShift")}
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
          aria-label={tr("browser.form.increaseShift")}
          className={`h-14 w-14 text-3xl font-bold ${t.buttonGhost}`}
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={doPreview} disabled={previewing} className={`min-h-11 px-4 ${t.buttonGhost} disabled:opacity-60`}>
          {previewing ? x({ en: "Decoding…", ko: "해독 중…", "zh-TW": "解碼中…", es: "Decodificando…" }) : x({ en: "Preview", ko: "미리 보기", "zh-TW": "預覽", es: "Vista previa" })}
        </button>
        <button
          type="button"
          onClick={() => a.submit(String(n))}
          disabled={a.busy || a.retryLeft > 0}
          className={`min-h-11 px-5 font-semibold ${t.button} disabled:opacity-60`}
        >
          {a.busy ? x({ en: "Checking…", ko: "확인 중…", "zh-TW": "確認中…", es: "Comprobando…" }) : x({ en: "Apply key", ko: "키 적용", "zh-TW": "套用金鑰", es: "Aplicar clave" })}
        </button>
      </div>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
      {preview && (
        <div className="space-y-3 border-t border-current/20 pt-3">
          <div className="flex items-center justify-between">
            <p className={`text-xs uppercase tracking-wider ${t.muted}`}>{tr("browser.form.previewLabel", { n })}</p>
            <button type="button" onClick={() => setPreview(null)} className={`min-h-11 px-2 text-sm ${t.link}`}>
              {x({ en: "Hide", ko: "숨기기", "zh-TW": "隱藏", es: "Ocultar" })}
            </button>
          </div>
          <BlockList blocks={preview} env={env} />
        </div>
      )}
    </section>
  );
}

function LoginForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
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
      {a.solved && <p className="text-sm font-semibold text-emerald-600">{x({ en: "✓ Session active.", ko: "✓ 세션 활성화됨.", "zh-TW": "✓ 工作階段已啟用。", es: "✓ Sesión activa." })}</p>}
      <label className="block text-sm">
        {x({ en: "Username", ko: "사용자 이름", "zh-TW": "使用者名稱", es: "Nombre de usuario" })}
        <input
          {...inputProps}
          value={user}
          onChange={(e) => setUser(e.target.value)}
          enterKeyHint="next"
          className={`mt-1 h-11 w-full px-3 text-base ${t.input}`}
        />
      </label>
      <label className="block text-sm">
        {x({ en: "Vault code", ko: "볼트 코드", "zh-TW": "金庫代碼", es: "Código de la Bóveda" })}
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
            {show ? x({ en: "Hide", ko: "숨기기", "zh-TW": "隱藏", es: "Ocultar" }) : x({ en: "Show", ko: "보기", "zh-TW": "顯示", es: "Mostrar" })}
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={a.busy || a.retryLeft > 0 || !user.trim() || !pass}
        className={`min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Signing in…", ko: "로그인 중…", "zh-TW": "登入中…", es: "Iniciando sesión…" }) : x({ en: "Sign in", ko: "로그인", "zh-TW": "登入", es: "Iniciar sesión" })}
      </button>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
    </form>
  );
}

function FinalPhraseForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
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
        {a.busy ? x({ en: "Transmitting…", ko: "전송 중…", "zh-TW": "傳送中…", es: "Transmitiendo…" }) : x({ en: "Transmit", ko: "전송", "zh-TW": "傳送", es: "Transmitir" })}
      </button>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
    </form>
  );
}

/** harbourcc.edu practice quiz. `code` is the binary word to decode. */
function BinaryQuizForm({ code, env }: { code: string; env: RenderEnv }) {
  const x = useStory();
  const { t } = env;
  const tr = useT();
  const a = useAttempt(env, "binary-lesson");
  const [v, setV] = useState("");
  return (
    <form
      className={`${t.card} space-y-3`}
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) void a.submit(v);
      }}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>{x({ en: "Decode this word", ko: "이 단어를 해독하세요", "zh-TW": "解碼這個單字", es: "Decodifica esta palabra" })}</p>
      <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-lg font-bold tracking-wider">
        {code.split(" ").map((g, i) => (
          <span key={i}>{g}</span>
        ))}
      </p>
      {a.solved ? (
        <p className="text-sm font-semibold text-emerald-600">{tr("browser.form.binaryPassed")}</p>
      ) : (
        <>
          <label className="block text-sm">
            {x({ en: "Your answer", ko: "답", "zh-TW": "你的答案", es: "Tu respuesta" })}
            <input
              {...inputProps}
              value={v}
              onChange={(e) => setV(e.target.value)}
              enterKeyHint="send"
              className={`mt-1 h-11 w-full px-3 text-base ${t.input}`}
            />
          </label>
          <button
            type="submit"
            disabled={a.busy || a.retryLeft > 0 || !v.trim()}
            className={`min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
          >
            {a.busy ? x({ en: "Checking…", ko: "확인 중…", "zh-TW": "確認中…", es: "Comprobando…" }) : x({ en: "Check answer", ko: "정답 확인", "zh-TW": "檢查答案", es: "Comprobar respuesta" })}
          </button>
        </>
      )}
      {!a.solved && <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />}
    </form>
  );
}

function AdminLoginForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
  const { t } = env;
  const a = useAttempt(env, "admin-console");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  return (
    <form
      className={`${t.card} mx-auto max-w-sm space-y-3`}
      onSubmit={(e) => {
        e.preventDefault();
        if (pass.trim()) void a.submit(pass);
      }}
    >
      <label className="block text-sm font-semibold" htmlFor="admin-password">
        {prompt}
      </label>
      <div className="flex gap-2">
        <input
          id="admin-password"
          {...inputProps}
          type={show ? "text" : "password"}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          enterKeyHint="go"
          className={`h-11 min-w-0 flex-1 px-3 text-base ${t.input}`}
        />
        <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} className={`min-h-11 px-3 text-sm ${t.buttonGhost}`}>
          {show ? x({ en: "Hide", ko: "숨기기", "zh-TW": "隱藏", es: "Ocultar" }) : x({ en: "Show", ko: "보기", "zh-TW": "顯示", es: "Mostrar" })}
        </button>
      </div>
      <button
        type="submit"
        disabled={a.busy || a.retryLeft > 0 || !pass.trim()}
        className={`min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Checking…", ko: "확인 중…", "zh-TW": "確認中…", es: "Comprobando…" }) : x({ en: "Unlock console", ko: "콘솔 잠금 해제", "zh-TW": "解鎖主控台", es: "Desbloquear consola" })}
      </button>
      <FeedbackLine feedback={a.feedback} retryLeft={a.retryLeft} />
    </form>
  );
}
