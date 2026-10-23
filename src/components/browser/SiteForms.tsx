"use client";

import { useState } from "react";
import { useLocale, useT } from "@/i18n/client";
import { pick } from "@/i18n/config";
import type { AttemptResponse, PuzzleId, SiteFormId } from "@/lib/types";
import { LOCK_THEMES, LockStatus, lockFrameClass, OPEN_HOLD_MS, useLockFeedback } from "@/components/shell/lockFeel";
import { useAttemptLock } from "@/components/shell/useAttemptLock";
import type { RenderEnv } from "./SiteRenderer";

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
  // The room-wide limit and lockouts come from the shared attempt log, so every phone shows the same jam.
  const lock = useAttemptLock(ctx.state.attempts, puzzleId);
  const fb = useLockFeedback({ pulse: lock.pulse, jammedUntil: lock.jammedUntil });
  const retryLeft = fb.jamSec;

  async function submit(input: string) {
    if (busy || retryLeft > 0 || fb.phase === "open") return;
    setBusy(true);
    setFeedback(null);
    const res = await ctx.api<AttemptResponse>("/attempt", { method: "POST", body: { puzzleId, input } });
    setBusy(false);
    if (res.status === 429 || res.data?.rateLimited) {
      lock.retryAfter(res.data?.retryAfterSec ?? 30);
      lock.fire("wrong");
      return;
    }
    if (!res.ok || !res.data) {
      setFeedback({ tone: "error", text: tr("browser.form.connectionError") });
      return;
    }
    if (res.data.correct) {
      setFeedback({ tone: "success", text: res.data.message ?? tr("browser.form.accepted") });
      lock.fire("open");
      ctx.toast(res.data.message ?? tr("browser.form.correct"), "success");
      // Let the form glow open for a moment before the page moves on.
      await Promise.all([ctx.refresh(), new Promise((r) => setTimeout(r, OPEN_HOLD_MS))]);
      env.onSolved();
    } else {
      setFeedback({ tone: "error", text: res.data.message ?? tr("browser.form.rejected") });
      lock.fire("wrong");
      if (res.data.retryAfterSec) lock.retryAfter(res.data.retryAfterSec);
      void ctx.refresh();
    }
  }

  return {
    busy,
    feedback,
    retryLeft,
    left: lock.left,
    open: fb.phase === "open",
    frame: lockFrameClass(LOCK_THEMES.site, fb.phase),
    submit,
    solved: ctx.state.progress.solved.includes(puzzleId),
  };
}

