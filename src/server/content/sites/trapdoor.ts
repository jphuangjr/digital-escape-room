import "server-only";
import type { Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const TRAPDOOR_HOST = "trapdoor.net";

function home(): SitePage {
  const blocks: Block[] = [
    { type: "notice", tone: "danger", text: "CONNECTION LOGGED." },
    { type: "heading", level: 1, text: "You followed the wrong needle." },
    { type: "paragraph", text: "Hello, investigator. We wondered how long it would take." },
    { type: "paragraph", text: "Dr. Voss was a gifted archivist and a troubled woman. She saw patterns in coffee stains and conspiracies in typographical errors. The people who loved her are grieving. You are being paid to keep that grief open." },
    { type: "paragraph", text: "There is nothing behind this door. There never was. The account you followed was ours, and every timestamp you decoded was written for you to decode. Consider this a courtesy." },
    { type: "paragraph", text: "Go home. Close the laptop. Let the record rest." },
    { type: "compass" },
    { type: "paragraph", text: "— The Office of Continuity, Meridian Institute" },
    { type: "footer", text: "This page is monitored. Your visit has been reconciled." },
  ];
  return page(TRAPDOOR_HOST, "trapdoor.net", "honeypot", blocks, {
    headComments: ["honeypot v2 — log visitor, notify T.K."],
    bodyComments: [
      "if they got here they found the sock account. the real one still posts. check whose needle points true.",
      "reminder: our account's name is the mirror image. hers came first.",
    ],
    tailComments: ["DO NOT link this page from anywhere. — L.A."],
  });
}

export function resolveTrapdoor(path: string, _progress: RoomProgress, _loc: Locale): SitePage | null {
  return path === "" ? home() : null;
}
