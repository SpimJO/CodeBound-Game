# CodeBound Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require:
- **Header**: `x-api-key: <your-api-key>`
- **Header**: `Authorization: Bearer <your-token>`

---

## 📍 Authentication Routes

### Register User
```http
POST /auth/register
Headers: x-api-key
Body: {
  "username": "player123",
  "email": "player@example.com",
  "password": "securepass"
}
Response: {
  "success": true,
  "data": {
    "user": { "id", "username", "email" },
    "token": "encrypted-jwt-token"
  }
}
```

### Login
```http
POST /auth/login
Headers: x-api-key
Body: {
  "email": "player@example.com",
  "password": "securepass"
}
Response: {
  "success": true,
  "data": {
    "token": "encrypted-jwt-token"
  }
}
```

### Get Session (Current User)
```http
POST /auth/sessionToken
Headers: x-api-key, Authorization
Response: {
  "success": true,
  "data": {
    "user": {
      "id", "username", "email", "avatar",
      "progress": { "currentLevel", "highestLevel", "totalTokens", ... }
    }
  }
}
```

### Update User Profile
```http
PUT /auth/profile
Headers: x-api-key, Authorization
Body: {
  "username": "newUsername",
  "avatar": "https://example.com/avatar.png"
}
Response: {
  "success": true,
  "data": {
    "user": { "id", "username", "email", "avatar", "updated_at" }
  }
}
```

---

## 📊 Progress Routes (Protected)

### Update Progress After Level Completion
```http
POST /progress/update
Headers: x-api-key, Authorization
Body: {
  "levelCompleted": 5,
  "tokensEarned": 150,
  "timeSpent": 45.2,
  "hintsUsed": 2,
  "isPerfect": false
}
Response: UserProgress object + achievements unlocked
```

### Get Player Progress
```http
GET /progress
Headers: x-api-key, Authorization
Response: Full progress with level completions count
```

### Get Level Completions
```http
GET /progress/levels?limit=10
Headers: x-api-key, Authorization
Response: Array of completed levels with stats
```

### Get Player Statistics
```http
GET /progress/stats
Headers: x-api-key, Authorization
Response: {
  "currentLevel", "highestLevel", "totalTokens",
  "averageTimePerLevel", "perfectLevels", ...
}
```

### Reset Progress
```http
POST /progress/reset
Headers: x-api-key, Authorization
Response: { "message": "Progress reset successfully" }
```

---

## 🏆 Leaderboard Routes

### Get Global Leaderboard (Public)
```http
GET /leaderboard?limit=50&offset=0&sort=level
Headers: x-api-key
Query Params:
  - limit: 1-100 (default: 50)
  - offset: 0+ (default: 0)
  - sort: level | tokens | playtime | recent
Response: {
  "players": [{ "rank", "username", "levelReached", "tokensEarned", ... }],
  "pagination": { "total", "hasMore", ... }
}
```

### Get Top Players (Public)
```http
GET /leaderboard/top/:count
Headers: x-api-key
Response: Top N players (max 100)
```

### Get Player Rank (Protected)
```http
GET /leaderboard/rank
Headers: x-api-key, Authorization
Response: { "rank": 42 }
```

### Get Leaderboard Around Player (Protected)
```http
GET /leaderboard/around-me?range=10
Headers: x-api-key, Authorization
Response: Leaderboard centered on current player
```

### Get Leaderboard Statistics (Public)
```http
GET /leaderboard/stats
Headers: x-api-key
Response: {
  "totalPlayers", "averageLevel", "highestLevel",
  "mostActivePlayers", ...
}
```

---

## 🎖️ Achievement Routes

### Get All Available Achievements (Public)
```http
GET /achievements/all
Headers: x-api-key
Response: Array of all achievements with descriptions
```

### Get User Achievements (Protected)
```http
GET /achievements
Headers: x-api-key, Authorization
Response: Array of unlocked achievements
```

### Get Achievement Progress (Protected)
```http
GET /achievements/progress
Headers: x-api-key, Authorization
Response: {
  "unlocked": [...],
  "total": 12,
  "unlockedCount": 5,
  "progress": { "tokens", "playtime", "perfectLevels", ... }
}
```

---

## 💬 Community Routes

### Get Community Posts (Public)
```http
GET /community/posts?limit=20&offset=0
Headers: x-api-key
Response: {
  "posts": [{ "id", "content", "likes", "user", "comments", ... }],
  "pagination": { ... }
}
```

### Create Post (Protected)
```http
POST /community/posts
Headers: x-api-key, Authorization
Body: { "content": "Great game! Just beat level 50!" }
Response: Created post object
```

### Get Single Post (Public)
```http
GET /community/posts/:postId
Headers: x-api-key
Response: Post with all comments
```

### Update Post (Protected - Owner Only)
```http
PUT /community/posts/:postId
Headers: x-api-key, Authorization
Body: { "content": "Updated content" }
Response: Updated post object
```

