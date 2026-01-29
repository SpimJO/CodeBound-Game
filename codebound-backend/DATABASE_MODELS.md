# CodeBound Database Models & API Operations

## 📊 Database Schema Overview

Based on the CodeBound game requirements from the PDF and codebase analysis, here are the database models:

---

## 🔐 1. USER & AUTHENTICATION

### Model: `User`
**Purpose:** User accounts and authentication

**Fields:**
- `id` - Unique identifier
- `name` - User's full name
- `email` - Login email (unique)
- `password` - Hashed password
- `username` - Display name for leaderboard (unique)
- `avatar` - Avatar URL/path
- `created_at`, `updated_at` - Timestamps

**API Operations:**
- ✅ **POST** `/api/v1/auth/register` - Create new user
- ✅ **POST** `/api/v1/auth/login` - Authenticate user
- ✅ **GET** `/api/v1/auth/me` - Get current user profile
- 🔄 **PUT** `/api/v1/users/:id` - Update user profile (name, username, avatar)

---

## 🎮 2. GAME PROGRESS & LEVELS

### Model: `UserProgress`
**Purpose:** Track overall player progress

**Fields:**
- `currentLevel` - Currently playing level (1-100)
- `highestLevel` - Highest level reached
- `totalTokens` - Total tokens earned
- `totalPlayTime` - Total time played (seconds)
- `lastPlayed` - Last play timestamp
- `equippedSkin` - Currently equipped character skin

**API Operations:**
- ✅ **GET** `/api/v1/progress` - Get user's progress
- 🔄 **PUT** `/api/v1/progress` - Update progress (level, tokens, playtime)
- ✅ **GET** `/api/v1/progress/:userId` - Get specific user's progress (for leaderboard)

---

### Model: `Level`
**Purpose:** Game levels (1-100)

**Fields:**
- `levelNumber` - Level number (1-100, unique)
- `title` - Level title
- `description` - Level description/instructions
- `difficulty` - "beginner", "intermediate", "advanced"
- `topic` - Programming topic (variables, loops, conditionals, functions, etc.)
- `tokensReward` - Tokens earned on completion
- `order` - Display order

**API Operations:**
- ✅ **GET** `/api/v1/levels` - Get all levels (with pagination)
- ✅ **GET** `/api/v1/levels/:id` - Get specific level details
- ✅ **GET** `/api/v1/levels/:id/test-cases` - Get test cases for level
- 🔄 **POST** `/api/v1/levels` - Create new level (admin)
- 🔄 **PUT** `/api/v1/levels/:id` - Update level (admin)

---

### Model: `LevelCompletion`
**Purpose:** Track completed levels per user

**Fields:**
- `levelId` - Level completed
- `tokensEarned` - Tokens earned for this completion
- `attemptsCount` - Number of attempts before success
- `timeSpent` - Time taken to complete (seconds)
- `hintsUsed` - Number of hints used
- `code` - Final solution code
- `isPerfect` - Completed without hints
- `completedAt` - Completion timestamp

**API Operations:**
- ✅ **POST** `/api/v1/levels/:id/complete` - Mark level as completed
- ✅ **GET** `/api/v1/users/:userId/completions` - Get user's completed levels
- ✅ **GET** `/api/v1/levels/:id/completions` - Get all completions for a level (leaderboard)

---

### Model: `LevelUnlock`
**Purpose:** Track unlocked levels per user

**Fields:**
- `levelId` - Unlocked level
- `unlockedAt` - Unlock timestamp

**API Operations:**
- ✅ **POST** `/api/v1/levels/:id/unlock` - Unlock a level
- ✅ **GET** `/api/v1/users/:userId/unlocked-levels` - Get unlocked levels

---

### Model: `LevelAttempt`
**Purpose:** Track all code attempts (for analytics)

**Fields:**
- `levelId` - Level attempted
- `code` - Code submitted
- `isSuccess` - Whether attempt succeeded
- `errorMessage` - Error message if failed
- `testCasesPassed` - Number of test cases passed
- `totalTestCases` - Total test cases
- `attemptedAt` - Attempt timestamp

