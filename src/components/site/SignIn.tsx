"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type { MeResponse } from "@/lib/types";
import { useT } from "@/i18n/client";

/**
 * One sign-in sheet for the whole site. Any "Sign in" button calls `openSignIn(callbackUrl)`; `SignInHost` (in the
 * root layout) shows the methods the server has on: a passkey, Google, or a code emailed to you. With Google as
 * the only method it goes straight to Google, as before. After an email sign-in it offers to create a passkey.
 */

const OPEN_EVENT = "escape:signin";

export function openSignIn(callbackUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/") {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { callbackUrl } }));
}

async function fetchProviders(): Promise<string[]> {
  const me = (await fetch("/api/me").then((r) => (r.ok ? r.json() : null)).catch(() => null)) as MeResponse | null;
  return me?.authProviders ?? (me?.googleEnabled ? ["google"] : []);
}

type Step = "choose" | "code" | "offer";

export function SignInHost() {
  const [target, setTarget] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const url = (e as CustomEvent<{ callbackUrl: string }>).detail.callbackUrl;
      void fetchProviders().then((list) => {
        if (list.length === 1 && list[0] === "google") return void signIn("google", { callbackUrl: url });
        setProviders(list);
        setTarget(url);
      });
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  if (target === null) return null;
  return createPortal(<SignInSheet callbackUrl={target} providers={providers} onClose={() => setTarget(null)} />, document.body);
}

