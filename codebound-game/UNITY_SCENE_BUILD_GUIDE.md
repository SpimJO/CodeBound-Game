# 🎮 UNITY SCENE BUILD GUIDE - LEVEL 1

**Complete step-by-step Unity setup to make game 100% functional!**

---

## 📋 **WHAT WE'RE BUILDING:**

**Goal:** Working Level 1 where player can:
1. Read challenge from Paper
2. Open terminal on PC
3. Type Java code
4. Door unlocks if code correct
5. Collect tokens
6. Enter portal to complete level

**Time:** ~2 hours (with placeholders)

---

## 🚀 **STEP 1: CREATE SCENE (5 minutes)**

### **1.1 - New Scene:**
```
1. In Unity, go to: File → New Scene
2. Choose: "2D" template
3. Save as: Assets/Scenes/Levels/Level_001.unity
```

### **1.2 - Camera Setup:**
```
Select "Main Camera" in Hierarchy:
- Position: (0, 0, -10)
- Size: 5
- Projection: Orthographic
- Background: #003344 (dark cyan)
- Clear Flags: Solid Color
```

### **1.3 - Physics Settings:**
```
Go to: Edit → Project Settings → Physics 2D
- Gravity Y: -20 (stronger gravity for platformer feel)
- Default Material: None
- Auto Sync Transforms: OFF (for performance!)
```

---

## 🎨 **STEP 2: CREATE PLACEHOLDER SPRITES (10 minutes)**

**Since Bing sprites aren't ready yet, we'll use colored shapes!**

### **2.1 - Create Sprites Folder:**
```
Right-click in Project window:
Create → Folder → Name: "_Placeholders"
Location: Assets/Sprites/_Placeholders/
```

### **2.2 - Generate Placeholder PNGs:**

**Method A - Unity Built-in (Easiest!):**
```
For each sprite below, in Hierarchy:
1. Right-click → 2D Object → Sprites → Square
2. Rename (e.g., "PlaceholderCharacter")
3. Select → Inspector → Sprite Renderer:
   - Color: [Set color below]
   - Sorting Layer: [See sorting layers section]
4. Drag from Hierarchy to Project _Placeholders folder (creates prefab)
```

**Colors to use:**
```
Character:      Cyan      #00FFFF   (Player)
Platform:       Gray      #666666   (Ground/platforms)
Paper:          Blue      #0088FF   (Challenge paper)
PC Station:     White     #FFFFFF   (Computer)
Door Locked:    Red       #FF0000   (Locked door)
Door Open:      Green     #00FF00   (Unlocked door)
Portal:         Purple    #AA00FF   (Level exit)
Token:          Gold      #FFD700   (Collectibles)
Background:     Dark Teal #002233   (BG layer)
```

---

## 📦 **STEP 3: CREATE SORTING LAYERS (3 minutes)**

**Critical for proper rendering order!**

```
Go to: Edit → Project Settings → Tags and Layers
Expand "Sorting Layers" section
Click "+" to add layers in this order:
```

```
0. Default
1. Background      (Sky, parallax)
2. Platform        (Ground, walls)
3. Interactables   (Paper, PC, Door, Portal)
4. Player          (Character)
5. Collectibles    (Tokens)
6. UI              (HUD, Terminal)
```

---

## 🏗️ **STEP 4: CREATE GAMEOBJECTS & PREFABS (30 minutes)**

### **4.1 - Setup Empty GameObjects Structure:**

```
In Hierarchy, create this structure:
(Right-click → Create Empty)

Level_001
├─ Environment
│  ├─ Platforms
│  └─ Background
├─ Interactables
│  ├─ Paper
│  ├─ PCStation
│  ├─ Door
│  └─ Portal
├─ Player
├─ Collectibles
│  ├─ Token_1
│  ├─ Token_2
│  ├─ Token_3
│  ├─ Token_4
│  └─ Token_5
└─ Managers
   ├─ GameManager
   ├─ LevelManager
   └─ PerformanceManager
```

---

### **4.2 - PLAYER GameObject:**

