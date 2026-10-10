"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import {
  ALPHABET,
  BIT_VALUES,
  a1z26ToLetters,
  binaryToLetters,
  lettersToBinary,
  looksBinary,
  caesarDecode,
  caesarShift,
  caesarWheel,
  lettersToA1z26,
  looksNumeric,
  normalizeShift,
} from "./decoderLogic";
import { btnGhost } from "./shared";

type T = ReturnType<typeof useT>;

async function copyText(text: string, ctx: GameCtx, t: T) {
  try {
    await navigator.clipboard.writeText(text);
    ctx.toast(t("common.copied"), "success");
  } catch {
    ctx.toast(t("apps.decoder.copyFailed"), "error");
  }
}

async function pasteInto(set: (v: string) => void, ctx: GameCtx, t: T) {
  try {
    const v = await navigator.clipboard.readText();
    set(v);
  } catch {
    ctx.toast(t("apps.decoder.pasteBlocked"), "info");
  }
}

function OutputBox({ text, ctx }: { text: string; ctx: GameCtx }) {
  const t = useT();
  const placeholder = t("apps.decoder.resultPlaceholder");
  return (
    <div className="space-y-2">
      <div className="min-h-20 whitespace-pre-wrap break-words rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 font-mono text-base tracking-wide text-amber-100">
        {text || <span className="text-zinc-500">{placeholder}</span>}
      </div>
      <div className="flex gap-2">
        <button className={btnGhost} disabled={!text} onClick={() => copyText(text, ctx, t)}>
          {t("apps.decoder.copyResult")}
        </button>
      </div>
    </div>
  );
}

