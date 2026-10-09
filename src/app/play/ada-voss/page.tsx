import type { Metadata } from "next";
import { AdaLanding } from "./AdaLanding";

export const metadata: Metadata = {
  title: "The Vanishing of Dr. Ada Voss — Escape Escape",
  description:
    "A multiplayer online escape room. Dr. Ada Voss vanished 48 hours ago. Her laptop is open. Start at the beginning.",
};

export default function Page() {
  return <AdaLanding />;
}
