# Free Assets - OpenGameArt, GitHub, Bfxr/Sfxr

**Goal:** Kumuha ng free images (sprites, tiles, UI) at sounds (Bfxr/sfxr) from other sources, then i-implement sa CodeBound. Pwede manual download o one-run script.

---

## 1. Saan kumuha ng images (free, various licenses)

### OpenGameArt.org (CC0 / CC-BY)

- **CC0 Platformer collection** (maraming tiles at sprites, one page):
  - https://opengameart.org/content/cc0-platformer
  - Click each "Collected Art" item -> Download. Save sa `Assets/Sprites/Imported/OpenGameArt/`.
- **CC0 2D Platform Creatures & Characters:**
  - https://opengameart.org/content/cc0-2d-platform-creatures-characters
- **16x16 Dungeon Tiles (NES style):**
  - https://opengameart.org/content/16x16-dungeon-tiles-nes-remake
- **Platformer sprites (robot, controls):**
  - https://opengameart.org/content/platformer-sprites
- **Advanced search (2D + CC0):**
  - https://opengameart.org/art-search-advanced?field_art_type_tid[]=9&field_art_license_tid[]=5
  - Filter: 2D Art, License CC0. Then download from each asset page.

**License:** Check per asset (CC0 = no attribution required; CC-BY = credit author). Keep a CREDITS.txt in project if needed.

---

### GitHub (clone or Download ZIP)

- **Liberated Pixel Cup (LPC) – sprites & tiles:**
  - https://github.com/OpenGameArt/LiberatedPixelCup
  - Clone or "Code -> Download ZIP". Copy needed PNGs to `Assets/Sprites/Imported/GitHub/LiberatedPixelCup/`.
- **SpritePak (winter/ice, CC3.0):**
  - https://github.com/imtumbleweed/SpritePak
  - Download ZIP, extract to `Assets/Sprites/Imported/GitHub/SpritePak/`.

**License:** Check repo (GPL, CC-BY-SA, etc.). Only use in project if license matches your use (e.g. open-source).

---

### Kenney.nl (CC0, very permissive)

- **All assets:**
  - https://kenney.nl/assets
- **Platformer Pack Redux (tiles, characters):**
  - https://kenney.nl/assets/platformer-pack-redux
- **Platformer Kit:**
  - https://www.kenney.nl/assets/platformer-kit

Click "Download" on the asset page (ZIP). Extract to e.g. `Assets/Sprites/Imported/Kenney/`. CC0 = use freely, attribution optional but nice.

---

### itch.io (CC0 / free)

- **CC0 game assets (sprites):**
  - https://itch.io/game-assets/assets-cc0/tag-sprites
- **Free game assets:**
  - https://itch.io/game-assets/free

Download from each asset page. Save into `Assets/Sprites/Imported/Itch/` (or subfolder by pack name).

---

## 2. Sound effects – Bfxr / Sfxr

### Bfxr (recommended)

- **Site:** https://www.bfxr.net/
- **Use:** Pickup/Coin, Jump, Hit/Hurt, Powerup, Blip/Select, etc. -> tweak -> **Export WAV** (Ctrl+E or Export WAV button).
- **Where in Unity:** Put `.wav` files in `Assets/Audio/SFX/` (create folder if needed). Import as Audio Clip; use with `AudioSource` or your own audio manager.
- **Rights:** You keep full rights; use in commercial or non-commercial games.

### Sfxr (original, simpler)

- **Online:** https://sfxr.me/ or search "sfxr generator".
- **Use:** Same idea – pick preset, mutate, export WAV. Put WAVs in `Assets/Audio/SFX/`.

**Suggested sounds for CodeBound:**

- Coin/token collect
- Jump
- Door open
- Terminal open/close
- Button click (UI)
- Level complete / portal
- Error (wrong code)

Generate each in Bfxr, export WAV, drop into `Assets/Audio/SFX/`, then assign in Unity.

---

## 3. Folder structure sa Unity project (where to put what)

Use this so lahat ng “kinuha sa iba” naka-organize:

```
Assets/
├── Sprites/
│   ├── _BING_PROMPTS/          (existing – your AI prompts)
│   ├── Characters/             (existing – your designs)
│   ├── Environment/            (existing)
│   ├── Collectibles/           (existing)
│   └── Imported/               (NEW – from other sources)
│       ├── OpenGameArt/
│       ├── GitHub/
│       ├── Kenney/
│       └── Itch/
├── Audio/                      (NEW if wala pa)
│   ├── SFX/                    (Bfxr/sfxr WAVs here)
│   └── Music/                  (optional)
```

After download: drag into correct folder in Unity; set Texture Type = Sprite (2D and UI) for images; leave Audio as default or adjust in Import Settings.

---

## 4. “Isang run” – script (create folders + optional clone)

May script na: **`FetchFreeAssets.ps1`** (sa root ng codebound-game).

- Creates `Assets/Sprites/Imported/...` and `Assets/Audio/SFX` if missing.
- Optionally clones one GitHub repo (e.g. a small asset repo) into `Assets/Sprites/Imported/GitHub/`.
- Does **not** auto-download from OpenGameArt/Kenney/itch (those need browser/login). You run the script once, then open the URLs in ASSET_SOURCES.md and download manually into the folders the script created.

So “one run” = run script once (folders + optional clone), then one pass through the links in this doc to download and drop files.

---

## 5. Paano kung “ikaw (AI) kukuha, tapos implement natin”

- **Hindi pwedeng ako mismo ang kumuha:** I can’t browse OpenGameArt/GitHub/itch in real time and save files to your project. I can only generate text (guides, scripts, code).
- **Pwede natin gawin:** (1) This doc + script so **you** do one run (script + manual downloads), (2) **Implementation:** after you drop assets, I can help you wire them in Unity (which sprite to which GameObject, which WAV to which event in code). So: **ikaw kukuha** using this guide; **tayo mag-implement** (steps/code changes) once the files are in the project.

---

## 6. Quick checklist (one-run flow)

1. Run `Scripts/FetchFreeAssets.ps1` (creates folders; optional GitHub clone).
2. Open **OpenGameArt** CC0 Platformer link -> download 2–3 packs -> extract to `Assets/Sprites/Imported/OpenGameArt/`.
3. Open **Kenney** Platformer Pack Redux -> Download -> extract to `Assets/Sprites/Imported/Kenney/`.
4. Open **Bfxr** -> generate 5–7 SFX -> Export WAV -> save to `Assets/Audio/SFX/`.
5. In Unity: drag new sprites into scene/prefabs; assign WAVs to AudioSource or your SFX manager.

Pag na-download na lahat at naka-folder na, pwede na natin i-implement step-by-step (which asset goes where, and code for sounds).
