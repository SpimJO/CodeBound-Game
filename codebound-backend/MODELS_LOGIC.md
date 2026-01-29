# CodeBound Database Models - Simplified Logic Documentation

## 📋 Overview

**Architecture: Hybrid Local + Backend for Leaderboard**

This is a **simplified architecture** where:
- 🎮 **Game (Unity)**: 100% local storage using PlayerPrefs (no authentication, no cloud sync)
- 🌐 **Landing Page (React)**: Static showcase + API calls for dynamic data
- 📊 **Backend (Node.js + MySQL)**: Simple API for leaderboard submissions and community posts

---

## 🎯 System Requirements (Simplified)

### Core Features:
1. **100 Progressive Levels** - All game logic in Unity (local)
2. **Tokens System** - Local tracking in PlayerPrefs
3. **Achievements** - Local tracking in PlayerPrefs
4. **Character Skins** - Local assets in Unity
5. **Leaderboard** - Backend API (submit scores, get rankings)
6. **Hints System** - Local in Unity
7. **Code Validation** - Local in Unity
8. **Progress Tracking** - 100% Local (PlayerPrefs only)
9. **Community Hub** - Simple guest posting (no login)

### What's NOT in this system:
- ❌ User authentication (no login/signup)
- ❌ Cloud progress sync
- ❌ Teacher/admin dashboard
- ❌ Complex user management
- ❌ Role-based access control

---

## 🏗️ Simplified Architecture

```
┌─────────────────────────────────────────────────┐
│            Landing Page (React)                 │
│  - Download button (increment counter)         │
│  - Leaderboard (GET /api/leaderboard)          │
│  - Community Hub (GET/POST /api/community)     │
│  - Page views tracking                          │
└──────────────────┬──────────────────────────────┘
                   │ REST API calls
┌──────────────────▼──────────────────────────────┐
│         Backend (Node.js + Express)             │
│  - POST /api/leaderboard/submit                │
│  - GET  /api/leaderboard                       │
│  - POST /api/community/posts                   │
│  - GET  /api/community/posts                   │
│  - POST /api/downloads/increment               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Database (MySQL + Prisma)               │
│  - LeaderboardEntry                            │
│  - CommunityPost                               │
│  - CommunityComment                            │
│  - DownloadCounter                             │
│  - PageView                                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         Unity Game (Local Only)                 │
│  - All progress in PlayerPrefs                 │
│  - Levels, achievements, skins (local)         │
│  - On game over: POST score to leaderboard     │
└─────────────────────────────────────────────────┘
```

---

## 📊 1. LEADERBOARD SYSTEM

### Model: `LeaderboardEntry`

**Purpose:** Store player scores for global leaderboard

**Fields:**
- `playerName` - Display name (player enters when submitting score)
- `deviceId` - Optional unique device ID (prevent duplicate entries from same device)
- `highestLevel` - Maximum level reached
- `totalTokens` - Total tokens collected
- `totalPlayTime` - Total playtime in seconds
- `lastSubmitted` - Last score submission timestamp

**Logic:**
- No authentication required
- Player can submit score anytime
- Duplicate deviceId? Update existing entry if new score is higher
- Rankings calculated on-the-fly based on:
  1. highestLevel (DESC)
  2. totalTokens (DESC)
  3. totalPlayTime (ASC - faster is better)

**Use Cases:**

1. **Submit Score (from Unity game):**
```typescript
// POST /api/leaderboard/submit
{
  "playerName": "CodeMaster123",
  "deviceId": "abc-def-ghi", // Optional
  "highestLevel": 45,
  "totalTokens": 1250,
  "totalPlayTime": 3600
}

// Response:
{
  "success": true,
  "rank": 127,
  "message": "Score submitted successfully!"
}
```

2. **Get Leaderboard (for landing page):**
```typescript
// GET /api/leaderboard?limit=50&offset=0
{
  "entries": [
    {
      "rank": 1,
      "playerName": "JavaNinja",
      "highestLevel": 100,
      "totalTokens": 5000,
      "totalPlayTime": 72000,
      "lastSubmitted": "2026-01-29T10:30:00Z"
    },
    // ... more entries
  ],
  "total": 1250,
  "limit": 50,
  "offset": 0
}
```

