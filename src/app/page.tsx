import Link from "next/link";
import { GAMES, SITE_NAME, gameText, type GameInfo, type Translate } from "@/lib/games";
import { Compass } from "@/components/site/Compass";
import { LanguageSwitcher } from "@/i18n/client";
import { getT } from "@/i18n/server";
import { DirectoryAccount, DirectoryCases, JoinBox } from "./DirectoryClient";

function GameCard({ game, t }: { game: GameInfo; t: Translate }) {
  const live = game.status === "live";
  const body = (
    <article
      className={`flex h-full flex-col gap-4 rounded-xl border p-5 ${
        live ? "border-noir-line bg-noir-bg-2/90 active:border-noir-brass" : "border-dashed border-noir-line/70 bg-noir-bg-2/40"
      }`}
    >
      <div className="flex items-start gap-4">
        <Compass className={`h-14 w-14 shrink-0 ${live ? "text-noir-brass" : "text-noir-ink-faint"}`} />
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-noir-ink-faint">
            {live ? gameText(t, game, "tone") : t("site.directory.comingSoon")}
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
        <span className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-noir-brass font-semibold text-noir-bg">
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

export default async function Directory() {
  const t = await getT();
  return (
    <main className="noir-vignette min-h-dvh pt-safe pb-safe px-safe">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-10 pt-10">
        <LanguageSwitcher tone="noir" className="-mb-6 -mt-6 justify-end self-end" />
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">{t("site.directory.eyebrow")}</p>
          <h1 className="font-serif text-5xl leading-tight text-noir-ink">{SITE_NAME}</h1>
          <p className="max-w-md font-serif text-noir-ink-dim">
            {t("site.directory.intro")}
          </p>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <DirectoryAccount />
          <JoinBox />
        </div>

        <section aria-labelledby="cases-heading" className="flex flex-col gap-4">
          <h2 id="cases-heading" className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">
            {t("site.directory.casesHeading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {GAMES.map((g) => (
              <GameCard key={g.id} game={g} t={t} />
            ))}
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-noir-line/70 p-5 text-center">
              <Compass className="h-10 w-10 text-noir-ink-faint" />
              <p className="font-serif text-lg text-noir-ink-dim">{t("site.directory.moreCases")}</p>
              <p className="text-xs text-noir-ink-faint">{t("site.directory.moreCasesHint")}</p>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
          <DirectoryCases />
        </div>

        <footer className="text-center font-mono text-[11px] text-noir-ink-faint">
          {t("site.directory.footer")}
        </footer>
      </div>
    </main>
  );
}
