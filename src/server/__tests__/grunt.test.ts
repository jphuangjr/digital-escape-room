import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { CARDS } from "@/lib/grunt/cards";
import { EMOJI, EMOJI_GROUPS, guessMatches, normalizeGuess, type GruntAction } from "@/lib/grunt/types";
import type { PartyCtx } from "../party/registry";
import {
  BONK_COOLDOWN_MS,
  READY_MS,
  RECAP_MS,
  advanceState,
  applyAction,
  botMove,
  initialState,
  parseAction,
  teamOf,
  viewFor,
  winnerOf,
  type GruntState,
} from "../grunt/game";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
const seq = () => {
  let i = 7;
  return (n: number) => (i = (i * 31 + 11) % 997) % n;
};
const ctx = (playerId: string, now: number, room = ids(4)): PartyCtx => ({ playerId, hostId: "p1", roomPlayerIds: room, now, rand: seq() });

function must(s: GruntState, who: string, a: GruntAction, now = 1000, room = ids(4)): GruntState {
  const r = applyAction(s, a, ctx(who, now, room));
  if (!r.ok) throw new Error(r.error);
  return r.state;
}
const refused = (s: GruntState, who: string, a: GruntAction, now = 1000) => applyAction(s, a, ctx(who, now)).ok === false;

function started(n = 4, settings = {}): GruntState {
  let s = initialState();
  if (Object.keys(settings).length) s = must(s, "p1", { type: "settings", settings }, 1000, ids(n));
  return must(s, "p1", { type: "start" }, 1000, ids(n));
}
/** Start the first turn's clock. */
function clueing(n = 4, settings = {}): GruntState {
  const s = started(n, settings);
  return must(s, s.giver!, { type: "begin" }, 1000, ids(n));
}
const teammate = (s: GruntState) => s.teams[s.clueTeam!].find((id) => id !== s.giver)!;
const opponent = (s: GruntState) => s.teams[s.clueTeam === 0 ? 1 : 0][0];

describe("Grunt setup", () => {
  it("needs four players, then deals two balanced teams and plays every player's turn", () => {
    expect(applyAction(initialState(), { type: "start" }, ctx("p1", 1000, ids(3))).ok).toBe(false);
    const s = started(7);
    expect(s.teams[0].length + s.teams[1].length).toBe(7);
    expect(Math.abs(s.teams[0].length - s.teams[1].length)).toBeLessThanOrEqual(1);
    expect(new Set([...s.teams[0], ...s.teams[1]]).size).toBe(7);
    expect(s.totalTurns).toBe(8); // the bigger team has 4: 4 turns each
    expect(s.phase).toBe("ready");
    expect(s.clueTeam).toBe(0);
    expect(s.teams[0]).toContain(s.giver);
  });

  it("counts each player's turns from the rounds setting", () => {
    expect(started(4, { rounds: 2 }).totalTurns).toBe(8);
  });

  it("only the host starts and changes settings, and only between games", () => {
    expect(refused(initialState(), "p2", { type: "start" })).toBe(true);
    expect(refused(started(), "p1", { type: "settings", settings: { rounds: 3 } })).toBe(true);
  });

  it("the keyboard has no letters or numbers to spell with", () => {
    expect(EMOJI.length).toBe(EMOJI_GROUPS.reduce((n, g) => n + g.emoji.length, 0));
    for (const e of EMOJI) expect(e).not.toMatch(/[A-Za-z0-9]/);
    expect(new Set(EMOJI).size).toBe(EMOJI.length);
  });

  it("every card has a word and a different, longer phrase", () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(150);
    for (const c of CARDS) {
      expect(c.word.trim()).toBeTruthy();
      expect(normalizeGuess(c.phrase)).not.toBe(normalizeGuess(c.word));
    }
  });
});

