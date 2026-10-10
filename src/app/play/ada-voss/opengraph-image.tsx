import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "../../_og/card";
import { getGame } from "@/lib/games";

const game = getGame("ada-voss")!;
export const alt = game.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({ eyebrow: `Escape Escape · ${game.tone}`, title: game.title, subtitle: game.tagline });
}
