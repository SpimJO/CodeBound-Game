-- Remove unused columns and analytics tables (Supabase / PostgreSQL)
ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar";
ALTER TABLE "user_progress" DROP COLUMN IF EXISTS "totalPlayTime";
ALTER TABLE "level_completions" DROP COLUMN IF EXISTS "timeSpent";
ALTER TABLE "level_completions" DROP COLUMN IF EXISTS "hintsUsed";
ALTER TABLE "level_completions" DROP COLUMN IF EXISTS "isPerfect";
DROP TABLE IF EXISTS "game_sessions";
DROP TABLE IF EXISTS "download_counter";
