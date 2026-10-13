# The Atlas of Silent Worlds: Plan

Third game on the site. A condensed escape-room version of the longer "Atlas of Silent Worlds" brief: same
premise, same portal rule, cut down to about two hours of play.

> Spoiler warning: this file names puzzle solutions. The real answer key must live server-side only
> (`src/server/**`), like every other game.

## Directory listing
| Field | Value |
|---|---|
| id | `atlas-silent-worlds` |
| Title | The Atlas of Silent Worlds |
| Players | Solo or up to 8 |
| Duration | 90–120 min |
| Difficulty | Hard |
| Status | `staging` until playtested |

## Decisions
- Built on the **shared scene engine** extracted from The Nightingale Express (walls, hotspots, close-ups, shared
  inventory, jamming locks, tiered hints, room vote). Not a standalone engine, not a fork of the train code.
- The brief's localStorage saves, save/load buttons and one-script-per-room architecture are not needed: room state
  lives on the server and syncs to everyone.
- Ages: **Verdant Archive, Sunken Meridian, Pelagic Library**, plus the Observatory hub and the Null Cathedral.
- **Minimal art first.** Build the whole game with simple placeholder walls, then do a full art pass once the first
  version is playable end to end.
- Finale: a **three-way room vote** (Restore / Sever / Reroute), with Reroute as the hidden "perfect" ending.

## What was cut from the brief
| Brief | Escape-room version |
|---|---|
| 7 Ages, 10–18 rooms each | Observatory hub + 3 Ages + Null Cathedral: 6 locations |
| 4–7 major puzzles per Age | About 3 major puzzles per location, about 16 in total |
| Cartographer's Riddle ("a map") | Cut: guessable, not deducible |
| Chart Room as its own room | Folded into the Observatory desk |
| Map, save system, player journal | An "Atlas" page of places the team has reached (also fast travel), a Journal tab that collects documents automatically, server-side state |
| Two endings | Three endings, chosen by a room vote |

## The core: the Threshold rule
**D = (O + 2R + S) mod N**: destination = origin index + twice the outer ring + the inner ring, modulo the number of
node slots (N = 7, the seven symbols on the Observatory plate). The whole game is built around learning this rule.

- Ring positions are marked with Cartographer glyphs, not numbers. Players learn the glyph values in the Verdant Archive.
- A destination must be registered and powered. Failures say why: no power, unregistered, empty slot, jammed.
- Misrouting three times in a row shuts the gate for 60 seconds (the existing jam mechanic), so trying all 49
  settings costs about 16 minutes. The calculation is clearly faster.
- Routing is a pure function on the server, with the brief's tests: (O=2, R=1, S=3, N=7) → 0 and (2, 2, 3, 7) → 2.
  Negative values are handled safely.

## Structure and time budget (about 115 minutes)

### Act I: The Drowned Observatory (about 30 min, linear, teaches the basics)
- **Observatory** (4 walls): journal, telescope, the dead clock, the seven-symbol plate.
  - **Dead Clock:** set its hands from the journal sketch → brass token.
- **Waterworks** (2–3 walls): **Three Valves.** Constraints: intake opens before reservoir; reservoir closes
  before outflow opens; intake closes after reservoir. Wrong order floods the room and resets the valves. Right
  order lowers the water and reveals a gear.
- **Threshold Chamber** (2 walls):
  - **Engine Alignment:** fit the gear, then set a symbol lock using symbols from the clock, the map and the water
    wheel → power.
  - **First crossing:** the routing ledger lists ring settings for all three Ages in Cartographer glyphs. The page
    for node 6 is torn out.
- Optional, cut if over budget: "Do not trust the first door that opens." A cracked outer ring slips one notch until
  repaired, so the first crossing lands somewhere wrong.

### Act II: three Ages, any order (about 60 min; about 35 if the team splits up)
Each Age is one location with 4 walls and gives: a **Routing Seal**, **one piece of the Cathedral calculation**, and
a **Cartographer memory** (story, and evidence for the ending).

