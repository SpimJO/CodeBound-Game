# Ano ang Nasa Code na vs Ano ang Sa Unity Mo (Designs, Sounds, Images)

**Short answer:**  
- **Logic / system / API calls** = nasa **C# code na** (tapos na).  
- **Designs, sounds, images** = **sa Unity** (ikaw bahala: placeholders muna, o palitan ng art + SFX).  
- **Backend** = **hiwalay na process** (Node/Express). **C# sa Unity** lang ang tumatakbo sa Unity; yung C# ang tumatawag sa backend over HTTP. So kailangan **both**: backend naka-run + Unity naka-Play.

---

## 1. Saan tumatakbo ang code? Kasama ba backend sa Unity?

| Part | Saan tumatakbo | Ano ginagawa |
|------|----------------|--------------|
| **Backend** (Node/Express, Prisma) | **Hiwalay** – terminal: `cd codebound-backend` then `npm run dev` | Database, auth, progress, leaderboard, community, analytics. Naghihintay ng HTTP requests. |
| **C# (game logic, API calls)** | **Sa Unity lang** – kapag nag-Press Play ka sa Unity Editor (or build .exe) | Movement, UI, code validation, **tumatawag sa backend** via `APIService` (login, progress, leaderboard, etc.). |
| **Frontend (React)** | Optional – hiwalay: `npm run dev` sa codebound-frontend | Website (leaderboard, community, download count). Hindi kasama sa Unity. |

So:
- **Unity = C# lang** ang “code na tumatakbo” sa loob ng game. Walang backend inside Unity.
- **Backend = separate.** Dapat naka-run (`npm run dev`) para ang C# may tatawagan.
- **I-run mo:** (1) Backend sa terminal, (2) Unity Editor → Play. Same machine o kung nasa same network, pwede backend sa isang PC at Unity sa isa pa (palitan mo lang `BASE_URL` sa `APIConfig.cs`).

---

## 2. Ano ang “meron na” (code) vs “ikaw pa sa Unity” (setup + design)

### Nasa code na (hindi mo na i-code ulit)

- **Backend (codebound-backend):** Auth, progress, leaderboard, community, analytics, DB (Prisma).  
- **Game C#:**  
  - API: `APIService`, `APIConfig`, `AuthService`, progress/leaderboard calls.  
  - Gameplay: `PlayerController`, `LevelManager`, `CodeTerminal`, `PaperInteractable`, `PCStationInteractable`, `DoorController`, `TokenCollectible`, `LevelExit`, etc.  
  - Managers: `GameManager`, `LevelManager`, `SaveManager`, `SkinManager`, etc.  

So **function ng system** (logic, API integration) – **meron na**. Ang kailangan mo sa Unity ay **setup at content**, hindi bagong logic (unless may feature ka pang idadagdag).

### Sa Unity mo pa i-set up (steps sa Editor)

- **Scenes sa Build Settings** – isama ang MainMenu, CharacterSelect, LevelSelect, at kung may Level_001.  
- **GameObjects** – Player, Paper, PCStation, Door, Tokens, Portal, etc. (kung wala pa sa scene).  
- **Components** – Sprite Renderer, Collider 2D, Rigidbody 2D kung saan kailangan.  
- **Script assignment** – i-add ang tamang script sa tamang object (e.g. Player → `PlayerController`, Door → `DoorController`).  
- **References (drag-drop)** – kritikal: Paper → Challenge Panel / texts / buttons; PCStation → Code Terminal; CodeTerminal → Level Door, InputField, Run/Clear/Hint/Exit buttons; etc.  

Lahat yan **steps sa Unity Editor**, hindi bagong C#. Guide: **HOW_TO_CONNECT_SCRIPTS.md**.

### Designs, sounds, images – ikaw bahala

- **Images/sprites:** Pwede placeholder muna (colored quads/sprites). Pag gusto mo final look: use **IMAGE_PROMPTS.md** o **ASSET_SOURCES.md** (OpenGameArt, Kenney, itch, etc.) then import PNG sa Unity at i-assign sa Sprite Renderer / UI Image.  
- **Sounds:** Bfxr/sfxr → Export WAV → `Assets/Audio/SFX/` → sa Unity i-assign sa `AudioSource` o sa audio manager mo.  
- **Layout / feel:** Positions, scales, colors, animations – lahat sa Unity (Inspector, Scene view).  

So **Unity = designs + sounds + images + wiring ng existing code** sa scenes. Code ng system, meron na.

---

## 3. Checklist: Ano sa Unity ang kailangan mo pa i-set up

- [ ] **Open project** – Unity Hub → Add → codebound-game folder → Open.  
- [ ] **Build Settings** – File → Build Settings → Scenes In Build: MainMenu (index 0), CharacterSelect, LevelSelect, Level_001 (kung meron).  
- [ ] **APIConfig** – `BASE_URL` at `API_KEY` same sa backend (para tumawag sa tamang server).  
- [ ] **Per scene:**  
  - [ ] Create/place GameObjects (Player, Paper, PCStation, Door, Tokens, Portal, etc.).  
  - [ ] Add components (Sprite Renderer, Colliders, Rigidbody kung kailangan).  
  - [ ] Add scripts (PlayerController, PaperInteractable, PCStationInteractable, DoorController, CodeTerminal, etc.).  
  - [ ] **Drag references** (Paper ↔ UI; PCStation ↔ Code Terminal; CodeTerminal ↔ Door + InputField + buttons).  
- [ ] **Managers** – GameManager, LevelManager, etc. sa hierarchy at naka-assign ang script.  
- [ ] **Design (optional):** Replace placeholders with sprites from IMAGE_PROMPTS / ASSET_SOURCES.  
- [ ] **Sound (optional):** Bfxr WAVs sa `Assets/Audio/SFX/`, assign sa events (jump, collect, door, etc.).  

Code (C# at backend) – **hindi na kasama dito**; yan na yung “meron na”. Ang “need mo pa sa Unity” = **setup ng scenes + references + designs + sounds/images**.

---

## 4. One-sentence summary

- **Backend** = hiwalay, i-run mo sa terminal (`codebound-backend`).  
- **C#** = tumatakbo **lang sa Unity** (Editor Play o built game); yan ang nagca-call sa backend.  
- **Sa Unity ikaw bahala:** scene setup, drag references, **designs (images)**, **sounds**; yung **logic at API** nasa code na.
