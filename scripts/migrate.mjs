// Apply Prisma migrations during the build, except on Vercel preview builds.
//
// Preview and production deployments share one database. Migrating from a preview build would change
// the live schema before the PR is merged, breaking production code that still expects the old schema.
// So only production builds (and local/CI builds, where VERCEL_ENV is unset) migrate.
import { spawnSync } from "node:child_process";

const env = process.env.VERCEL_ENV;
if (env && env !== "production") {
  console.log(`[migrate] Skipping prisma migrate deploy on Vercel "${env}" build (shared database).`);
  process.exit(0);
}

const res = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
process.exit(res.status ?? 1);
