# Landing Page Data Requirements

## 📊 What Data is Shown on Landing Page?

### 1. **Hero Section** (Static Content)
```
- Game title & description (hardcoded)
- Game trailer video (YouTube embed - hardcoded)
- Download button with counter
```

**API Call:**
```typescript
GET /api/v1/downloads/count
Response: { totalDownloads: 1532 }
```

---

### 2. **Leaderboard Section** (Top Players)
Shows top 100 players sorted by:
1. Highest Level Reached (primary)
2. Total Tokens (secondary)
3. Achievement Count (tertiary)

**API Call:**
```typescript
GET /api/v1/leaderboard?limit=100

Response: {
  entries: [
    {
      rank: 1,
      username: "JavaNinja",
      highestLevel: 100,
      totalTokens: 5000,
      achievementsCount: 45,
      lastUpdated: "2026-01-29T10:30:00Z"
    },
    {
      rank: 2,
      username: "CodeMaster",
      highestLevel: 98,
      totalTokens: 4800,
      achievementsCount: 42,
      lastUpdated: "2026-01-29T09:15:00Z"
    },
    // ... more entries
  ],
  total: 1250 // total players
}
```

**Database Query (Backend):**
```typescript
// Option 1: Use pre-computed Leaderboard table (faster)
const entries = await prisma.leaderboard.findMany({
  orderBy: [
    { highestLevel: 'desc' },
    { totalTokens: 'desc' },
    { achievementsCount: 'desc' }
  ],
  take: 100
});

// Option 2: Real-time calculation (more accurate, slower)
const entries = await prisma.userProgress.findMany({
  orderBy: [
    { highestLevel: 'desc' },
    { totalTokens: 'desc' }
  ],
  take: 100,
  include: {
    user: {
      select: { username: true }
    },
    _count: {
      select: {
        user: {
          select: { achievements: true }
        }
      }
    }
  }
});
```

**Display Example:**
```
🏆 TOP PLAYERS

Rank | Player        | Level | Tokens | Achievements
-----|---------------|-------|--------|-------------
  1  | JavaNinja     |  100  | 5,000  |     45
  2  | CodeMaster    |   98  | 4,800  |     42
  3  | LogicQueen    |   95  | 4,500  |     40
  4  | DebugKing     |   92  | 4,200  |     38
  5  | SyntaxWizard  |   90  | 4,000  |     35
...
```

---

### 3. **Community Hub Section** (Recent Posts)
Shows recent posts from players (with login required to post)

**API Call:**
```typescript
GET /api/v1/community/posts?limit=10

Response: {
  posts: [
    {
      id: "post_123",
      userId: "user_456",
      username: "JavaLearner",
      avatar: "https://...",
      content: "Just completed Level 50! This game is amazing! 🎉",
      likes: 24,
      commentCount: 5,
      created_at: "2026-01-29T10:30:00Z"
    },
    // ... more posts
  ],
  total: 250
}
```

**Database Query (Backend):**
```typescript
const posts = await prisma.communityPost.findMany({
  orderBy: { created_at: 'desc' },
  take: 10,
  include: {
    user: {
      select: {
        username: true,
        avatar: true
      }
    },
    _count: {
      select: { comments: true }
    }
  }
});

const formattedPosts = posts.map(post => ({
  id: post.id,
  userId: post.userId,
  username: post.user.username,
  avatar: post.user.avatar,
  content: post.content,
  likes: post.likes,
  commentCount: post._count.comments,
  created_at: post.created_at
}));
```

**Display Example:**
```
💬 COMMUNITY

┌──────────────────────────────────────────┐
│ @JavaLearner · 2 hours ago              │
│ Just completed Level 50! 🎉             │
│                                          │
│ ❤️ 24 likes   💬 5 comments            │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ @CodeNinja · 4 hours ago                │
│ Any tips for Level 75? Stuck on loops   │
│                                          │
│ ❤️ 12 likes   💬 8 comments            │
└──────────────────────────────────────────┘
```

---

### 4. **Stats Section** (Game Statistics)
```
📊 GAME STATS

[5,230]       [1,532]        [100]
Players       Downloads      Levels
```

**API Calls:**
```typescript
// 1. Total players
GET /api/v1/stats/players
Response: { totalPlayers: 5230 }

// Backend query:
const totalPlayers = await prisma.user.count();

// 2. Total downloads
GET /api/v1/downloads/count
Response: { totalDownloads: 1532 }

// 3. Total levels (hardcoded = 100)
```

---

