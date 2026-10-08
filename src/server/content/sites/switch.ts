import "server-only";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const SWITCH_HOST = "switch.ada-voss.net";

function home(progress: RoomProgress): SitePage {
  const solved = progress.solved.includes("final-phrase");
  const blocks: Block[] = solved
    ? [
        { type: "compass" },
        { type: "notice", tone: "success", text: "SWITCH DISARMED. Proof of life accepted." },
        { type: "heading", level: 1, text: "You found me." },
        { type: "paragraph", text: "If you're reading this, the phrase was right, and that means you walked the whole road: the name they erased, the year they lied about, the little cat with the number on her collar. Nobody stumbles into those three things by accident." },
        { type: "paragraph", text: "I'm alive. I've been alive the whole time, inside their own network, watching them reconcile me out of existence one record at a time." },
        { type: "paragraph", text: "Now you have to choose. I can't make this call for you. I'm too close to it." },
        { type: "footer", text: "switch.ada-voss.net — the needle points true." },
      ]
    : [
        { type: "compass" },
        { type: "heading", level: 1, text: "Dead Man's Switch" },
        { type: "countdown", seconds: 47 * 3600 + 59 * 60 + 12, label: "Until the unaltered records are released" },
        { type: "paragraph", text: "This is Ada Voss. If this timer is running, I haven't checked in. Either I can't, or I've decided not to." },
        { type: "paragraph", text: "If you're one of them, you can't stop it. If you're the one my sister hired — hello. You can prove I'm still breathing. Three pieces, joined by dashes: who has the key, the year they lied, and the number on Biscuit's collar." },
        { type: "form", form: "final-phrase", prompt: "Proof of life phrase" },
        { type: "footer", text: "switch.ada-voss.net — hosted somewhere they can't reconcile." },
      ];
  return page(SWITCH_HOST, solved ? "You found me" : "Dead Man's Switch", "switch", blocks, {
    headComments: ["no trackers. no analytics. no Institute."],
    bodyComments: ["if it fires, it fires. better the truth out late than never. — A."],
  });
}

export function resolveSwitch(path: string, progress: RoomProgress): SitePage | null {
  if (!progress.solved.includes("intranet-login")) return null;
  return path === "" ? home(progress) : null;
}
