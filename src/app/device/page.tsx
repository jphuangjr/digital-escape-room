import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { DeviceClient } from "./DeviceClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("device.title"), robots: { index: false, follow: false } };
}

export default function DevicePage() {
  return <DeviceClient />;
}
