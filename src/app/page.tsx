"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function Landing() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
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

          <button
            type="submit"
            disabled={busy}
            className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg transition-colors active:bg-noir-brass-hi disabled:opacity-60"
          >
            {busy ? "Opening the laptop…" : mode === "create" ? "Open the case" : "Join the investigation"}
          </button>
        </form>

        <footer className="text-center font-mono text-[11px] text-noir-ink-faint">
          A work of fiction. Rooms go cold after 48 hours.
        </footer>
      </div>
    </main>
  );
}
