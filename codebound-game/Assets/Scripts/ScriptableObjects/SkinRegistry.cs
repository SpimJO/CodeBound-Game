using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Skin Registry - Maps Backend IDs to Unity Assets
/// This bridges the gap between the Backend Data (Strings) and Unity Visuals (Sprites/Animators)
/// Usage: Create this in Assets folder via Right Click > CodeBound > Skin Registry
/// </summary>
[CreateAssetMenu(fileName = "SkinRegistry", menuName = "CodeBound/Skin Registry")]
public class SkinRegistry : ScriptableObject
{
    [System.Serializable]
    public class SkinAssetEntry
    {
        [Header("Backend Identity")]
        public string skinId;          // Must match backend ID (e.g., "ninja", "wizard")

        [Header("Visual Assets")]
        public Sprite shopIcon;        // Icon for Shop UI
        public RuntimeAnimatorController animator; // Animation controller for in-game character
        public Color themeColor = Color.white; // Theme color for particles/trails

        [Header("Pico Park / Fireboy Style")]
        public Sprite staticBodySprite; // If using simple non-animated sprite (Pico Park style body)

        [Header("Metal Slug Style Selection")]
        public Sprite characterPortrait; // Large detailed portrait for selection screen (Card Art)
        public Sprite nameplateBackground; // Optional custom border/bg for the card
    }

    [Header("Registered Skins")]
    public List<SkinAssetEntry> skins;

    /// <summary>
    /// Find visual assets for a specific skin ID
    /// </summary>
    public SkinAssetEntry GetSkinAssets(string id)
    {
        var skin = skins.Find(s => s.skinId == id);
        if (skin == null)
        {
            Debug.LogWarning($"Skin assets not found for ID: {id}. Returning default.");
            if (skins.Count > 0) return skins[0]; // Fallback to first skin
            return null;
        }
        return skin;
    }
}
