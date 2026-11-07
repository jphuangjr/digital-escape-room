/**
 * The folded iPhone Duo puts the clock/battery "pill" at the top of a strip down the right edge, reported only as
 * a right safe-area inset (84px, left 0). No API names the device, so that inset pattern is the signal:
 * right >= 56 while left is 0. Regular iPhones report 0/0 in portrait and equal left/right in landscape.
 * On a match, <html> gets `side-rail` and, at phone widths, the games' tab bars move into that strip
 * (globals.css, "Side rail").
 *
 * Inline at the top of <body> (layout.tsx) so the class is set before first paint, and again on every resize
 * (folding, unfolding and rotating all resize without reloading). It only adds and removes its own probe div.
 */
export const SIDE_RAIL_MIN_RIGHT = 56;

export const SIDE_RAIL_SCRIPT = `(function(){function c(){try{var d=document.createElement("div");d.style.cssText="position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)";document.body.appendChild(d);var s=getComputedStyle(d),l=parseFloat(s.paddingLeft)||0,r=parseFloat(s.paddingRight)||0;d.remove();document.documentElement.classList.toggle("side-rail",r>=${SIDE_RAIL_MIN_RIGHT}&&l<1)}catch(e){}}c();try{addEventListener("resize",c)}catch(e){}})();`;
