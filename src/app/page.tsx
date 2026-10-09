import Link from "next/link";
import { GAMES, SITE_NAME, type GameInfo } from "@/lib/games";
import { Compass } from "@/components/site/Compass";
import { DirectoryAccount, DirectoryCases, JoinBox } from "./DirectoryClient";

function GameCard({ game }: { game: GameInfo }) {
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
            {live ? game.tone : "Coming soon"}
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight text-noir-ink">{game.title}</h2>
          <p className="mt-1 font-serif italic text-noir-ink-dim">{game.tagline}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-noir-ink-dim">{game.blurb}</p>
      <ul className="flex flex-wrap gap-2 text-xs text-noir-ink-dim">
        {[game.players, game.duration, game.difficulty].map((t) => (
          <li key={t} className="rounded-full border border-noir-line px-3 py-1">
            {t}
          </li>
        ))}
      </ul>
      {live && (
        <span className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-noir-brass font-semibold text-noir-bg">
          Open the case →
        </span>
      )}
    </article>
  );
  return live ? (
    <Link href={game.href} className="block h-full" aria-label={`Play ${game.title}`}>
      {body}
    </Link>
  ) : (
    body
  );
}

export default function Directory() {
  return (
    <main className="noir-vignette min-h-dvh pt-safe pb-safe px-safe">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-10 pt-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">Online escape rooms</p>
          <h1 className="font-serif text-5xl leading-tight text-noir-ink">{SITE_NAME}</h1>
          <p className="max-w-md font-serif text-noir-ink-dim">
            Puzzle mysteries you solve together, each on your own phone. Pick a case, invite your crew, and get out.
          </p>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <DirectoryAccount />
          <JoinBox />
        </div>

        <section aria-labelledby="cases-heading" className="flex flex-col gap-4">
          <h2 id="cases-heading" className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">
            Cases
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {GAMES.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-noir-line/70 p-5 text-center">
              <Compass className="h-10 w-10 text-noir-ink-faint" />
              <p className="font-serif text-lg text-noir-ink-dim">More cases are being written.</p>
              <p className="text-xs text-noir-ink-faint">Sign in to keep your times when they open.</p>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
          <DirectoryCases />
        </div>

        <footer className="text-center font-mono text-[11px] text-noir-ink-faint">
          Works of fiction. Rooms go cold after 48 hours.
        </footer>
      </div>
    </main>
  );
}
