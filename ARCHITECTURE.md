# CodeBound System Architecture

## 🏗️ Architecture Overview

**Type:** Hybrid Architecture (Unity Game + Backend API)

```
┌─────────────────────────────────────────────────┐
│         UNITY GAME (Mobile/Desktop)             │
│                                                 │
│  📦 Local Assets (Read-Only):                  │
│  - 100 Level definitions                       │
│  - Achievement definitions                     │
│  - Skin assets & metadata                      │
│  - Test cases for code validation              │
│  - Hint texts                                  │
│                                                 │
│  💾 Local Cache (PlayerPrefs):                 │
│  - Settings (volume, controls)                 │
│  - Offline progress buffer                     │
│  - Last known server state                     │
│                                                 │
│  🌐 API Integration:                           │
│  - Login/Register → Auth tokens                │
│  - Sync progress → GET/POST                    │
│  - Submit level completion                     │
│  - Track achievements                          │
│  - Purchase skins (tokens)                     │
└──────────────────┬──────────────────────────────┘
                   │ REST API (JSON)
                   │ Authentication: Bearer Token
┌──────────────────▼──────────────────────────────┐
│         BACKEND API (Node.js + Express)         │
│                                                 │
│  🔐 Authentication:                            │
│  - POST /auth/register                         │
│  - POST /auth/login                            │
│  - GET  /auth/me                               │
│                                                 │
│  🎮 Game Progress:                             │
│  - GET  /progress                              │
│  - POST /progress/sync                         │
│  - POST /levels/:number/complete               │
│                                                 │
│  🏆 Achievements & Skins:                      │
│  - POST /achievements/:id/unlock               │
│  - GET  /skins/owned                           │
│  - POST /skins/:id/purchase                    │
│  - PUT  /progress/equip-skin                   │
│                                                 │
│  📊 Leaderboard:                               │
│  - GET  /leaderboard                           │
│  - GET  /leaderboard/me                        │
│                                                 │
│  💬 Community:                                 │
│  - GET  /community/posts                       │
│  - POST /community/posts                       │
│  - POST /community/posts/:id/like              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         DATABASE (MySQL + Prisma)               │
│                                                 │
│  - User (auth credentials)                     │
│  - UserProgress (current state)                │
│  - LevelCompletion (history)                   │
│  - UserAchievement (unlocked)                  │
│  - UserSkin (owned skins)                      │
│  - Leaderboard (computed rankings)             │
│  - CommunityPost & Comments                    │
│  - GameSession (analytics)                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         LANDING PAGE (React/Next.js)            │
│                                                 │
│  📺 Static Content:                            │
│  - Game trailer                                │
│  - Download button                             │
│  - FAQs                                        │
│                                                 │
│  🌐 Dynamic Content (API calls):               │
│  - Leaderboard (top 100)                       │
│  - Community posts                             │
│  - Download counter                            │
│  - User login/register                         │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Game Launch Flow

```
1. Player opens game
2. Check internet connection
3. IF online:
   a. Prompt login/register
   b. GET /progress → load cloud progress
   c. Cache locally in PlayerPrefs
4. IF offline:
   a. Load from PlayerPrefs cache
   b. Show "Offline Mode" indicator
   c. Queue changes for sync
5. Start game with loaded progress
```

### 2. Level Completion Flow

```
1. Player completes level in Unity
2. Validate code locally (test cases)
3. Calculate rewards (tokens, achievements)
4. Update local state (PlayerPrefs)
5. IF online:
   a. POST /levels/:number/complete
      {
        levelNumber: 25,
        tokensEarned: 50,
        timeSpent: 180,
        hintsUsed: 1,
        isPerfect: false
      }
   b. Backend validates and saves
   c. Check achievement triggers
   d. Update leaderboard
   e. Return updated progress
6. IF offline:
   a. Queue API call for later
   b. Sync when connection restored
7. Show completion screen with rewards
```

### 3. Achievement Unlock Flow

```
1. Player action triggers achievement check (in Unity)
2. Check local achievement state
3. IF not yet unlocked:
   a. POST /achievements/:id/unlock
      {
        achievementId: "speed_demon",
        progress: 100
      }
   b. Backend creates UserAchievement record
   c. Award bonus tokens
   d. Update UserProgress
4. Show achievement unlock animation
5. Update local cache
```

### 4. Skin Purchase Flow

```
1. Player opens shop in game
2. GET /skins/owned → check owned skins
3. Display available skins with prices
4. Player clicks "Purchase"
5. Validate tokens locally
6. POST /skins/:id/purchase
   {
     skinId: "ninja",
     tokenCost: 500
   }
7. Backend:
   a. Check if user has enough tokens
   b. Deduct tokens from UserProgress
   c. Create UserSkin record
8. Return success + updated tokens
9. Update local cache
10. Show "Skin Unlocked!" message
```

### 5. Leaderboard Update Flow

```
Backend (Scheduled Cron Job every 5 minutes):
1. Clear Leaderboard table
2. Aggregate data:
   SELECT 
     u.id,
     u.username,
     up.highestLevel,
     up.totalTokens,
     COUNT(ua.id) as achievementsCount
   FROM users u
   JOIN user_progress up ON u.id = up.userId
   LEFT JOIN user_achievements ua ON u.id = ua.userId
   GROUP BY u.id
   ORDER BY 
     up.highestLevel DESC,
     up.totalTokens DESC,
     up.lastPlayed ASC
3. Calculate ranks (1, 2, 3, ...)
4. Insert into Leaderboard table

