import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "./_og/card";
import { SITE_NAME } from "@/lib/games";

export const alt = `${SITE_NAME}: online escape rooms`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Online escape rooms",
    title: SITE_NAME,
    subtitle: "Puzzle mysteries you solve together, each on your own phone.",
  });
}