| Age | Puzzle style | Piece of the calculation |
|---|---|---|
| Verdant Archive | Number patterns: plant growth follows a spiral sequence; roots hide a drawer | **The numerals**: which glyph means 0–6 |
| Sunken Meridian | Light and shadow: turn mirrors, read shadow lengths, read mirrored inscriptions | **The rule**: the engineer's note that the outer ring counts twice |
| Pelagic Library | Pressure locks, water levels (reusing the Act I valve logic), contradictory registry records | **The destination**: which records are true, showing the Cathedral is node 6 |

- **Each Age's seal can be earned there alone**, so the team never deadlocks.
- Each Age also has one **optional secret** that needs something from another Age (e.g. the Verdant sun-lens that
  needs Meridian light). The three secrets unlock the third ending, like Nightingale's "every clue".
- Every Age's gate has a marked "home" setting back to the Observatory.

### Act III: The Null Cathedral (about 25 min)
1. **Register the node:** put the three seals into the Observatory's seven-symbol plate. Node 6 is registered but
   has no symbol on any map.
2. **Calculate the route:** origin 0, target 6, so (0 + 2R + S) mod 7 = 6. Several settings work, deliberately:
   any correct calculation succeeds. Sharp teams can infer the rule from the ledger before finding the note.
3. **The Atlas Core:** the three Cartographer memories contradict each other and together explain why the network
   was split up.
4. **Room vote:**
   - **Restore:** reconnect every Age.
   - **Sever:** keep them separated.
   - **Reroute:** connect each Age only to the Observatory, like a hub. Needs all three secrets plus a final Core
     puzzle.

## Architecture

### Shared scene engine (built first)
Extracted from The Nightingale Express with no change to how it plays:
- `src/lib/scene/types.ts`: game-agnostic DTOs (close-ups, actions, item cards, event log, hint notes, votes).
- `src/server/scene/`:
  - `store.ts`: row-locked read-modify-write of `Room.scene`.
  - `engine.ts`: pure helpers: the event log, jamming locks, hint tiers and cooldowns, vote tally/close/tie.
  - `registry.ts`: every scene game registered by game id: initial state, parse, DTO, apply action, ending info.
- `POST /api/rooms/[code]/scene` dispatches by `room.gameId` through the registry; `state.ts`, `cases.ts` and
  `profile.ts` ask the registry instead of checking for the train.

### Atlas content (server-only, `src/server/atlas/`)
- `world.ts`: locations, walls and hotspots **as data**: which text to show for which flags, actions with what
  they require and set, items to pick up. At about 3× Nightingale's size this should be data, not switch statements.
- `puzzles.ts`: hand-written handlers only where data can't express it: valve order, mirrors, the gate.
- `router.ts`: pure `route(O, R, S, N)` plus a traversal check returning why a crossing failed.
- `text/<locale>.ts`: all wording, English first.

**Secrets:** glyph values, the Cathedral index and every code stay on the server. The client sends dial positions
and gets back glyph art and where the gate went.

**Location:** each player's location is per device, as in Nightingale, and shown to teammates through presence.
Once anyone crosses into an Age it appears on the team's Atlas page and everyone can jump there.

**Hints, location-aware:** Nightingale hints the first unsolved puzzle in one fixed order, which breaks once the
team spreads across three Ages. Atlas hint requests carry the player's location and pick from that location's own
ordered list. The hint-giver is the journal's author, the last Cartographer, revealed in the Cathedral.

### Client (`src/components/atlas/`)
Reuses Nightingale's shell (generalised from `TrainShell` once Atlas is the second user). New pieces: the gate's
two-ring dial (no fine dragging, 44px tap targets), the Journal, the Atlas page.