### 5. **FAQs Section** (Static Content)
```
Hardcoded in frontend component:

Q: What is CodeBound?
A: A 2D puzzle game that teaches Java programming...

Q: Is it free?
A: Yes, completely free...

Q: What platforms are supported?
A: Android, iOS, Windows, macOS
```

---

## 🔄 Data Flow Summary

```
┌─────────────────────────────────────────┐
│      Landing Page (React/Next.js)       │
└──────────────┬──────────────────────────┘
               │
               │ HTTP GET requests
               │
┌──────────────▼──────────────────────────┐
│      Backend API (Node.js/Express)      │
│                                         │
│  Routes:                                │
│  - GET /leaderboard                     │
│  - GET /community/posts                 │
│  - GET /downloads/count                 │
│  - GET /stats/players                   │
└──────────────┬──────────────────────────┘
               │
               │ Database queries
               │
┌──────────────▼──────────────────────────┐
│      Database (MySQL + Prisma)          │
│                                         │
│  Tables:                                │
│  - User (count players)                 │
│  - UserProgress (leaderboard data)      │
│  - Leaderboard (pre-computed ranks)     │
│  - CommunityPost (recent posts)         │
│  - DownloadCounter (download count)     │
└─────────────────────────────────────────┘
```

---

## 🎨 Landing Page Layout

```
┌────────────────────────────────────────────────┐
│                  NAVBAR                        │
│  [Logo]  Home  Leaderboard  Community  Login  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│               HERO SECTION                     │
│                                                │
│         🎮 CODEBOUND 🎮                       │
│    Learn Java Through Puzzles!                │
│                                                │
│   [Watch Trailer] [Download Now]              │
│   Downloaded 1,532 times                       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│            LEADERBOARD SECTION                 │
│                                                │
│  🏆 TOP PLAYERS                               │
│                                                │
│  Rank | Player      | Level | Tokens | ...    │
│   1   | JavaNinja   |  100  | 5,000  | ...    │
│   2   | CodeMaster  |   98  | 4,800  | ...    │
│   ...                                          │
│                                                │
│  [View Full Leaderboard →]                    │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│            COMMUNITY SECTION                   │
│                                                │
│  💬 WHAT PLAYERS ARE SAYING                   │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │ @JavaLearner · 2h ago                │    │
│  │ Just completed Level 50! 🎉          │    │
│  │ ❤️ 24   💬 5                        │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  [Share Your Achievement →]                   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              STATS SECTION                     │
│                                                │
│   [5,230]     [1,532]       [100]             │
│   Players     Downloads     Levels             │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│               FAQ SECTION                      │
│                                                │
│  ❓ FREQUENTLY ASKED QUESTIONS                │
│                                                │
│  Q: What is CodeBound?                        │
│  A: ...                                       │
│                                                │
│  Q: Is it free?                               │
│  A: ...                                       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│                  FOOTER                        │
│  © 2026 CodeBound | Privacy | Terms           │
└────────────────────────────────────────────────┘
```

---

## 🚀 API Endpoints for Landing Page

| Endpoint | Method | Purpose | Data Source |
|----------|--------|---------|-------------|
| `/api/v1/leaderboard` | GET | Top 100 players | `Leaderboard` or `UserProgress` + `User` |
| `/api/v1/community/posts` | GET | Recent posts | `CommunityPost` + `User` + comment count |
| `/api/v1/community/posts/:id/like` | POST | Like a post | `CommunityPost` (increment likes) |
| `/api/v1/downloads/count` | GET | Total downloads | `DownloadCounter` |
| `/api/v1/downloads/increment` | POST | Track download | `DownloadCounter` (increment) |
| `/api/v1/stats/players` | GET | Total players | `User` (count) |

---

## 💡 Notes

1. **Leaderboard Update Strategy:**
   - Option A: Real-time query (slower, always accurate)
   - Option B: Cron job every 5 minutes (faster, slight delay)
   - **Recommended:** Use pre-computed `Leaderboard` table, updated by cron job

2. **Community Posts:**
   - Users must be logged in to post/comment
   - Anyone can view posts (no login required)
   - Posts sorted by `created_at DESC` (newest first)

3. **Performance:**
   - Cache leaderboard for 5 minutes (Redis or in-memory)
   - Cache community posts for 1 minute
   - Cache stats for 10 minutes

4. **Security:**
   - Landing page is public (no auth required to view)
   - Auth only needed for:
     - Posting in community
     - Commenting on posts
     - Liking posts (optional, or allow anonymous)
