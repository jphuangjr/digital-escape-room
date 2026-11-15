"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  BURNOUT_MIN_PLAYERS,
  INTERN_MIN_PLAYERS,
  NEPHEW_MIN_PLAYERS,
  RECRUITER_MIN_PLAYERS,
  type Role,
  type Settings,
} from "@/lib/allhands/types";
import { lineupFor, type RoleCounts } from "@/lib/allhands/lineup";
import { goneRoles } from "@/lib/allhands/gone";
import { FormattedMessage } from "react-intl";
import { useT } from "@/i18n/client";
import type { SeatView } from "@/lib/allhands/types";

const ROLES: Role[] = ["employee", "mole", "it", "hr", "recruiter", "intern", "burnout", "nephew"];

const MIN_FOR: Partial<Record<Role, number>> = {
  intern: INTERN_MIN_PLAYERS,
  burnout: BURNOUT_MIN_PLAYERS,
  nephew: NEPHEW_MIN_PLAYERS,
  recruiter: RECRUITER_MIN_PLAYERS,
};

const ROLE_TONE: Record<Role, string> = {
  employee: "border-lime-300/40 text-lime-300",
  mole: "border-rose-400/50 text-rose-300",
  it: "border-sky-300/40 text-sky-300",
  hr: "border-amber-300/40 text-amber-300",
  burnout: "border-violet-300/40 text-violet-300",
  intern: "border-teal-300/40 text-teal-300",
  nephew: "border-orange-300/40 text-orange-300",
  recruiter: "border-fuchsia-400/50 text-fuchsia-300",
};

/** The phases of a round, in order; each is named and explained in the rules sheet. */
const PHASES = ["reveal", "night", "dawn", "day", "vote", "exit"] as const;

/** Colours a side's name inside a translated sentence (`<company>…</company>` in the message). */
const tone = (cls: string) => {
  const Tone = (chunks: React.ReactNode) => (
    <span key={cls} className={`font-semibold ${cls}`}>
      {chunks}
    </span>
  );
  return Tone;
};

/** A quick reference anyone can open mid-game: who's who, what happens when, and how each side wins. */
export function RulesButton({
  players,
  settings,
  lineup = null,
  seats = [],
}: {
  players: number;
  settings: Settings;
  lineup?: RoleCounts | null;
  /** This phone's view of the table, mid-game: departed seats with a shown role mark that role as gone. */
  seats?: SeatView[];
}) {
  const t = useT();
  const role = (r: Role) => t(`allhands.role.${r}.name`);
  const list = (items: string[]) => items.reduce((a, b) => t("party.and", { a, b }));
  const [open, setOpen] = useState(false);
  const { counts } = lineupFor(players, settings, lineup);
  const moleSide = counts.mole + counts.recruiter;
  const parts = [
    moleSide > 0 && t(counts.recruiter ? "allhands.rules.molesRecruiter" : "allhands.rules.moles", { n: moleSide }),
    counts.it > 0 && t("allhands.rules.one", { role: role("it") }),
    counts.hr > 0 && t("allhands.rules.one", { role: role("hr") }),
    ...ROLES.filter((r) => MIN_FOR[r] !== undefined && r !== "recruiter" && counts[r] > 0).map((r) => t("allhands.rules.one", { role: role(r) })),
  ].filter((x): x is string => Boolean(x));
  const tableLine = parts.length ? list(parts) : t("allhands.rules.noSpecial");
  const off = (r: Role) => r !== "employee" && r !== "mole" && counts[r] === 0;
  const gone = goneRoles(counts, seats);
  const goneLine = gone.length > 0 ? list(gone.map(role)) : null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("allhands.rules.title")}
        className="flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-slate-700 px-3 text-sm font-semibold text-slate-200 transition-transform duration-75 active:scale-95 active:bg-slate-800"
      >
        <span aria-hidden>📖</span>
        <span className="hidden min-[420px]:inline">{t("allhands.rules.button")}</span>
      </button>
      {open &&
        // Portaled: the sticky header's backdrop blur would otherwise trap a fixed sheet inside the header.
        createPortal(
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label={t("allhands.rules.title")}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex max-h-[85dvh] w-full max-w-xl flex-col rounded-t-2xl border border-slate-800 bg-slate-950"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-lg font-bold">{t("allhands.rules.title")}</p>
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 text-sm text-slate-400 active:bg-slate-800">
                {t("allhands.rules.close")}
              </button>
            </div>
            <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-4 py-4 text-sm">
              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t("allhands.rules.howToWin")}</h2>
                <p>
                  <FormattedMessage id="allhands.rules.winCompany" values={{ company: tone("text-lime-300") }} />
                </p>
                <p>
                  <FormattedMessage id="allhands.rules.winMoles" values={{ moles: tone("text-rose-300") }} />
                </p>
                <p>
                  <FormattedMessage id="allhands.rules.winBurnout" values={{ burnout: tone("text-violet-300") }} />
                </p>
                <p>
                  <FormattedMessage id="allhands.rules.winIntern" values={{ intern: tone("text-teal-300") }} />
                </p>
                <p className="text-slate-400">{t("allhands.rules.table", { n: players, roles: tableLine })}</p>
                {goneLine && (
                  <p className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200">
                    <span aria-hidden>🪦</span>{" "}
                    <FormattedMessage id="allhands.rules.gone" values={{ roles: goneLine, b: tone("") }} />
                  </p>
                )}
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t("allhands.rules.whoIsWho")}</h2>
                {ROLES.map((r) => (
                  <div key={r} className={`rounded-xl border bg-slate-900 p-3 ${ROLE_TONE[r]} ${off(r) || gone.includes(r) ? "opacity-50" : ""}`}>
                    <p className="font-bold">
                      {role(r)} <span className="font-normal text-slate-500">({t(`allhands.role.${r}.classic`)})</span>
                      {gone.includes(r) && <span className="ml-1 text-xs font-normal text-slate-400">{t("allhands.rules.outOfGame")}</span>}
                      {off(r) && (
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          {MIN_FOR[r] ? t("allhands.rules.notInGameMin", { n: MIN_FOR[r] }) : t("allhands.rules.notInGame")}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-slate-200">{t(`allhands.role.${r}.power`)}</p>
                  </div>
                ))}
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t("allhands.rules.eachRound")}</h2>
                <ol className="flex flex-col gap-2">
                  {PHASES.map((p, i) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">{i + 1}</span>
                      <span>
                        <span className="font-semibold">{t(`allhands.phase.${p}`)}.</span> <span className="text-slate-300">{t(`allhands.rules.phase.${p}`)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="flex flex-col gap-1 text-slate-400">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t("party.houseRules")}</h2>
                <p>{t("allhands.rules.house1")}</p>
                <p>{t("allhands.rules.house2")}</p>
              </section>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
