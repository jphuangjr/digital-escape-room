import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { getSessionUser } from "@/server/auth";
import { seesStaging } from "@/server/purchases";
import { REPLY_ALL_GAME_ID } from "@/lib/replyall/types";
import { ReplyAllLanding } from "./ReplyAllLanding";

export const metadata: Metadata = {
  title: "Reply All — Escape Escape",
};

/** While a game is in staging only admins and testers can see its page; everyone else gets a 404. */
export default async function Page() {
  const game = getGame(REPLY_ALL_GAME_ID);
  const user = await getSessionUser();
  if (!game || (game.status === "staging" && !(await seesStaging(user)))) notFound();
  return <ReplyAllLanding />;
}
