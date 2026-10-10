import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { AdminClient } from "./AdminClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.page.title"), robots: { index: false, follow: false } };
}

export default function AdminPage() {
  return <AdminClient />;
}
