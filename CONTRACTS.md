# Build contracts (shared by all contributors)

Types: `src/lib/types.ts` (source of truth). DB: `prisma/schema.prisma`. Spec: `SPEC.md`.

## Hard rules
- Answer key, hint text, endings text, site content live under `src/server/**` and are only imported by
  route handlers / server code. Client code (`src/components/**`, `src/app/r/**` client components, `src/lib/**`)
  must never import from `src/server/**`. `src/server/**` files start with `import "server-only";`.
- Mobile-first; no hover-dependent UI; tap targets >= 44px; respect safe-area insets.

## Identity
- Cookie `pt_<CODE>` (httpOnly, 30d) holds `Player.token` for that room. `getPlayer(code)` in `src/server/session.ts`.

## HTTP API (all JSON; all room routes require the cookie except create/join)
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | /api/rooms | `{displayName,color}` | `{code}` + sets cookie (creator is host) |
| POST | /api/rooms/[code]/join | `{displayName,color}` | `{code}` + sets cookie. 404 unknown/expired room |
| GET | /api/rooms/[code]/state | – | `RoomState` (401 if no player cookie) |
| POST | /api/rooms/[code]/presence | `{view: string}` | `{ok}` heartbeat; client sends every 15s and on view change |
| POST | /api/resolve | `{code,address}` | `ResolveResponse` (records visit) |
| POST | /api/rooms/[code]/attempt | `{puzzleId,input}` | `AttemptResponse`; 429 w/ `rateLimited` when >5/min/puzzle/room |
| POST | /api/rooms/[code]/notes | `{body,visibility,fragmentTag?}` | `NoteDTO` |
| PATCH | /api/rooms/[code]/notes/[id] | `{body?,visibility?,fragmentTag?}` | `NoteDTO` (author only; host may also edit nothing but delete) |
| DELETE | /api/rooms/[code]/notes/[id] | – | `{ok}` (author or host; host only for PUBLIC) |
| POST | /api/rooms/[code]/hints | `{puzzleId: HintPuzzleId}` | `HintDTO` or 429 `{cooldownUntil}` |
| POST | /api/rooms/[code]/vote | `{choice}` | `VoteState` |
| POST | /api/rooms/[code]/tiebreak | `{choice}` (host) | `EndingDTO` |
| POST | /api/rooms/[code]/decode | `{shift}` | `{blocks: Block[]}` lostpaws listings shifted by `shift` (server-side preview; any shift allowed) |

Addresses are normalized: lowercase, strip `http(s)://`, `www.`, trailing `/`.

## Realtime (Supabase Realtime broadcast)
- Channel `room:<CODE>`. Server publishes via `publish(code, event, payload)` from `src/server/realtime.ts`
  (uses Supabase REST broadcast with service role key; no-op if env missing).
- Events: `presence.updated`, `note.public.created|updated|deleted`, `progress.updated`, `attempt.logged`,
  `hint.unlocked`, `vote.updated`, `ending.resolved`, `room.closed`. Payloads are hints only — clients may simply
  refetch `GET /state` on any event (debounced). Private notes are NEVER published.
- Client: `useRoomChannel(code, onEvent)` in `src/lib/realtime/client.ts`; if Supabase env is missing it
  polls `/state` every 4s instead.

## Content API (server, `src/server/content/index.ts`)
```ts
resolveSite(address: string, progress: RoomProgress): SitePage | null   // null => unreachable
checkAnswer(puzzleId: PuzzleId, input: string): boolean
normalize(input: string): string
decodeListings(shift: number): Block[]
getHint(puzzleId: HintPuzzleId, tier: 1|2|3): string
baseEmails(): EmailDTO[]; voicemailsFor(progress: RoomProgress, hints: HintDTO[]): EmailDTO[]
endingText(ending: Ending): { title: string; body: string }
bonusEpilogue(): string
bonusFiles(): { name: string; body: string }[]   // returned via GET /api/rooms/[code]/files only if bonus-pin solved
HINT_PUZZLES: HintPuzzleId[]
```
Decoder: unlocked by solving `tools-folder` (requires `bonus-pin`), not by visiting a site.
Gating: `intranet.meridian-inst.net` subpages beyond login require `intranet-login` solved;
`switch.ada-voss.net` unreachable until `intranet-login` solved. lostpaws listings render ciphertext until
`shift-key` solved, then plaintext.

Extra route: GET /api/rooms/[code]/files -> `{locked: true}` or `{locked:false, files}`.

## Accounts (optional Google sign-in, next-auth v4, JWT sessions)
- Enabled only when `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` are set (plus `AUTH_SECRET`); otherwise fully anonymous.
- Hosting (`POST /api/rooms`) requires sign-in when enabled → 401 `{signInRequired:true}`. Joining stays optional.
- One open room per host: if the user already hosts non-expired rooms, `POST /api/rooms` → 409 `ReplaceRoomsRequired`
  listing them; resending with `replaceExisting: true` deletes them immediately (publishing `room.closed`) and creates
  the new room. CaseRecords are unaffected.
- `getPlayerInRoom` falls back from the `pt_<CODE>` cookie to the signed-in user's Player in that room
  (one per user per room) and re-issues the cookie, so a signed-in player is the same player on any device.
- Final phrase solved → `Room.finishedAt`; a `CaseRecord` (game, time, ending, host?) is written per signed-in
  player and survives room expiry. `GET /api/me` → `MeResponse` (user, open rooms, finished cases).

## Purchases (hosting rights) and admin
- Hosting a game requires owning it: `GamePurchase(userId, gameId)` (permanent; `source` "code" now, "stripe" later).
  Admins (emails in `ACCOUNT_ADMIN`, comma-separated) own every game. Joining is always free.
  `POST /api/rooms {gameId}` → 403 `{purchaseRequired:true}` when not owned.
- `POST /api/redeem {code}` → `PurchaseCode` (KEY-XXXX-XXXX-XXXX) → purchase. Each account can claim a code once
  (`CodeRedemption`). Single-use codes have `maxUses` 1; group codes allow more (null = unlimited) and may expire.
  Capacity is enforced with a conditional `UPDATE … WHERE useCount < maxUses`. If the user already owns the game,
  the code isn't consumed. Turned-off (`revokedAt`) or expired codes stop working; purchases already made stay.
- Admin page `/admin`; APIs `GET|POST /api/admin/codes` (`kind: single|group`), `DELETE /api/admin/codes/[id]` (turn off).
