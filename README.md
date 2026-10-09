# Escape Escape

A directory of multiplayer, mobile-first online escape rooms (`/`). Games are listed in `src/lib/games.ts`.
The first one is **The Vanishing of Dr. Ada Voss** (`/play/ada-voss`).

## Adding a game
1. Add an entry to `GAMES` in `src/lib/games.ts` (its `id` is stored on rooms and case records).
2. Give it a landing page at its `href` (see `src/app/play/ada-voss/`).
3. Create its rooms with that `gameId`.

## The Vanishing of Dr. Ada Voss

Multiplayer, mobile-first online escape room. Next.js 15 (App Router) + Prisma/Postgres + Supabase Realtime.

- `SPEC.md` — design spec (contains spoilers)
- `CONTRACTS.md` — API routes, realtime events, file ownership, answer-key rules

## Run locally
```bash
cp .env.example .env          # set POSTGRES_PRISMA_URL + POSTGRES_URL_NON_POOLING (Vercel Supabase integration names); Supabase vars optional (falls back to 4s polling)
npm install
npx prisma migrate dev
npm run dev                   # http://localhost:3000
npm test                      # vitest
```
Google sign-in (optional, required only to host): set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`;
OAuth redirect URI is `<origin>/api/auth/callback/google`.

Hosting requires owning the game. Until Stripe is wired up, admins (emails in `ACCOUNT_ADMIN`, comma-separated)
generate single-use purchase codes at `/admin`; players redeem them on the game page.

Admin analytics (which puzzles stall players): `GET /api/admin/analytics?token=$ADMIN_TOKEN`.

The answer key lives only in `src/server/**` (guarded with `server-only`); client code must never import it.
