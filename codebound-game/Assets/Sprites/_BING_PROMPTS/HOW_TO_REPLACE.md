# 🔄 How to Replace Placeholder Sprites

**After generating sprites from Bing, follow these steps:**

---

## 📦 **STEP 1: Organize Your Generated Sprites**

Create a temporary folder on desktop:
```
Desktop/
└─ CodeBound_Sprites/
   ├─ character.png
   ├─ platform.png
   ├─ paper.png
   ├─ pc.png
   ├─ door_locked.png
   ├─ door_open.png
   ├─ portal.png
   └─ token.png
```

---

## 🎨 **STEP 2: Process Each Sprite**

### **For Character, Paper, Token:**
1. Open in Paint/GIMP/Photoshop
2. Resize to correct dimensions (see prompt files)
3. **Remove background:**
   - GIMP: Layer → Transparency → Color to Alpha
   - Photoshop: Magic Wand → Delete background
   - Paint.NET: Magic Wand → Delete
4. Save as PNG with transparency

### **For Platform:**
1. Crop to exactly 32x32 pixels
2. Check edges are seamless (test by tiling 2x2)
3. Adjust if needed
4. Save as PNG

### **For Door:**
1. Crop to 32x64 pixels (tall)
2. Keep aspect ratio
3. Save locked and open versions separately

---

## 🔄 **STEP 3: Replace in Unity**

### **Method 1: Direct Replacement (Easiest)**
1. Open Unity project
2. Navigate to sprite folder in Project window
3. Select OLD placeholder sprite
4. **Delete it**
5. Drag your NEW sprite into same location
6. **Keep same filename!** (e.g., "default_idle.png")
7. Unity auto-updates all references!

### **Method 2: Manual Assignment**
1. Drag new sprite into Unity
2. Find all GameObjects using old sprite
3. In Inspector → Sprite Renderer → Sprite
4. Drag new sprite into field
5. Delete old sprite

---

## ⚙️ **STEP 4: Configure Import Settings**

Select sprite in Unity → Inspector:

```
Texture Type: Sprite (2D and UI)
Sprite Mode: Single
Pixels Per Unit: 32
Filter Mode: Point (no filter)  ← IMPORTANT for pixel art!
Compression: None
Max Size: 256 (for small sprites) or 1024 (for bg)
```

**Click APPLY!**

---

## 🧪 **STEP 5: Test in Scene**

1. Open Level_001 scene
2. Press **Play**
3. Check if sprites look correct
4. Verify sizes match
5. Check transparency works
6. Adjust Pixels Per Unit if too big/small

---

## 📍 **REPLACEMENT LOCATIONS:**

### **Character:**
```
Location: Assets/Sprites/Characters/Default/
Old: default_idle.png (placeholder)
New: Your character sprite
Size: 32x32 pixels
```

### **Platform:**
```
Location: Assets/Sprites/Environment/Platforms/
Old: platform_32x32.png (gray rectangle)
New: Your platform tile
Size: 32x32 pixels
Note: Check tiling works!
```

### **Paper:**
```
Location: Assets/Sprites/Environment/Interactables/
Old: paper_hologram.png (yellow square)
New: Your hologram sprite
Size: 32x32 pixels
```

### **PC Station:**
```
Location: Assets/Sprites/Environment/Interactables/
Old: pc_station.png (cyan square)
New: Your PC sprite
Size: 64x64 pixels
```

### **Door:**
```
Location: Assets/Sprites/Environment/Interactables/
Old: door_locked.png (red rectangle)
Old: door_open.png (green rectangle)
New: Your door sprites (both states)
Size: 32x64 pixels (tall)
```

### **Portal:**
```
Location: Assets/Sprites/Environment/Interactables/
Old: portal.png (blue circle)
New: Your portal sprite
Size: 64x64 pixels
```

### **Token:**
```
Location: Assets/Sprites/Collectibles/
Old: token.png (gold circle)
New: Your token sprite
Size: 16x16 pixels
```

### **Background:**
```
Location: Assets/Sprites/Environment/Backgrounds/
Old: bg_cyan_tech.png (solid color)
New: Your background
Size: 1920x1080 pixels
```

---

## ⚠️ **COMMON ISSUES:**

### **Sprite is blurry:**
- **Fix:** Set Filter Mode to "Point (no filter)"

### **Sprite is too big/small:**
- **Fix:** Adjust "Pixels Per Unit" (try 16, 32, or 64)

### **Background is white instead of transparent:**
- **Fix:** Use Color to Alpha in GIMP to remove white

### **Platform tiles don't connect:**
- **Fix:** Crop exactly to 32x32, check edges are seamless

### **Sprite looks pixelated (in bad way):**
- **Fix:** Set Compression to "None"

---

## 💡 **PRO TIPS:**

1. **Replace one at a time** - Test after each replacement
2. **Keep backups** - Save original generated images
3. **Use same filenames** - Unity auto-updates references
4. **Test animations** - Some sprites have animation controllers
5. **Check sorting layers** - Ensure sprites render in correct order

---

## 🎯 **PRIORITY ORDER:**

**Replace these first:**
1. ✅ Character (most visible)
2. ✅ Platform (gameplay critical)
3. ✅ Door (core mechanic)
4. ✅ Token (collectibles)

**Then these:**
5. ✅ Paper, PC, Portal (interactables)

**Last:**
6. ✅ Background (polish)

---

## ✅ **VERIFICATION CHECKLIST:**

After replacing all sprites:
- [ ] Character appears correctly
- [ ] Character is right size (not giant or tiny)
- [ ] Platforms tile seamlessly
- [ ] Door has both locked/open states
- [ ] Tokens are visible
- [ ] All sprites have transparent backgrounds
- [ ] No white boxes around sprites
- [ ] Pixel art looks crisp (not blurry)
- [ ] Colors match theme (cyan/blue)
- [ ] Game still runs without errors

---

**Need help?** Check if:
1. Filename matches exactly
2. Import settings correct
3. Sprite is PNG with transparency
4. Size is correct (32x32, 64x64, etc.)

**Questions?** Verify your steps above! 🚀
