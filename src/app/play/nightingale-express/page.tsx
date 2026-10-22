import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { getSessionUser } from "@/server/auth";
import { seesStaging } from "@/server/purchases";
import { TrainLanding } from "./TrainLanding";

export const metadata: Metadata = {
  title: "The Nightingale Express — Escape Escape",
};

/** While a game is in staging only admins and testers can see its page; everyone else gets a 404. */
export default async function Page() {
  const game = getGame("nightingale-express");
  const user = await getSessionUser();
  if (!game || (game.status === "staging" && !(await seesStaging(user)))) notFound();
  return <TrainLanding />;
}