Unity Game:
1. GET /leaderboard?limit=100
2. Display in leaderboard UI
3. Highlight current player's rank
```

---

## 🎯 Content Management Strategy

### What's in Unity (Hardcoded):

**Levels (1-100):**
```csharp
[Serializable]
public class LevelData {
    public int levelNumber;
    public string title;
    public string description;
    public string difficulty; // beginner, intermediate, advanced
    public string topic; // variables, loops, conditionals, etc.
    public int tokensReward;
    public List<TestCase> testCases;
    public List<Hint> hints;
}

// Loaded from JSON or ScriptableObjects
List<LevelData> allLevels = Resources.Load<LevelDataCollection>("Levels");
```

**Achievements:**
```csharp
[Serializable]
public class AchievementData {
    public string achievementId;
    public string name;
    public string description;
    public string iconPath;
    public string category;
    public int tokensReward;
    public AchievementRequirement requirement;
}

// Examples:
- "first_level" → Complete Level 1
- "speed_demon" → Complete any level under 60s
- "perfectionist" → Complete 10 levels without hints
- "token_master" → Earn 1000 tokens
```

**Skins:**
```csharp
[Serializable]
public class SkinData {
    public string skinId;
    public string displayName;
    public string description;
    public Sprite icon;
    public GameObject characterPrefab;
    public int price;
    public string rarity; // common, rare, epic, legendary
}

// Examples:
- "default" → Student (free, always owned)
- "ninja" → Ninja Coder (500 tokens)
- "wizard" → Code Wizard (1000 tokens)
- "robot" → Debug Bot (2000 tokens)
```

### What's in Database (Backend):

**User-Specific Data:**
- Which user?
- Which levels completed?
- Which achievements unlocked?
- Which skins owned?
- Current progress (level, tokens, playtime)
- Leaderboard rankings

**Advantages:**
- ✅ No need to update backend when adding new levels
- ✅ Game works offline with all content
- ✅ Smaller database (only user data)
- ✅ Faster level loading (local assets)
- ✅ No version sync issues

**Disadvantages:**
- ⚠️ Need Unity rebuild to change level content
- ⚠️ Cannot A/B test levels dynamically
- ⚠️ Cannot disable/enable levels remotely

---

## 🔐 Authentication Flow

### Registration:
```
Unity → POST /auth/register
{
  "email": "player@example.com",
  "password": "SecurePass123",
  "username": "CodeMaster99"
}

Backend:
1. Validate email format
2. Check if email already exists
3. Hash password (bcrypt)
4. Create User record
5. Create UserProgress record (default state)
6. Create UserSkin record for default skin
7. Generate auth token (JWT-like encrypted)
8. Return user data + token

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "player@example.com",
      "username": "CodeMaster99"
    },
    "token": "encrypted_auth_token_here",
    "progress": {
      "currentLevel": 1,
      "totalTokens": 0
    }
  }
}
```

### Login:
```
Unity → POST /auth/login
{
  "email": "player@example.com",
  "password": "SecurePass123"
}

Backend:
1. Find user by email
2. Compare password hash
3. Generate auth token
4. Return user data + token

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "encrypted_auth_token",
    "progress": { ... }
  }
}
```

### Token Validation:
```
All authenticated endpoints require header:
Authorization: Bearer {encrypted_token}

Backend middleware:
1. Extract token from header
2. Decrypt and verify (CipherToken class)
3. Extract userId from payload
4. Attach to req.user for controllers
```

---

## 💾 Offline Support

### Local Storage (PlayerPrefs):

```csharp
// Save progress locally
PlayerPrefs.SetInt("currentLevel", 25);
PlayerPrefs.SetInt("highestLevel", 25);
PlayerPrefs.SetInt("totalTokens", 1250);
PlayerPrefs.SetString("equippedSkin", "ninja");

// Queue for sync when online
string pendingSync = PlayerPrefs.GetString("pendingSyncQueue");
List<SyncAction> queue = JsonUtility.FromJson<List<SyncAction>>(pendingSync);
queue.Add(new SyncAction {
    type = "level_complete",
    data = { levelNumber = 25, tokensEarned = 50 }
});
PlayerPrefs.SetString("pendingSyncQueue", JsonUtility.ToJson(queue));
```

### Sync on Reconnect:

```csharp
public async void SyncOfflineProgress() {
    string queueJson = PlayerPrefs.GetString("pendingSyncQueue");
    List<SyncAction> queue = JsonUtility.FromJson<List<SyncAction>>(queueJson);
    
    foreach (var action in queue) {
        switch (action.type) {
            case "level_complete":
                await API.Post("/levels/" + action.data.levelNumber + "/complete", action.data);
                break;
            case "achievement_unlock":
                await API.Post("/achievements/" + action.data.achievementId + "/unlock", action.data);
                break;
            // ... more cases
        }
    }
    
    // Clear queue after successful sync
    PlayerPrefs.SetString("pendingSyncQueue", "[]");
    
    // Fetch latest server state
    var serverProgress = await API.Get("/progress");
    
    // Merge local and server (server = source of truth)
    MergeProgress(localProgress, serverProgress);
}
```

---

## 🎯 Next Steps

1. ✅ Finalize database schema
2. ⏳ Run Prisma migration
3. ⏳ Create backend controllers:
   - AuthController
   - ProgressController
   - AchievementController
   - SkinController
   - LeaderboardController
   - CommunityController
4. ⏳ Implement authentication middleware
5. ⏳ Create Unity API service layer
6. ⏳ Implement game<→backend sync logic
7. ⏳ Build landing page with API integration

---

**Summary:**
- Game content (levels, achievements, skins) = **Unity assets** (hardcoded)
- User data (progress, unlocks, ownership) = **Database** (backend)
- Best of both worlds: Fast offline gameplay + Cloud progress sync
