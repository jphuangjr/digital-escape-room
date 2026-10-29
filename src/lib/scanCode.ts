/**
 * The room code in a scanned QR code: an invite link (`https://…/r/ADA-7K2Q`, or the old `/?join=ADA-7K2Q`) or a bare
 * code. Null for anything else, so a stray QR code (a menu, a Wi-Fi sticker) never navigates anywhere: only the code
 * is used, never the scanned URL itself.
 */
export function roomCodeFromScan(text: string): string | null {
  const raw = text.trim();
  const code = (s: string | null | undefined) => {
    const m = s?.toUpperCase().match(/^([A-Z]+)-([A-Z0-9]{4})$/);
    return m ? `${m[1]}-${m[2]}` : null;
  };
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const path = url.pathname.match(/^\/r\/([^/]+)\/?$/);
    return code(path ? decodeURIComponent(path[1]) : url.searchParams.get("join"));
  } catch {
    return code(raw);
  }
}
