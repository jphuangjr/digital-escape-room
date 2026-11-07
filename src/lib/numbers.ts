/** A whole number from a text field, kept within [min, max]; `fallback` when it's empty or not a number. */
export function clampInt(text: string, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(text));
  if (text.trim() === "" || !Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