/** The form's result line, then the jam banner or how many tries are left. */
function FeedbackLine({ a }: { a: Pick<ReturnType<typeof useAttempt>, "feedback" | "retryLeft" | "left"> }) {
  const { feedback, retryLeft, left } = a;
  const color =
    feedback?.tone === "success" ? "text-emerald-500" : feedback?.tone === "error" ? "text-red-500" : "opacity-80";
  return (
    <>
      {feedback && (
        <p role="status" className={`text-sm font-semibold ${color}`}>
          {feedback.text}
        </p>
      )}
      <LockStatus jamSec={retryLeft} left={left} theme={LOCK_THEMES.site} />
    </>
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
  if (form === "mara-login") return <MailLoginForm prompt={prompt} env={env} />;
  if (form === "mara-reset") return <MailResetForm prompt={prompt} env={env} />;
  return <FinalPhraseForm prompt={prompt} env={env} />;
}

function ShiftKeyForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
  const { t } = env;
  const tr = useT();
  // The lock is room-wide (useAttemptLock reads the shared attempt log), so teammates' phones lock too.
  const a = useAttempt(env, "shift-key");
  const [n, setN] = useState(1);
  const wrap = (v: number) => ((v % 26) + 26) % 26;

  return (
    <section className={`${t.card} space-y-3 ${a.frame}`}>
      <p className="font-semibold">{prompt}</p>
      {a.solved ? (
        <p className="text-sm font-semibold text-emerald-600">{tr("browser.form.shiftSolved")}</p>
      ) : (
        <p className={`text-sm ${t.muted}`}>{tr("browser.form.lockNote")}</p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setN((v) => wrap(v - 1))}
          aria-label={tr("browser.form.decreaseShift")}
          className={`lk-key h-14 w-14 text-3xl font-bold ${t.buttonGhost}`}
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
          className={`lk-key h-14 w-14 text-3xl font-bold ${t.buttonGhost}`}
        >
          +
        </button>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => a.submit(String(n))}
          disabled={a.busy || a.open || a.retryLeft > 0}
          className={`lk-key min-h-11 px-5 font-semibold ${t.button} disabled:opacity-60`}
        >
          {a.busy
            ? x({ en: "Checking…", ko: "확인 중…", "zh-TW": "確認中…", es: "Comprobando…", ja: "確認中…", "pt-BR": "Verificando…" })
            : x({ en: "Apply key", ko: "키 적용", "zh-TW": "套用金鑰", es: "Aplicar clave", ja: "キーを適用", "pt-BR": "Aplicar chave" })}
        </button>
      </div>
      <FeedbackLine a={a} />
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
      className={`${t.card} mx-auto max-w-sm space-y-3 ${a.frame}`}
      onSubmit={(e) => {
        e.preventDefault();
        void a.submit(`${user.trim()}:${pass}`);
      }}
    >
      <p className="font-semibold">{prompt}</p>
      {a.solved && <p className="text-sm font-semibold text-emerald-600">{x({ en: "✓ Session active.", ko: "✓ 세션 활성화됨.", "zh-TW": "✓ 工作階段已啟用。", es: "✓ Sesión activa.", ja: "✓ セッション有効。", "pt-BR": "✓ Sessão ativa." })}</p>}
      <label className="block text-sm">
        {x({ en: "Username", ko: "사용자 이름", "zh-TW": "使用者名稱", es: "Nombre de usuario", ja: "ユーザー名", "pt-BR": "Nome de usuário" })}
        <input
          {...inputProps}
          value={user}
          onChange={(e) => setUser(e.target.value)}
          enterKeyHint="next"
          className={`mt-1 h-11 w-full px-3 text-base ${t.input}`}
        />
      </label>
      <label className="block text-sm">
        {x({ en: "Vault code", ko: "볼트 코드", "zh-TW": "金庫代碼", es: "Código de la Bóveda", ja: "金庫コード", "pt-BR": "Código do Cofre" })}
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
            {show ? x({ en: "Hide", ko: "숨기기", "zh-TW": "隱藏", es: "Ocultar", ja: "隠す", "pt-BR": "Ocultar" }) : x({ en: "Show", ko: "보기", "zh-TW": "顯示", es: "Mostrar", ja: "表示", "pt-BR": "Mostrar" })}
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={a.busy || a.open || a.retryLeft > 0 || !user.trim() || !pass}
        className={`lk-key min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Signing in…", ko: "로그인 중…", "zh-TW": "登入中…", es: "Iniciando sesión…", ja: "ログイン中…", "pt-BR": "Entrando…" }) : x({ en: "Sign in", ko: "로그인", "zh-TW": "登入", es: "Iniciar sesión", ja: "ログイン", "pt-BR": "Entrar" })}
      </button>
      <FeedbackLine a={a} />
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
      className={`${t.card} space-y-3 ${a.frame}`}
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
        disabled={a.busy || a.open || a.retryLeft > 0 || !v.trim()}
        className={`lk-key min-h-12 w-full font-bold uppercase tracking-widest ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Transmitting…", ko: "전송 중…", "zh-TW": "傳送中…", es: "Transmitiendo…", ja: "送信中…", "pt-BR": "Transmitindo…" }) : x({ en: "Transmit", ko: "전송", "zh-TW": "傳送", es: "Transmitir", ja: "送信", "pt-BR": "Transmitir" })}
      </button>
      <FeedbackLine a={a} />
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
      className={`${t.card} space-y-3 ${a.frame}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) void a.submit(v);
      }}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>{x({ en: "Decode this word", ko: "이 단어를 해독하세요", "zh-TW": "解碼這個單字", es: "Decodifica esta palabra", ja: "この単語をデコードせよ", "pt-BR": "Decodifique esta palavra" })}</p>
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
            {x({ en: "Your answer", ko: "답", "zh-TW": "你的答案", es: "Tu respuesta", ja: "あなたの答え", "pt-BR": "Sua resposta" })}
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
            disabled={a.busy || a.open || a.retryLeft > 0 || !v.trim()}
            className={`lk-key min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
          >
            {a.busy ? x({ en: "Checking…", ko: "확인 중…", "zh-TW": "確認中…", es: "Comprobando…", ja: "確認中…", "pt-BR": "Verificando…" }) : x({ en: "Check answer", ko: "정답 확인", "zh-TW": "檢查答案", es: "Comprobar respuesta", ja: "答え合わせ", "pt-BR": "Verificar resposta" })}
          </button>
        </>
      )}
      {!a.solved && <FeedbackLine a={a} />}
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
      className={`${t.card} mx-auto max-w-sm space-y-3 ${a.frame}`}
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
          {show ? x({ en: "Hide", ko: "숨기기", "zh-TW": "隱藏", es: "Ocultar", ja: "隠す", "pt-BR": "Ocultar" }) : x({ en: "Show", ko: "보기", "zh-TW": "顯示", es: "Mostrar", ja: "表示", "pt-BR": "Mostrar" })}
        </button>
      </div>
      <button
        type="submit"
        disabled={a.busy || a.open || a.retryLeft > 0 || !pass.trim()}
        className={`lk-key min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Checking…", ko: "확인 중…", "zh-TW": "確認中…", es: "Comprobando…", ja: "確認中…", "pt-BR": "Verificando…" }) : x({ en: "Unlock console", ko: "콘솔 잠금 해제", "zh-TW": "解鎖主控台", es: "Desbloquear consola", ja: "コンソールのロックを解除", "pt-BR": "Desbloquear console" })}
      </button>
      <FeedbackLine a={a} />
    </form>
  );
}

/** harbourmail.com sign-in (Easter egg). Submitted as "address:password". */
function MailLoginForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
  const { t } = env;
  const a = useAttempt(env, "mara-login");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  return (
    <form
      className={`${t.card} mx-auto max-w-sm space-y-3 ${a.frame}`}
      onSubmit={(e) => {
        e.preventDefault();
        void a.submit(`${user.trim()}:${pass}`);
      }}
    >
      <p className="font-semibold">{prompt}</p>
      <label className="block text-sm">
        {x({ en: "Email address", ko: "이메일 주소", "zh-TW": "電子郵件地址", es: "Correo electrónico", ja: "メールアドレス", "pt-BR": "Endereço de e-mail" })}
        <input
          {...inputProps}
          type="email"
          inputMode="email"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          enterKeyHint="next"
          className={`mt-1 h-11 w-full px-3 text-base ${t.input}`}
        />
      </label>
      <label className="block text-sm">
        {x({ en: "Password", ko: "비밀번호", "zh-TW": "密碼", es: "Contraseña", ja: "パスワード", "pt-BR": "Senha" })}
        <div className="mt-1 flex gap-2">
          <input
            {...inputProps}
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            enterKeyHint="go"
            className={`h-11 min-w-0 flex-1 px-3 text-base ${t.input}`}
          />
          <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} className={`min-h-11 px-3 text-sm ${t.buttonGhost}`}>
            {show ? x({ en: "Hide", ko: "숨기기", "zh-TW": "隱藏", es: "Ocultar", ja: "隠す", "pt-BR": "Ocultar" }) : x({ en: "Show", ko: "보기", "zh-TW": "顯示", es: "Mostrar", ja: "表示", "pt-BR": "Mostrar" })}
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={a.busy || a.open || a.retryLeft > 0 || !user.trim() || !pass}
        className={`lk-key min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Signing in…", ko: "로그인 중…", "zh-TW": "登入中…", es: "Iniciando sesión…", ja: "ログイン中…", "pt-BR": "Entrando…" }) : x({ en: "Sign in", ko: "로그인", "zh-TW": "登入", es: "Iniciar sesión", ja: "ログイン", "pt-BR": "Entrar" })}
      </button>
      <FeedbackLine a={a} />
    </form>
  );
}

/** harbourmail.com "forgot password": sends a temporary password to the account's recovery contact. */
function MailResetForm({ prompt, env }: { prompt: string; env: RenderEnv }) {
  const x = useStory();
  const { t } = env;
  const a = useAttempt(env, "mara-reset");
  const [v, setV] = useState("");
  return (
    <form
      className={`${t.card} mx-auto max-w-sm space-y-3 ${a.frame}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) void a.submit(v);
      }}
    >
      <label className="block text-sm font-semibold" htmlFor="mail-reset">
        {prompt}
      </label>
      <input
        id="mail-reset"
        {...inputProps}
        type="email"
        inputMode="email"
        value={v}
        onChange={(e) => setV(e.target.value)}
        enterKeyHint="send"
        placeholder="name@harbourmail.com"
        className={`h-11 w-full px-3 text-base ${t.input}`}
      />
      <button
        type="submit"
        disabled={a.busy || a.open || a.retryLeft > 0 || !v.trim()}
        className={`lk-key min-h-11 w-full font-semibold ${t.button} disabled:opacity-60`}
      >
        {a.busy ? x({ en: "Sending…", ko: "보내는 중…", "zh-TW": "傳送中…", es: "Enviando…", ja: "送信中…", "pt-BR": "Enviando…" }) : x({ en: "Send temporary password", ko: "임시 비밀번호 보내기", "zh-TW": "寄送臨時密碼", es: "Enviar contraseña temporal", ja: "仮パスワードを送信", "pt-BR": "Enviar senha temporária" })}
      </button>
      <FeedbackLine a={a} />
    </form>
  );
}
