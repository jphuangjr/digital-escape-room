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
Gating: `intranet.meridian-inst.com` subpages beyond login require `intranet-login` solved;
`switch.ada-voss.com` unreachable until `intranet-login` solved. lostpaws listings render ciphertext until
`shift-key` solved, then plaintext.

Extra route: GET /api/rooms/[code]/files -> `{locked: true}` or `{locked:false, files}`.

## Accounts (optional sign-in, next-auth v4, JWT sessions)
- Providers come from a registry in `src/server/auth.ts`: each is enabled only when its env vars are set (Google:
  `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET`; Apple: below), plus `AUTH_SECRET`. `enabledProviders` lists them; `authEnabled` is
  true when there's at least one, otherwise the app is fully anonymous (`googleEnabled` is a deprecated alias).
- Identity model: a `User` (purchases, redemptions, case records and players all hang off `User.id`) has one or more
  `AuthIdentity(provider, providerAccountId)` rows, unique per provider account, each with the provider's email and
  whether the provider verified it. The JWT carries only our `uid`. `User.googleSub` is legacy: still written for
  Google sign-ins during the rollout, read nowhere new, and dropped in a later migration.
- Sign-in (`resolveUser` in `src/server/identity.ts`, one transaction): (a) a known identity → its user (email,
  name and picture refreshed; empty names/pictures never overwrite stored ones; an unverified email never replaces
  a stored one); (b) otherwise, if the provider **verified** the email and **exactly one** user already has a
  verified identity with that email (case-insensitive), the new identity is linked to that user; (c) otherwise a new
  user. Unverified or ambiguous emails never link accounts. A Google user with `googleSub` but no identity row yet is
  matched by `googleSub`. Concurrent sign-ins creating the same identity: the loser re-reads the winner's row.
- `GET /api/me` → `MeResponse` adds `authProviders` (enabled provider ids) and `user.providers` (linked ones).
- **Email code** (provider `email`, next-auth Credentials): `POST /api/account/email-code {email}` emails a 6-digit
  code (Resend; enabled when `RESEND_API_KEY` + `EMAIL_FROM` are set). Same answer whether or not an account exists.
  Codes are stored hashed (keyed with `AUTH_SECRET`), live 10 min, allow 5 wrong tries, and only the newest one per
  address works; one code a minute and 5 an hour per address, 20 an hour per IP (429 `retryAfterSec`). A right code
  signs in through `resolveUser` as a **verified** `email` identity, so it links to an existing account with that
  email (rule b above) and is also the recovery path for a lost passkey.
- **Passkeys** (provider `passkey`, WebAuthn via `@simplewebauthn`, discoverable credentials): enabled when any
  account-creating provider is. A signed-in user adds one with `POST /api/account/passkeys/register-options` then
  `POST /api/account/passkeys {response}`; `GET /api/account/passkeys` lists them, `DELETE /api/account/passkeys/[id]`
  removes one. Sign-in: `POST /api/account/passkeys/login-options`, then next-auth `signIn("passkey", {response})`.
  Challenges are stored server-side (`AuthChallenge`, single use, 5 min); the relying party is the request's host
  (`AUTH_RP_ID` overrides), so a passkey works only on the domain it was made on. The signature counter is kept.
- **Apple** (provider `apple`): enabled by `AUTH_APPLE_ID` (Services ID), `AUTH_APPLE_TEAM_ID`, `AUTH_APPLE_KEY_ID`,
  `AUTH_APPLE_PRIVATE_KEY` (.p8). The client secret is an ES256 JWT minted from the key at startup (`src/server/apple.ts`);
  a key that won't load leaves Apple off and logs `[auth] apple sign-in is misconfigured`. Apple's callback is a
  cross-site `form_post`, so with Apple on, next-auth's callback-url/PKCE/state/nonce cookies are `SameSite=None;
  Secure` (session cookie stays Lax). Apple's verified email links like Google's; "Hide My Email" relay addresses
  won't match an existing account. No name or picture comes through, so the profile shows the email's local part
  (or nothing for a relay address). Setup checklist (Apple developer site + Vercel): `docs/APPLE_SIGN_IN.md`.
- Client: every "Sign in" button calls `openSignIn(callbackUrl)`; `SignInHost` (root layout) shows the enabled
  methods, or goes straight to Apple or Google when that's the only one.
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
  Admins (emails in `ACCOUNT_ADMIN`, comma-separated) own every game. Joining is always free. Only a **verified**
  email counts: `isAdmin` requires `User.emailVerified`, which `resolveUser` sets only from a verified identity, so
  nobody can claim an admin's address through a provider that doesn't verify emails.
  `POST /api/rooms {gameId}` → 403 `{purchaseRequired:true}` when not owned.
- `POST /api/redeem {code}` → `PurchaseCode` (KEY-XXXX-XXXX-XXXX) → purchase. Each account can claim a code once
  (`CodeRedemption`). Single-use codes have `maxUses` 1; group codes allow more (null = unlimited) and may expire.
  Capacity is enforced with a conditional `UPDATE … WHERE useCount < maxUses`. If the user already owns the game,
  the code isn't consumed. Turned-off (`revokedAt`) or expired codes stop working; purchases already made stay.
- Admin page `/admin`; APIs `GET|POST /api/admin/codes` (`kind: single|group`), `DELETE /api/admin/codes/[id]` (turn off).

## Case log (room-wide discoveries)
- `RoomProgress.discoveries` (JSON, capped at 200): a first visit to a site host (`kind: "site"`) and every puzzle
  solve (`kind: "puzzle"`), with who and when. Written inside `mutateProgress` by `/api/resolve` and the attempt route.
- Clients toast teammates' new discoveries (site toasts have an Open action), reload an open page whose content a
  solve changes (`PUZZLE_AFFECTS_HOSTS`), and list everything in the Room sheet's Case log tab.

## Scene games (physical rooms: The Nightingale Express, The Atlas of Silent Worlds)
- Shared engine: `src/lib/scene/types.ts` (client-safe DTO shapes) and `src/server/scene/` — `engine.ts` (pure
  helpers: case log, jamming locks, hint tiers/cooldowns, room vote), `store.ts` (row-locked `Room.scene` updates),
  `registry.ts` (the `SceneGame` interface), `games.ts` (every scene game by game id).
- `POST /api/rooms/[code]/scene` dispatches through `sceneGame(room.gameId)`; 400 if the room's game has none.
  `GET /state` includes `scene` for scene games; case badges and solved-ness come from the game too.
- To add one: implement `SceneGame` in `src/server/<game>/game.ts` (via `defineSceneGame`) and list it in
  `src/server/scene/games.ts`.
