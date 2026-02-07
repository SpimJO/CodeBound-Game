# CodeBound - Educational Coding Platformer

## 🎮 **2D Platformer + Java Learning**

100 levels teaching Java programming. Write code → Door unlocks → Complete level!

---

## 🚀 **KAILANGAN MO LANG BASAHIN (setup + connect + prompts):**

### **Setup at backend**
- **[UNITY_FULL_SYSTEM_SETUP.md](UNITY_FULL_SYSTEM_SETUP.md)** – Backend + Unity + Build Settings + API config. Start here.
- **[UNITY_WHAT_YOU_SETUP.md](UNITY_WHAT_YOU_SETUP.md)** – Ano nasa code na vs ano sa Unity (designs, sounds, images).

### **Connect scripts sa Unity**
- **[HOW_TO_CONNECT_SCRIPTS.md](HOW_TO_CONNECT_SCRIPTS.md)** – Paano i-drag references (Door, Terminal, Paper, UI). Critical.
- **[UNITY_SCENE_BUILD_GUIDE.md](UNITY_SCENE_BUILD_GUIDE.md)** – Build Level 1: GameObjects, components, UI.
- **[LEVEL_1_QUICK_CHECKLIST.md](LEVEL_1_QUICK_CHECKLIST.md)** – Quick checklist para Level 1.

