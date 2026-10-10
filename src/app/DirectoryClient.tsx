"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountBar, MyCases, useMe } from "@/components/site/Account";
import { useT } from "@/i18n/client";

/** "ada 7k2q", "7K2Q" or "ADA-7K2Q" → "ADA-7K2Q". */
function normalizeCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  if (/^[A-Z0-9]{4}$/.test(s)) return `ADA-${s}`;
  const m = s.match(/^([A-Z]+)-?([A-Z0-9]{4})$/);
  return m ? `${m[1]}-${m[2]}` : s;
}

export function DirectoryAccount() {
  const me = useMe();
  return <AccountBar me={me} callbackUrl="/" />;
}

export function DirectoryCases() {
  const me = useMe();
  return me ? <MyCases me={me} /> : null;
}

export function JoinBox() {
  const router = useRouter();
  const t = useT();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Old invite links pointed at /?join=CODE.
  useEffect(() => {
    const join = new URLSearchParams(window.location.search).get("join");
    if (join) router.replace(`/r/${normalizeCode(join)}`);
  }, [router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = normalizeCode(code);
    if (!/^[A-Z]+-[A-Z0-9]{4}$/.test(c)) return setErr(t("site.join.invalidCode"));
    router.push(`/r/${c}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
      <label htmlFor="room-code" className="text-xs uppercase tracking-widest text-noir-ink-faint">
        {t("site.join.label")}
      </label>
      <div className="flex gap-2">
        <input
          id="room-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErr(null);
          }}
          placeholder="ADA-7K2Q"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={12}
          className="min-h-12 min-w-0 flex-1 rounded-lg border border-noir-line bg-noir-bg-3 px-3 font-mono text-lg tracking-widest text-noir-ink placeholder:text-noir-ink-faint"
        />
        <button type="submit" className="min-h-12 shrink-0 rounded-lg bg-noir-brass px-5 font-semibold text-noir-bg active:bg-noir-brass-hi">
          {t("site.join.button")}
        </button>
      </div>
      {err && (
        <p role="alert" className="text-sm text-noir-ink-dim">
          {err}
        </p>
      )}
    </form>
  );
}
