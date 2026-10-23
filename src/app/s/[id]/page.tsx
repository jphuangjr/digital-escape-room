import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { formatDuration, gameText, getGame } from "@/lib/games";
import { publicEndingMessage } from "@/lib/result";
import { getSharedResult } from "@/server/result";
import { getT } from "@/i18n/server";

// A shared result card: one team's time, team size and badges for a game, as a teaser for people who
// haven't played. Never names a culprit, an answer or a player.

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getSharedResult((await params).id);
  if (!r) return { title: "Escape Escape", robots: { index: false, follow: false } };
  const t = await getT();
  const game = t(`site.game.${r.gameId}.title`);
  const title = t("result.page.title", { game });
  const description = t("result.page.description", { team: t("result.page.team", { n: r.playerCount }), game, time: formatDuration(r.durationMs) });
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedResultPage({ params }: Props) {
  const r = await getSharedResult((await params).id);
  const game = r && getGame(r.gameId);
  if (!r || !game) notFound();
  const t = await getT();
  const ending = publicEndingMessage(r.gameId, r.ending, r.solved);
  const badges = r.badges.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter((a) => a !== undefined);
  const stats = [
    { label: t("result.stat.time"), value: formatDuration(r.durationMs) },
    { label: t("result.stat.team"), value: String(r.playerCount) },
    { label: t("result.stat.hints"), value: String(r.hintsUsed) },
  ];
  return (
    <main className="noir-vignette min-h-dvh px-4 pb-12" style={{ paddingTop: "max(2rem, env(safe-area-inset-top))" }}>
      <article className="mx-auto max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-noir-ink-faint">{t("result.page.eyebrow")}</p>
          <h1 className="font-serif text-3xl text-noir-ink">{gameText(t, game, "title")}</h1>
          <p className="font-serif text-xl italic text-noir-brass">{t(ending.id, ending.values)}</p>
        </header>

        <div className="grid grid-cols-3 gap-2 text-center">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-noir-line bg-noir-bg-2 p-2">
              <p className="text-[10px] uppercase tracking-wider text-noir-ink-faint">{s.label}</p>
              <p className="font-mono text-lg text-noir-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {(badges.length > 0 || r.rank) && (
          <section className="space-y-3 text-center">
            {badges.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2">
                {badges.map((a) => (
                  <li key={a.id} className="rounded-full border border-noir-brass/40 bg-noir-brass/10 px-3 py-1 text-sm text-noir-ink">
                    <span aria-hidden>{a.icon}</span> {t(`profile.ach.${a.id}.name`)}
                  </li>
                ))}
              </ul>
            )}
            {r.rank && <p className="font-mono text-sm text-noir-brass">{t("result.rank", { rank: r.rank, total: r.boardSize })}</p>}
          </section>
        )}

        <section className="space-y-3 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
          <p className="font-serif text-lg text-noir-ink">{gameText(t, game, "tagline")}</p>
          <p className="text-sm leading-relaxed text-noir-ink-dim">{gameText(t, game, "blurb")}</p>
          <p className="text-sm text-noir-ink-dim">{t("result.page.teaser")}</p>
        </section>

        <div className="flex flex-col gap-2">
          <Link href={game.href} className="block min-h-12 rounded-lg bg-noir-brass py-3 text-center font-semibold text-noir-bg active:bg-noir-brass-hi">
            {t("result.page.cta")}
          </Link>
          <Link href="/" className="block min-h-12 rounded-lg border border-noir-line py-3 text-center text-noir-ink-dim">
            {t("result.page.all")}
          </Link>
        </div>
      </article>
    </main>
  );
}
