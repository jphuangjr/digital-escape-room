"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import type { MeResponse } from "@/lib/types";
import { formatDuration, gameTitle } from "@/lib/games";

const COLORS = ["#c9a227", "#a3302a", "#3d8c88", "#6b7fd7", "#b56cc4", "#d9824b", "#7fae4e", "#d8d2c4"];
const PREF_KEY = "ada.profile";

function normalizeCode(raw: string): string {
  let s = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  if (/^ADA[^-]/.test(s)) s = `ADA-${s.slice(3)}`;
  if (s && !s.startsWith("ADA-")) s = `ADA-${s}`;
  return s;
}

function Compass({ className = "" }: { className?: string }) {
  // Broken-needle compass with 7 notches.
  const notches = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
      {notches.map((a) => (
        <line
          key={a}
          x1="50"
          y1="8"
          x2="50"
          y2="16"
          stroke="currentColor"
          strokeWidth="2.5"
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      <path d="M50 50 L56 24 L50 30 Z" fill="currentColor" transform="rotate(18 50 50)" />
      <path d="M50 54 L46 70 L52 64 Z" fill="currentColor" opacity="0.55" transform="rotate(-24 50 50)" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

function GoogleButton({ label, callbackUrl = "/" }: { label: string; callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-noir-line bg-noir-ink font-semibold text-noir-bg active:opacity-80"
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.8-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z" />
      </svg>
      {label}
    </button>
  );
}

function MyCases({ me }: { me: MeResponse }) {
  if (!me.user || (me.activeRooms.length === 0 && me.cases.length === 0)) return null;
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">My cases</h2>
      {me.activeRooms.length > 0 && (
        <ul className="flex flex-col gap-2">
          {me.activeRooms.map((r) => (
            <li key={r.code}>
              <a
                href={`/r/${r.code}`}
                className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-noir-line bg-noir-bg-3 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block font-mono tracking-widest text-noir-ink">{r.code}</span>
                  <span className="block truncate text-xs text-noir-ink-faint">
                    {gameTitle(r.gameId)} · {r.playerCount} {r.playerCount === 1 ? "player" : "players"}
                    {r.isHost ? " · host" : ""} · {r.status === "playing" ? "in progress" : r.status}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-noir-brass">Rejoin →</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {me.cases.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-noir-ink-faint">
              <tr>
                <th className="py-1 pr-3 font-normal">Case</th>
                <th className="py-1 pr-3 font-normal">Time</th>
                <th className="py-1 font-normal">Ending</th>
              </tr>
            </thead>
            <tbody>
              {me.cases.map((c) => (
                <tr key={`${c.roomCode}-${c.finishedAt}`} className="border-t border-noir-line align-top">
                  <td className="py-2 pr-3">
                    <span className="block text-noir-ink">{gameTitle(c.gameId)}</span>
                    <span className="block text-xs text-noir-ink-faint">
                      {new Date(c.finishedAt).toLocaleDateString()} · {c.playerCount} {c.playerCount === 1 ? "player" : "players"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-noir-brass">{formatDuration(c.durationMs)}</td>
                  <td className="py-2 text-noir-ink-dim">{c.ending ? c.ending.toLowerCase() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Landing() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        setMe(data);
        // Prefill from Google only when the player hasn't chosen a name on this device.
        if (data.user?.name) setName((n) => n || data.user!.name!.slice(0, 24));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = Boolean(me?.user);
  const mustSignInToHost = mode === "create" && Boolean(me?.googleEnabled) && !signedIn;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null") as { name?: string; color?: string } | null;
      if (saved?.name) setName(saved.name);
      if (saved?.color && COLORS.includes(saved.color)) setColor(saved.color);
    } catch {
      /* storage unavailable */
    }
    const join = new URLSearchParams(window.location.search).get("join");
    if (join) {
      setJoinCode(normalizeCode(join));
      setMode("join");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const displayName = name.trim();
    if (!displayName) return setErr("Give yourself a name, investigator.");
    const code = normalizeCode(joinCode);
    if (mode === "join" && !/^ADA-[A-Z0-9]{4}$/.test(code)) return setErr("Room codes look like ADA-7K2Q.");
    setBusy(true);
    try {
      try {
        localStorage.setItem(PREF_KEY, JSON.stringify({ name: displayName, color }));
      } catch {
        /* ignore */
      }
      const res = await fetch(mode === "create" ? "/api/rooms" : `/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, color }),
      });
      const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string; signInRequired?: boolean };
      if (data.signInRequired) {
        setErr("Sign in with Google to host a room.");
        setMe((m) => (m ? { ...m, googleEnabled: true, user: null } : m));
        setBusy(false);
        return;
      }
      if (!res.ok || !data.code) {
        setErr(res.status === 404 ? "No such room. It may have gone cold (rooms expire after 48h)." : data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push(`/r/${data.code}`);
    } catch {
      setErr("Network trouble. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="noir-vignette min-h-dvh pt-safe pb-safe px-safe">
      <div className="mx-auto flex max-w-md flex-col gap-8 px-4 pb-10 pt-10">
        <header className="flex flex-col items-center gap-4 text-center">
          <Compass className="h-20 w-20 text-noir-brass" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">Case file 0412</p>
          <h1 className="font-serif text-4xl leading-tight text-noir-ink">
            The Vanishing of
            <br />
            <span className="text-noir-brass">Dr. Ada Voss</span>
          </h1>
        </header>

        <section className="space-y-3 font-serif text-base leading-relaxed text-noir-ink-dim">
          <p>
            Ada Voss, archivist at the Meridian Institute, vanished forty-eight hours ago. Her sister hired you. All you have is
            Ada&apos;s laptop, still warm, and one last message:
          </p>
          <blockquote className="border-l-2 border-noir-brass pl-4 italic text-noir-ink">
            &ldquo;If you&apos;re reading this, I got too close. Start at the beginning.&rdquo;
          </blockquote>
          <p className="text-sm text-noir-ink-faint">Play solo or bring a crew. Best on a phone, with friends on theirs.</p>
        </section>

        {me?.googleEnabled && (
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-noir-line bg-noir-bg-2/90 px-4 py-2">
            {signedIn ? (
              <>
                {me.user!.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.user!.image} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="h-8 w-8 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-noir-ink-dim">
                  Signed in as <span className="text-noir-ink">{me.user!.name || me.user!.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="min-h-11 shrink-0 px-2 text-sm text-noir-ink-faint underline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 text-sm text-noir-ink-dim">
                  Sign in to keep your cases and times, and pick up on any device.
                </span>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="min-h-11 shrink-0 px-2 text-sm font-semibold text-noir-brass underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-noir-bg-3 p-1">
            {(["create", "join"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setErr(null);
                }}
                className={`min-h-11 rounded-md text-sm font-medium transition-colors ${
                  mode === m ? "bg-noir-brass text-noir-bg" : "text-noir-ink-dim"
                }`}
              >
                {m === "create" ? "Create room" : "Join with code"}
              </button>
            ))}
          </div>

          {mode === "join" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest text-noir-ink-faint">Room code</span>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onBlur={() => setJoinCode((c) => normalizeCode(c))}
                placeholder="ADA-7K2Q"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                maxLength={12}
                className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 font-mono text-lg tracking-widest text-noir-ink placeholder:text-noir-ink-faint"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-noir-ink-faint">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Investigator"
              maxLength={24}
              autoComplete="nickname"
              className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink placeholder:text-noir-ink-faint"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-xs uppercase tracking-widest text-noir-ink-faint">Avatar color</legend>
            <div className="grid grid-cols-8 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className="flex min-h-11 items-center justify-center rounded-full"
                >
                  <span
                    className={`block h-8 w-8 rounded-full border-2 ${color === c ? "border-noir-ink scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          {err && (
            <p role="alert" className="rounded-md border border-noir-blood/60 bg-noir-blood/15 px-3 py-2 text-sm text-noir-ink">
              {err}
            </p>
          )}

          {mustSignInToHost ? (
            <div className="flex flex-col gap-2">
              <GoogleButton label="Sign in with Google to host" />
              <p className="text-center text-xs text-noir-ink-faint">Hosts sign in. Friends can join with just a name.</p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg transition-colors active:bg-noir-brass-hi disabled:opacity-60"
            >
              {busy ? "Opening the laptop…" : mode === "create" ? "Open the case" : "Join the investigation"}
            </button>
          )}
        </form>

        {me && <MyCases me={me} />}

        <footer className="text-center font-mono text-[11px] text-noir-ink-faint">
          A work of fiction. Rooms go cold after 48 hours.
        </footer>
      </div>
    </main>
  );
}
