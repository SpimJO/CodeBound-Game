# CodeBound Project Structure

## 📁 Project Folders Overview

```
d:\projects\6-codebound\
├── codebound-frontend/     # Landing Page (React/Next.js)
├── codebound-backend/      # API Server (Node.js + Express + MySQL)
└── codebound-game/         # Unity Game (C# + PlayerPrefs + API calls)
```

---

## 🌐 codebound-frontend (Landing Page)

**Technology:** React/Next.js + TailwindCSS

**Purpose:** Public-facing website to showcase game and community

**Features Implemented:**

### 1.2 Basic Overview of the System
- Hero section with game description
- Feature highlights
- Screenshots/images
- **Data Source:** Hardcoded content

### 1.3 Download Link
- Download button for game installer
- Platform selection (Windows, macOS, Android, iOS)
- Increment download counter on click
- **API Call:** `POST /api/v1/downloads/increment`

### 1.4 Community Hub
- Display recent posts from players
- Like and comment functionality
- Login required to post/comment
- **API Calls:**
  - `GET /api/v1/community/posts` (view posts)
  - `POST /api/v1/community/posts` (create post - auth required)
  - `POST /api/v1/community/posts/:id/like` (like post)
  - `POST /api/v1/community/posts/:id/comments` (add comment - auth required)

### 1.5 Game Trailer
- Embedded YouTube video
- **Data Source:** Hardcoded video URL

### 1.6 FAQs
- Frequently Asked Questions accordion
- **Data Source:** Hardcoded Q&A content

### 1.7 Leaderboard
- Top 100 players ranked by:
  1. Highest Level Reached
  2. Total Tokens
  3. Achievement Count
- **API Call:** `GET /api/v1/leaderboard?limit=100`

**Additional Features:**
- User login/register forms
- Responsive design
- SEO optimization

**Pages:**
```
/                    # Home page (all features above)
/leaderboard         # Full leaderboard page (with pagination)
/community           # Community hub page
/login               # Login page
/register            # Register page
```

---

## 🔧 codebound-backend (API Server)

**Technology:** Node.js + Express + TypeScript + Prisma + MySQL

**Purpose:** Middleman between frontend/game and database

**Architecture:**
```
src/
├── config/           # App configuration
├── db/              # Database connections (prisma.ts)
├── gen/             # Key generation utilities
├── lib/             # Core libraries (Api, baseRouter, token, apiKey)
├── middleware/      # Express middleware (auth, apiKey, rateLimiter)
├── network/
│   ├── controllers/ # Business logic
│   │   ├── auth.controller.ts
│   │   ├── progress.controller.ts
│   │   ├── achievement.controller.ts
│   │   ├── skin.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   ├── community.controller.ts
│   │   └── analytics.controller.ts
│   ├── routes/      # Route definitions
│   │   ├── auth.route.ts
│   │   ├── progress.route.ts
│   │   ├── achievement.route.ts
│   │   ├── skin.route.ts
│   │   ├── leaderboard.route.ts
│   │   ├── community.route.ts
│   │   └── analytics.route.ts
│   └── index.ts     # Main router registration
├── types/           # TypeScript definitions
├── utils/           # Utility functions
├── index.ts         # Express app configuration
└── server.ts        # Server entry point
```

**Database Models:**
```
User                  # User accounts (email, password, username)
UserProgress          # Game progress (currentLevel, totalTokens, etc.)
LevelCompletion       # Level completion history
UserAchievement       # Unlocked achievements
UserSkin              # Owned skins
Leaderboard           # Pre-computed rankings
CommunityPost         # User posts
CommunityComment      # Post comments
DownloadCounter       # Download tracking
GameSession           # Play session analytics
```

**API Endpoints:**

### Authentication
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Login and get auth token
- `GET /api/v1/auth/me` - Get current user info (auth required)

### Game Progress
- `GET /api/v1/progress` - Get user progress (auth required)
- `POST /api/v1/progress/sync` - Sync progress from game (auth required)
- `POST /api/v1/levels/:number/complete` - Submit level completion (auth required)

### Achievements
- `GET /api/v1/achievements/unlocked` - Get unlocked achievements (auth required)
- `POST /api/v1/achievements/:id/unlock` - Unlock achievement (auth required)

### Skins
- `GET /api/v1/skins/owned` - Get owned skins (auth required)
- `POST /api/v1/skins/:id/purchase` - Purchase skin (auth required)
- `PUT /api/v1/progress/equip-skin` - Equip skin (auth required)

