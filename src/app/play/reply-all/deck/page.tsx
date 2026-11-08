import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { isAdmin } from "@/server/purchases";
import { PROMPTS, REPLIES } from "@/lib/replyall/cards";
import { DeckReview } from "./DeckReview";

export const metadata: Metadata = {
  title: "Reply All deck — Escape Escape",
  robots: { index: false, follow: false },
};

/** Admins only: every Reply All prompt and reply card, to review the deck. Everyone else gets a 404. */
export default async function Page() {
  if (!isAdmin(await getSessionUser())) notFound();
  return <DeckReview prompts={PROMPTS} replies={REPLIES} />;
}
