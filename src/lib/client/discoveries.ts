import type { Discovery, PuzzleId } from "@/lib/types";

/** How a solve reads in the case log and in teammates' toasts: "Lee cracked the Lost Paws cipher". */
export const PUZZLE_DISCOVERY: Record<PuzzleId, string> = {
  "bonus-pin": "opened Ada's Personal folder",
  "tools-folder": "unlocked Ada's Tools",
  "shift-key": "cracked the Lost Paws cipher",
  "intranet-login": "got into the Vault",
  "binary-lesson": "passed the binary lesson (Decoder now reads binary)",
  "admin-console": "broke into the Vault's admin console",
  "final-phrase": "entered the proof of life",
};

export function describeDiscovery(d: Discovery): string {
  return d.kind === "site" ? `found a new site: ${d.host}` : PUZZLE_DISCOVERY[d.puzzleId] ?? "solved a puzzle";
}

/** Sites whose content changes when a puzzle is solved, so an open copy should reload itself. */
export const PUZZLE_AFFECTS_HOSTS: Record<PuzzleId, string[]> = {
  "bonus-pin": [],
  "tools-folder": [],
  "shift-key": ["lostpaws.net"],
  "intranet-login": ["intranet.meridian-inst.net"],
  "binary-lesson": ["harbourcc.edu"],
  "admin-console": ["intranet.meridian-inst.net", "switch.ada-voss.net"],
  "final-phrase": ["switch.ada-voss.net"],
};