### Leaderboard
- `GET /api/v1/leaderboard` - Get top players (public)
- `GET /api/v1/leaderboard/me` - Get current user's rank (auth required)

### Community
- `GET /api/v1/community/posts` - Get posts (public)
- `POST /api/v1/community/posts` - Create post (auth required)
- `POST /api/v1/community/posts/:id/like` - Like post (auth required)
- `GET /api/v1/community/posts/:id/comments` - Get comments (public)
- `POST /api/v1/community/posts/:id/comments` - Add comment (auth required)

### Analytics
- `GET /api/v1/downloads/count` - Get download count (public)
- `POST /api/v1/downloads/increment` - Increment download counter (public)
- `GET /api/v1/stats/players` - Get total player count (public)
- `POST /api/v1/sessions/start` - Start game session (auth required)
- `PUT /api/v1/sessions/:id/end` - End game session (auth required)

**Security:**
- API Key validation middleware
- JWT-like auth token (CipherToken encryption)
- Rate limiting (in-memory store)
- Password hashing (bcrypt)

---

## 🎮 codebound-game (Unity Game)

**Technology:** Unity 2D + C# + PlayerPrefs + UnityWebRequest

**Purpose:** Full game experience with 100 Java programming levels

**Features Implemented:**

### 1.1 Core Gameplay

#### 1.1.1 Puzzle Solving
- 100 unique programming puzzles
- Players write Java code to solve challenges
- Progression from basic to advanced concepts

#### 1.1.2 Level-Based Objectives
- Sequential level unlocking (Level 1 → 2 → 3...)
- Each level has specific learning objectives
- Clear win conditions

#### 1.1.3 Code-Based Interactions
- In-game code editor (Java syntax)
- Terminal for code execution
- Real-time code validation
- Syntax error feedback

#### 1.1.4 Progressive Difficulty
- Levels 1-30: Beginner (variables, operators, input/output)
- Levels 31-70: Intermediate (loops, conditionals, arrays)
- Levels 71-100: Advanced (functions, OOP, algorithms)

#### 1.1.5 2D Interactive Environment
- Pico Park-style 2D platformer
- Character navigation
- Interactive objects tied to code challenges
- Visual feedback for code execution

#### 1.1.6 Sole Programming Language Support (Java)
- Focus on Java fundamentals
- Standard Java syntax
- Java-specific concepts (classes, objects, etc.)

### 1.1.9 Gamification and Customization

#### 1.1.9.1 Tokens
- Earned by completing levels
- Used to purchase hints
- Used to purchase character skins
- Stored locally (PlayerPrefs) + synced to backend

#### 1.1.9.2 Achievements
- Milestone-based rewards (e.g., "Complete 10 levels")
- Performance-based (e.g., "Complete level without hints")
- Time-based (e.g., "Complete level under 60 seconds")
- Unlocking grants bonus tokens
- Stored locally + synced to backend

#### 1.1.9.3 Character Skins
- One character with multiple cosmetic skins
- Skins purchased with tokens
- Default skin (Student) is free
- Premium skins: Ninja, Wizard, Robot, etc.
- Skins stored as Unity assets, ownership tracked in backend

**Game Architecture:**

```
Assets/
├── Scripts/
│   ├── Managers/
│   │   └── GameManager.cs (Singleton, dependency injection)
│   ├── Models/
│   │   ├── LevelData.cs
│   │   ├── AchievementData.cs
│   │   ├── SkinData.cs
│   │   └── PlayerProgress.cs
│   ├── Services/
│   │   ├── APIService.cs (HTTP calls to backend)
│   │   ├── LocalStorageService.cs (PlayerPrefs wrapper)
│   │   ├── AchievementService.cs
│   │   └── ProgressService.cs
│   ├── UI/
│   │   ├── MenuManager.cs
│   │   ├── LevelSelectUI.cs
│   │   ├── ShopUI.cs
│   │   └── LeaderboardUI.cs
│   ├── Gameplay/
│   │   ├── PlayerController.cs
│   │   ├── CodeEditor.cs
│   │   ├── Terminal.cs
│   │   └── LevelManager.cs
│   └── Utils/
│       ├── CodeValidator.cs
│       └── JavaCompiler.cs
├── Resources/
│   ├── Levels/ (JSON files for 100 levels)
│   ├── Achievements/ (Achievement definitions)
│   └── Skins/ (Skin prefabs and metadata)
└── Scenes/
    ├── MainMenu.unity
    ├── LevelSelect.unity
    ├── Gameplay.unity
    ├── Shop.unity
    └── Settings.unity
```

