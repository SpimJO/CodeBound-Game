# Character Sprite Generation - Quick Reference

## 🎨 Generate All 8 Character Skins

Copy these prompts directly into your AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.)

---

## 1️⃣ DEFAULT SKIN (Free Starter Character)

**Prompt for DALL-E/Midjourney:**
```
2D pixel art game character sprite sheet, 64x64 pixels per frame, young programmer character wearing blue hoodie with code symbols (< >, {}), dark pants, white sneakers, brown short hair, side-view platformer perspective. Include idle animation (6 frames), walk cycle (8 frames), jump sequence (4 frames), fall animation (3 frames). Clean pixel art style with black outlines, color palette: blue #4A90E2, dark gray #333333, brown hair. Transparent background. Arranged in horizontal strip. Reference style: Celeste game character.
```

**Character Sheet Layout:**
```
[IDLE 1][IDLE 2][IDLE 3][IDLE 4][IDLE 5][IDLE 6]
[WALK 1][WALK 2][WALK 3][WALK 4][WALK 5][WALK 6][WALK 7][WALK 8]
[JUMP 1][JUMP 2][JUMP 3][JUMP 4][FALL 1][FALL 2][FALL 3]
```

---

## 2️⃣ CYBER SKIN (500 tokens)

**Prompt:**
```
2D pixel art cyberpunk hacker character sprite sheet, 64x64 pixels per frame, futuristic black tech suit with glowing neon blue circuit patterns, VR visor helmet, neon pink mohawk, side-view platformer. Include idle with pulsing glow (6 frames), walk cycle (8 frames), jump (4 frames), fall (3 frames). Cyberpunk aesthetic with glowing effects. Color palette: black #000000, neon cyan #00FFFF, hot pink #FF006E, purple glow #8B00FF. Transparent background. Horizontal sprite sheet. Reference: Neon punk style.
```

**Special Effects:** Add glowing particle layer

---

## 3️⃣ NINJA SKIN (750 tokens)

**Prompt:**
```
2D pixel art ninja warrior character sprite sheet, 64x64 pixels per frame, dark navy ninja outfit with red accents, ninja mask, katana sword on back, side-view platformer perspective. Include idle ready stance (6 frames), silent walk (8 frames), dynamic flip jump (4 frames), fall (3 frames). Sharp angular design. Color palette: navy blue #1A1A2E, black #0F0F0F, blood red #DC143C, steel gray for katana. Transparent background. Horizontal sprite sheet. Reference: Ninja Gaiden style.
```

**Special Effects:** Shadow smoke trail

---

## 4️⃣ ROBOT SKIN (800 tokens)

**Prompt:**
```
2D pixel art futuristic robot character sprite sheet, 64x64 pixels per frame, humanoid chrome silver robot with glowing blue chest core, orange accent lights, digital screen face with emoticon expressions, visible mechanical joints, small jetpack, side-view platformer. Include idle with mechanical breathing (6 frames), robotic walk (8 frames), jetpack jump (4 frames), fall (3 frames). Color palette: chrome silver #E8E8E8, electric blue #00BFFF, orange #FF8C00, dark gray #404040. Transparent background. Reference: Mega Man character.
```

**Special Effects:** Spark particles, glowing core

---

## 5️⃣ WIZARD SKIN (1000 tokens)

**Prompt:**
```
2D pixel art wizard character sprite sheet, 64x64 pixels per frame, deep purple flowing robes with gold trim and star patterns, pointed wizard hat, holding magical staff with glowing crystal, side-view platformer. Include idle with floating effect (6 frames), walk with robes flowing (8 frames), magical levitation jump (4 frames), fall (3 frames). Fantasy aesthetic. Color palette: deep purple #6A0DAD, gold #FFD700, royal blue #4169E1, white sparkles. Transparent background. Reference: Final Fantasy wizard sprites.
```

**Special Effects:** Magical sparkle particles

---

## 6️⃣ KNIGHT SKIN (1200 tokens)

**Prompt:**
```
2D pixel art medieval knight character sprite sheet, 64x64 pixels per frame, full steel plate armor with royal blue cape, helmet with red feather plume, holding sword and shield, side-view platformer. Include idle shield ready stance (6 frames), heavy armored walk (8 frames), powerful leap jump (4 frames), fall (3 frames). Heroic style. Color palette: steel gray #778899, royal blue #4169E1, gold trim #FFD700, red plume #DC143C. Transparent background. Reference: Shovel Knight style.
```

**Special Effects:** Cape flowing, metallic shine

---

## 7️⃣ PIRATE SKIN (900 tokens)

