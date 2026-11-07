/** The invite join form's avatar colors (/r/CODE, and the Nightingale landing). */
export const AVATAR_COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#eab308"];

/** Ada's landing page palette. */
export const ADA_COLORS = ["#c9a227", "#a3302a", "#3d8c88", "#6b7fd7", "#b56cc4", "#d9824b", "#7fae4e", "#d8d2c4"];

const PALETTES = [AVATAR_COLORS, ADA_COLORS];

/** A color another player in the room already has, and their name. */
export interface TakenColor {
  color: string;
  name: string;
}

/**
 * Whether `color` can be picked when the others in the room have `taken`. Each player's color is their own: one
 * someone else has is off limits, unless every color in that palette is gone (rooms hold more players than a
 * palette has colors, and the next player must still be able to join).
 */
export function colorAvailable(color: string, taken: readonly string[]): boolean {
  const used = new Set(taken.map((c) => c.toLowerCase()));
  const c = color.toLowerCase();
  if (!used.has(c)) return true;
  return PALETTES.some((p) => p.includes(c) && p.every((x) => used.has(x)));
}

/** The first color in `palette` still free, or `current` if it is (or nothing is). */
export function freeColor(palette: readonly string[], taken: readonly string[], current: string): string {
  if (colorAvailable(current, taken)) return current;
  return palette.find((c) => colorAvailable(c, taken)) ?? current;
}