function SignInSheet({ callbackUrl, providers, onClose }: { callbackUrl: string; providers: string[]; onClose: () => void }) {
  const t = useT();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const codeRef = useRef<HTMLInputElement>(null);
  const webauthn = typeof window !== "undefined" && browserSupportsWebAuthn();
  const hasPasskeys = providers.includes("passkey") && webauthn;

  useEffect(() => {
    if (resendAt <= now) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [resendAt, now]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const done = useCallback(() => window.location.assign(callbackUrl), [callbackUrl]);

  async function sendCode() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/email-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; retryAfterSec?: number };
      if (res.status === 429 && data.retryAfterSec && step === "code") setResendAt(Date.now() + data.retryAfterSec * 1000);
      if (!res.ok) return setMsg(data.error ?? t("auth.error.network"));
      setStep("code");
      setCode("");
      setResendAt(Date.now() + 60_000);
      setNow(Date.now());
      window.setTimeout(() => codeRef.current?.focus(), 50);
    } catch {
      setMsg(t("auth.error.network"));
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await signIn("email", { email, code: code.trim(), redirect: false });
      if (!res?.ok) return setMsg(t("auth.code.wrong"));
      // Signed in. Offer a passkey once, unless this account already has one.
      if (hasPasskeys) {
        const list = (await fetch("/api/account/passkeys").then((r) => (r.ok ? r.json() : null)).catch(() => null)) as { passkeys?: unknown[] } | null;
        if (list?.passkeys && list.passkeys.length === 0) return setStep("offer");
      }
      done();
    } catch {
      setMsg(t("auth.error.network"));
    } finally {
      setBusy(false);
    }
  }

  async function passkeySignIn() {
    setBusy(true);
    setMsg(null);
    try {
      const optionsJSON = await fetch("/api/account/passkeys/login-options", { method: "POST" }).then((r) => r.json());
      const response = await startAuthentication({ optionsJSON });
      const res = await signIn("passkey", { response: JSON.stringify(response), redirect: false });
      if (!res?.ok) return setMsg(t("auth.passkey.signInFailed"));
      done();
    } catch (err) {
      // Cancelled, or no passkey for this site on this device.
      if ((err as Error)?.name !== "NotAllowedError" && (err as Error)?.name !== "AbortError") setMsg(t("auth.passkey.signInFailed"));
      else setMsg(t("auth.passkey.none"));
    } finally {
      setBusy(false);
    }
  }

  async function createPasskey() {
    setBusy(true);
    setMsg(null);
    try {
      const ok = await addPasskey();
      if (!ok) return setMsg(t("auth.passkey.failed"));
      done();
    } catch {
      setMsg(t("auth.passkey.failed"));
    } finally {
      setBusy(false);
    }
  }

  const left = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const primary = "flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-noir-brass font-semibold text-noir-bg active:bg-noir-brass-hi disabled:opacity-60";
  const secondary = "flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-noir-line bg-noir-bg-3 font-semibold text-noir-ink active:bg-noir-bg disabled:opacity-60";
  const input = "min-h-12 w-full rounded-lg border border-noir-line bg-noir-bg-3 px-4 text-noir-ink placeholder:text-noir-ink-faint focus:border-noir-brass focus:outline-none";

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="signin-title">
      <button type="button" aria-label={t("auth.close")} className="absolute inset-0 bg-black/70" onClick={() => !busy && onClose()} />
      <div className="relative w-full max-w-md rounded-t-2xl border border-noir-line bg-noir-bg-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="signin-title" className="font-serif text-2xl text-noir-ink">
              {step === "code" ? t("auth.code.title") : step === "offer" ? t("auth.passkey.offerTitle") : t("auth.title")}
            </h2>
            <p className="mt-1 text-sm text-noir-ink-dim">
              {step === "code" ? t("auth.code.sent", { email }) : step === "offer" ? t("auth.passkey.offerBody") : t("auth.subtitle")}
            </p>
          </div>
          <button type="button" onClick={() => !busy && onClose()} aria-label={t("auth.close")} className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-xl text-noir-ink-faint">
            ×
          </button>
        </div>

        {step === "choose" && (
          <div className="flex flex-col gap-3">
            {hasPasskeys && (
              <button type="button" className={primary} disabled={busy} onClick={passkeySignIn}>
                <KeyIcon /> {t("auth.passkey.signIn")}
              </button>
            )}
            {providers.includes("google") && (
              <button type="button" className={secondary} disabled={busy} onClick={() => signIn("google", { callbackUrl })}>
                <GoogleMark /> {t("auth.google")}
              </button>
            )}
            {providers.includes("email") && (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendCode();
                }}
              >
                {(hasPasskeys || providers.includes("google")) && (
                  <p className="my-1 flex items-center gap-3 text-xs uppercase tracking-widest text-noir-ink-faint">
                    <span className="h-px flex-1 bg-noir-line" />
                    {t("auth.or")}
                    <span className="h-px flex-1 bg-noir-line" />
                  </p>
                )}
                <label htmlFor="signin-email" className="text-xs uppercase tracking-widest text-noir-ink-faint">
                  {t("auth.email.label")}
                </label>
                <input
                  id="signin-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email webauthn"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.email.placeholder")}
                  className={input}
                />
                <button type="submit" className={hasPasskeys ? secondary : primary} disabled={busy || !email.trim()}>
                  {busy ? t("auth.email.sending") : t("auth.email.send")}
                </button>
                {hasPasskeys && <p className="text-xs text-noir-ink-faint">{t("auth.lostPasskey")}</p>}
              </form>
            )}
          </div>
        )}

        {step === "code" && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submitCode();
            }}
          >
            <label htmlFor="signin-code" className="text-xs uppercase tracking-widest text-noir-ink-faint">
              {t("auth.code.label")}
            </label>
            <input
              id="signin-code"
              ref={codeRef}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${input} text-center font-mono text-2xl tracking-[0.5em]`}
            />
            <button type="submit" className={primary} disabled={busy || code.length !== 6}>
              {busy ? t("auth.code.checking") : t("auth.code.submit")}
            </button>
            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" className="min-h-11 text-noir-ink-dim underline" disabled={busy} onClick={() => setStep("choose")}>
                {t("auth.code.change")}
              </button>
              <button type="button" className="min-h-11 text-noir-brass underline disabled:text-noir-ink-faint disabled:no-underline" disabled={busy || left > 0} onClick={sendCode}>
                {left > 0 ? t("auth.code.resendIn", { s: left }) : t("auth.code.resend")}
              </button>
            </div>
          </form>
        )}

        {step === "offer" && (
          <div className="flex flex-col gap-3">
            <button type="button" className={primary} disabled={busy} onClick={createPasskey}>
              <KeyIcon /> {busy ? t("auth.passkey.creating") : t("auth.passkey.create")}
            </button>
            <button type="button" className={secondary} disabled={busy} onClick={done}>
              {t("auth.passkey.skip")}
            </button>
          </div>
        )}

        {msg && (
          <p className="mt-3 text-sm text-red-300" role="alert">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

/** Create a passkey for the signed-in account on this device. False if the device refused or the server did. */
export async function addPasskey(): Promise<boolean> {
  const optionsJSON = await fetch("/api/account/passkeys/register-options", { method: "POST" }).then((r) => (r.ok ? r.json() : null));
  if (!optionsJSON) return false;
  const response = await startRegistration({ optionsJSON });
  const res = await fetch("/api/account/passkeys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ response }) });
  return res.ok;
}

export function KeyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 19 4M18 5l2 2M15 8l2 2" />
    </svg>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