```
Select "Player" in Hierarchy:

1. Add Component → Sprite Renderer
   - Sprite: PlaceholderCharacter (cyan square)
   - Sorting Layer: Player
   - Order in Layer: 0

2. Add Component → Box Collider 2D
   - Size: (0.8, 0.9) - slightly smaller than sprite
   - Offset: (0, 0)

3. Add Component → Rigidbody 2D
   - Body Type: Dynamic
   - Mass: 1
   - Linear Drag: 0
   - Angular Drag: 0
   - Gravity Scale: 1
   - Collision Detection: Continuous
   - Constraints: Freeze Rotation Z ✓

4. Add Component → Scripts → PlayerController
   (The one we created with optimized movement!)

5. Set Transform:
   - Position: (-3, -3.5, 0)
   - Rotation: (0, 0, 0)
   - Scale: (1, 1, 1)

6. Create Prefab:
   - Drag Player from Hierarchy to Assets/Prefabs/Gameplay/
   - Name: Player.prefab
```

---

### **4.3 - PLATFORMS (5 pieces):**

**Platform 1 (Ground):**
```
Select "Platforms" parent → Right-click → 2D Object → Sprite → Square

1. Rename: Platform_Ground

2. Sprite Renderer:
   - Sprite: PlaceholderPlatform (gray)
   - Color: #666666
   - Sorting Layer: Platform

3. Add Component → Box Collider 2D
   - Size: Auto (matches sprite)
   - Check: Used By Composite ✓

4. Transform:
   - Position: (-3, -4, 0)
   - Scale: (3, 0.5, 1) - Wide base platform
```

**Platforms 2-5 (Ascending Steps):**
```
Duplicate Platform_Ground 4 times (Ctrl+D)
Rename and adjust:

Platform_Step1:
- Position: (-2, -2, 0)
- Scale: (2, 0.5, 1)

Platform_Step2:
- Position: (-1, 0, 0)
- Scale: (2, 0.5, 1)

Platform_Step3:
- Position: (0, 2, 0)
- Scale: (2, 0.5, 1)

Platform_Step4 (Top):
- Position: (2, 4, 0)
- Scale: (2, 0.5, 1)
```

**Create Platform Prefab:**
```
1. Drag Platform_Ground to Assets/Prefabs/Gameplay/Platform.prefab
2. Other platforms use same prefab (just different transforms)
```

---

### **4.4 - PAPER (Challenge Display):**

```
Select "Paper" in Hierarchy:

1. Add Component → Sprite Renderer
   - Sprite: PlaceholderPaper (blue square)
   - Color: #0088FF
   - Sorting Layer: Interactables

2. Add Component → Box Collider 2D
   - Size: (1, 1)
   - Is Trigger: ✓ (IMPORTANT!)

3. Add Component → Scripts → PaperInteractable

4. Transform:
   - Position: (-3, -1.5, 0) - Near spawn
   - Scale: (0.8, 0.8, 1)

5. Create Prefab:
   - Drag to Assets/Prefabs/Gameplay/PaperInteractable.prefab
```

---

### **4.5 - PC STATION (Terminal Access):**

```
Select "PCStation" in Hierarchy:

1. Add Component → Sprite Renderer
   - Sprite: PlaceholderPC (white square)
   - Color: #FFFFFF
   - Sorting Layer: Interactables

2. Add Component → Box Collider 2D
   - Size: (1.5, 1.5) - Larger for PC
   - Is Trigger: ✓

3. Add Component → Scripts → PCStationInteractable

4. Transform:
   - Position: (-2, 0.5, 0) - On first step
   - Scale: (1.2, 1.2, 1)

5. Create Prefab:
   - Drag to Assets/Prefabs/Gameplay/PCStationInteractable.prefab
```

---

### **4.6 - DOOR (Auto-Opening):**

```
Select "Door" in Hierarchy:

1. Add Component → Sprite Renderer
   - Sprite: PlaceholderDoorLocked (red)
   - Color: #FF0000
   - Sorting Layer: Interactables

2. Add Component → Box Collider 2D
   - Size: (1, 2) - Tall door
   - Is Trigger: OFF (blocks player initially)

3. Add Component → Scripts → DoorController
   - Move Speed: 2
   - Move Distance: 3

4. Transform:
   - Position: (-1, 2.5, 0) - On third platform
   - Scale: (0.8, 1.5, 1) - Vertical door

5. Create Prefab:
   - Drag to Assets/Prefabs/Gameplay/DoorController.prefab

NOTE: Door will change to green when unlocked!
```

---

