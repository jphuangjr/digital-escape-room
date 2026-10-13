import type { ProfileResponse } from "@/lib/types";
import { getSessionUser } from "@/server/auth";
import { error, json } from "@/server/http";
import { getProfile } from "@/server/profile";

/** The signed-in player's profile: their record across every escape room. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return error(401, "Sign in to see your profile.");
  return json<ProfileResponse>(await getProfile(user));
}