3. **Get Player Rank:**
```typescript
// GET /api/leaderboard/rank?deviceId=abc-def-ghi
{
  "rank": 127,
  "playerName": "CodeMaster123",
  "highestLevel": 45,
  "totalTokens": 1250,
  "outOf": 1250
}
```

**Controller Logic:**
```typescript
// Submit score
async submitScore(req, res) {
  const { playerName, deviceId, highestLevel, totalTokens, totalPlayTime } = req.body;
  
  // Validation
  if (!playerName || !highestLevel) {
    return this.error(res, "Missing required fields", 400);
  }
  
  // Check if deviceId exists
  if (deviceId) {
    const existing = await prisma.leaderboardEntry.findFirst({
      where: { deviceId }
    });
    
    if (existing) {
      // Update if new score is better
      if (highestLevel > existing.highestLevel || 
         (highestLevel === existing.highestLevel && totalTokens > existing.totalTokens)) {
        await prisma.leaderboardEntry.update({
          where: { id: existing.id },
          data: { playerName, highestLevel, totalTokens, totalPlayTime, lastSubmitted: new Date() }
        });
      }
    } else {
      // Create new entry
      await prisma.leaderboardEntry.create({
        data: { playerName, deviceId, highestLevel, totalTokens, totalPlayTime }
      });
    }
  } else {
    // No deviceId, always create new entry
    await prisma.leaderboardEntry.create({
      data: { playerName, highestLevel, totalTokens, totalPlayTime }
    });
  }
  
  // Calculate rank
  const rank = await prisma.leaderboardEntry.count({
    where: {
      OR: [
        { highestLevel: { gt: highestLevel } },
        { 
          AND: [
            { highestLevel },
            { totalTokens: { gt: totalTokens } }
          ]
        }
      ]
    }
  }) + 1;
  
  this.success(res, { rank }, "Score submitted!");
}

// Get leaderboard
async getLeaderboard(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;
  
  const [entries, total] = await Promise.all([
    prisma.leaderboardEntry.findMany({
      orderBy: [
        { highestLevel: 'desc' },
        { totalTokens: 'desc' },
        { totalPlayTime: 'asc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.leaderboardEntry.count()
  ]);
  
  const rankedEntries = entries.map((entry, index) => ({
    rank: offset + index + 1,
    ...entry
  }));
  
  this.success(res, { entries: rankedEntries, total, limit, offset });
}
```

---

## 💬 2. COMMUNITY HUB (Simple Guest Posts)

### Model: `CommunityPost`

**Purpose:** Simple community posts (no authentication)

**Fields:**
- `authorName` - Guest name (entered by user)
- `content` - Post text
- `likes` - Like count (can be incremented by anyone)
- `created_at` - Timestamp

**Logic:**
- No login required
- Anyone can post
- Anyone can like (no tracking who liked)
- Simple moderation: manual cleanup by admin if needed

**Use Cases:**

1. **Create Post:**
```typescript
// POST /api/community/posts
{
  "authorName": "JavaLearner",
  "content": "Just completed Level 50! This game is amazing! 🎉"
}

// Response:
{
  "success": true,
  "postId": "post_123",
  "message": "Post created!"
}
```

2. **Get Posts:**
```typescript
// GET /api/community/posts?limit=20&offset=0
{
  "posts": [
    {
      "id": "post_123",
      "authorName": "JavaLearner",
      "content": "Just completed Level 50!",
      "likes": 15,
      "commentCount": 3,
      "created_at": "2026-01-29T10:30:00Z"
    }
  ],
  "total": 250,
  "limit": 20,
  "offset": 0
}
```

3. **Like Post:**
```typescript
// POST /api/community/posts/:id/like
{
  "success": true,
  "likes": 16
}
```

### Model: `CommunityComment`

**Purpose:** Comments on posts

**Fields:**
- `postId` - Parent post
- `authorName` - Guest name
- `content` - Comment text
- `created_at` - Timestamp

**Use Cases:**

1. **Create Comment:**
```typescript
// POST /api/community/posts/:id/comments
{
  "authorName": "CodeNinja",
  "content": "Congrats! Level 50 is tough!"
}
```

2. **Get Comments:**
```typescript
// GET /api/community/posts/:id/comments
{
  "comments": [
    {
      "id": "comment_123",
      "authorName": "CodeNinja",
      "content": "Congrats!",
      "created_at": "2026-01-29T11:00:00Z"
    }
  ]
}
```

