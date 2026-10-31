import Link from "next/link";
import { SITE_NAME, gameText, visibleGames, type GameInfo, type Translate } from "@/lib/games";
import { getSessionUser } from "@/server/auth";
import { seesStaging } from "@/server/purchases";
import { Compass } from "@/components/site/Compass";
import { LanguageSwitcher } from "@/i18n/client";
import { getT } from "@/i18n/server";
import { DirectoryAccount, DirectoryCases, JoinBox } from "./DirectoryClient";
import { VaultIntro } from "@/components/site/VaultIntro";
import { LobbyAmbience } from "@/components/site/LobbyAmbience";
import { GameTrailer } from "@/components/site/GameTrailer";

function GameCard({ game, t, i }: { game: GameInfo; t: Translate; i: number }) {
  const staging = game.status === "staging";
  const live = game.status === "live" || staging;
  const body = (
    <article
      className={`lb-card flex h-full flex-col gap-4 rounded-xl border p-5 ${
        live ? "border-noir-line bg-noir-bg-2/90 active:border-noir-brass" : "border-dashed border-noir-line/70 bg-noir-bg-2/40"
      }`}
    >
      {live && <GameTrailer gameId={game.id} t={t} variant="card" className="-mx-5 -mt-5 -mb-1 h-28 rounded-t-xl opacity-70" />}
      <div className="relative flex items-start gap-4">
        <Compass needle={live ? "sway" : undefined} className={`h-14 w-14 shrink-0 ${live ? "text-noir-brass" : "text-noir-ink-faint"}`} />
        <div className="min-w-0">
          <p className="font-mono text-11px uppercase tracking-[0.25em] text-noir-ink-faint">
            {live ? gameText(t, game, "tone") : t("site.directory.comingSoon")}
            {staging && (
              <span className="ml-2 rounded border border-noir-blood/70 px-1.5 py-0.5 text-noir-blood">Staging · admins only</span>
            )}
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight text-noir-ink">{gameText(t, game, "title")}</h2>
          <p className="mt-1 font-serif italic text-noir-ink-dim">{gameText(t, game, "tagline")}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-noir-ink-dim">{gameText(t, game, "blurb")}</p>
      <ul className="flex flex-wrap gap-2 text-xs text-noir-ink-dim">
        {(["players", "duration", "difficulty"] as const).map((f) => (
          <li key={f} className="rounded-full border border-noir-line px-3 py-1">
            {gameText(t, game, f)}
          </li>
        ))}
      </ul>
      {live && (
        <span
          className="lb-sheen mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-noir-brass font-semibold text-noir-bg"
          style={{ "--i": i } as React.CSSProperties}
        >
          {t("site.directory.openCase")}
        </span>
      )}
    </article>
  );
  return live ? (
    <Link href={game.href} className="block h-full" aria-label={t("site.directory.playAria", { title: gameText(t, game, "title") })}>
      {body}
    </Link>
  ) : (
    body
  );
}

/** Entrance order for a lobby block (.lb-in in globals.css). */
const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default async function Directory() {
  const t = await getT();
  const games = visibleGames(await seesStaging(await getSessionUser().catch(() => null)));
  return (
    <main className="noir-vignette min-h-dvh pt-safe pb-safe px-safe">
      <VaultIntro />
      <LobbyAmbience />
      <div id="lobby" className="relative z-10 mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-10 pt-10">
        <LanguageSwitcher tone="noir" className="lb-in -mb-6 -mt-6 justify-end self-end" />
        <header className="lb-in flex flex-col items-center gap-3 text-center" style={step(0)}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">{t("site.directory.eyebrow")}</p>
          <h1 className="lb-title font-serif text-5xl leading-tight text-noir-ink">{SITE_NAME}</h1>
          <p className="max-w-md font-serif text-noir-ink-dim">
            {t("site.directory.intro")}
          </p>
        </header>

        <div className="lb-in mx-auto flex w-full max-w-md flex-col gap-4" style={step(1)}>
          <DirectoryAccount />
          <JoinBox />
        </div>

        <section aria-labelledby="cases-heading" className="flex flex-col gap-4">
          <h2 id="cases-heading" style={step(2)} className="lb-in font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">
            {t("site.directory.casesHeading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {games.map((g, i) => (
              <div key={g.id} className="lb-in h-full" style={step(3 + i)}>
                <GameCard game={g} t={t} i={i} />
              </div>
            ))}
            <div style={step(3 + games.length)} className="lb-in flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-noir-line/70 p-5 text-center">
              <Compass needle="search" className="h-10 w-10 text-noir-ink-faint" />
              <p className="font-serif text-lg text-noir-ink-dim">{t("site.directory.moreCases")}</p>
              <p className="text-xs text-noir-ink-faint">{t("site.directory.moreCasesHint")}</p>
            </div>
          </div>
        </section>

        <div className="lb-in mx-auto w-full max-w-md" style={step(4 + games.length)}>
          <DirectoryCases />
        </div>

        <footer style={step(5 + games.length)} className="lb-in text-center font-mono text-11px text-noir-ink-faint">
          {t("site.directory.footer")}
        </footer>
      </div>
    </main>
  );
}
