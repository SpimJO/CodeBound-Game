# 🎨 Bing Image Creator - Ready to Copy Prompts

**Tool:** https://www.bing.com/images/create (FREE!)

---

## 📋 **HOW TO USE:**

### **Step 1: Generate Each Sprite**
1. Open a `.txt` file below
2. Copy the entire prompt
3. Go to Bing Image Creator
4. Paste prompt
5. Click "Create"
6. Wait 30-60 seconds
7. Download best result

### **Step 2: Process Image**
1. Open in Paint / GIMP / Photoshop
2. Crop to correct size (see each file)
3. Remove background (make transparent)
4. Save as PNG

### **Step 3: Replace in Unity**
1. Delete placeholder sprite in Unity
2. Drag your new PNG into same folder
3. Select sprite → Inspector:
   - **Texture Type:** Sprite (2D and UI)
   - **Pixels Per Unit:** 32
   - **Filter Mode:** Point (no filter)
   - Click **Apply**

---

## 📂 **FILES IN THIS FOLDER:**

```
01_character_default.txt       → Default character (programmer)
02_platform_tile.txt           → Platform tile (32x32)
03_paper_hologram.txt          → Challenge paper
04_pc_station.txt              → Computer terminal
05_door_locked.txt             → Door (locked state)
06_door_open.txt               → Door (open state)
07_portal_exit.txt             → Level exit portal
08_token_collectible.txt       → Gold token/coin
09_background_cyan.txt         → Background layer
```

---

## ⏱️ **TIME PER SPRITE:**

| Sprite | Generate | Process | Total |
|--------|----------|---------|-------|
| Character | 2 min | 5 min | 7 min |
| Platform | 1 min | 2 min | 3 min |
| Paper | 1 min | 2 min | 3 min |
| PC Station | 2 min | 3 min | 5 min |
| Door (both) | 3 min | 4 min | 7 min |
| Portal | 2 min | 3 min | 5 min |
| Token | 2 min | 5 min | 7 min |
| Background | 3 min | 2 min | 5 min |
| **TOTAL** | **16 min** | **26 min** | **42 min** |

---

## 🎯 **PRIORITY ORDER:**

**Do these first (test gameplay):**
1. ✅ Character (most important!)
2. ✅ Platform
3. ✅ Door
4. ✅ Token

**Do these second (interactables):**
5. ✅ Paper
6. ✅ PC Station
7. ✅ Portal

**Do last (polish):**
8. ✅ Background

---

## 🔄 **REPLACEMENT LOCATIONS:**

After generating sprites, replace in:

```
Assets/Sprites/Characters/Default/
├─ default_idle.png          ← Replace with your character

Assets/Sprites/Environment/Platforms/
├─ platform_32x32.png        ← Replace with your platform

Assets/Sprites/Environment/Interactables/
├─ paper_hologram.png        ← Replace with your paper
├─ pc_station.png            ← Replace with your PC
├─ door_locked.png           ← Replace with your locked door
├─ door_open.png             ← Replace with your open door
└─ portal.png                ← Replace with your portal

Assets/Sprites/Collectibles/
└─ token.png                 ← Replace with your token
```

---

## 💡 **PRO TIPS:**

1. **Generate 3-4 versions** of each, pick best
2. **Request "transparent background"** in all prompts
3. **Use "32x32 pixels"** for consistency
4. **Save originals** before cropping
5. **Test in Unity** after each replacement

---

**Ready to start?** Copy prompts from `.txt` files! 🚀
