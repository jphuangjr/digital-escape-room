import type { Metadata } from "next";
import { Suspense } from "react";
import { RedeemClient } from "./RedeemClient";

const title = "Claim your escape room — Escape Escape";
const description = "You've been given a free escape room. Sign in with Google to claim it, then host it for your friends.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: false, follow: false },
};

export default function RedeemPage() {
  return (
    <Suspense>
      <RedeemClient />
    </Suspense>
  );
}
