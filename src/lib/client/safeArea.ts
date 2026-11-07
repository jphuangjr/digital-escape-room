/**
 * The left/right safe-area insets in px (a notch in landscape; the folded iPhone Duo's 84px right strip). They only
 * exist in CSS, so a throwaway probe carries them as padding. For layouts placed in JS (the tour card).
 */
export function sideInsets(): { left: number; right: number } {
  try {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-left:var(--safe-left);padding-right:var(--safe-right)";
    document.body.appendChild(d);
    const s = getComputedStyle(d);
    const out = { left: parseFloat(s.paddingLeft) || 0, right: parseFloat(s.paddingRight) || 0 };
    d.remove();
    return out;
  } catch {
    return { left: 0, right: 0 };
  }
}
