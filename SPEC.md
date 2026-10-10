# The Vanishing of Dr. Ada Voss: Build Spec

A multiplayer, mobile-first online escape room. Players join a shared room, sit at Ada Voss's in-game laptop, and browse a fake internet (six in-game sites) to solve a chain of clues. The room votes on the ending.

> Spoiler warning: Section 8 is the answer key. It must live server-side only (`src/server/**`).

## 1. Story
Dr. Ada Voss, archivist at the fictional Meridian Institute, vanished 48 hours ago. The player is a freelance investigator hired by her estranged sister. Ada's last message: "If you're reading this, I got too close. Start at the beginning."
Twist: Ada is alive. She found the Institute was quietly rewriting historical records and hid inside the network on purpose. The final puzzle proves she's alive, and the room votes whether to EXPOSE the Institute or PROTECT Ada.
Tone: noir. Motif: a compass with a broken needle (7 notches) appears on every site.

## 2. Constraints
- Mobile-first. No reliance on view-source, EXIF tools, hover, URL editing, or text selection. The game supplies in-game tools.
- One app, one URL. The six sites are rendered inside a fake browser.
- Multiplayer rooms with private notes and shared public notes.
- Answer key never reaches the client. All validation server-side.
- Anonymous play: display name, avatar color, player token cookie.
- Stack: Next.js App Router + TS, Postgres + Prisma, Supabase Realtime (behind a swappable interface), Tailwind.
- Rooms expire after 48 hours of inactivity. Analytics: record which puzzles stall players.

## 4. Fake browser
- Address bar, back/forward, bookmarks, single page. Typing an address calls /api/resolve. Unknown: "This site can't be reached."
- View Source button on every page shows prettified source with hidden comments.
- File Info button on every image shows in-game metadata panel.
- Tap-to-reveal for hidden/redacted text. No hover UI.

## 5. Rooms
- Host creates room, code like `ADA-7K2Q`. Others join via code or invite link `/r/ADA-7K2Q` with name + color.
- Late joiners see full progress + public notes. Rejoin via token cookie.
- Shared: unlocked apps, visited sites, solved puzzles, attempt log, public notes, hints, vote. Private: private notes (server-stored, never broadcast).
- Notes app: tabs Mine / Room. Fragment tags (name/year/ID/cipher key/address). New notes default private with one-tap "Share to room". Public notes show author name, color, timestamp. Only author or host can delete.
- Presence: who's online and which site/app each is viewing.
- Attempts: anyone can submit; every attempt appears in shared attempt log. Rate limit 5/min/room/puzzle.

## 6. Desktop apps
| App | Purpose | Unlock |
|---|---|---|
| Browser | Fake internet | Start |
| Notes | Private + public notes | Start |
| Email | Sister's engagement email, Ada's voicemail hints | Start |
| Files | "Ada's Personal" bonus folder (PIN-locked) | Start |
| Decoder | Caesar shift and A1Z26 tools; Binary tab after the CS 110 quiz (see §9a) | Solving the "Ada's Tools" folder in Files (see §9) |
Mobile: each app full-screen with bottom dock. Desktop: draggable windows optional.

