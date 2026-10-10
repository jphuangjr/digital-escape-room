import type { Discovery, PuzzleId } from "@/lib/types";

/** A message formatter, i.e. `useT()` from "@/i18n/client". */
type Translate = (id: string, values?: Record<string, string | number | boolean>) => string;

/**
 * How a solve reads in the case log and in teammates' toasts: "Lee cracked the Lost Paws cipher".
 * English reference data; the UI shows the translated `room.discovery.<puzzleId>` messages.
 */
export const PUZZLE_DISCOVERY: Record<PuzzleId, string> = {
  "bonus-pin": "opened Ada's Personal folder",
  "tools-folder": "unlocked Ada's Tools",
  "shift-key": "cracked the Lost Paws cipher",
  "intranet-login": "got into the Vault",
  "binary-lesson": "passed the binary lesson (Decoder now reads binary)",
  "admin-console": "broke into the Vault's admin console",
  "final-phrase": "entered the proof of life",
};

/** The predicate ("cracked the Lost Paws cipher"). Pass `t` for the viewer's language; without it, English. */
export function describeDiscovery(d: Discovery, t?: Translate): string {
  if (!t) return d.kind === "site" ? `found a new site: ${d.host}` : PUZZLE_DISCOVERY[d.puzzleId] ?? "solved a puzzle";
  if (d.kind === "site") return t("room.discovery.site", { host: d.host });
  return d.puzzleId in PUZZLE_DISCOVERY ? t(`room.discovery.${d.puzzleId}`) : t("room.discovery.unknown");
}

/** The subject ("Lee" / "You"; in Korean with its particle, "Lee 님이" / "내가"). */
export function discoveryWho(d: Discovery, t: Translate, isMe = false): string {
  return t("room.discovery.who", { isMe, name: d.playerName });
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

/** Space between "who" and "what" in a discovery line: none in Chinese or Japanese, which don't use word spaces. */
export function discoverySeparator(locale: string): string {
  return locale.startsWith("zh") || locale === "ja" ? "" : " ";
}
