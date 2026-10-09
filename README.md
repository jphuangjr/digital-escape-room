# The Vanishing of Dr. Ada Voss

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
Admin analytics (which puzzles stall players): `GET /api/admin/analytics?token=$ADMIN_TOKEN`.

The answer key lives only in `src/server/**` (guarded with `server-only`); client code must never import it.
