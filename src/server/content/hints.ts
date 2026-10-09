import "server-only";
import type { HintPuzzleId } from "@/lib/types";

export const HINT_PUZZLES: HintPuzzleId[] = [
  "find-blog",
  "shift-key",
  "find-pets",
  "pet-id",
  "intranet-login",
  "final-phrase",
  "bonus-pin",
];

export const HINT_TITLES: Record<HintPuzzleId, string> = {
  "find-blog": "Where I wrote it down",
  "shift-key": "The dial",
  "find-pets": "The forum",
  "pet-id": "The cat",
  "intranet-login": "The door",
  "final-phrase": "Proof of life",
  "bonus-pin": "My folder",
};

/** Ada's voicemails. Tier 1 = nudge, 2 = bigger nudge, 3 = near-answer. */
const HINTS: Record<HintPuzzleId, [string, string, string]> = {
  "find-blog": [
    "It's me. If you're on the Institute's site, don't just read it — look underneath it. Every page has a skin and a skeleton. The skeleton never lies as well as the skin does.",
    "Me again. Open the source of the Institute's front page. Somebody on the migration team left a note to themselves about where the old archive went. Follow it.",
    "Okay. Go to meridian-inst.net/vault-2019. There's a photograph there that isn't theirs — it's mine. Open its file info. I left the address of my notebook in the comment.",
  ],
  "shift-key": [
    "The blog has two series. One is soup. Don't follow the soup. Follow the Field Notes, and read them the way time runs — oldest first.",
    "Read my Field Notes oldest to newest. Look at the first letter of each title. Then look at the dates — just the day of the month. Add them up. The compass has the same number of notches.",
    "The titles spell DRIFT. The days are two, one, one, two, one. That's seven. Seven notches on the compass, seven turns of the dial. Ignore the kitchen — eleven is a trap.",
  ],
  "find-pets": [
    "Wren still beats everyone on that arcade game. Her friends hang out on a forum about it. I hung out there too, under a name you'd recognise if you've seen the stair.",
    "On RunnerBoard there are two of us with almost the same name. One is me. One is them. Mine came first. Whoever I am, I only talk in my own posts — and I talk with the clock.",
    "Take compass_needle's post times — hours and minutes — and turn each number into a letter: one is A, twenty-six is Z. Twelve fifteen is L-O. Keep going. It spells a website. The other account spells a trap.",
  ],
  "pet-id": [
    "I asked about a cat on the forum. She's real, she's a friend's, and the board where she's listed knows her better than I do.",
    "Find Biscuit on Lost Paws. Every chipped animal has a registry number. Write hers down — it's one of the three things you'll need at the end.",
    "Biscuit the tabby. Her registry ID is the number on her listing. Four digits, starts with a zero. That's your third fragment.",
  ],
  "intranet-login": [
    "There's a staff portal. Wren let me use her account. The decoded listings tell you whose key it is and what the code is made of.",
    "Username is the standard staff format: first name, dot, last name, lowercase. The code is two numbers stuck together — the year they lied about, then the cat's number.",
    "Wren Okafor. The Institute says 1987 — that's the true year, the footer was the lie, they swapped the digits. Then add Biscuit's four digits. wren.okafor, then founding-year-then-ID, no spaces.",
  ],
  "final-phrase": [
    "The switch wants proof I'm alive. Only someone who walked my whole road could know it. Three pieces. You already have all of them.",
    "Name, year, number. The name who has the key. The year they lied. The number on the collar. Joined by dashes.",
    "Her first name, the true founding year, Biscuit's ID — lowercase, dashes between. Name-year-number. That's me, still breathing.",
  ],
  "bonus-pin": [
    "My personal folder is locked with something only family would think of. My sister talks about me more than I'd like.",
    "Read my sister's email again. She mentions a date that's mine and no one else's.",
    "My birthday. March fourteenth. Month then day, four digits, with the zero in front.",
  ],
};

export function getHint(puzzleId: HintPuzzleId, tier: 1 | 2 | 3): string {
  const set = HINTS[puzzleId];
  if (!set) return "";
  const t = Math.min(3, Math.max(1, Math.trunc(tier))) as 1 | 2 | 3;
  return set[t - 1];
}