describe("a turn", () => {
  it("the clue-giver starts the clock, or it starts by itself", () => {
    const s = started();
    const bystander = [...s.teams[0], ...s.teams[1]].find((id) => id !== s.giver && id !== "p1")!;
    expect(refused(s, bystander, { type: "begin" })).toBe(true);
    const auto = advanceState(s, 1000 + READY_MS).state;
    expect(auto.phase).toBe("clue");
    expect(auto.current).not.toBeNull();
  });

  it("only the clue-giver builds the clue, from the keyboard", () => {
    let s = clueing();
    expect(refused(s, teammate(s), { type: "emoji", emoji: 0 })).toBe(true);
    expect(refused(s, s.giver!, { type: "emoji", emoji: EMOJI.length })).toBe(true);
    s = must(s, s.giver!, { type: "emoji", emoji: 3 });
    s = must(s, s.giver!, { type: "emoji", emoji: 5 });
    s = must(s, s.giver!, { type: "undo" });
    expect(s.current!.clue).toEqual([3]);
    s = must(s, s.giver!, { type: "clear" });
    expect(s.current!.clue).toEqual([]);
  });

  it("scores 1 for the word, 3 more for the phrase, then deals a new card", () => {
    let s = clueing();
    const first = s.current!.card;
    s = must(s, s.giver!, { type: "got", points: 1 });
    expect(refused(s, s.giver!, { type: "got", points: 1 })).toBe(true);
    s = must(s, s.giver!, { type: "got", points: 3 });
    expect(s.current!.card).not.toBe(first);
    expect(viewFor(s, s.giver!, { hostId: "p1" }).turnPoints).toBe(4);
  });

  it("guessing the phrase outright counts the word too; pass and next deal a new card", () => {
    let s = clueing();
    s = must(s, s.giver!, { type: "got", points: 3 });
    expect(viewFor(s, s.giver!, { hostId: "p1" }).turnPoints).toBe(4);
    expect(refused(s, s.giver!, { type: "next" })).toBe(true); // word not yet on this new card
    const before = s.current!.card;
    s = must(s, s.giver!, { type: "pass" });
    expect(s.current!.card).not.toBe(before);
  });

  it("typed guesses from the clue team score by themselves; others can't guess", () => {
    let s = clueing();
    const card = CARDS[s.current!.card];
    expect(refused(s, opponent(s), { type: "guess", text: card.word })).toBe(true);
    expect(refused(s, s.giver!, { type: "guess", text: card.word })).toBe(true);
    s = must(s, teammate(s), { type: "guess", text: "definitely not it" });
    s = must(s, teammate(s), { type: "guess", text: `  THE ${card.word.toUpperCase()}! ` });
    expect(s.guesses.map((g) => g.hit)).toEqual([null, "word"]);
    expect(s.current!.word1).toBe(true);
    s = must(s, teammate(s), { type: "guess", text: card.phrase.toLowerCase() });
    expect(s.guesses.at(-1)!.hit).toBe("phrase");
    expect(s.done.at(-1)!.phrase3).toBe(true);
  });

  it("the other team bonks: a point off, with a cooldown, and only when bonks are on", () => {
    let s = clueing();
    expect(refused(s, teammate(s), { type: "bonk" })).toBe(true);
    s = must(s, opponent(s), { type: "bonk" }, 2000);
    expect(refused(s, opponent(s), { type: "bonk" }, 2000 + BONK_COOLDOWN_MS - 1)).toBe(true);
    s = must(s, opponent(s), { type: "bonk" }, 2000 + BONK_COOLDOWN_MS);
    expect(s.bonks).toBe(2);
    expect(viewFor(s, s.giver!, { hostId: "p1" }).turnPoints).toBe(-2);
    const off = clueing(4, { bonk: false });
    expect(refused(off, opponent(off), { type: "bonk" })).toBe(true);
  });

  it("the time running out banks the turn into the team's score, recaps it, then passes to the other team", () => {
    let s = clueing();
    const team = s.clueTeam!;
    const giver = s.giver!;
    s = must(s, giver, { type: "emoji", emoji: 1 });
    s = must(s, giver, { type: "got", points: 3 });
    s = must(s, opponent(s), { type: "bonk" }, 1500);
    s = advanceState(s, 1000 + 60_000).state;
    expect(s.phase).toBe("recap");
    expect(s.scores[team]).toBe(3);
    expect(s.history.at(-1)).toMatchObject({ team, giver, points: 3, bonks: 1 });
    expect(s.history.at(-1)!.cards[0]).toMatchObject({ word1: true, phrase3: true, clue: EMOJI[1] });
    s = advanceState(s, 1000 + 60_000 + RECAP_MS).state;
    expect(s.phase).toBe("ready");
    expect(s.clueTeam).toBe(team === 0 ? 1 : 0);
  });

  it("each team's players take turns giving clues, and the game ends after the last turn", () => {
    let s = started(4);
    const givers: string[] = [];
    let now = 1000;
    while (s.phase !== "over") {
      givers.push(s.giver!);
      now += READY_MS;
      s = advanceState(s, now).state; // clock starts
      now += 60_000;
      s = advanceState(s, now).state; // turn ends
      now += RECAP_MS;
      s = advanceState(s, now).state; // next turn
    }
    expect(givers).toHaveLength(4);
    expect(new Set(givers).size).toBe(4);
    expect(givers.map((g) => teamOf(s, g))).toEqual([0, 1, 0, 1]);
    expect(winnerOf(s)).toBeNull(); // nobody scored: a tie
  });
});

