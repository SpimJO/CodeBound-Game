# 🔌 PAANO MAG-CONNECT NG SCRIPTS SA UNITY

**Simple guide lang - follow this step by step!**

---

## 📋 **STEP 1: BUILD GAMEOBJECTS IN UNITY**

**Follow UNITY_SCENE_BUILD_GUIDE.md pero eto yung CRITICAL CONNECTIONS:**

---

## 🎯 **PLAYER - Connect Script**

### **1. Create Player GameObject:**
```
Hierarchy → Create Empty → Rename: "Player"
Position: (-3, -3.5, 0)
```

### **2. Add Components:**
```
Inspector → Add Component:
1. Sprite Renderer (color: Cyan)
2. Box Collider 2D (size: 0.8 x 0.9)
3. Rigidbody 2D (Dynamic, Freeze Rotation Z)
```

### **3. ADD SCRIPT (CRITICAL!):**
```
Inspector → Add Component → Scripts → PlayerController

Automatic na yung functionality! 
WASD movement, Space jump - working na!
```

---

## 📄 **PAPER - Connect Script + References**

### **1. Create Paper GameObject:**
```
Hierarchy → Create Empty → Rename: "Paper"
Position: (-3, -1.5, 0)
```

### **2. Add Components:**
```
Inspector → Add Component:
1. Sprite Renderer (color: Blue)
2. Box Collider 2D (size: 1 x 1, Is Trigger: ✓)
```

### **3. ADD SCRIPT:**
```
Inspector → Add Component → Scripts → PaperInteractable
```

### **4. CONNECT REFERENCES (CRITICAL!):**
```
Paper GameObject selected → Inspector → PaperInteractable script:

Kailangan mo i-drag yung UI elements dito:
├─ Challenge Panel: [Drag ChallengeCanvas/Panel here]
├─ Title Text: [Drag TitleText here]
├─ Objective Text: [Drag ObjectiveText here]
├─ Hint Text: [Drag HintText here]
├─ Close Button: [Drag CloseButton here]
└─ Interaction UI: [Drag InteractionPrompt here]

PAANO MAG-DRAG:
1. Kunin mo yung UI element sa Hierarchy (example: TitleText)
2. I-drag mo sa field sa Inspector
3. Bibitawan mo sa loob ng box
4. Lalabas yung name = CONNECTED! ✅
```

---

## 💻 **PC STATION - Connect Script + References**

### **1. Create PCStation GameObject:**
```
Hierarchy → Create Empty → Rename: "PCStation"
Position: (-2, 0.5, 0)
```

### **2. Add Components:**
```
Inspector → Add Component:
1. Sprite Renderer (color: White)
2. Box Collider 2D (size: 1.5 x 1.5, Is Trigger: ✓)
```

### **3. ADD SCRIPT:**
```
Inspector → Add Component → Scripts → PCStationInteractable
```

### **4. CONNECT REFERENCES (CRITICAL!):**
```
PCStation selected → Inspector → PCStationInteractable:

├─ Code Terminal: [Drag CodeTerminalCanvas here]
└─ Interaction UI: [Drag HUDCanvas/InteractionPrompt here]

Pag di mo na-connect to = Terminal hindi mag-oopen!
```

---

## 🚪 **DOOR - Connect Script**

### **1. Create Door GameObject:**
```
Hierarchy → Create Empty → Rename: "Door"
Position: (-1, 2.5, 0)
Scale: (0.8, 1.5, 1)
```

### **2. Add Components:**
```
Inspector → Add Component:
1. Sprite Renderer (color: Red)
2. Box Collider 2D (size: 1 x 2, Is Trigger: OFF!)
```

### **3. ADD SCRIPT:**
```
Inspector → Add Component → Scripts → DoorController

Settings sa Inspector:
├─ Move Speed: 2
└─ Move Distance: 3

Walang ibang kailangan! Auto-sliding na yan!
```

---

## 🖥️ **CODE TERMINAL CANVAS - Connect Script + References**

### **1. Create CodeTerminalCanvas:**
```
Hierarchy → UI → Canvas
Rename: CodeTerminalCanvas
Settings: Screen Space Overlay, Sort Order: 10
Active: OFF (uncheck sa Hierarchy)
```

