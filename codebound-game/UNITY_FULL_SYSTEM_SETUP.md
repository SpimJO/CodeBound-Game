# CodeBound - Full System Setup (Backend + Game sa Unity)

**Goal:** I-run ang buong system: backend API, frontend web, at Unity game na connected sa backend.

---

## Ano ang kaya at hindi kaya i-generate

- **Kaya:** Lahat ng C# scripts, config, at docs (nandito na sa repo). Pwede i-update ang scripts at i-add ang image prompts para sa assets.
- **Hindi kaya:** Ang Unity Editor mismo (install at run sa iyo). Ang mga `.unity` scene files ay may internal GUIDs at references na kailangan i-link sa loob ng Editor (drag-drop). Pwede mong i-open ang project sa Unity at i-follow ang guides para ma-wire lahat.

**So:** I-open mo ang `codebound-game` folder sa Unity Editor, i-connect ang references (HOW_TO_CONNECT_SCRIPTS.md), tapos Play. Backend at API config ay naka-fix na para tumugma sa codebound-backend.

---

## 1. One-time: Backend at database

```bash
# Terminal 1 - Backend
cd codebound-backend
npx prisma generate
npx prisma db push
npm run dev
```

- Backend: `http://localhost:3000`
- API: `http://localhost:3000/api` (walang /v1)
- Siguraduhin ang `API_KEY` sa backend `.env` ay **same** sa game (APIConfig.cs).

---

## 2. One-time: Unity project

1. **Open sa Unity**
   - Unity Hub → Add → piliin ang folder: `d:\projects\5-codebound\codebound-game`
   - Open Project (Unity 2021.3 LTS o newer recommended).

2. **Scenes sa Build Settings**
   - File → Build Settings → Scenes In Build
   - Add Open Scenes, o i-drag:
     - `Assets/Scenes/Core/MainMenu.unity`
     - `Assets/Scenes/Core/CharacterSelect.unity`
     - `Assets/Scenes/Core/LevelSelect.unity`
     - (Kung may Level_001) `Assets/Scenes/Levels/Level_001.unity`
   - MainMenu dapat nasa index 0 (first scene).

3. **API config (game → backend)**
   - Na-update na: `Assets/Scripts/Services/APIConfig.cs`
   - `BASE_URL = "http://localhost:3000/api"` (no v1)
   - `API_KEY` = same value sa `codebound-backend/.env` (API_KEY)
   - Kung iba ang port o URL mo, edit `APIConfig.cs` (BASE_URL at API_KEY).

---

## 3. Per-scene: I-connect ang scripts (kung hindi pa)

- **MainMenu / LevelSelect / CharacterSelect:** Follow **HOW_TO_CONNECT_SCRIPTS.md** para sa:
  - Player → PlayerController
  - Paper → PaperInteractable + UI references
  - PCStation → Code Terminal reference
  - Door → DoorController
  - CodeTerminal → Level Door + Input/Output/Buttons
  - Managers (GameManager, LevelManager, etc.)
- **Level 1 (kung wala pa):** Follow **UNITY_SCENE_BUILD_GUIDE.md** para gumawa ng Level_001 at i-connect lahat.

---

## 4. I-run ang full system

1. **Backend:** `npm run dev` sa `codebound-backend` (naka-run na).
2. **Frontend (optional):** `npm run dev` sa `codebound-frontend` para sa web.
3. **Unity:** Press Play sa Editor. Dapat:
   - Main menu loads
   - Login/Register (kung naka-wire) tumawag sa `http://localhost:3000/api/auth/...`
   - Progress/leaderboard (kung naka-wire) tumawag sa `/api/progress`, `/api/leaderboard`, etc.

---

## 5. Assets: AI prompts o free sources (OpenGameArt, GitHub, Bfxr)

- **IMAGE_PROMPTS.md** – prompts para sa DALL-E/ideogram (character, UI, tiles, icons). Generate PNG -> import sa Unity.
- **ASSET_SOURCES.md** – free sources:
  - **OpenGameArt.org** (CC0 platformer, sprites, tiles) – links to download
  - **GitHub** (e.g. Liberated Pixel Cup, SpritePak) – clone or Download ZIP
  - **Kenney.nl** (CC0 platformer packs) – download ZIP
  - **itch.io** (CC0/free sprites)
  - **Bfxr** (https://www.bfxr.net/) – sound effects, Export WAV -> save to `Assets/Audio/SFX/`
- **FetchFreeAssets.ps1** – one run: creates folders (`Assets/Sprites/Imported/...`, `Assets/Audio/SFX`). Then download manually from ASSET_SOURCES.md links.

---

## Quick checklist

- [ ] Backend running (`npm run dev`), DB migrated (`prisma db push`)
- [ ] Unity project open (codebound-game folder)
- [ ] Build Settings: MainMenu, CharacterSelect, LevelSelect (at Level_001 kung meron)
- [ ] APIConfig.cs: BASE_URL at API_KEY match sa backend
- [ ] Script references connected (HOW_TO_CONNECT_SCRIPTS.md)
- [ ] Press Play sa Unity → main menu at (kung naka-setup) API calls 200

Pag lahat naka-check, mapagana mo na ang buong system (backend + game sa Unity); frontend ay optional para sa web.