**Prompt:**
```
2D pixel art pirate captain character sprite sheet, 64x64 pixels per frame, brown leather coat, red bandana, pirate hat with skull emblem, eye patch, cutlass sword, small colorful parrot on shoulder, side-view platformer. Include idle swagger stance (6 frames), sea legs walk (8 frames), sword raised jump (4 frames), fall (3 frames). Adventurous nautical style. Color palette: brown leather #8B4513, red #DC143C, black #000000, gold accents #FFD700. Transparent background. Reference: Sea of Thieves style.
```

**Special Effects:** Treasure sparkle particles

---

## 8️⃣ SPACE SKIN (1500 tokens)

**Prompt:**
```
2D pixel art astronaut character sprite sheet, 64x64 pixels per frame, white NASA-style space suit with orange accents, gold reflective visor helmet, oxygen tanks on back, communication antenna, side-view platformer. Include idle floating slightly (6 frames), moon bounce walk (8 frames), jetpack boost jump (4 frames), zero-gravity tumble fall (3 frames). Space exploration aesthetic. Color palette: white #FFFFFF, orange #FF8C00, gold visor #FFD700, dark gray #2F4F4F. Transparent background. Reference: Among Us with realistic details.
```

**Special Effects:** Star particles, jetpack thrust

---

## 📏 Technical Requirements

### For All Sprites:
- **Size**: 64x64 pixels per frame
- **Style**: Clean pixel art with black outlines
- **Background**: Transparent (PNG format)
- **Layout**: Horizontal sprite sheet
- **Total frames needed**: ~30 frames per character
- **Export**: PNG format, no compression

### Animation Frames:
- **Idle**: 6 frames (looping)
- **Walk**: 8 frames (looping)
- **Jump**: 4 frames (one-shot)
- **Fall**: 3 frames (looping)

---

## 🎯 Generation Tips

### Using DALL-E:
1. Submit one prompt at a time
2. Request "sprite sheet horizontal layout"
3. May need to generate idle, walk, jump separately
4. Combine in image editor

### Using Midjourney:
1. Add `--ar 16:9` for horizontal layout
2. Add `--style raw` for less AI interpretation
3. Add `--v 6` for latest version
4. Use `/describe` on reference images first

### Using Stable Diffusion:
1. Use "pixel art" LoRA models
2. Negative prompt: "blurry, 3D, realistic, photo"
3. CFG Scale: 7-10
4. Steps: 30-50

### Using Leonardo.ai:
1. Select "Pixel Art" preset
2. Use "Sprite Sheet" in prompt
3. Image dimensions: 1024x512 or 2048x512

---

## 🛠️ Post-Generation Steps

### 1. Clean Up in Image Editor (Photoshop/GIMP/Aseprite)
- Remove any background artifacts
- Ensure consistent size (64x64 per frame)
- Add black outlines if missing
- Adjust colors to match palette

### 2. Slice Sprite Sheet
- Import to Unity
- Use Sprite Editor
- Set Sprite Mode: Multiple
- Slice by grid: 64x64 pixels
- Name frames: skinId_animation_frame

### 3. Create Animations
- Create Animation Clips in Unity
- Drag frames into timeline
- Set frame rate: 12 FPS for pixel art
- Create looping animations

### 4. Setup Animator
- Create Animator Controller per skin
- Add animation states
- Setup transitions
- Configure parameters

---

## 📦 Alternative: Asset Packs

If AI generation doesn't work well, consider these Unity Asset Store packs:

**Free Options:**
- "Free 2D Character Pack" by CraftPix
- "Basic Platformer Character" by Kenney
- "Pixel Adventure" series

**Premium Options ($10-30):**
- "Pixel Art Character Bundle" - $25
- "2D Game Character Pack" - $15
- "Animated Platformer Characters" - $20

---

## ✅ Delivery Checklist

For each character skin:
- [ ] Idle sprite sheet (6 frames)
- [ ] Walk sprite sheet (8 frames)
- [ ] Jump sprite sheet (4 frames)
- [ ] Fall sprite sheet (3 frames)
- [ ] All frames are 64x64 pixels
- [ ] Transparent background
- [ ] Consistent art style
- [ ] Proper color palette
- [ ] Ready to import to Unity

---

## 🎨 Color Palette Quick Reference

```
Default:  Blue #4A90E2, Gray #333333
Cyber:    Cyan #00FFFF, Pink #FF006E, Black #000000
Ninja:    Navy #1A1A2E, Red #DC143C, Black #0F0F0F
Robot:    Silver #E8E8E8, Blue #00BFFF, Orange #FF8C00
Wizard:   Purple #6A0DAD, Gold #FFD700, Blue #4169E1
Knight:   Steel #778899, Blue #4169E1, Gold #FFD700
Pirate:   Brown #8B4513, Red #DC143C, Black #000000
Space:    White #FFFFFF, Orange #FF8C00, Gold #FFD700
```

---

## 🚀 Ready to Generate!

Copy the prompts above into your AI tool of choice and start generating! 🎮
