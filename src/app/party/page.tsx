import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, gameText, isPartyGame, visibleGames } from "@/lib/games";
import { getSessionUser } from "@/server/auth";
import { seesStaging } from "@/server/purchases";
import { LanguageSwitcher } from "@/i18n/client";
import { getT } from "@/i18n/server";
import { JoinBox } from "../DirectoryClient";

export const metadata: Metadata = { title: `Party games — ${SITE_NAME}` };

/** Party games: social games for a group in one room, one tap away from the escape rooms on the home page. */
export default async function PartyGames() {
  const t = await getT();
  const games = visibleGames(await seesStaging(await getSessionUser().catch(() => null))).filter(isPartyGame);
  return (
    <main className="noir-vignette min-h-dvh px-edge pt-edge pb-10 pt-safe pb-safe">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm text-noir-ink-faint">
            {t("site.party.back")}
          </Link>
          <LanguageSwitcher tone="noir" />
        </div>
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-serif text-5xl leading-tight text-noir-ink">{t("site.party.title")}</h1>
          <p className="max-w-md font-serif text-noir-ink-dim">{t("site.party.intro")}</p>
        </header>
        <div className="mx-auto w-full max-w-md">
          <JoinBox />
        </div>
        {games.length === 0 ? (
          <p className="text-center text-noir-ink-dim">{t("site.party.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {games.map((g) => (
              <Link key={g.id} href={g.href} className="block h-full" aria-label={t("site.directory.playAria", { title: gameText(t, g, "title") })}>
                <article className="flex h-full flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-5 active:border-noir-brass">
                  <div>
                    <p className="font-mono text-11px uppercase tracking-[0.25em] text-noir-ink-faint">
                      {gameText(t, g, "tone")}
                      {g.status === "staging" && (
                        <span className="ml-2 rounded border border-noir-blood/70 px-1.5 py-0.5 text-noir-blood">Staging · admins only</span>
                      )}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold leading-tight text-noir-ink">{gameText(t, g, "title")}</h2>
                    <p className="mt-1 text-noir-ink-dim">{gameText(t, g, "tagline")}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-noir-ink-dim">{gameText(t, g, "blurb")}</p>
                  <ul className="flex flex-wrap gap-2 text-xs text-noir-ink-dim">
                    {g.tags?.map((tag) => (
                      <li key={tag} className="rounded-full border border-noir-brass/70 px-3 py-1 font-semibold text-noir-brass">
                        {tag}
                      </li>
                    ))}
                    {(["players", "duration"] as const).map((f) => (
                      <li key={f} className="rounded-full border border-noir-line px-3 py-1">
                        {gameText(t, g, f)}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-noir-brass font-semibold text-noir-bg">
                    {t("site.party.play")}
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