### **Prompts at assets (character, sprites, sounds)**
- **[IMAGE_PROMPTS.md](IMAGE_PROMPTS.md)** – Prompts para sa character at UI (DALL-E / ideogram).
- **[ASSET_SOURCES.md](ASSET_SOURCES.md)** – Free assets: OpenGameArt, Kenney, GitHub, Bfxr (sounds).
- **Assets/Sprites/_BING_PROMPTS/** – Per-file .txt prompts (01_character_default.txt, etc.) + WHERE_TO_SAVE.md, HOW_TO_REPLACE.md.

---

## ⚡ **QUICK START:**

```
1. Backend: cd codebound-backend → npx prisma db push → npm run dev
2. Unity: Open project (codebound-game folder) → Build Settings: add scenes
3. Follow HOW_TO_CONNECT_SCRIPTS.md → connect Door, Terminal, Paper, UI
4. Prompts: use IMAGE_PROMPTS.md or _BING_PROMPTS/*.txt → import sprites
5. Press PLAY (backend dapat naka-run)
```

---

## 🎯 **Ano meron:**

### **100 Progressive Levels**
- **Levels 1-10**: Introduction (Print statements, variables)
- **Levels 11-25**: Basics (Loops, conditionals, arrays)
- **Levels 26-50**: Intermediate (Methods, recursion, sorting)
- **Levels 51-75**: Advanced (Data structures, dynamic programming)
- **Levels 76-100**: Expert (OOP, algorithms, graphs)

### **In-Game IDE**
- Real syntax highlighting (keywords, strings, numbers)
- Line numbers and code editor
- Basic autocomplete suggestions
- Terminal output display
- Runs actual Java code via backend API

### **Character System**
- 8 unlockable character skins (Metal Slug inspired)
- Earn tokens by completing levels
- Purchase skins: 3000-15000 tokens
- Full customization system

### **Token Economy**
- Earn 150-550 tokens per level
- Speed bonus (complete faster)
- No-hint bonus (solve without help)
- First-try bonus (correct on first attempt)

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────┐
│              UNITY FRONTEND                     │
│  ┌──────────────────────────────────────────┐  │
│  │  Scenes: MainMenu, LevelSelect,          │  │
│  │          CharacterSelect, Level_1-100    │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Scripts:                                 │  │
│  │  - IDEManager.cs (Code editor)           │  │
│  │  - LevelController.cs (Gameplay)         │  │
│  │  - DoorController.cs (Auto-open)         │  │
│  │  - PaperInteractable.cs (Challenges)     │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Services:                                │  │
│  │  - APIService.cs (Backend calls)         │  │
│  │  - AuthService.cs (Login/Register)       │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     ↕ REST API
┌─────────────────────────────────────────────────┐
│            NODE.JS BACKEND                      │
│  ┌──────────────────────────────────────────┐  │
│  │  Endpoints:                               │  │
│  │  - POST /auth/login                       │  │
│  │  - GET /progress/levels                   │  │
│  │  - POST /progress/complete                │  │
│  │  - POST /java/execute (Code runner)       │  │
│  │  - GET /skins/all                         │  │
│  │  - POST /skins/purchase                   │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  MySQL Database (Prisma ORM)             │  │
│  │  - Users, Progress, Skins, Achievements  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 📂 **Project Structure**

```
codebound-game/
├── Assets/
│   ├── Scenes/
│   │   ├── Core/           # MainMenu, LevelSelect, CharacterSelect
│   │   └── Levels/         # Level_001 to Level_100
│   ├── Scripts/
│   │   ├── Controllers/    # Level, Door, Paper controllers
│   │   ├── Managers/       # IDE, Game, Level managers
│   │   ├── Services/       # API, Auth services
│   │   └── Interactables/  # Paper, PC, Door scripts
│   ├── Prefabs/
│   │   ├── Gameplay/       # Player, Token, Portal
│   │   ├── Interactables/  # Paper, PCStation, LockedDoor
│   │   └── UI/             # IDE panel, Menus, HUD
│   ├── Sprites/
│   │   ├── Characters/     # 8 character skins
│   │   ├── Environment/    # Platforms, backgrounds
│   │   ├── Interactables/  # Paper, PC, Door sprites
│   │   └── UI/             # Buttons, icons
│   └── Resources/
│       └── LevelData/      # level_001.json to level_100.json
├── HOW_TO_CONNECT_SCRIPTS.md
├── UNITY_FULL_SYSTEM_SETUP.md
├── UNITY_WHAT_YOU_SETUP.md
├── IMAGE_PROMPTS.md
├── ASSET_SOURCES.md
└── README.md
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Unity 2021.3 or newer
- Node.js backend running on localhost:3000
- MySQL database configured

### **Setup Steps**

1. **Clone Repository**
```bash
git clone https://github.com/SpimJO/CodeBound-Game.git
cd CodeBound-Game/codebound-game
```

2. **Open in Unity**
- Open Unity Hub
- Click "Add" → Select `codebound-game` folder
- Open project

3. **Configure API**
- Open `Assets/Scripts/Services/APIConfig.cs`
- BASE_URL = http://localhost:3000/api (must match backend)
- API_KEY = same as codebound-backend .env

4. **Run Backend** (separate terminal)
```bash
cd ../codebound-backend
npm install
npm run dev
```

5. **Play in Unity**
- Open `MainMenu.unity` scene
- Press Play button
- Login with test account or register new user

---

## 📚 **Documentation (lahat nasa root at Assets/Sprites)**

- Setup: UNITY_FULL_SYSTEM_SETUP.md, UNITY_WHAT_YOU_SETUP.md
- Connect: HOW_TO_CONNECT_SCRIPTS.md, UNITY_SCENE_BUILD_GUIDE.md, LEVEL_1_QUICK_CHECKLIST.md
- Art/sound: IMAGE_PROMPTS.md, ASSET_SOURCES.md, Assets/Sprites/_BING_PROMPTS/
- Characters: Assets/Sprites/Characters/CHARACTER_DESIGNS.md, GENERATION_GUIDE.md

---

## 🎨 **Art Style**

- **Characters**: Metal Slug inspired detailed pixel art (64x64)
- **Environment**: Tech dungeon aesthetic with neon accents
- **Color Themes**: 
  - Levels 1-25: Bright cyan (tutorial labs)
  - Levels 26-50: Purple (corporate facility)
  - Levels 51-75: Red/orange (danger zone)
  - Levels 76-100: Matrix green (core processor)

---

## 🛠️ **Technology Stack**

### **Frontend (Unity)**
- Unity 2021.3 LTS
- C# .NET Standard 2.1
- TextMeshPro for UI
- UnityWebRequest for API calls

### **Backend (Node.js)**
- Express.js REST API
- Prisma ORM
- MySQL database
- JWT authentication
- AES-256 encryption

---

## 🎮 **Controls**

| **Key** | **Action** |
|---------|-----------|
| Arrow Keys / WASD | Move player |
| Space | Jump |
| E | Interact (PC Station, Paper) |
| Enter | Run code (in IDE) |
| Escape | Close IDE / Pause |

---

## 🏆 **Progression System**

- Complete Level 1 to unlock Level 2
- Linear progression (must complete previous level)
- Earn tokens based on performance
- Purchase character skins with tokens
- Track best times and scores
- Optional: Achieve 3-star ratings

---

## 📦 **Build & Deploy**

### **Windows Build**
```bash
# In Unity: File → Build Settings
# Platform: PC, Mac & Linux Standalone
# Target: Windows
# Click "Build"
```

### **WebGL Build**
```bash
# In Unity: File → Build Settings
# Platform: WebGL
# Click "Build"
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-levels`)
3. Commit changes (`git commit -m 'Add 10 new levels'`)
4. Push to branch (`git push origin feature/new-levels`)
5. Open Pull Request

---

## 📝 **License**

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 **Credits**

- **Game Design**: SpimJO
- **Programming**: SpimJO
- **Art Style**: Inspired by Metal Slug & Fireboy & Watergirl
- **Backend**: Node.js + Express + Prisma

---

## 📞 **Contact**

- **GitHub**: [@SpimJO](https://github.com/SpimJO)
- **Repository**: [CodeBound-Game](https://github.com/SpimJO/CodeBound-Game)

---

**Made with ❤️ for learning Java through gaming**