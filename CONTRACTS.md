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
- **Deleting an account**: `DELETE /api/account {confirm: true}` (signed in) → `deleteAccount` (`src/server/accountDeletion.ts`).
  Cascades remove identities, passkeys, purchases, redemptions, case records and blocks; pending email codes and
  passkey challenges go too. Players in open rooms keep their name and color but lose `userId` and `image`. Codes an
  admin made keep working (`createdById` → null); chat reports keep their copy without the account link. The client
  then signs out (the old JWT points at no user, so it already counts as signed out). Profile page → Delete account.
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

## Chat safety (`src/server/chatSafety.ts`)
- **Filter**: chat text is stored as typed and masked on the way out (`maskProfanity`: same word lists as the name
  filter, first letter + dots, with an allowlist for words like "therapist"). Display names are still refused by
  `isProfane`. Latin-script only for now.
- **Block**: `POST /api/rooms/[code]/block {playerId, block}` → `{blocked}`. A `PlayerBlock` hides that player's chat
  for you in this room; if both players are signed in, a `UserBlock` carries it into future rooms. `RoomState.me.blocked`
  lists blocked players here; `GET .../chat` leaves their messages out and `useChat` drops live ones. Unblock from People.
- **Report**: `POST /api/rooms/[code]/chat/report {messageId, reason: "abuse"|"spam"|"other", block?}` keeps a
  `ChatReport` with a copy of the original text (kept after the room expires). Admin → Reports lists open ones;
  `GET/PATCH /api/admin/reports` (`{id, resolved}`).

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

## Party games (All Hands)
- Social games with hidden information for a group in one room. Listed on `/party`, reached from the home page's
  "Party games" button; the home page lists escape rooms only (`GameInfo.kind === "party"` keeps a game off it).
- Engine: `src/server/party/registry.ts` (the `PartyGame` interface: pure `apply`, `advance`, per-player `view`),
  `src/server/party/games.ts` (every party game by id), `src/server/party/server.ts` (row-locked changes, lazy
  phase advance, stand-in host). All Hands lives in `src/server/allhands/game.ts`; client-safe shapes and copy in
  `src/lib/allhands/types.ts`. State is stored in `Room.scene`.
- `POST /api/rooms/[code]/party {type, ...}` → `{ok, party}` (409 `{error, party}` when refused). Actions: `start`,
  `settings`, `ready`, `pick {target}`, `vote {target|"skip"}`, `tick`, `skip {from?}`, `pause`, `resume`, `end`,
  `kick {playerId}` (lobby only). Host actions are allowed for the host, or a stand-in while the host has been away
  90s (`effectiveHostId`).
- `GET /state` includes `party` (an `AllHandsView` built for the caller). **Roles never leave the server except in
  that player's own view**: broadcasts are `progress.updated` with no game data. Laid-off and fired players, and
  everyone at game over, see every role.
- No server clock: `endsAt` is stored and any request after it (state reads, or the client's `tick` when its
  countdown hits zero) advances one phase, with a fresh clock.
- Party games skip leaderboards, case records and badges. Hosting needs sign-in and a purchase, like escape rooms.
- UI text for All Hands is English only for now; the directory button and game card are translated.
- Chat: the room's ordinary chat (`/api/rooms/[code]/chat`) is the team chat. `PartyGame.canChat` lets a game mute
  players; All Hands mutes the laid-off and fired until the game ends (403 `api.chat.benched`). The Moles' back
  channel is the `moleChat {body}` party action: stored in the game state (last 100, reset each game), posted only by
  living Moles mid-game, and shown in `AllHandsView.moleChat` only to Moles, the laid-off and fired, and everyone at
  game over. It is never broadcast; Moles see new messages through the usual `progress.updated` refetch.
- Admin test rooms: an admin hosting a party room may `POST /api/rooms/[code]/party/test` with `{action: "fill",
  total}` (add bots between games), `{action: "viewAs", playerId|null}` (sets the `pv_<CODE>` cookie) or
  `{action: "botsAct"}` (each bot makes its move via `PartyGame.botMove`, except the one being viewed). Bots are
  Player rows whose token starts with `bot_` (`src/server/party/test.ts`). While viewing as a bot, `GET /state`
  builds the party view for that bot and seat actions (`ready`, `pick`, `vote`, `moleChat`) are made as it; host
  controls stay the admin's. `RoomState.partyTest` (every seat with its role) is sent only to that admin. Looking
  through a real player's eyes is never allowed.
- Burnt-out Employee (`burnout`, a Jester): dealt in place of one Employee at tables of 7+ when `settings.burnout`
  is on (default). Plays the decoy at night and counts as a non-Mole for the win check; fired at performance review,
  the game ends after the exit interview with `winner: "burnout"`. A night layoff doesn't count.
- Intern (`intern`, 6+ players, `settings.intern`): the first night they pick a mentor (night kind `"intern"`;
  no pick means the next living seat). They win with the mentor's team (`teamOf`), never learn the mentor's role,
  and IT sees them as not a Mole. `AllHandsView.winners` lists every winning seat.
- Founder's Nephew (`nephew`, 8+, `settings.nephew`): the first time he's fired he stays in, his role is revealed
  to everyone, and history logs `"spared"` (`exit.survived`).
- Recruiter (`recruiter`, 9+, `settings.recruiter`): replaces one Mole. Once per game sends
  `{type: "pick", target, offer: true}` instead of a layoff; that night nobody is laid off. The offer is
  `"blocked"` if HR protected the target, `"refused"` (silently) on IT, HR or a Mole, otherwise `"hired"`: the
  target becomes a Mole (`me.recruited`, `dawn.recruited` for them only) and joins the Mole chat.
  The other Mole-side players get `dawn.hired = target` (a private "Recruiting" DM on the morning screen);
  it's null for everyone else and on a failed offer.
  `isMoleRole` covers mole and recruiter.
- #random poll: `DECOY_PROMPTS` are "most likely to" questions; `pollPrompt(s)` picks one per round from a per-game
  offset. At dawn, `dawn.poll = {prompt, winners}` holds the most-picked player(s) among the decoy picks only (ties
  share it, at most three). It has no vote counts, so the poll's size can't hint at how many players have powers.
- Rules sheet: `goneRoles(counts, seats)` (src/lib/allhands/gone.ts) marks IT, HR, Intern, Burnt-out or Nephew as out
  of the game once every seat dealt that role has departed with its role shown on this phone. With reveals off, a living
  player sees nothing marked. A spared Nephew's role chip shows on the after-hours and review lists.
- Each `NightRecord` also stores who held the powers that night (`moles`, `it`, `hr`, `recruiter`; optional for older
  saved games). The game-over recap names them via `nightLines` (src/lib/allhands/recap.ts) and leaves out a power
  whose holder was already gone, instead of saying "Nobody".
- Onboarding: once every seat is ready, the reveal phase's `endsAt` moves to now + `READY_COUNTDOWN_MS` (10s, never
  later than it was), and the screen shows a countdown. After hours then starts on the normal phase timeout.
- Performance review on the IT Guy's phone: each checked player gets a "🔍 Mole" / "🔍 Not a Mole" tag, and the
  "DMs you've read" list shows below. `checks` are still only sent to the IT Guy (and to everyone at game over).
- Last five seconds of any All Hands timer (not while paused): `navigator.vibrate` once a second where supported
  (Android browsers; iOS Safari has no Vibration API), and a fading red edge flash (`.ah-final-flash`) on every phone.