**API Operations:**
- ✅ **POST** `/api/v1/levels/:id/attempt` - Submit code attempt
- ✅ **GET** `/api/v1/users/:userId/attempts` - Get user's attempt history
- ✅ **GET** `/api/v1/levels/:id/attempts` - Get all attempts for a level

---

### Model: `TestCase`
**Purpose:** Test cases for level validation

**Fields:**
- `levelId` - Level this test case belongs to
- `input` - Test input
- `expectedOutput` - Expected output
- `description` - Test case description
- `isHidden` - Hidden test case (not shown to user)

**API Operations:**
- ✅ **GET** `/api/v1/levels/:id/test-cases` - Get test cases (public ones only)
- 🔄 **POST** `/api/v1/levels/:id/test-cases` - Add test case (admin)
- 🔄 **PUT** `/api/v1/test-cases/:id` - Update test case (admin)

---

## 🏆 3. ACHIEVEMENTS

### Model: `Achievement`
**Purpose:** Available achievements

**Fields:**
- `name` - Achievement name (unique)
- `description` - Achievement description
- `iconPath` - Icon URL/path
- `category` - "level", "token", "time", "perfect", etc.
- `requirement` - Requirement description/JSON
- `tokensReward` - Tokens earned when unlocked
- `order` - Display order

**API Operations:**
- ✅ **GET** `/api/v1/achievements` - Get all achievements
- ✅ **GET** `/api/v1/achievements/:id` - Get specific achievement
- ✅ **GET** `/api/v1/users/:userId/achievements` - Get user's achievements
- 🔄 **POST** `/api/v1/achievements` - Create achievement (admin)
- 🔄 **PUT** `/api/v1/achievements/:id` - Update achievement (admin)

---

### Model: `UserAchievement`
**Purpose:** User's unlocked achievements

**Fields:**
- `userId` - User who unlocked
- `achievementId` - Achievement unlocked
- `unlockedAt` - Unlock timestamp
- `progress` - Progress percentage (if applicable)

**API Operations:**
- ✅ **POST** `/api/v1/achievements/:id/unlock` - Unlock achievement for user
- ✅ **GET** `/api/v1/users/:userId/achievements` - Get user's unlocked achievements

---

## 🎨 4. CHARACTERS & SKINS

### Model: `Skin`
**Purpose:** Available character skins

**Fields:**
- `name` - Skin identifier (unique)
- `displayName` - Display name
- `description` - Skin description
- `iconPath` - Preview image
- `price` - Tokens required to purchase
- `rarity` - "common", "rare", "epic", "legendary"
- `isDefault` - Default skin (free)
- `isActive` - Available for purchase

**API Operations:**
- ✅ **GET** `/api/v1/skins` - Get all available skins
- ✅ **GET** `/api/v1/skins/:id` - Get specific skin
- ✅ **GET** `/api/v1/users/:userId/skins` - Get user's owned skins
- 🔄 **POST** `/api/v1/skins` - Create skin (admin)
- 🔄 **PUT** `/api/v1/skins/:id` - Update skin (admin)

---

### Model: `UserSkin`
**Purpose:** User's owned skins

**Fields:**
- `userId` - User who owns
- `skinId` - Skin owned
- `purchasedAt` - Purchase timestamp
- `purchasedWithTokens` - Tokens spent

**API Operations:**
- ✅ **POST** `/api/v1/skins/:id/purchase` - Purchase skin with tokens
- ✅ **PUT** `/api/v1/progress/equip-skin` - Equip a skin
- ✅ **GET** `/api/v1/users/:userId/skins` - Get user's owned skins

---

## 💡 5. HINTS SYSTEM

### Model: `Hint`
**Purpose:** Hints available for levels

**Fields:**
- `levelId` - Level this hint belongs to
- `hintText` - Hint text/content
- `order` - Hint order (1st, 2nd, 3rd hint)
- `tokenCost` - Cost to unlock this hint

