import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { ATLAS_GAME_ID } from "@/lib/atlas/types";
import { getSessionUser } from "@/server/auth";
import { isAdmin } from "@/server/purchases";
import { TrainLanding } from "../nightingale-express/TrainLanding";

export const metadata: Metadata = {
  title: "The Atlas of Silent Worlds (staging) — Escape Escape",
  robots: { index: false, follow: false },
};

/** Staging: only admins can see this page; everyone else gets a 404. */
export default async function Page() {
  const game = getGame(ATLAS_GAME_ID);
  const user = await getSessionUser();
  if (!game || (game.status === "staging" && !isAdmin(user))) notFound();
  return <TrainLanding gameId={ATLAS_GAME_ID} startKey="atlas.landing.start" startingKey="atlas.landing.starting" />;
}
