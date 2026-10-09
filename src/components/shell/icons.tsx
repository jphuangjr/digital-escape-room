import type { SVGProps } from "react";
import type { AppId } from "@/lib/types";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Broken-needle compass with 7 notches (the game's motif). */
export function CompassMark(props: P) {
  const notches = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x1: 12 + Math.cos(a) * 8.2, y1: 12 + Math.sin(a) * 8.2, x2: 12 + Math.cos(a) * 10.2, y2: 12 + Math.sin(a) * 10.2 };
  });
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <circle cx="12" cy="12" r="10.5" />
      {notches.map((n, i) => (
        <line key={i} {...n} />
      ))}
      <path d="M12 12 L14.6 5.2" />
      <path d="M11.4 13.4 L9.6 18" strokeDasharray="1.6 1.2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function BrowserIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </svg>
  );
}
export function NotesIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}
export function EmailIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
export function FilesIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
    </svg>
  );
}
export function DecoderIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
    </svg>
  );
}
export function LockIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}
export function PeopleIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.2c2.8.3 5 2.6 5 5.8" />
    </svg>
  );
}
export function CrownIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />
    </svg>
  );
}
export function CloseIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
export function BackIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
export function ForwardIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
export function ReloadIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M20 11a8 8 0 10-2.3 5.7M20 5v6h-6" />
    </svg>
  );
}
export function StarIcon({ filled, ...props }: P & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
    </svg>
  );
}
export function BookmarksIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}
export function CodeIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
    </svg>
  );
}
export function ShareIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7" />
    </svg>
  );
}
export function HomeIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M3 11l9-7 9 7M5 10v10h14V10" />
    </svg>
  );
}

export const APP_META: Record<AppId, { label: string; Icon: (p: P) => React.ReactElement }> = {
  browser: { label: "Browser", Icon: BrowserIcon },
  notes: { label: "Notes", Icon: NotesIcon },
  email: { label: "Email", Icon: EmailIcon },
  files: { label: "Files", Icon: FilesIcon },
  decoder: { label: "Decoder", Icon: DecoderIcon },
};

export const APP_ORDER: AppId[] = ["browser", "notes", "email", "files", "decoder"];