**API Operations:**
- ✅ **GET** `/api/v1/levels/:id/hints` - Get hints for level (with costs)
- ✅ **POST** `/api/v1/hints/:id/unlock` - Unlock hint (deduct tokens)
- 🔄 **POST** `/api/v1/levels/:id/hints` - Add hint (admin)
- 🔄 **PUT** `/api/v1/hints/:id` - Update hint (admin)

---

### Model: `HintUsage`
**Purpose:** Track hint usage per user

**Fields:**
- `userId` - User who used hint
- `levelId` - Level hint was used for
- `hintId` - Hint used
- `tokensSpent` - Tokens spent
- `usedAt` - Usage timestamp

**API Operations:**
- ✅ **GET** `/api/v1/users/:userId/hint-usage` - Get user's hint usage history
- ✅ **GET** `/api/v1/levels/:id/hint-usage` - Get hint usage stats for level

---

## 🏅 6. LEADERBOARD

### Model: `Leaderboard`
**Purpose:** Leaderboard rankings

**Fields:**
- `userId` - User reference
- `rank` - Calculated rank
- `totalScore` - Calculated total score
- `levelsCompleted` - Number of levels completed
- `achievementsCount` - Number of achievements
- `totalTokens` - Total tokens earned
- `lastUpdated` - Last update timestamp

**API Operations:**
- ✅ **GET** `/api/v1/leaderboard` - Get leaderboard (top players)
- ✅ **GET** `/api/v1/leaderboard/top/:limit` - Get top N players
- ✅ **GET** `/api/v1/leaderboard/user/:userId` - Get user's rank
- ✅ **GET** `/api/v1/leaderboard/around/:userId` - Get players around user's rank
- 🔄 **POST** `/api/v1/leaderboard/update` - Update leaderboard (cron job)

**Leaderboard Calculation:**
- Score = (levelsCompleted * 100) + (achievementsCount * 50) + (totalTokens * 0.1)
- Ranked by totalScore descending
- Updated when user completes level or unlocks achievement

---

## 📊 7. ANALYTICS & TRACKING

### Model: `GameSession`
**Purpose:** Track game sessions

**Fields:**
- `userId` - User playing
- `startedAt` - Session start time
- `endedAt` - Session end time
- `duration` - Session duration (seconds)
- `levelsPlayed` - Levels played in session
- `tokensEarned` - Tokens earned in session

**API Operations:**
- ✅ **POST** `/api/v1/sessions/start` - Start game session
- ✅ **PUT** `/api/v1/sessions/:id/end` - End game session
- ✅ **GET** `/api/v1/users/:userId/sessions` - Get user's session history

---

## 🔄 Data Flow Summary

### Landing Page Needs:
1. **Leaderboard** - GET `/api/v1/leaderboard` (top players with username, avatar, score)
2. **User Levels** - GET `/api/v1/users/:userId/progress` (current level, highest level)
3. **User Achievements** - GET `/api/v1/users/:userId/achievements` (achievement count)

### Game Needs:
1. **Level Data** - GET `/api/v1/levels/:id` (level details, test cases)
2. **Submit Code** - POST `/api/v1/levels/:id/attempt` (validate code)
3. **Complete Level** - POST `/api/v1/levels/:id/complete` (save completion, award tokens)
4. **Unlock Achievement** - POST `/api/v1/achievements/:id/unlock`
5. **Purchase Skin** - POST `/api/v1/skins/:id/purchase`
6. **Unlock Hint** - POST `/api/v1/hints/:id/unlock`
7. **Update Progress** - PUT `/api/v1/progress` (current level, tokens, playtime)

---

## 📝 Next Steps

1. Review and approve the schema
2. Run `npx prisma migrate dev` to create tables
3. Create seed data for:
   - 100 Levels (1-100)
   - Default Achievements
   - Default Skins
   - Test Cases for each level
4. Implement API endpoints
5. Create leaderboard calculation service
