/**
 * The in-game sites moved from .net to .com (players type .com by habit). Rooms, bookmarks and
 * case logs from before the move still hold .net addresses; this maps them to the new ones.
 */
const MOVED = /^((?:[a-z0-9-]+\.)*(?:meridian-inst|ada-voss|harbourmail|harbormail|runnerboard|lostpaws|trapdoor))\.net(?=$|[/:?#])/i;

/** "lostpaws.net/x" -> "lostpaws.com/x"; anything else is returned unchanged. */
export function modernizeAddress(address: string): string {
  return address.replace(MOVED, "$1.com");
}