describe("secrecy", () => {
  it("the guessing team never sees the card; the clue-giver and the other team do; everyone sees the clue", () => {
    let s = clueing();
    s = must(s, s.giver!, { type: "emoji", emoji: 2 });
    const word = CARDS[s.current!.card].word;
    expect(viewFor(s, s.giver!, { hostId: "p1" }).card?.word).toBe(word);
    expect(viewFor(s, opponent(s), { hostId: "p1" }).card?.word).toBe(word);
    const mate = viewFor(s, teammate(s), { hostId: "p1" });
    expect(mate.card).toBeNull();
    expect(mate.clue).toEqual([EMOJI[2]]);
    expect(JSON.stringify(mate)).not.toContain(`"${CARDS[s.current!.card].phrase}"`);
  });
});

describe("players", () => {
  it("a late arrival joins the smaller team", () => {
    let s = started(5);
    const small = s.teams[0].length <= s.teams[1].length ? 0 : 1;
    s = must(s, "p9", { type: "join" }, 1000, ids(9));
    expect(s.teams[small]).toContain("p9");
  });
});

describe("guesses", () => {
  it("match loosely: case, punctuation, articles and plurals don't matter", () => {
    expect(guessMatches("Hot-Dogs!", "Hot dog")).toBe(true);
    expect(guessMatches("the snowman", "Snowman")).toBe(true);
    expect(guessMatches("  RAINING cats & dogs ", "Raining cats and dogs")).toBe(false); // "&" is not "and"
    expect(guessMatches("glass", "Glasses")).toBe(false);
    expect(guessMatches("", "Dog")).toBe(false);
  });
});

describe("actions and bots", () => {
  it("parses only well-formed actions", () => {
    expect(parseAction({ type: "got", points: 2 })).toBeNull();
    expect(parseAction({ type: "emoji", emoji: "3" })).toBeNull();
    expect(parseAction({ type: "guess", text: "dog" })).toEqual({ type: "guess", text: "dog" });
  });

  it("a bot clue-giver starts, taps a few emoji, then passes", () => {
    let s = started();
    const bot = s.giver!;
    expect(botMove(s, bot, seq())).toEqual({ type: "begin" });
    s = must(s, bot, { type: "begin" });
    expect(botMove(s, bot, seq())?.type).toBe("emoji");
    expect(botMove(s, opponent(s), seq())).toBeNull();
  });
});
