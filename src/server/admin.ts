import "server-only";
import type { User } from "@prisma/client";
import { getT } from "@/i18n/server";
import { error } from "./http";
import { getSessionUser } from "./auth";
import { isAdmin } from "./purchases";

/** The signed-in admin, or a 401/403 response. Admins are listed by email in ACCOUNT_ADMIN. */
export async function requireAdmin(): Promise<User | Response> {
  const user = await getSessionUser();
  if (!user) return error(401, (await getT())("api.admin.signIn"));
  if (!isAdmin(user)) return error(403, (await getT())("api.admin.only"));
  return user;
}