### Delete Post (Protected - Owner Only)
```http
DELETE /community/posts/:postId
Headers: x-api-key, Authorization
Response: { "message": "Post deleted successfully" }
```

### Like Post (Public)
```http
POST /community/posts/:postId/like
Headers: x-api-key
Response: Updated post with new like count
```

### Add Comment (Protected)
```http
POST /community/posts/:postId/comments
Headers: x-api-key, Authorization
Body: { "content": "Nice job!" }
Response: Created comment object
```

### Delete Comment (Protected - Owner Only)
```http
DELETE /community/comments/:commentId
Headers: x-api-key, Authorization
Response: { "message": "Comment deleted successfully" }
```

### Get User's Posts (Protected)
```http
GET /community/my-posts?limit=10
Headers: x-api-key, Authorization
Response: Array of user's posts
```

---

## 🎨 Skins Routes

### Get Available Skins (Public)
```http
GET /skins/available
Headers: x-api-key
Response: {
  "success": true,
  "data": [
    { "id": "default", "name": "Default", "tokenCost": 0, "isDefault": true },
    { "id": "ninja", "name": "Code Ninja", "tokenCost": 500 },
    { "id": "wizard", "name": "Algorithm Wizard", "tokenCost": 1000 },
    ...
  ]
}
```

### Get User's Owned Skins (Protected)
```http
GET /skins
Headers: x-api-key, Authorization
Response: {
  "success": true,
  "data": [
    { "id", "userId", "skinId", "purchasedAt", "purchasedWithTokens" }
  ]
}
```

### Purchase Skin (Protected)
```http
POST /skins/purchase
Headers: x-api-key, Authorization
Body: {
  "skinId": "ninja",
  "tokenCost": 500
}
Response: {
  "success": true,
  "data": {
    "skin": { "id", "userId", "skinId", "purchasedAt", "purchasedWithTokens" },
    "progress": { "totalTokens": 1500, ... }
  }
}
```

### Equip Skin (Protected)
```http
POST /skins/equip
Headers: x-api-key, Authorization
Body: {
  "skinId": "ninja"
}
Response: {
  "success": true,
  "data": { "equippedSkin": "ninja", ... }
}
```

### Check Skin Ownership (Protected)
```http
GET /skins/:skinId/owned
Headers: x-api-key, Authorization
Response: {
  "success": true,
  "data": { "owned": true }
}
```

---

## 📈 Analytics Routes (Public)

### Increment Downloads
```http
POST /analytics/downloads/increment
Headers: x-api-key
Response: { "totalDownloads": 1234, "lastIncrement": "..." }
```

### Get Download Stats
```http
GET /analytics/downloads
Headers: x-api-key
Response: { "totalDownloads": 1234 }
```

### Get Platform Stats
```http
GET /analytics/platform
Headers: x-api-key
Response: {
  "totalUsers", "totalDownloads", "totalLevelsCompleted",
  "activePlayersToday", "activePlayersThisWeek", ...
}
```

### Get Level Stats
```http
GET /analytics/levels
Headers: x-api-key
Response: Array of level statistics (completions, avg time, etc.)
```

### Get Engagement Metrics
```http
GET /analytics/engagement
Headers: x-api-key
Response: {
  "dailyActiveUsers", "weeklyActiveUsers",
  "retentionRate", "newUsersThisWeek", ...
}
```

---

## 🎮 Game Session Routes (Protected)

### Start Game Session
```http
POST /sessions/start
Headers: x-api-key, Authorization
Response: { "id", "userId", "startedAt" }
```

### End Game Session
```http
POST /sessions/:sessionId/end
Headers: x-api-key, Authorization
Body: {
  "levelsPlayed": 3,
  "tokensEarned": 450
}
Response: Session with duration calculated
```

### Get User's Sessions
```http
GET /sessions?limit=10
Headers: x-api-key, Authorization
Response: Array of user's game sessions
```

### Get Active Session
```http
GET /sessions/active
Headers: x-api-key, Authorization
Response: Current active session or null
```

### Get Session Statistics
```http
GET /sessions/stats
Headers: x-api-key, Authorization
Response: {
  "totalSessions", "totalPlayTime", "averageSessionDuration",
  "totalLevelsPlayed", "longestSessionDuration", ...
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Achievement IDs

Available achievements:
- `first_level` - Complete your first level
- `level_10` - Reach level 10
- `level_25` - Reach level 25
- `level_50` - Reach level 50
- `level_100` - Complete all 100 levels
- `speed_demon` - Complete a level in under 30 seconds
- `perfectionist` - Complete 10 levels without hints
- `token_collector` - Earn 1,000 tokens
- `token_master` - Earn 5,000 tokens
- `no_hints` - Complete 5 levels without hints in a row
- `marathon` - Play for 1 hour total
- `dedicated` - Play for 10 hours total
