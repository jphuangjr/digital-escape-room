import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { getSessionUser } from "@/server/auth";
import { seesStaging } from "@/server/purchases";
import { ALL_HANDS_GAME_ID } from "@/lib/allhands/types";
import { AllHandsLanding } from "./AllHandsLanding";

export const metadata: Metadata = {
  title: "All Hands — Escape Escape",
};

/** While a game is in staging only admins and testers can see its page; everyone else gets a 404. */
export default async function Page() {
  const game = getGame(ALL_HANDS_GAME_ID);
  const user = await getSessionUser();
  if (!game || (game.status === "staging" && !(await seesStaging(user)))) notFound();
  return <AllHandsLanding />;
}