**Controller Logic:**
```typescript
// Create post
async createPost(req, res) {
  const { authorName, content } = req.body;
  
  if (!authorName || !content) {
    return this.error(res, "Missing required fields", 400);
  }
  
  // Basic validation
  if (content.length > 1000) {
    return this.error(res, "Content too long (max 1000 chars)", 400);
  }
  
  const post = await prisma.communityPost.create({
    data: { authorName, content }
  });
  
  this.created(res, { postId: post.id }, "Post created!");
}

// Get posts with comment count
async getPosts(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;
  
  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { comments: true }
        }
      }
    }),
    prisma.communityPost.count()
  ]);
  
  const formattedPosts = posts.map(post => ({
    id: post.id,
    authorName: post.authorName,
    content: post.content,
    likes: post.likes,
    commentCount: post._count.comments,
    created_at: post.created_at
  }));
  
  this.success(res, { posts: formattedPosts, total, limit, offset });
}

// Like post
async likePost(req, res) {
  const { id } = req.params;
  
  const post = await prisma.communityPost.update({
    where: { id },
    data: { likes: { increment: 1 } }
  });
  
  this.success(res, { likes: post.likes });
}
```

---

## 📥 3. DOWNLOAD TRACKING

### Model: `DownloadCounter`

**Purpose:** Track total download count (no per-user tracking)

**Fields:**
- `totalDownloads` - Simple counter
- `lastIncrement` - Last download timestamp

**Logic:**
- Single row in database
- Increment on download button click
- Show on landing page ("Downloaded X times")

**Use Cases:**

1. **Increment Counter:**
```typescript
// POST /api/downloads/increment
{
  "success": true,
  "totalDownloads": 1532
}
```

2. **Get Counter:**
```typescript
// GET /api/downloads/count
{
  "totalDownloads": 1532
}
```

**Controller Logic:**
```typescript
// Increment download counter
async incrementDownload(req, res) {
  // Get or create counter
  let counter = await prisma.downloadCounter.findFirst();
  
  if (!counter) {
    counter = await prisma.downloadCounter.create({
      data: { totalDownloads: 1 }
    });
  } else {
    counter = await prisma.downloadCounter.update({
      where: { id: counter.id },
      data: { 
        totalDownloads: { increment: 1 },
        lastIncrement: new Date()
      }
    });
  }
  
  this.success(res, { totalDownloads: counter.totalDownloads });
}

// Get download count
async getDownloadCount(req, res) {
  const counter = await prisma.downloadCounter.findFirst();
  this.success(res, { totalDownloads: counter?.totalDownloads || 0 });
}
```

---

## 📊 4. ANALYTICS (Simple Page Views)

### Model: `PageView`

**Purpose:** Track page view counts (optional)

**Fields:**
- `page` - Page name ("home", "leaderboard", "community")
- `viewCount` - View count for that page/date
- `date` - Date of views

**Use Cases:**
- Track which pages are most viewed
- Simple analytics dashboard (optional)

---

## 🎮 5. UNITY GAME (LOCAL STORAGE STRUCTURE)

All game data is stored locally in Unity using **PlayerPrefs**:

### PlayerPrefs Keys:

```csharp
// Progress
PlayerPrefs.SetInt("currentLevel", 25);
PlayerPrefs.SetInt("highestLevel", 25);
PlayerPrefs.SetInt("totalTokens", 1250);
PlayerPrefs.SetFloat("totalPlayTime", 3600f);

// Settings
PlayerPrefs.SetFloat("musicVolume", 0.7f);
PlayerPrefs.SetFloat("sfxVolume", 0.8f);
PlayerPrefs.SetString("equippedSkin", "ninja");

// Level completions (JSON)
string completionsJson = JsonUtility.ToJson(levelCompletionsArray);
PlayerPrefs.SetString("levelCompletions", completionsJson);

// Achievements (JSON)
string achievementsJson = JsonUtility.ToJson(achievementsArray);
PlayerPrefs.SetString("achievements", achievementsJson);

// Owned skins (JSON)
string skinsJson = JsonUtility.ToJson(ownedSkinsArray);
PlayerPrefs.SetString("ownedSkins", skinsJson);

PlayerPrefs.Save();
```

### Leaderboard Submission (from Unity):

