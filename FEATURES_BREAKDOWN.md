# CodeBound Features Breakdown

## 🎮 GAME ONLY (Not on Landing Page)

### 1. **Skins System**
- **What:** Character customization (one character, multiple skins)
- **Location:** In-game shop
- **Storage:** 
  - Skin definitions → Unity assets (hardcoded)
  - Ownership tracking → Database (`UserSkin` table)
- **Flow:**
  1. Player opens shop in game
  2. GET `/api/v1/skins/owned` → check which skins owned
  3. Display available skins with token prices
  4. Player purchases → POST `/api/v1/skins/:id/purchase`
  5. Deduct tokens, add to `UserSkin` table
- **NOT shown on landing page**

### 2. **Hints System**
- **What:** Token-based hints for levels
- **Location:** In-game during level play
- **Storage:** 
  - Hint texts → Unity (hardcoded per level)
  - Usage tracking → Optional (can track in `HintUsage` table if needed)
- **Flow:**
  1. Player stuck on level
  2. Click "Hint" button
  3. Deduct tokens locally
  4. Show hint text
- **NOT shown on landing page**

### 3. **Code Editor/Terminal**
- **What:** In-game Java code editor and terminal
- **Location:** In-game during level play
- **Storage:** All local in Unity
- **NOT shown on landing page**

### 4. **Test Cases**
- **What:** Code validation test cases
- **Location:** In-game (validate player code)
- **Storage:** Unity (hardcoded per level)
- **NOT shown on landing page**

### 5. **Level Definitions**
- **What:** 100 level challenges
- **Location:** In-game
- **Storage:** Unity ScriptableObjects/JSON
- **NOT shown on landing page**

---

## 🌐 LANDING PAGE (Visible to Public)

### 1. **Leaderboard** ⭐
- **What:** Top players ranked by level & tokens
- **Data Source:** 
  - `Leaderboard` table (pre-computed)
  - OR `UserProgress` + `User` (real-time)
- **API:** GET `/api/v1/leaderboard?limit=100`
- **Shown:**
  - Rank
  - Username
  - Highest Level Reached
  - Total Tokens
  - Achievement Count

### 2. **Community Posts** 💬
- **What:** Player-shared achievements/tips
- **Data Source:** `CommunityPost` + `User`
- **API:** GET `/api/v1/community/posts?limit=10`
- **Shown:**
  - Username
  - Avatar
  - Post content
  - Likes count
  - Comments count
  - Timestamp

### 3. **Download Counter** 📥
- **What:** Total download count
- **Data Source:** `DownloadCounter` table
- **API:** GET `/api/v1/downloads/count`
- **Shown:**
  - "Downloaded X times"

### 4. **Player Stats** 📊
- **What:** Total registered players
- **Data Source:** `User` table (count)
- **API:** GET `/api/v1/stats/players`
- **Shown:**
  - "X players worldwide"

### 5. **Game Trailer** 🎥
- **What:** YouTube video embed
- **Data Source:** Hardcoded URL
- **NOT from database**

### 6. **FAQs** ❓
- **What:** Frequently Asked Questions
- **Data Source:** Hardcoded in frontend
- **NOT from database**

---

## 🔄 BOTH (Game + Landing Page)

### 1. **User Profile**
- **Game:** Login to sync progress
- **Landing Page:** Login to post/comment in community
- **Data Source:** `User` table

### 2. **Achievements**
- **Game:** Track unlocked achievements
- **Landing Page:** Show achievement count in leaderboard
- **Data Source:** `UserAchievement` table
- **NOTE:** Achievement details (name, icon, description) NOT shown on landing page, only count

---

## 📊 Data Visibility Matrix

| Feature | Game | Landing Page | Database Table |
|---------|------|--------------|----------------|
| **Skins** | ✅ Shop, equip | ❌ | `UserSkin` |
| **Hints** | ✅ Purchase, use | ❌ | Optional tracking |
| **Levels** | ✅ Play | ❌ | None (Unity assets) |
| **Test Cases** | ✅ Validation | ❌ | None (Unity assets) |
| **Code Editor** | ✅ Write code | ❌ | None (local) |
| **Progress** | ✅ Track | ⚠️ Aggregated in leaderboard | `UserProgress` |
| **Achievements** | ✅ Unlock | ⚠️ Count only | `UserAchievement` |
| **Leaderboard** | ✅ View rank | ✅ Top 100 | `Leaderboard` |
| **Community** | ❌ | ✅ Posts & comments | `CommunityPost` |
| **Download Count** | ❌ | ✅ Display | `DownloadCounter` |
| **Login/Register** | ✅ | ✅ | `User` |

---

## 🎯 Key Points

### Landing Page Purpose:
- **Showcase game** (trailer, screenshots)
- **Show top players** (leaderboard)
- **Community engagement** (posts/comments)
- **Download tracking** (counter)
- **NOT a full game dashboard** (no detailed stats, skins, etc.)

### Game Purpose:
- **Play 100 levels**
- **Track progress** (sync to cloud)
- **Customize character** (skins)
- **Unlock achievements**
- **Submit score to leaderboard**
- **Full gameplay experience**

### Backend Purpose:
- **Authentication** (login/register)
- **Progress sync** (save/load)
- **Leaderboard computation** (rankings)
- **Community data** (posts/comments)
- **Analytics** (downloads, sessions)

---

## 💡 What Users See

### Visitor (No Login):
**Landing Page:**
- ✅ View leaderboard (top 100)
- ✅ View community posts
- ✅ See download count
- ✅ Watch trailer
- ✅ Read FAQs
- ❌ Cannot post/comment

**Game:**
- ❌ Cannot play (login required)

### Logged-In User:
**Landing Page:**
- ✅ All visitor features
- ✅ Post in community
- ✅ Comment on posts
- ✅ Like posts

**Game:**
- ✅ Play all 100 levels
- ✅ Progress syncs to cloud
- ✅ View/purchase skins
- ✅ Use hints
- ✅ Unlock achievements
- ✅ Submit score to leaderboard

---

## 🚀 Summary

**Landing Page = Marketing + Leaderboard + Community**
- Attract new players
- Show top players (motivation)
- Share achievements (social proof)
- Download tracking

**Game = Full Experience**
- 100 levels of Java challenges
- Skins, hints, achievements (all in-game)
- Progress tracking
- Code editor/terminal

**Backend = Data Management**
- User accounts
- Progress sync
- Leaderboard computation
- Community data
- Analytics

✅ **Skins are 100% in-game feature** - not visible or relevant to landing page visitors!
