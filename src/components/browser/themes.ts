import type { CSSProperties } from "react";
import type { SiteTheme } from "@/lib/types";

export interface ThemeStyle {
  root: string;
  font: CSSProperties;
  container: string;
  h1: string;
  h2: string;
  h3: string;
  p: string;
  link: string;
  muted: string;
  card: string;
  accent: string;
  button: string;
  buttonGhost: string;
  input: string;
  mono: string;
  footer: string;
  frame: string;
  dark: boolean;
}

const SERIF: CSSProperties = { fontFamily: 'Georgia, "Times New Roman", Times, serif' };
const SANS: CSSProperties = { fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' };
const MONO: CSSProperties = { fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Courier New", monospace' };
const CORP: CSSProperties = { fontFamily: 'Tahoma, Verdana, Arial, sans-serif' };
const ROUND: CSSProperties = { fontFamily: '"Trebuchet MS", "Avenir Next", ui-rounded, system-ui, sans-serif' };

export const THEMES: Record<SiteTheme, ThemeStyle> = {
  meridian: {
    root: "bg-[#f4efe2] text-[#2b2620]",
    font: SERIF,
    container: "max-w-3xl",
    h1: "text-3xl font-normal tracking-wide text-[#1f2a44] border-b-2 border-double border-[#1f2a44]/40 pb-2",
    h2: "text-2xl font-normal text-[#1f2a44] mt-2",
    h3: "text-lg font-semibold italic text-[#1f2a44]",
    p: "leading-relaxed",
    link: "text-[#6b1f1f] underline decoration-1 underline-offset-2",
    muted: "text-[#6d6353]",
    card: "border border-[#d8cfb8] bg-[#fffdf6] p-4",
    accent: "text-[#1f2a44]",
    button: "bg-[#1f2a44] text-[#f4efe2] border border-[#1f2a44]",
    buttonGhost: "border border-[#1f2a44]/50 text-[#1f2a44]",
    input: "border border-[#b8ad92] bg-white text-[#2b2620]",
    mono: "",
    footer: "border-t border-[#d8cfb8] text-[#6d6353] text-xs text-center",
    frame: "border-4 border-double border-[#b8ad92] bg-[#e9e1cc]",
    dark: false,
  },
  drift: {
    root: "bg-white text-[#222]",
    font: SANS,
    container: "max-w-xl",
    h1: "text-3xl font-light tracking-tight",
    h2: "text-xl font-medium tracking-tight",
    h3: "text-base font-semibold uppercase tracking-[0.2em] text-[#888]",
    p: "leading-loose text-[#333]",
    link: "text-[#111] underline decoration-[#ccc] underline-offset-4",
    muted: "text-[#999]",
    card: "border-b border-[#eee] py-5",
    accent: "text-[#e2683c]",
    button: "bg-[#111] text-white",
    buttonGhost: "border border-[#ddd] text-[#111]",
    input: "border border-[#ddd] bg-white text-[#111]",
    mono: "",
    footer: "text-[#aaa] text-xs text-center",
    frame: "bg-[#f5f5f3]",
    dark: false,
  },
  runnerboard: {
    root: "bg-[#05052b] text-[#9dffcf] [image-rendering:pixelated]",
    font: MONO,
    container: "max-w-3xl",
    h1: "text-2xl font-bold uppercase text-[#ff4df0] [text-shadow:0_0_8px_#ff4df0] tracking-widest",
    h2: "text-xl font-bold text-[#ffe94d] [text-shadow:0_0_6px_#ffe94d]",
    h3: "text-base font-bold text-[#4df4ff]",
    p: "leading-relaxed",
    link: "text-[#ffe94d] underline",
    muted: "text-[#6f8fb0]",
    card: "border-2 border-[#4df4ff] bg-[#0a0a4a] p-3 shadow-[4px_4px_0_#ff4df0]",
    accent: "text-[#ff4df0]",
    button: "bg-[#ff4df0] text-black border-2 border-white",
    buttonGhost: "border-2 border-[#4df4ff] text-[#4df4ff]",
    input: "border-2 border-[#4df4ff] bg-black text-[#9dffcf]",
    mono: "",
    footer: "border-t-2 border-dashed border-[#4df4ff] text-[#6f8fb0] text-xs text-center",
    frame: "border-2 border-[#4df4ff] bg-black",
    dark: true,
  },
  lostpaws: {
    root: "bg-[#fff6e6] text-[#3a2f25]",
    font: ROUND,
    container: "max-w-2xl",
    h1: "text-3xl font-extrabold text-[#d9622b]",
    h2: "text-2xl font-bold text-[#d9622b]",
    h3: "text-lg font-bold text-[#7a4b2a]",
    p: "leading-relaxed",
    link: "text-[#1f6fa8] underline underline-offset-2",
    muted: "text-[#8f7a66]",
    card: "rounded-2xl bg-white p-4 shadow-md shadow-[#d9622b]/10 border border-[#f2dcc0]",
    accent: "text-[#d9622b]",
    button: "rounded-full bg-[#d9622b] text-white",
    buttonGhost: "rounded-full border-2 border-[#d9622b] text-[#d9622b]",
    input: "rounded-xl border-2 border-[#f2dcc0] bg-white text-[#3a2f25]",
    mono: "",
    footer: "text-[#8f7a66] text-xs text-center",
    frame: "rounded-2xl bg-[#ffe9c7]",
    dark: false,
  },
  intranet: {
    root: "bg-[#e6e8eb] text-[#222]",
    font: CORP,
    container: "max-w-3xl",
    h1: "text-xl font-bold text-white bg-[#3d4a5c] -mx-4 px-4 py-2",
    h2: "text-lg font-bold text-[#3d4a5c] border-b border-[#b9bfc7] pb-1",
    h3: "text-sm font-bold uppercase text-[#55606e]",
    p: "text-sm leading-relaxed",
    link: "text-[#1a4f8b] underline",
    muted: "text-[#6b7480]",
    card: "border border-[#c4c8cc] bg-white p-3",
    accent: "text-[#1a4f8b]",
    button: "bg-[#3d4a5c] text-white border border-[#2a3442]",
    buttonGhost: "border border-[#8892a0] bg-[#f4f5f7] text-[#222]",
    input: "border border-[#8892a0] bg-white text-[#222]",
    mono: "",
    footer: "border-t border-[#c4c8cc] text-[#6b7480] text-xs",
    frame: "border border-[#c4c8cc] bg-[#f4f5f7]",
    dark: false,
  },
  switch: {
    root: "bg-black text-[#33ff66]",
    font: MONO,
    container: "max-w-2xl",
    h1: "text-2xl font-bold [text-shadow:0_0_10px_#33ff66]",
    h2: "text-xl font-bold",
    h3: "text-base font-bold text-[#7cff9b]",
    p: "leading-relaxed",
    link: "text-[#7cff9b] underline",
    muted: "text-[#1f9f45]",
    card: "border border-[#1a7f37] p-3",
    accent: "text-[#b6ffc8]",
    button: "border border-[#33ff66] bg-[#33ff66] text-black",
    buttonGhost: "border border-[#33ff66] text-[#33ff66]",
    input: "border border-[#33ff66] bg-black text-[#33ff66] caret-[#33ff66]",
    mono: "",
    footer: "border-t border-[#1a7f37] text-[#1f9f45] text-xs",
    frame: "border border-[#1a7f37] bg-[#031a08]",
    dark: true,
  },
  harbourcc: {
    root: "bg-[#f3f6fa] text-[#1d2733]",
    font: SANS,
    container: "max-w-2xl",
    h1: "text-3xl font-bold text-[#0b4f6c]",
    h2: "text-xl font-semibold text-[#0b4f6c] border-b border-[#cfdbe6] pb-1",
    h3: "text-base font-semibold text-[#2a6f8f]",
    p: "leading-relaxed",
    link: "text-[#c2410c] underline underline-offset-2",
    muted: "text-[#5b6b7a]",
    card: "rounded-lg border border-[#cfdbe6] bg-white p-4 shadow-sm",
    accent: "text-[#0b4f6c]",
    button: "rounded-md bg-[#0b4f6c] text-white",
    buttonGhost: "rounded-md border border-[#0b4f6c]/50 text-[#0b4f6c]",
    input: "rounded-md border border-[#9fb3c4] bg-white text-[#1d2733]",
    mono: "",
    footer: "border-t border-[#cfdbe6] text-[#5b6b7a] text-xs text-center",
    frame: "rounded-lg bg-[#e3ebf2]",
    dark: false,
  },
  honeypot: {
    root: "bg-[#120203] text-[#f2c4c4]",
    font: SERIF,
    container: "max-w-2xl",
    h1: "text-3xl font-bold uppercase tracking-[0.3em] text-[#ff2a2a] [text-shadow:0_0_14px_#a00]",
    h2: "text-xl font-bold text-[#ff4d4d]",
    h3: "text-base font-semibold text-[#ff8080]",
    p: "leading-relaxed",
    link: "text-[#ff5555] underline",
    muted: "text-[#9a5a5a]",
    card: "border border-[#7a0000] bg-[#1d0406] p-4",
    accent: "text-[#ff2a2a]",
    button: "bg-[#a00] text-white border border-[#ff2a2a]",
    buttonGhost: "border border-[#7a0000] text-[#ff8080]",
    input: "border border-[#7a0000] bg-black text-[#f2c4c4]",
    mono: "",
    footer: "border-t border-[#7a0000] text-[#9a5a5a] text-xs text-center",
    frame: "border border-[#7a0000] bg-black",
    dark: true,
  },
};
