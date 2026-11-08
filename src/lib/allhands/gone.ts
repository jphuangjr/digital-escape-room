import type { Role, SeatView } from "./types";
import type { RoleCounts } from "./lineup";

/** Roles the Rules sheet may call "out of the game". The Moles' side isn't here: the game ends when the last Mole goes. */
const TRACKED: Role[] = ["it", "hr", "intern", "burnout", "nephew"];

/**
 * Roles in this game with nobody left holding them, judged only from what this phone already sees: the roles shown
 * on departed seats. With role reveals off, a living player sees no departed roles, so nothing is ever marked.
 * A recruited player shows as a Mole, so a role can be undercounted here but never wrongly marked as gone.
 */
export function goneRoles(counts: RoleCounts, seats: Pick<SeatView, "alive" | "role">[]): Role[] {
  return TRACKED.filter((r) => (counts[r] ?? 0) > 0 && seats.filter((x) => !x.alive && x.role === r).length >= (counts[r] ?? 0));
}