### **2. Build UI inside (Panel, InputField, etc)**
*(Follow UNITY_SCENE_BUILD_GUIDE.md for full UI)*

### **3. ADD SCRIPT TO CANVAS:**
```
Select CodeTerminalCanvas → Inspector → Add Component → CodeTerminal
```

### **4. CONNECT REFERENCES (MOST CRITICAL!):**
```
CodeTerminalCanvas selected → Inspector → CodeTerminal script:

⚠️ SUPER IMPORTANT - Door won't unlock if mali!

├─ Level Door: [Drag Door GameObject here] ⚠️ #1 PRIORITY!
├─ Input Field: [Drag CodeInputField here]
├─ Output Text: [Drag OutputText here]
├─ Run Button: [Drag RunButton here]
├─ Clear Button: [Drag ClearButton here]
├─ Hint Button: [Drag HintButton here]
└─ Exit Button: [Drag ExitButton here]

PAG WALA YUNG "Level Door" CONNECTION:
= Door hindi mag-uunlock kahit tama yung code!
= MOST COMMON ERROR!
```

---

## 🎮 **MANAGERS - Connect Scripts**

### **1. Create Managers parent:**
```
Hierarchy → Create Empty → Rename: "Managers"
```

### **2. Create 3 children:**
```
Under Managers:
├─ Create Empty → Rename: "GameManager"
│  └─ Add Component → GameManager script
│
├─ Create Empty → Rename: "LevelManager"
│  └─ Add Component → LevelManager script
│     └─ Settings: Current Level = 1
│
└─ Create Empty → Rename: "PerformanceManager"
   └─ Add Component → PerformanceManager script
      ├─ Target FPS: 60
      └─ FPS Text: [Drag HUDCanvas/FPSCounter here]
```

---

## 📊 **SUMMARY: LAHAT NG CONNECTIONS**

```
Player → PlayerController.cs
   No references needed! Auto works!

Paper → PaperInteractable.cs
   ├─ Challenge Panel ✓
   ├─ Title/Objective/Hint Texts ✓
   └─ Interaction UI ✓

PCStation → PCStationInteractable.cs
   ├─ Code Terminal ✓
   └─ Interaction UI ✓

Door → DoorController.cs
   No references needed! Auto works!

CodeTerminalCanvas → CodeTerminal.cs
   ├─ Level Door ⚠️ MOST IMPORTANT!
   ├─ Input Field ✓
   ├─ Output Text ✓
   └─ All 4 Buttons ✓

Token → TokenCollectible.cs
   No references needed! Auto works!

Portal → LevelExit.cs
   No references needed! Auto works!
```

---

## ✅ **PAANO MALAMAN NA CONNECTED NA?**

**Sa Inspector, pag naka-connect:**
```
✅ Field may name ng object (not "None")
✅ May icon ng component type
✅ Pag clinick mo, yung object sa Hierarchy mag-highlight

❌ Pag "None (GameObject)" = NOT CONNECTED!
❌ Empty field = NEED TO DRAG!
```

---

## 🐛 **COMMON ERRORS:**

**"Door doesn't unlock!"**
→ Check: CodeTerminal → Level Door reference connected?

**"Terminal doesn't open!"**
→ Check: PCStation → Code Terminal reference connected?

**"Challenge doesn't show!"**
→ Check: Paper → Challenge Panel reference connected?

**"Press [E] doesn't appear!"**
→ Check: Interaction UI reference connected?

---

## 🎯 **QUICK CHECKLIST:**

Bago mag-test, verify:
```
[ ] Player has PlayerController script
[ ] Paper has PaperInteractable + all UI references
[ ] PCStation has PCStationInteractable + terminal reference
[ ] Door has DoorController script
[ ] CodeTerminal has script + ALL references (especially Door!)
[ ] All GameObjects have correct components (Collider, Sprite, etc)
[ ] UI Canvases exist (CodeTerminal, Challenge, HUD)
[ ] Managers exist with scripts
```

**If all checked → Press PLAY → Should work!** 🚀

---

**This is THE connection guide! Follow this!** ✨