### **4.7 - PORTAL (Level Exit):**

```
Select "Portal" in Hierarchy:

1. Add Component → Sprite Renderer
   - Sprite: PlaceholderPortal (purple circle)
   - Color: #AA00FF
   - Sorting Layer: Interactables

2. Add Component → Circle Collider 2D
   - Radius: 1.5
   - Is Trigger: ✓

3. Add Component → Scripts → LevelExit

4. Transform:
   - Position: (2, 4.5, 0) - At the top!
   - Scale: (1.5, 1.5, 1)

5. Create Prefab:
   - Drag to Assets/Prefabs/Gameplay/LevelExit.prefab
```

---

### **4.8 - TOKENS (5 Collectibles):**

```
For EACH token (1-5):

1. Add Component → Sprite Renderer
   - Sprite: PlaceholderToken (gold circle)
   - Color: #FFD700
   - Sorting Layer: Collectibles

2. Add Component → Circle Collider 2D
   - Radius: 0.3
   - Is Trigger: ✓

3. Add Component → Scripts → TokenCollectible
   (Already has object pooling!)

4. Positions (spread across platforms):
   Token_1: (-2.5, -1, 0)
   Token_2: (-1.5, 1, 0)
   Token_3: (0, 3, 0)
   Token_4: (1, 4.5, 0)
   Token_5: (2.5, 5, 0)

5. Scale: (0.5, 0.5, 1) - Small coins

6. Create Prefab:
   - Drag Token_1 to Assets/Prefabs/Gameplay/TokenCollectible.prefab
```

---

## 🖼️ **STEP 5: CREATE UI CANVASES (40 minutes)**

### **5.1 - CODE TERMINAL CANVAS:**

```
Hierarchy → Right-click → UI → Canvas

1. Rename: CodeTerminalCanvas

2. Canvas Component:
   - Render Mode: Screen Space - Overlay
   - Pixel Perfect: ✓
   - Sort Order: 10

3. Canvas Scaler:
   - UI Scale Mode: Scale With Screen Size
   - Reference Resolution: 1920 x 1080
   - Match: 0.5 (Width/Height)

4. Set Active: OFF (hidden by default)
```

**Terminal Panel:**
```
CodeTerminalCanvas → Right-click → UI → Panel

1. Rename: TerminalPanel

2. Rect Transform:
   - Anchors: Center-Middle
   - Width: 1200
   - Height: 800
   - Pos X: 0, Pos Y: 0

3. Image Component:
   - Color: #1A1A1A (dark gray)
   - Alpha: 240 (mostly opaque)
```

**Title Text:**
```
TerminalPanel → Right-click → UI → Text - TextMeshPro

1. Rename: TitleText
2. TMP Settings:
   - Text: "💻 CODE TERMINAL - LEVEL 1"
   - Font Size: 42
   - Color: #00FFFF (cyan)
   - Alignment: Center-Top
3. Rect Transform:
   - Anchors: Top-Stretch
   - Height: 60
   - Pos Y: -30
```

**Code Input Field:**
```
TerminalPanel → Right-click → UI → Input Field - TextMeshPro

1. Rename: CodeInputField

2. Rect Transform:
   - Anchors: Center
   - Width: 1100
   - Height: 400
   - Pos Y: 100

3. TMP Input Field:
   - Character Limit: 2000
   - Line Type: Multi Line Newline
   - Placeholder Text: "// Type your Java code here..."
   - Font Size: 20
   - Text Color: #FFFFFF
   - Background Color: #0D0D0D (very dark)
```

**Output Console:**
```
TerminalPanel → Right-click → UI → Text - TextMeshPro

1. Rename: OutputText

2. Rect Transform:
   - Anchors: Bottom-Stretch
   - Height: 200
   - Pos Y: 200

3. TMP Settings:
   - Text: "> Ready to run code...\n"
   - Font Size: 18
   - Color: #00FF00 (green console text)
   - Alignment: Top-Left
   - Wrapping: Enabled
   - Overflow: Scroll
```

