import { ogCard, OG_CONTENT_TYPE, OG_SIZE, resultCard } from "../../_og/card";
import { formatDuration, gameTitle } from "@/lib/games";
import { publicEndingMessage } from "@/lib/result";
import { getSharedResult } from "@/server/result";
import { intlFor } from "@/i18n/server";

export const alt = "A team's escape room result";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** The shared result's link preview, in English (crawlers send no language). No names, no answers. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const r = await getSharedResult((await params).id);
  if (!r) return ogCard({ eyebrow: "Online escape rooms", title: "Escape Escape", subtitle: "Puzzle mysteries you solve together, each on your own phone." });
  const intl = intlFor("en");
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);
  const ending = publicEndingMessage(r.gameId, r.ending, r.solved);
  return resultCard({
    gameId: r.gameId,
    game: gameTitle(r.gameId),
    ending: t(ending.id, ending.values),
    stats: [
      { label: t("result.stat.time"), value: formatDuration(r.durationMs) },
      { label: t("result.stat.team"), value: String(r.playerCount) },
      { label: t("result.stat.hints"), value: String(r.hintsUsed) },
      ...(r.rank ? [{ label: t("result.stat.rank"), value: `#${r.rank}` }] : []),
    ],
    badges: r.badges.map((id) => t(`profile.ach.${id}.name`)),
  });
}
