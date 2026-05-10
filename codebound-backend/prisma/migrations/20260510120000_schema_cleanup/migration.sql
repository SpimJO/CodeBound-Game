-- Sync schema with Prisma (Supabase / PostgreSQL). Safe to re-run where IF EXISTS / IF NOT EXISTS applies.

-- Theme tutorial flags (levels 26 / 51 / 76)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme_one" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme_two" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme_three" INTEGER NOT NULL DEFAULT 0;

-- Remove unused columns
ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar";
ALTER TABLE "user_progress" DROP COLUMN IF EXISTS "totalPlayTime";
ALTER TABLE "level_completions" DROP COLUMN IF EXISTS "timeSpent";
ALTER TABLE "level_completions" DROP COLUMN IF EXISTS "hintsUsed";
ALTER TABLE "level_completions" DROP COLUMN IF EXISTS "isPerfect";

-- Unused analytics (both possible legacy table names)
DROP TABLE IF EXISTS "game_sessions";
DROP TABLE IF EXISTS "download_counter";
DROP TABLE IF EXISTS "download_counters";
