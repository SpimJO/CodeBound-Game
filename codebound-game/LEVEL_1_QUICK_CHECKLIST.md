# ✅ LEVEL 1 QUICK BUILD CHECKLIST

**Use this while building! Check off each item as you complete it.**

---

## 🎯 **PHASE 1: SCENE SETUP** (5 min)

- [ ] Create new 2D scene
- [ ] Save as: `Assets/Scenes/Levels/Level_001.unity`
- [ ] Camera: Orthographic, Size 5, BG Color #003344
- [ ] Physics2D: Gravity -20, Auto Sync OFF

---

## 🎨 **PHASE 2: SORTING LAYERS** (3 min)

**Edit → Project Settings → Tags & Layers → Sorting Layers:**

- [ ] 0. Default
- [ ] 1. Background
- [ ] 2. Platform
- [ ] 3. Interactables
- [ ] 4. Player
- [ ] 5. Collectibles
- [ ] 6. UI

---

## 📦 **PHASE 3: PLACEHOLDER SPRITES** (10 min)

**Create colored squares in Hierarchy → 2D Object → Sprites → Square:**

- [ ] Character - Cyan #00FFFF
- [ ] Platform - Gray #666666
- [ ] Paper - Blue #0088FF
- [ ] PC - White #FFFFFF
- [ ] Door Locked - Red #FF0000
- [ ] Door Open - Green #00FF00
- [ ] Portal - Purple #AA00FF
- [ ] Token - Gold #FFD700

**Save all to:** `Assets/Sprites/_Placeholders/`

---

## 🏗️ **PHASE 4: GAMEOBJECTS** (30 min)

### **Player:**
- [ ] Add Sprite Renderer (Cyan, Sorting: Player)
- [ ] Add Box Collider 2D (Size: 0.8 x 0.9)
- [ ] Add Rigidbody 2D (Dynamic, Freeze Rotation Z)
- [ ] Add PlayerController script
- [ ] Position: (-3, -3.5, 0)
- [ ] Save prefab: `Assets/Prefabs/Gameplay/Player.prefab`

### **Platforms (5 pieces):**
- [ ] Platform_Ground: Pos (-3, -4, 0), Scale (3, 0.5, 1)
- [ ] Platform_Step1: Pos (-2, -2, 0), Scale (2, 0.5, 1)
- [ ] Platform_Step2: Pos (-1, 0, 0), Scale (2, 0.5, 1)
- [ ] Platform_Step3: Pos (0, 2, 0), Scale (2, 0.5, 1)
- [ ] Platform_Step4: Pos (2, 4, 0), Scale (2, 0.5, 1)
- [ ] All: Gray sprite, Sorting: Platform, Box Collider 2D (NOT trigger)
- [ ] Save prefab: `Assets/Prefabs/Gameplay/Platform.prefab`

### **Paper:**
- [ ] Add Sprite Renderer (Blue, Sorting: Interactables)
- [ ] Add Box Collider 2D (Is Trigger: ✓)
- [ ] Add PaperInteractable script
- [ ] Position: (-3, -1.5, 0), Scale: (0.8, 0.8, 1)
- [ ] Save prefab: `Assets/Prefabs/Gameplay/PaperInteractable.prefab`

### **PC Station:**
- [ ] Add Sprite Renderer (White, Sorting: Interactables)
- [ ] Add Box Collider 2D (Is Trigger: ✓)
- [ ] Add PCStationInteractable script
- [ ] Position: (-2, 0.5, 0), Scale: (1.2, 1.2, 1)
- [ ] Save prefab: `Assets/Prefabs/Gameplay/PCStationInteractable.prefab`

### **Door:**
- [ ] Add Sprite Renderer (Red, Sorting: Interactables)
- [ ] Add Box Collider 2D (Is Trigger: OFF - blocks initially!)
- [ ] Add DoorController script (Speed: 2, Distance: 3)
- [ ] Position: (-1, 2.5, 0), Scale: (0.8, 1.5, 1)
- [ ] Save prefab: `Assets/Prefabs/Gameplay/DoorController.prefab`

### **Portal:**
- [ ] Add Sprite Renderer (Purple, Sorting: Interactables)
- [ ] Add Circle Collider 2D (Is Trigger: ✓, Radius: 1.5)
- [ ] Add LevelExit script
- [ ] Position: (2, 4.5, 0), Scale: (1.5, 1.5, 1)
- [ ] Save prefab: `Assets/Prefabs/Gameplay/LevelExit.prefab`

### **Tokens (5 pieces):**
- [ ] Token_1: Pos (-2.5, -1, 0)
- [ ] Token_2: Pos (-1.5, 1, 0)
- [ ] Token_3: Pos (0, 3, 0)
- [ ] Token_4: Pos (1, 4.5, 0)
- [ ] Token_5: Pos (2.5, 5, 0)
- [ ] All: Gold sprite, Sorting: Collectibles, Circle Collider 2D (Trigger ✓, Radius: 0.3), TokenCollectible script
- [ ] Save prefab: `Assets/Prefabs/Gameplay/TokenCollectible.prefab`

---

## 🖼️ **PHASE 5: UI CANVASES** (40 min)