**Buttons (4 buttons):**
```
Create these buttons in TerminalPanel:

1. RunButton:
   - Text: "▶ RUN CODE"
   - Position: (-300, -350)
   - Size: (200, 50)
   - Color: #00AA00 (green)

2. ClearButton:
   - Text: "🗑 CLEAR"
   - Position: (-80, -350)
   - Size: (150, 50)
   - Color: #AA6600 (orange)

3. HintButton:
   - Text: "💡 HINT"
   - Position: (120, -350)
   - Size: (150, 50)
   - Color: #0066AA (blue)

4. ExitButton:
   - Text: "✖ CLOSE"
   - Position: (320, -350)
   - Size: (150, 50)
   - Color: #AA0000 (red)
```

**Add CodeTerminal Script:**
```
Select CodeTerminalCanvas:
1. Add Component → Scripts → CodeTerminal
2. In Inspector, drag references:
   - Input Field: CodeInputField
   - Output Text: OutputText
   - Run Button: RunButton
   - Clear Button: ClearButton
   - Hint Button: HintButton
   - Exit Button: ExitButton
```

---

### **5.2 - CHALLENGE DISPLAY CANVAS:**

```
Hierarchy → Right-click → UI → Canvas

1. Rename: ChallengeCanvas
2. Same Canvas settings as Terminal
3. Set Active: OFF
```

**Challenge Panel:**
```
ChallengeCanvas → Panel

1. Rect Transform:
   - Width: 900
   - Height: 600

2. Background: #002244 (dark blue)

3. Add child texts:
   - TitleText: "🎯 LEVEL 1 CHALLENGE"
   - ObjectiveText: "Print 'Hello World' to console"
   - HintText: "Use System.out.println()"
   - CloseButton: "GOT IT!"
```

---

### **5.3 - HUD CANVAS:**

```
Hierarchy → Right-click → UI → Canvas

1. Rename: HUDCanvas
2. Same Canvas settings
3. Set Active: ON (always visible)
```

**HUD Elements:**
```
Create these TMP texts:

1. LevelNumber (Top-Left):
   - Text: "LEVEL 1"
   - Font Size: 36
   - Position: (50, -30)

2. TokenCounter (Top-Right):
   - Text: "TOKENS: 0/5"
   - Font Size: 32
   - Position: (-50, -30)
   - Alignment: Right

3. Timer (Top-Center):
   - Text: "00:00"
   - Font Size: 32

4. FPSCounter (Bottom-Right):
   - Text: "FPS: 60"
   - Font Size: 20
   - Position: (-10, 10)
   - Color: #00FF00

5. InteractionPrompt (Bottom-Center):
   - Text: "Press [E] to Read"
   - Font Size: 28
   - Position: (0, 100)
   - Color: #FFFF00 (yellow)
```

---

## 🔗 **STEP 6: CONNECT REFERENCES (20 minutes)**

**This is CRITICAL! Scripts need references to work!**

### **6.1 - PCStationInteractable:**
```
Select PCStation GameObject in Hierarchy:

In Inspector → PCStationInteractable script:
- Code Terminal: Drag CodeTerminalCanvas here
- Interaction UI: Drag InteractionPrompt here
- Player Controller: Will be set at runtime
```

### **6.2 - CodeTerminal:**
```
Select CodeTerminalCanvas:

In Inspector → CodeTerminal script:
- Level Door: Drag Door GameObject here ⚠️ IMPORTANT!
- Player Controller: Will be set at runtime
```

### **6.3 - PaperInteractable:**
```
Select Paper GameObject:

In Inspector → PaperInteractable script:
- Challenge Panel: Drag ChallengeCanvas/Panel here
- Title Text: Drag TitleText
- Objective Text: Drag ObjectiveText
- Hint Text: Drag HintText
- Close Button: Drag CloseButton
- Interaction UI: Drag InteractionPrompt
```

### **6.4 - DoorController:**
```
Select Door GameObject:

In Inspector → DoorController script:
- Move Speed: 2
- Move Distance: 3
- (No references needed - auto works!)
```

### **6.5 - GameManager:**
```
Hierarchy → Managers → GameManager

1. Add Component → Scripts → GameManager
2. This is singleton - auto-manages itself!
```

### **6.6 - LevelManager:**
```
Hierarchy → Managers → LevelManager

1. Add Component → Scripts → LevelManager
2. In Inspector:
   - Current Level: 1
   - Level Data: Will load from Resources/LevelData/level_001.json
```

