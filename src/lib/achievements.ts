// Achievements shown on a player's profile. Earned from their case records; the rules live in
// src/server/profile.ts, the words in the "profile.ach.<id>" messages.

export interface AchievementDef {
  id: string;
  icon: string;
  /** Game-specific achievements are shown only once that game is live or the player has played it. */
  gameId: string | null;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-case", icon: "🗝️", gameId: null },
  { id: "five-cases", icon: "📚", gameId: null },
  { id: "host", icon: "🎩", gameId: null },
  { id: "crew", icon: "👥", gameId: null },
  { id: "solo", icon: "🕯️", gameId: null },
  { id: "no-hints", icon: "🧠", gameId: null },
  { id: "flawless", icon: "🎯", gameId: null },
  { id: "under-hour", icon: "⏱️", gameId: null },
  { id: "top-ten", icon: "🏆", gameId: null },
  { id: "all-games", icon: "🌍", gameId: null },
  { id: "ada-both-endings", icon: "⚖️", gameId: "ada-voss" },
  { id: "ada-compass", icon: "🧭", gameId: "ada-voss" },
  { id: "ada-envelope", icon: "✉️", gameId: "ada-voss" },
  { id: "nx-thief", icon: "💎", gameId: "nightingale-express" },
  { id: "nx-every-clue", icon: "🔍", gameId: "nightingale-express" },
  { id: "atlas-escaped", icon: "🔭", gameId: "atlas-silent-worlds" },
  { id: "atlas-secrets", icon: "🗺️", gameId: "atlas-silent-worlds" },
  { id: "atlas-reroute", icon: "🌀", gameId: "atlas-silent-worlds" },
  { id: "atlas-every-ending", icon: "🌒", gameId: "atlas-silent-worlds" },
];
