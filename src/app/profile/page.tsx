import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { ProfileClient } from "./ProfileClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("profile.page.title"), robots: { index: false, follow: false } };
}

export default function ProfilePage() {
  return <ProfileClient />;
}