## Act I as built (answer key)
Code: `src/server/atlas/` (`world.ts` is the data, `scene.ts` the rules, `router.ts` the gate). Placeholder art:
`src/components/atlas/walls.tsx`.

| Step | Where | Solution |
|---|---|---|
| Dead Clock | Observatory | Journal: hour hand on the Lantern, minute hand on the Key. Telescope: Lantern = ring of six, Key = three in a line. Star chart (a clock face): ring of six at IV, line of three at VII → `0435` (or `1635`). Decoys: ring of five (VIII), line of four (IX), two triangles of three. |
| Stair door | Observatory | Clock case holds the brass token → use it on the stair door. |
| Three Valves | Waterworks | Open intake, open reservoir, close reservoir, open outflow, close intake (closing intake before opening outflow also works). Any broken order floods and resets. |
| Engine | Chamber | Gear from the drained tunnel → engine. Plaque: hour, tide, sky = clock case ✶, wheel hub ≈, telescope lens ◈ → `✶≈◈`. |
| First crossing | Chamber | Ledger: Verdant ☉/≈, Meridian ✶/△, Pelagic ⌘/≈ (outer/inner). |

## The Verdant Archive as built (answer key)
Four walls: arrival (the gate home), growing beds, shelves, roots.

| Step | Solution |
|---|---|
| Index cabinet | The spiral creeper's record (each morning it grows as many new leaves as it had two mornings before) reads ☾ ◈ ◈ ≈ ☉ ✶ = 0 1 1 2 3 5, which is only consistent with those values. The doubling fern reads ◈ ≈ ⌘ = 1 2 4. The sign says the pots count from nothing to six, so △ = 6. Set the seven wheels in counting order: `☾◈≈☉⌘✶△`. Inside: the **numeral card** (the glyph values, kept for Act III) and a watering can. |
| The roots | A ladder of roots under seven pots (☉ ☾ ✶ ◈ △ ≈ ⌘). Follow each root down, crossing at every graft: only ☾ reaches the little door. Water it (three wrong pots in a row and the soil needs a minute to drain). Behind the door: the **Seal of the Leaf** and **Ilse Varro's letter** (the first Cartographer memory). |

The Verdant arrival wall also holds a **sun lens**: carry it to the Sunken Meridian for the optional secret.