### **6.7 - PerformanceManager:**
```
Hierarchy → Managers → PerformanceManager

1. Add Component → Scripts → PerformanceManager
2. In Inspector:
   - Target FPS: 60
   - Show FPS Counter: ✓
   - FPS Text: Drag HUDCanvas/FPSCounter here
```

---

## ✅ **STEP 7: FINAL CHECKS (10 minutes)**

### **Checklist:**
```
[ ] All GameObjects have correct positions
[ ] All Sprite Renderers have correct sorting layers
[ ] All colliders set to Trigger where needed
[ ] All scripts added to correct objects
[ ] All references connected in Inspector
[ ] Player has Rigidbody2D (Dynamic)
[ ] Platforms have Collider2D (NOT trigger)
[ ] Door has BoxCollider2D (NOT trigger initially)
[ ] Interactables have Trigger colliders
[ ] UI Canvases set to correct active state:
    - CodeTerminalCanvas: OFF
    - ChallengeCanvas: OFF
    - HUDCanvas: ON
```

---

## 🎮 **STEP 8: TEST THE GAME! (15 minutes)**

### **Press PLAY and test:**

1. **Movement:**
   - Arrow keys / WASD - Player moves
   - Space - Player jumps
   - Player collides with platforms ✓

2. **Paper Interaction:**
   - Walk near Paper
   - "Press [E] to Read" appears
   - Press E - Challenge panel shows
   - Click "GOT IT!" - Panel closes

3. **PC Terminal:**
   - Walk near PC
   - "Press [E] to Code" appears
   - Press E - Terminal opens
   - Player can't move (locked)
   - Type code in input field
   - Click RUN CODE button

4. **Code Validation:**
   - Type: `System.out.println("Hello World");`
   - Click RUN CODE
   - Output shows: "> 🚪 Door unlocked!"
   - Door changes to GREEN
   - Door slides UP smoothly
   - Player unlocked (can move again)

5. **Token Collection:**
   - Walk through tokens
   - Tokens disappear
   - Counter updates: "TOKENS: 1/5"
   - All 5 tokens collectable

6. **Portal Exit:**
   - Walk through door opening
   - Touch purple portal
   - Level completes!
   - (Should sync to backend)

---

## 🐛 **COMMON ISSUES & FIXES:**

### **Player falls through platforms:**
```
Fix: Select Platform → Box Collider 2D:
- Is Trigger: OFF (unchecked)
- Rigidbody2D on Player: Body Type = Dynamic
```

### **Can't interact with Paper/PC:**
```
Fix: 
- Check colliders are set to "Is Trigger: ON"
- Make sure scripts are attached
- Check player has "Player" tag
```

### **Door doesn't unlock:**
```
Fix: 
- CodeTerminal script → Level Door reference MUST be set!
- Select CodeTerminalCanvas
- Drag Door GameObject to "Level Door" field
```

### **Terminal doesn't open:**
```
Fix:
- PCStationInteractable → Code Terminal reference = CodeTerminalCanvas
- Make sure Canvas is child of root (not inside other objects)
```

### **Sprites look blurry:**
```
Fix: Select sprite → Inspector:
- Texture Type: Sprite (2D and UI)
- Filter Mode: Point (no filter)
- Compression: None
```

### **UI too small/large:**
```
Fix: Canvas Scaler:
- Reference Resolution: 1920 x 1080
- UI Scale Mode: Scale With Screen Size
```

---

## 🎉 **SUCCESS CRITERIA:**

When everything works:
- ✅ Player spawns and can move/jump
- ✅ Paper shows challenge
- ✅ PC opens terminal
- ✅ Code validation works
- ✅ Door auto-slides open (like Watergirl & Fireboy!)
- ✅ Tokens collectible and counted
- ✅ Portal completes level
- ✅ FPS shows 60 in bottom-right
- ✅ No errors in Console

**GAME IS NOW 100% FUNCTIONAL!** 🚀

Only thing missing = Real sprites from Bing! Replace later using WHERE_TO_SAVE.md guide!

---

## 📊 **TIME BREAKDOWN:**

```
Scene Setup:          5 min
Placeholder Sprites:  10 min
Sorting Layers:       3 min
GameObjects:          30 min
UI Canvases:          40 min
Connect References:   20 min
Final Checks:         10 min
Testing:              15 min
--------------------------
TOTAL:                ~2 hours
```

**After this = FULLY PLAYABLE GAME!** 🎮✨
