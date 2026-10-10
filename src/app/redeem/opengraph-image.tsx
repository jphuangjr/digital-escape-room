import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "../_og/card";

export const alt = "You've been given a free escape room";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Escape Escape",
    title: "You've been given a free escape room",
    subtitle: "Sign in with Google to claim it, then host it for your friends.",
  });
}
