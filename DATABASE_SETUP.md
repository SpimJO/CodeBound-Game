# Database Setup - CodeBound Backend

## Problem
Ang Prisma schema mo (schema.prisma) ay updated na, pero:
- Ang **migrations folder** may old migration (2025-07-30) na may `User.name` pero ang current schema ay `User.username`
- Ang **database** (cbgame_db) ay **walang tables** o outdated ang tables

Kaya nagiging 500 ang API: "The table `user_progress` does not exist in the current database."

---

## Solution: I-sync ang Database sa Current Schema

May **2 options**:

### Option 1: Quick Push (Recommended for Dev)
**Gagawin:** I-sync ang schema directly sa database nang walang migration files.

```bash
cd codebound-backend

# Generate Prisma Client
npx prisma generate

# Push schema to database (creates/updates tables)
npx prisma db push

# Check database (optional)
npx prisma studio
```

**Result:** Lahat ng tables (users, user_progress, level_completions, community_posts, etc.) ay mage-create o mag-update sa database.

**Note:** `db push` ay para sa dev lang; walang migration history tracking.

---

### Option 2: Create New Migration (For Production Tracking)
**Gagawin:** I-reset ang migrations at gumawa ng fresh migration.

```bash
cd codebound-backend

# Delete old migrations (optional, if outdated)
# rm -rf prisma/migrations

# Create new migration from current schema
npx prisma migrate dev --name init_all_tables

# This will:
# 1. Apply migration to database (create tables)
# 2. Generate Prisma Client
# 3. Save migration file for versioning
```

**Result:** May bagong migration file na complete (lahat ng tables) at ma-apply sa database.

---

## Ano ang Tables na Ma-create

Based sa schema.prisma:

- `users` - User accounts
- `user_progress` - Player progress/stats
- `level_completions` - Level completion history
- `user_achievements` - User achievements
- `user_skins` - Owned skins
- `leaderboard` - Leaderboard rankings
- `community_posts` - Community posts
- `community_comments` - Post comments
- `download_counter` - Download statistics
- `game_sessions` - Game session tracking

---

## Recommended Steps

1. **Siguraduhing running ang MySQL** at accessible ang `cbgame_db`.
2. **Run Prisma Push** (Option 1):
   ```bash
   cd codebound-backend
   npx prisma generate
   npx prisma db push
   ```
3. **I-restart ang backend**:
   ```bash
   npm run dev
   ```
4. **I-refresh ang frontend** - dapat wala nang "table does not exist" errors.

---

## After Setup: Paano Mag-add ng Test Data (Optional)

Kung gusto mo ng sample data para sa leaderboard/community:

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Or create seed script (prisma/seed.ts)
```

Sa studio, pwede kang mag-add ng:
- Users (with username, email, password hash)
- UserProgress (currentLevel, totalTokens, etc.)
- CommunityPosts
- Leaderboard entries

---

## Expected Result After Setup

Kapag na-push na ang schema:
- **Network tab:** Hindi na "table does not exist"
- **API responses:** 200 with empty data (kung walang users/posts pa)
- **After adding data:** Makikita sa frontend (leaderboard, posts, etc.)

---

## Quick Command (One-liner)

```bash
cd codebound-backend && npx prisma generate && npx prisma db push && npm run dev
```

Yan lang. Tapos na ang database setup.
