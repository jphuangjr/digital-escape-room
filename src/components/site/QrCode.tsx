"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * A scannable QR code for `url`. Always dark-on-white with a quiet zone, whatever the page theme:
 * phone cameras struggle with inverted or low-contrast codes.
 */
export function QrCode({ url, size = 200, label }: { url: string; size?: number; label: string }) {
  return (
    <div className="inline-block rounded-xl bg-white p-3">
      <QRCodeSVG value={url} size={size} level="M" marginSize={1} role="img" aria-label={label} />
    </div>
  );
}