## 7. Puzzle graph
Site 1 (Meridian) → Branch A: Site 2 (blog) → cipher shift key; Branch B: Site 3 (forum) → pets address + pet name.
Site 4 (lost pets) needs both → pet ID → Site 5 (intranet) → admin console (binary password; §9a) → Site 6 (dead man's switch) → room vote → ending.

## 8. Answer key (SERVER ONLY)
Fragments: A = `wren`, B = `1987`, C = `0412`. Final phrase `wren-1987-0412`.

Site 1 Meridian Institute (`meridian-inst.net`): Staff directory ~12 staff. Wren Okafor has no photo; her bio mentions a high score on retro game Circuit Runner '94 (lead to Site 3). Fragment A. About page: "Founded 1987." Footer "© since 1978." digits swapped; true year 1987 (fragment B). View Source comment: `<!-- archive migration complete: see /vault-2019 -->`. `/vault-2019`: a photo whose File Info comment reads `draft uploaded to thedrift.blog`.

Site 2 "The Drift" (`thedrift.blog`) [Branch A]: Real series: 5 posts, first letters of titles spell DRIFT. Post dates day-of-month 2,1,1,2,1 sum to 7. Shift key = 7 (compass's 7 notches echo it). Decoy series "Ada's Kitchen": recipe measurements sum to 11; shift 11 decodes Site 4 to gibberish.

Site 3 RunnerBoard (`runnerboard.net`) [Branch B]: Real user `compass_needle`: 4 posts with timestamps HH:MM decoded with A1Z26 spell LOSTPAWS: 12:15 LO, 19:20 ST, 16:01 PA, 23:19 WS → `lostpaws.net`. A post mentions "has anyone seen Biscuit?". Decoy user `needle_compass`: 20:18, 01:16, 04:15, 15:18 → TRAPDOOR; `trapdoor.net` is an Institute honeypot telling players they've been misled, nudging back.

Site 4 Lost Paws (`lostpaws.net`): Listing descriptions are Caesar shift 7. Decoded message: "WREN HAS THE KEY. VAULT CODE IS THE YEAR THEY LIED." Generate ciphertext from plaintext with a utility; don't hand-encode. Biscuit (tabby) listing shows pet ID 0412 (fragment C).

Site 5 Intranet (`intranet.meridian-inst.net`): login username `wren.okafor`, password `19870412`. Contains record-diff evidence (before/after historical entries). The dashboard pins a Systems notice from W. Okafor with the admin password in 5-bit binary. `/admin` (Systems Admin console) asks for that password (`lantern`, shown as `01100 00001 01110 10100 00101 10010 01110`) and holds the badge log and the redacted memo; tap-to-reveal discloses address of Site 6. Site 6 and the final phrase require the admin console.

Site 6 Dead man's switch (`switch.ada-voss.net`): cosmetic countdown, input `wren-1987-0412`. Success proves Ada is alive and opens room vote.

Normalization: trim, lowercase, collapse whitespace, treat `_`/`-`/space as equivalent separators in final phrase.

## 9. Opening puzzle: Ada's Personal → Ada's Tools → Decoder
Files → "Ada's Personal" PIN = 0314, found in Email: sister's engagement email mentions Ada's birthday March 14. Contents: voicemail transcripts, lore about sister, Wren, Institute; reward: epilogue + compass badge.
Files → Ada's Personal → "Ada's Tools" (a subfolder, only visible once Ada's Personal is open) asks "Who was Dad's weather?" Answer `mara` (notes_on_mara.txt in Ada's Personal: "Dad called her his weather"). Requires Ada's Personal solved first. Solving it unlocks the Decoder for the room, so players have the A1Z26 tool before RunnerBoard.

## 9a. Binary: Wren's night class
Ada's Tools also holds `cs110_syllabus.txt` (Harbour Community College, CS 110, instructor W. Okafor). Week 3 points to `harbourcc.edu/cs110/binary`: a lesson on 5-bit place values (16 8 4 2 1, A = 1), a tap-the-switches demo, a 26-row decoding sheet and a practice quiz (`01000 00101 01100 01100 01111` = `hello`). Passing the quiz (puzzle `binary-lesson`) adds the `binary` badge, which installs a Binary tab in the Decoder for the whole room. The dashboard's View Source also links the class site, so players who skipped the syllabus can still find it.

## 10. Hints
Ada's voicemails arrive in shared Email app. 3 tiers per puzzle (nudge, bigger nudge, near-answer). Any player requests next tier; unlocks for whole room. Cooldown 2 min per puzzle between tiers.

## 11. Vote
1. Solving Site 6 sets status `voting`. 2. Each connected player votes EXPOSE/PROTECT, visible live, changeable until close. 3. Closes when all connected players voted or after 3 minutes. 4. Majority wins; ties broken by host. 5. Show winning ending + vote summary.
EXPOSE: evidence leaks; Institute falls; Ada stays in hiding a little longer, but truth is out.
PROTECT: records stay sealed; Ada is safe and disappears for good; sister gets a final message.

## 12. Mobile UX
Full-screen apps, bottom dock, 44px targets, no horizontal scroll (wide content scrolls in own container), address bar works with on-screen keyboard + paste, decoder thumb-friendly (stepper, tap letters), safe-area insets.
