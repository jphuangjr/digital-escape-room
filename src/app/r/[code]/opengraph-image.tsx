import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "../../_og/card";

export const alt = "You're invited to investigate";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Invite-link preview. Only formats the code from the URL; never touches the database. */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = decodeURIComponent(code).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  return ogCard({
    eyebrow: "The Vanishing of Dr. Ada Voss",
    title: "You're invited to investigate",
    subtitle: "Tap to join the room. Sign in with Google or just enter a name.",
    badge: clean || undefined,
  });
}