function CaesarTool({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(0);
  const [mode, setMode] = useState<"decode" | "encode">("decode");
  const output = mode === "decode" ? caesarDecode(input, shift) : caesarShift(input, shift);
  const wheel = caesarWheel(mode === "decode" ? shift : (26 - shift) % 26);

  return (
    <div className="space-y-4 p-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apps.decoder.ciphertext")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={t("apps.decoder.inputPlaceholder")}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => pasteInto(setInput, ctx, t)}>
          {t("common.paste")}
        </button>
        <button className={btnGhost} disabled={!input} onClick={() => setInput("")}>
          {t("common.clear")}
        </button>
        <div className="ml-auto flex rounded-lg border border-zinc-700 p-0.5" role="group" aria-label={t("apps.decoder.direction")}>
          {(["decode", "encode"] as const).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-10 rounded-md px-3 text-xs font-semibold uppercase tracking-wide ${
                mode === m ? "bg-amber-500 text-zinc-950" : "text-zinc-400"
              }`}
            >
              {t("apps.decoder.mode", { mode: m })}
            </button>
          ))}
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2">
        <button
          aria-label={t("apps.decoder.decreaseShift")}
          onClick={() => setShift((s) => normalizeShift(s - 1))}
          className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-800 text-3xl font-bold text-zinc-100 active:bg-zinc-700"
        >
          −
        </button>
        <div className="text-center" aria-live="polite">
          <div className="text-xs uppercase tracking-widest text-zinc-500">{t("apps.decoder.shift")}</div>
          <div className="font-mono text-4xl font-bold text-amber-300">{shift}</div>
        </div>
        <button
          aria-label={t("apps.decoder.increaseShift")}
          onClick={() => setShift((s) => normalizeShift(s + 1))}
          className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-800 text-3xl font-bold text-zinc-100 active:bg-zinc-700"
        >
          +
        </button>
      </div>

      {/* Wheel */}
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {t("apps.decoder.wheel")}{" "}
          <span className="font-normal normal-case tracking-normal text-zinc-500">{t("apps.decoder.wheelHint")}</span>
        </div>
        <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-zinc-800 bg-zinc-900/60">
          <div className="flex w-max font-mono text-sm">
            {wheel.map((m) => (
              <div key={m.cipher} className="flex w-7 flex-col items-center border-r border-zinc-800 py-1 last:border-r-0">
                <span className="text-zinc-400">{m.cipher}</span>
                <span className="text-amber-300">{m.plain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apps.decoder.output")}</div>
        <OutputBox text={output} ctx={ctx} />
      </div>
    </div>
  );
}

function A1Z26Tool({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const [input, setInput] = useState("");
  const numeric = looksNumeric(input);
  const output = !input.trim() ? "" : numeric ? a1z26ToLetters(input) : lettersToA1z26(input);

  function tapLetter(l: string) {
    setInput((v) => (looksNumeric(v) ? "" : v) + l);
  }
  function tapNumber(n: number) {
    setInput((v) => {
      const base = v && !looksNumeric(v) ? "" : v;
      return base.trim() ? `${base.trim()} ${n}` : `${n}`;
    });
  }

  return (
    <div className="space-y-4 p-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {t("apps.decoder.numbersOrLetters")}
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("apps.decoder.a1z26Placeholder")}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          className="min-h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => pasteInto(setInput, ctx, t)}>
          {t("common.paste")}
        </button>
        <button
          className={btnGhost}
          disabled={!input}
          aria-label={t("apps.decoder.backspace")}
          onClick={() => setInput((v) => (looksNumeric(v) ? v.replace(/\d+\D*$/, "") : v.slice(0, -1)))}
        >
          ⌫
        </button>
        <button className={btnGhost} disabled={!input} onClick={() => setInput("")}>
          {t("common.clear")}
        </button>
        <span className="ml-auto self-center text-xs text-zinc-500">
          {input.trim() ? (numeric ? t("apps.decoder.numbersToLetters") : t("apps.decoder.lettersToNumbers")) : ""}
        </span>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apps.decoder.result")}</div>
        <OutputBox text={output} ctx={ctx} />
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {t("apps.decoder.tapLetters")}{" "}
          <span className="font-normal normal-case tracking-normal text-zinc-500">{t("apps.decoder.tapLettersHint")}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
          {ALPHABET.split("").map((l, i) => (
            <button
              key={l}
              onClick={() => tapLetter(l)}
              className="flex min-h-12 flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 active:bg-zinc-800"
            >
              <span className="font-mono text-base font-bold text-zinc-100">{l}</span>
              <span className="text-[10px] text-amber-400">{i + 1}</span>
            </button>
          ))}
          <button
            onClick={() => setInput((v) => (looksNumeric(v) ? v : v + " "))}
            className="col-span-2 min-h-12 rounded-lg border border-zinc-800 bg-zinc-900 text-xs uppercase text-zinc-400 active:bg-zinc-800"
          >
            {t("apps.decoder.space")}
          </button>
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apps.decoder.tapNumbers")}</div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
          {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => tapNumber(n)}
              className="flex min-h-12 flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 active:bg-zinc-800"
            >
              <span className="font-mono text-base font-bold text-zinc-100">{n}</span>
              <span className="text-[10px] text-amber-400">{ALPHABET[n - 1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BinaryTool({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const [input, setInput] = useState("");
  const [bits, setBits] = useState([0, 0, 0, 0, 0]);
  const binary = looksBinary(input);
  const output = !input.trim() ? "" : binary ? binaryToLetters(input) : lettersToBinary(input);
  const value = bits.reduce((sum, b, i) => sum + b * BIT_VALUES[i], 0);
  const letter = value >= 1 && value <= 26 ? ALPHABET[value - 1] : "?";

  function addGroup() {
    setInput((v) => {
      const base = v && !looksBinary(v) ? "" : v;
      return `${base}${base && !base.endsWith(" ") ? " " : ""}${bits.join("")} `;
    });
    setBits([0, 0, 0, 0, 0]);
  }

  return (
    <div className="space-y-4 p-3">
      <p className="text-xs text-zinc-500">{t("apps.decoder.binaryIntro")}</p>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apps.decoder.binaryOrLetters")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder={t("apps.decoder.binaryPlaceholder")}
          inputMode={binary || !input ? "numeric" : "text"}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => pasteInto(setInput, ctx, t)}>
          {t("common.paste")}
        </button>
        <button className={btnGhost} disabled={!input} onClick={() => setInput("")}>
          {t("common.clear")}
        </button>
        <span className="ml-auto self-center text-xs text-zinc-500">
          {input.trim() ? (binary ? t("apps.decoder.binaryToLetters") : t("apps.decoder.lettersToBinary")) : ""}
        </span>
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apps.decoder.result")}</div>
        <OutputBox text={output} ctx={ctx} />
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {t("apps.decoder.tapSwitches")}{" "}
          <span className="font-normal normal-case tracking-normal text-zinc-500">{t("apps.decoder.tapSwitchesHint")}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {bits.map((b, i) => (
            <button
              key={i}
              aria-pressed={b === 1}
              aria-label={t("apps.decoder.bitAria", { value: BIT_VALUES[i], on: b === 1 })}
              onClick={() => setBits((cur) => cur.map((x, j) => (j === i ? 1 - x : x)))}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg border font-mono ${
                b ? "border-amber-500 bg-amber-500/20 text-amber-200" : "border-zinc-800 bg-zinc-900 text-zinc-400"
              }`}
            >
              <span className="text-xl font-bold">{b}</span>
              <span className="text-[10px] text-amber-400">{BIT_VALUES[i]}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <p aria-live="polite" className="flex-1 font-mono text-sm text-zinc-300">
            {bits.join("")} = {value} = <span className="text-lg font-bold text-amber-300">{letter}</span>
          </p>
          <button className={btnGhost} disabled={value === 0} onClick={addGroup}>
            {t("apps.decoder.addToInput")}
          </button>
        </div>
      </div>
    </div>
  );
}

function BinaryLocked() {
  const t = useT();
  return (
    <div className="space-y-2 p-8 text-center">
      <div className="text-3xl" aria-hidden>
        🔒
      </div>
      <p className="text-sm font-semibold text-zinc-200">{t("apps.decoder.binaryLockedTitle")}</p>
      <p className="text-xs text-zinc-500">{t("apps.decoder.binaryLockedBody")}</p>
    </div>
  );
}

export function DecoderApp({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const [tab, setTab] = useState<"caesar" | "a1z26" | "binary">("caesar");
  const hasBinary = ctx.state.progress.badges.includes("binary");
  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      <div className="flex shrink-0 gap-1 border-b border-zinc-800 p-2" role="tablist">
        {(
          [
            ["caesar", t("apps.decoder.tabCaesar")],
            ["a1z26", t("apps.decoder.tabA1z26")],
            ["binary", hasBinary ? t("apps.decoder.tabBinary") : t("apps.decoder.tabBinaryLocked")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-11 flex-1 rounded-lg text-sm font-semibold ${
              tab === id ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 active:bg-zinc-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div hidden={tab !== "caesar"}>
          <CaesarTool ctx={ctx} />
        </div>
        <div hidden={tab !== "a1z26"}>
          <A1Z26Tool ctx={ctx} />
        </div>
        <div hidden={tab !== "binary"}>{hasBinary ? <BinaryTool ctx={ctx} /> : <BinaryLocked />}</div>
      </div>
    </div>
  );
}
