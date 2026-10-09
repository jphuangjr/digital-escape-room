import type { Metadata } from "next";
import { Suspense } from "react";
import { RedeemClient } from "./RedeemClient";

export const metadata: Metadata = { title: "Claim your escape room — Escape Escape", robots: { index: false, follow: false } };

export default function RedeemPage() {
  return (
    <Suspense>
      <RedeemClient />
    </Suspense>
  );
}