```csharp
// When player wants to submit score to leaderboard
public async void SubmitScoreToLeaderboard(string playerName)
{
    var scoreData = new {
        playerName = playerName,
        deviceId = SystemInfo.deviceUniqueIdentifier,
        highestLevel = PlayerPrefs.GetInt("highestLevel"),
        totalTokens = PlayerPrefs.GetInt("totalTokens"),
        totalPlayTime = PlayerPrefs.GetFloat("totalPlayTime")
    };
    
    string json = JsonUtility.ToJson(scoreData);
    
    UnityWebRequest request = new UnityWebRequest(
        "https://your-backend.com/api/leaderboard/submit", 
        "POST"
    );
    
    byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
    request.uploadHandler = new UploadHandlerRaw(bodyRaw);
    request.downloadHandler = new DownloadHandlerBuffer();
    request.SetRequestHeader("Content-Type", "application/json");
    
    await request.SendWebRequest();
    
    if (request.result == UnityWebRequest.Result.Success)
    {
        Debug.Log("Score submitted to leaderboard!");
    }
}
```

---

## 🚀 API ENDPOINTS SUMMARY

### Leaderboard:
- `POST /api/v1/leaderboard/submit` - Submit score
- `GET /api/v1/leaderboard` - Get leaderboard (paginated)
- `GET /api/v1/leaderboard/rank?deviceId=xxx` - Get player rank

### Community:
- `POST /api/v1/community/posts` - Create post
- `GET /api/v1/community/posts` - Get posts (paginated)
- `GET /api/v1/community/posts/:id` - Get single post
- `POST /api/v1/community/posts/:id/like` - Like post
- `POST /api/v1/community/posts/:id/comments` - Create comment
- `GET /api/v1/community/posts/:id/comments` - Get comments

### Analytics:
- `POST /api/v1/downloads/increment` - Increment download counter
- `GET /api/v1/downloads/count` - Get download count
- `POST /api/v1/analytics/pageview` - Track page view (optional)

---

## 🌐 LANDING PAGE DATA FLOW

### Landing Page Components:

1. **Hero Section:**
   - Static content (game title, description, trailer)
   - Download button → onClick: POST /api/downloads/increment → trigger download

2. **Leaderboard Section:**
   - GET /api/leaderboard?limit=10
   - Show top 10 players
   - "View Full Leaderboard" → separate page with pagination

3. **Community Hub Section:**
   - GET /api/community/posts?limit=5
   - Show recent posts
   - "Post your achievement" form (no login)

4. **Stats Section:**
   - GET /api/downloads/count → "Downloaded X times"
   - GET /api/leaderboard → "X players competing"
   - Static: "100 challenging levels"

---

## ✅ SIMPLIFIED vs ORIGINAL SCHEMA

### What was REMOVED:
- ❌ User authentication (login/signup)
- ❌ UserProgress (now local in Unity)
- ❌ LevelCompletion tracking (now local)
- ❌ LevelUnlock tracking (now local)
- ❌ LevelAttempt tracking (now local)
- ❌ Achievement tracking (now local)
- ❌ UserAchievement tracking (now local)
- ❌ Skin ownership tracking (now local)
- ❌ HintUsage tracking (now local)
- ❌ GameSession tracking (now local)
- ❌ Level management (hardcoded in Unity)
- ❌ Test case management (hardcoded in Unity)
- ❌ Admin/teacher dashboard
- ❌ Role-based access control

### What REMAINS:
- ✅ LeaderboardEntry (score submissions)
- ✅ CommunityPost (guest posts)
- ✅ CommunityComment (guest comments)
- ✅ DownloadCounter (simple counter)
- ✅ PageView (optional analytics)

---

## 🎯 NEXT STEPS

1. ✅ Review simplified schema
2. ⏳ Run Prisma migration
3. ⏳ Create controllers:
   - LeaderboardController
   - CommunityController
   - AnalyticsController
4. ⏳ Create routes and middleware
5. ⏳ Test API endpoints
6. ⏳ Implement Unity integration (submit scores)
7. ⏳ Implement React landing page

---

## 📝 NOTES

- **No authentication = no security concerns** for user data (since no user data stored)
- **Guest posting = potential spam** (consider adding simple rate limiting or CAPTCHA)
- **DeviceId** prevents duplicate leaderboard entries from same device
- **Landing page can be static** (Next.js/React) with API calls for dynamic data
- **Unity game is standalone** - works 100% offline, only calls API for leaderboard submission

Mas simple at mas madali maintain! 🚀