**Local Storage (PlayerPrefs):**
```csharp
// Progress
"currentLevel": 25
"highestLevel": 25
"totalTokens": 1250
"totalPlayTime": 3600.0
"equippedSkin": "ninja"

// Settings
"musicVolume": 0.7
"sfxVolume": 0.8

// Cached data (JSON strings)
"levelCompletions": [{levelNumber: 1, stars: 3, ...}, ...]
"unlockedAchievements": ["first_level", "speed_demon", ...]
"ownedSkins": ["default", "ninja", "wizard"]
```

**API Integration:**
```csharp
// On game start
1. Login/Register → GET auth token
2. GET /api/v1/progress → load cloud progress
3. Merge with local cache

// During gameplay
1. Complete level → POST /api/v1/levels/:number/complete
2. Unlock achievement → POST /api/v1/achievements/:id/unlock
3. Purchase skin → POST /api/v1/skins/:id/purchase

// On game exit
1. POST /api/v1/sessions/:id/end
2. Save final state to PlayerPrefs
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────┐
│    LANDING PAGE (codebound-frontend)    │
│                                         │
│  User Actions:                          │
│  - View leaderboard                     │
│  - View community posts                 │
│  - Click download                       │
│  - Login/Register                       │
│  - Post in community                    │
└──────────────┬──────────────────────────┘
               │
               │ REST API (JSON)
               │ Headers: api-key, Authorization
               │
┌──────────────▼──────────────────────────┐
│     BACKEND (codebound-backend)         │
│                                         │
│  Controllers:                           │
│  - Validate request                     │
│  - Authenticate user (if needed)        │
│  - Query database (Prisma)              │
│  - Process business logic               │
│  - Return JSON response                 │
└──────────────┬──────────────────────────┘
               │
               │ SQL queries via Prisma
               │
┌──────────────▼──────────────────────────┐
│         DATABASE (MySQL)                │
│                                         │
│  Tables:                                │
│  - users, user_progress                 │
│  - level_completions, user_achievements │
│  - user_skins, leaderboard              │
│  - community_posts, community_comments  │
│  - download_counter, game_sessions      │
└─────────────────────────────────────────┘
               ▲
               │
               │ REST API (JSON)
               │ Headers: api-key, Authorization
               │
┌──────────────┴──────────────────────────┐
│       GAME (codebound-game)             │
│                                         │
│  Unity C# Scripts:                      │
│  - APIService.cs → HTTP calls           │
│  - GameManager.cs → orchestrate all     │
│  - PlayerPrefs → local cache            │
│                                         │
│  Player Actions:                        │
│  - Login/Register                       │
│  - Complete level                       │
│  - Unlock achievement                   │
│  - Purchase skin                        │
│  - Submit score to leaderboard          │
└─────────────────────────────────────────┘
```

---

## 🚀 Development Workflow

### 1. Backend Development (Current Phase)
```bash
cd codebound-backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Frontend Development
```bash
cd codebound-frontend
npm install
npm run dev
# Access at http://localhost:5173
```

### 3. Unity Game Development
```bash
# Open Unity Hub
# Add project: d:\projects\6-codebound\codebound-game
# Open in Unity Editor
# Configure API_BASE_URL in APIConfig.cs
# Build for target platform
```

---

## 📝 Current Status

### ✅ Completed:
- Backend setup (Node.js + Express + Prisma)
- Database schema design
- Documentation (MODELS_LOGIC.md, ARCHITECTURE.md, etc.)

### ⏳ In Progress:
- Push Prisma schema to database
- Create backend controllers
- Implement API endpoints

### 📌 Next Steps:
1. Push schema to MySQL database
2. Create controllers for all endpoints
3. Test API endpoints with Postman
4. Implement Unity API integration
5. Build landing page components
6. Deploy backend API
7. Deploy landing page
8. Build and distribute game

---

## 🎯 Project Goals Summary

**Landing Page Goal:**
Attract players, showcase top performers, build community

**Backend Goal:**
Provide reliable API for authentication, progress sync, and data management

**Game Goal:**
Deliver engaging, educational Java programming experience through 100 challenging levels

**Together:**
Create a complete ecosystem where players can learn Java, compete on leaderboards, and share achievements with the community!
