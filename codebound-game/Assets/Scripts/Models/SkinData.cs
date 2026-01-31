using System;
using System.Collections.Generic;

/// <summary>
/// Skin data model matching backend /skins structure
/// Supports Metal Slug style character skins (FR10)
/// </summary>
[Serializable]
public class SkinData
{
    public string skinId;       // default, cyber, ninja, robot, pirate, wizard, knight, space
    public string skinName;     // Display name
    public string description;  // Flavor text
    public int tokenCost;       // Purchase price
    public bool isDefault;      // Free starter skin
    public bool isOwned;        // Player owns this skin
    public bool isEquipped;     // Currently equipped
    public DateTime? purchasedAt;

    // Asset References (Unity specific)
    public string spriteSheetPath; // Path to sprite sheet
    public string animatorController; // Path to animator controller

    public SkinData()
    {
        skinId = "default";
        skinName = "Default";
        description = "The classic CodeBound character";
        tokenCost = 0;
        isDefault = true;
        isOwned = true;
        isEquipped = true;
        purchasedAt = null;
        spriteSheetPath = "Sprites/Characters/Default";
        animatorController = "Animations/Characters/DefaultAnimator";
    }

    public SkinData(string id, string name, string desc, int cost, string spritePath, string animPath)
    {
        skinId = id;
        skinName = name;
        description = desc;
        tokenCost = cost;
        isDefault = false;
        isOwned = false;
        isEquipped = false;
        purchasedAt = null;
        spriteSheetPath = spritePath;
        animatorController = animPath;
    }
}

// ============================================================
// SKIN CATALOG REMOVED - FETCH FROM BACKEND INSTEAD
// Use SkinService.GetAvailableSkins() to fetch from /skins/available
// ============================================================

/// <summary>
/// Skin purchase request for backend /skins/purchase
/// </summary>
[Serializable]
public class SkinPurchaseRequest
{
    public string skinId;
    public int tokenCost;

    public SkinPurchaseRequest(string id, int cost)
    {
        skinId = id;
        tokenCost = cost;
    }
}

/// <summary>
/// Skin equip request for backend /skins/equip
/// </summary>
[Serializable]
public class SkinEquipRequest
{
    public string skinId;

    public SkinEquipRequest(string id)
    {
        skinId = id;
    }
}

/// <summary>
/// Backend response for owned skins
/// </summary>
[Serializable]
public class UserSkinResponse
{
    public string id;
    public string userId;
    public string skinId;
    public string purchasedAt;
    public int purchasedWithTokens;
}

/// <summary>
/// Animation states for character (Metal Slug style)
/// </summary>
public enum CharacterAnimationState
{
    Idle,
    Walk,
    Run,
    Jump,
    Fall,
    Land,
    Interact,
    Victory,
    Defeat,
    Typing // Special animation when using terminal
}

/// <summary>
/// Character animation data for sprite sheet animations
/// </summary>
[Serializable]
public class CharacterAnimationData
{
    public CharacterAnimationState state;
    public int startFrame;
    public int endFrame;
    public float frameRate; // Frames per second
    public bool loop;

    public CharacterAnimationData(CharacterAnimationState animState, int start, int end, float fps = 12f, bool isLoop = true)
    {
        state = animState;
        startFrame = start;
        endFrame = end;
        frameRate = fps;
        loop = isLoop;
    }
}
