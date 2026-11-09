import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { isAdmin } from "@/server/purchases";
import { PROMPTS, REPLIES } from "@/lib/replyall/cards";
import { AFTER_HOURS_PROMPTS, AFTER_HOURS_REPLIES } from "@/lib/replyall/afterHours";
import { DeckReview } from "./DeckReview";

export const metadata: Metadata = {
  title: "Reply All deck — Escape Escape",
  robots: { index: false, follow: false },
};

/** Admins only: every Reply All prompt and reply card, to review the deck. Everyone else gets a 404. */
export default async function Page() {
  if (!isAdmin(await getSessionUser())) notFound();
  return (
    <DeckReview
      decks={[
        { key: "prompts", label: "Prompts", kind: "prompt", cards: PROMPTS },
        { key: "replies", label: "Replies", kind: "reply", cards: REPLIES },
        { key: "ah-prompts", label: "18+ prompts", kind: "prompt", cards: AFTER_HOURS_PROMPTS, adult: true },
        { key: "ah-replies", label: "18+ replies", kind: "reply", cards: AFTER_HOURS_REPLIES, adult: true },
      ]}
    />
  );
}