## The Sunken Meridian as built (answer key)
Two places: the Meridian (arrival with the gate home, and the mirror plaza) and, once the sun door opens, the Sun
Temple (the great mirror, and the keeper's room).

| Step | Solution |
|---|---|
| Mirror plaza | Sunlight enters on row 0 from the west. Five tilting mirrors, two pillars, the sun door below column 3. Only one setting lands the beam on the door, and it uses every mirror: the two mirrors in column 1 and the one in column 3 lean `\`, the two in column 2 lean `/`. Lit, the sun door opens onto the Sun Temple. |
| Keeper's chest | The tablet forbids looking at the dial: read it from the great mirror, which shows the buried sundial reversed. The shadow seems to fall at 8, on a numeral that reads VI; really it falls at IV. Set `04` (decoys: 08, 06). Inside: the **engineer's note** (the rule: the Observatory gate is 0, the outer ring counts twice, the inner once, count round seven), the **Seal of the Sun** and **Corin Ashe's letter** (the second memory, contradicting Ilse's). |
| Engineer's note | Written backwards until the team holds the **hand mirror** from the temple altar. |
| Optional secret | Use the Verdant sun lens on the dark shaft by the plaza: the sunken vault lights up and holds **the first map** (the Ages joined only to the Observatory, a hint at the Reroute ending). |

## The Pelagic Library as built (answer key)
Two places: the Library (arrival with the gate home, and the airlock) and, once the airlock opens, the Drowned
Reading Room (the hall and the registry).

| Step | Solution |
|---|---|
| Pressure tanks | Tanks of 8, 5 and 3, starting 8/0/0; the airlock opens when the middle (pressure) tank holds exactly 4. Pours run until one tank is empty or the other full. Shortest: big→pressure, pressure→small, small→big, pressure→small, big→pressure, pressure→small (1/4/3). |
| Registrar's desk | Three registries disagree. Each also describes the hall; only Halloran's matches it (four statues, green lamps, gauge at twelve fathoms). Set its row, in order: `◈≈☉△` (Verdant, Meridian, Pelagic, struck). Inside: the **Seal of the Tide** and **E. Halloran's letter** (the third memory: he struck the Cathedral from the registry on purpose). The struck node, △, is the Cathedral's index: with the numeral card, 6. |
| Optional secret: the glass | The hall's glass wall is etched from the sea side. Use the Meridian's **hand mirror** on it (the mirror is kept): a drawer slides out with **the last tide chart**. |
| Optional secret: the seed | Fill a **flask of sea water** at the Library's arrival and pour it on the **dormant seed** in the Verdant beds: the **night bloom**. |

The three optional secrets are now the Meridian vault (needs the Verdant lens), the Library glass (needs the
Meridian hand mirror) and the Verdant seed (needs Library sea water).

## Act III as built (answer key)
| Step | Solution |
|---|---|
| The seven sockets | Back in the Observatory, seat each seal in its own Age's node socket (Halloran's registry): Leaf in ◈, Sun in ≈, Tide in ☉. Wrong sockets refuse the seal (three in a row and the plate needs a minute). All three seated restores the Cathedral's registration; the △ socket lights. |
| The route | From the Observatory gate (0), the Cathedral (△ = 6) needs 2R + S ≡ 6 (mod 7): e.g. outer ☉, inner ☾. Several settings work. |
| The Atlas Core | Corin Ashe's page on the lectern (he wrote the journal) sets out the choice. **Call the room to decide** opens the vote: Restore or Sever, plus Reroute if it has been unlocked. |
| Reroute (optional) | Needs all three secrets. Set each Age gate so it routes home to the Observatory (0) from its own number: Verdant (1) ☉/☾, Meridian (2) ≈/◈, Pelagic (3) ≈/☾ (other settings that come to 0 also work). |
| The vote | Everyone online votes; a clear majority wins, the host breaks a tie. Every ending counts as an escape on the leaderboard. Case badges: `atlas-secrets` (all three secrets), `atlas-reroute`. |

Act III's notes are only offered once they can be acted on (the plate after every Age's seal is found, the route
after the registration is restored).

Glyph values (taught in the Verdant Archive, server only): ☾ 0, ◈ 1, ≈ 2, ☉ 3, ⌘ 4, ✶ 5, △ 6. Nodes: 0 Observatory,
1 Verdant, 2 Meridian, 3 Pelagic, 4–5 empty, 6 Null Cathedral (registration revoked). From the Observatory
(origin 0) the Cathedral needs 2R + S ≡ 6 (mod 7), e.g. ☉/☾.

## Build order
1. Shared scene engine, with Nightingale ported onto it. **Done.**
2. Atlas added to `GAMES` as `staging`; router and tests; Act I playable with placeholder art. **Done.**
3. One PR per Age. Verdant Archive, Sunken Meridian and Pelagic Library **done**.
4. Null Cathedral, endings, leaderboard and case records. **Done.**
5. Art pass. **Done** (`src/components/atlas/art.tsx`: every wall drawn in SVG and reacting to the room's state; `items.tsx`: every item drawn).
6. Playtests, using the stuck-puzzle analytics to tune timing and hints. **Instrumented**: every scene action
   records story flags reached (with minutes from the room's start), lock guesses, hints and the ending; admins
   see the funnel, where unfinished rooms gave up, hint-heavy puzzles and lock accuracy under Admin → Playtest
   (`/api/admin/playtest?game=…`, `src/server/playtest.ts`). Tune from that once a few teams have played.
7. The five other languages, once the English text stops changing.