### **CodeTerminalCanvas:**
- [ ] Create Canvas (Render: Screen Space Overlay, Sort Order: 10)
- [ ] Canvas Scaler: Scale With Screen Size, Ref: 1920x1080
- [ ] Set Active: OFF
- [ ] Add Panel (1200x800, Color: #1A1A1A)
- [ ] Add TitleText: "💻 CODE TERMINAL - LEVEL 1"
- [ ] Add CodeInputField: TMP Input, Multi-line, 1100x400
- [ ] Add OutputText: TMP Text, 200 height, Green #00FF00
- [ ] Add RunButton: "▶ RUN CODE", Green
- [ ] Add ClearButton: "🗑 CLEAR", Orange
- [ ] Add HintButton: "💡 HINT", Blue
- [ ] Add ExitButton: "✖ CLOSE", Red
- [ ] Add CodeTerminal script to Canvas
- [ ] Connect all UI references in script

### **ChallengeCanvas:**
- [ ] Create Canvas (Same settings)
- [ ] Set Active: OFF
- [ ] Add Panel (900x600, Color: #002244)
- [ ] Add TitleText: "🎯 LEVEL 1 CHALLENGE"
- [ ] Add ObjectiveText: Shows challenge objective
- [ ] Add HintText: Shows hints
- [ ] Add CloseButton: "GOT IT!"

### **HUDCanvas:**
- [ ] Create Canvas (Same settings)
- [ ] Set Active: ON
- [ ] Add LevelNumber: Top-Left "LEVEL 1"
- [ ] Add TokenCounter: Top-Right "TOKENS: 0/5"
- [ ] Add Timer: Top-Center "00:00"
- [ ] Add FPSCounter: Bottom-Right "FPS: 60", Green
- [ ] Add InteractionPrompt: Bottom-Center "Press [E]", Yellow

---

## 🔗 **PHASE 6: CONNECT REFERENCES** (20 min)

**CRITICAL - Scripts won't work without these!**

### **PCStationInteractable:**
- [ ] Code Terminal → CodeTerminalCanvas
- [ ] Interaction UI → HUDCanvas/InteractionPrompt

### **CodeTerminal (on Canvas):**
- [ ] Level Door → Door GameObject ⚠️ **MOST IMPORTANT!**
- [ ] Input Field → CodeInputField
- [ ] Output Text → OutputText
- [ ] All 4 buttons connected

### **PaperInteractable:**
- [ ] Challenge Panel → ChallengeCanvas/Panel
- [ ] Title Text → TitleText
- [ ] Objective Text → ObjectiveText
- [ ] Hint Text → HintText
- [ ] Close Button → CloseButton
- [ ] Interaction UI → HUDCanvas/InteractionPrompt

### **DoorController:**
- [ ] Move Speed: 2
- [ ] Move Distance: 3
- [ ] (No other references needed)

### **Managers:**
- [ ] Create empty GameObjects in Hierarchy/Managers
- [ ] Add GameManager script
- [ ] Add LevelManager script (Current Level: 1)
- [ ] Add PerformanceManager script (Target FPS: 60, FPS Text reference)

---

## 🧪 **PHASE 7: TESTING** (15 min)

### **Press PLAY - Test each feature:**

**Movement:**
- [ ] Player moves with Arrow/WASD
- [ ] Player jumps with Space
- [ ] Player collides with platforms
- [ ] Player doesn't fall through ground

**Paper Interaction:**
- [ ] Walk near Paper
- [ ] "Press [E] to Read" shows
- [ ] Press E → Challenge panel opens
- [ ] "GOT IT!" button closes panel

**PC Terminal:**
- [ ] Walk near PC
- [ ] "Press [E] to Code" shows
- [ ] Press E → Terminal opens
- [ ] Player movement locked
- [ ] Can type in code field

**Code Validation:**
- [ ] Type: `System.out.println("Hello World");`
- [ ] Click "RUN CODE"
- [ ] Output shows: "> 🚪 Door unlocked!"
- [ ] Door sprite changes to GREEN
- [ ] Door slides UP smoothly
- [ ] Player movement unlocked
- [ ] Can exit terminal with "CLOSE"

**Token Collection:**
- [ ] Walk through tokens
- [ ] Tokens disappear
- [ ] "TOKENS: X/5" counter updates
- [ ] All 5 tokens collectible

**Portal Exit:**
- [ ] Walk through door opening
- [ ] Touch purple portal
- [ ] Level completes (console log shows)

**Performance:**
- [ ] FPS counter shows ~60
- [ ] No lag or stuttering
- [ ] Smooth door animation
- [ ] No errors in Console

---

## ✅ **FINAL VERIFICATION:**

- [ ] **All 10 todos completed in todo list**
- [ ] **No Console errors**
- [ ] **Game playable from start to finish**
- [ ] **All interactions work**
- [ ] **Door auto-opens (Watergirl & Fireboy style!)**
- [ ] **Performance at 60 FPS**
- [ ] **Scene saved**
- [ ] **All prefabs created**

---

## 🎉 **SUCCESS!**

**Game is 100% functional!** Only missing:
- Real sprites from Bing (use WHERE_TO_SAVE.md to replace later)

**Total build time:** ~2 hours ⏱️

**You can now:**
1. Play complete Level 1
2. Test all mechanics
3. Replace sprites later when ready
4. Duplicate for Levels 2-100 🚀

---

## 🐛 **QUICK FIXES:**

**Player falls through platforms:**
→ Platform colliders: Is Trigger = OFF

**Can't interact:**
→ Interactable colliders: Is Trigger = ON

**Door doesn't unlock:**
→ CodeTerminal script → Level Door = Door GameObject

**Terminal doesn't open:**
→ PCStationInteractable → Code Terminal = CodeTerminalCanvas

**Sprites blurry:**
→ Sprite Inspector: Filter Mode = Point

**UI too small:**
→ Canvas Scaler: Scale With Screen Size, 1920x1080

---

**Follow UNITY_SCENE_BUILD_GUIDE.md for detailed steps!** 📖
