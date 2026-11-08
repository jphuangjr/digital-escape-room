"use client";

import { QrScanButton } from "@/components/site/QrScanner";
import { useT } from "@/i18n/client";

export type PartyMode = "host" | "join";

/** "ada 7k2q", "7K2Q" or "ADA-7K2Q" → "ADA-7K2Q". Every room, party games included, uses the ADA- prefix. */
export function normalizeRoomCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  if (/^[A-Z0-9]{4}$/.test(s)) return `ADA-${s}`;
  const m = s.match(/^([A-Z]+)-?([A-Z0-9]{4})$/);
  return m ? `${m[1]}-${m[2]}` : s;
}

export function isRoomCode(code: string): boolean {
  return /^ADA-[A-Z0-9]{4}$/.test(code);
}

/** Host / Join toggle for a party game's landing form, like the escape rooms' Create / Join tabs. */
export function PartyModeTabs({ mode, onChange, activeClass }: { mode: PartyMode; onChange: (m: PartyMode) => void; activeClass: string }) {
  const t = useT();
  return (
    <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1">
      {(["host", "join"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`min-h-11 rounded-lg text-sm font-semibold transition-colors ${mode === m ? activeClass : "text-slate-400"}`}
        >
          {m === "host" ? t("site.ada.tabCreate") : t("site.ada.tabJoin")}
        </button>
      ))}
    </div>
  );
}

/** Room-code field with the QR scanner, shown on the Join tab. */
export function PartyCodeField({ value, onChange, focusClass }: { value: string; onChange: (v: string) => void; focusClass: string }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="party-room-code" className="text-xs uppercase tracking-widest text-slate-400">
        {t("site.ada.roomCode")}
      </label>
      <div className="flex gap-2">
        <input
          id="party-room-code"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={() => onChange(normalizeRoomCode(value))}
          placeholder="ADA-7K2Q"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={12}
          className={`min-h-12 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 font-mono text-lg tracking-widest text-slate-100 outline-none placeholder:text-slate-600 ${focusClass}`}
        />
        <QrScanButton onCode={(c) => onChange(normalizeRoomCode(c))} />
      </div>
    </div>
  );
}

/** Joins a room by code. Resolves to the room's code, or an error message to show. */
export async function joinRoom(
  rawCode: string,
  displayName: string,
  color: string,
  t: ReturnType<typeof useT>,
): Promise<{ code: string } | { error: string }> {
  const code = normalizeRoomCode(rawCode);
  if (!isRoomCode(code)) return { error: t("site.join.invalidCode") };
  try {
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, color }),
    });
    const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string; colorTaken?: boolean };
    if (data.colorTaken) return { error: data.error ?? t("site.form.colorTaken") };
    if (!res.ok || !data.code) return { error: res.status === 404 ? t("site.ada.errNoRoom") : data.error || t("site.ada.errGeneric") };
    return { code: data.code };
  } catch {
    return { error: t("site.error.network") };
  }
}
