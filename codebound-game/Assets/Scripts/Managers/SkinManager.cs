using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Skin Manager - Handles the Visual application of skins.
/// Combines Data (from Backend/SkinService) with Assets (from SkinRegistry).
/// </summary>
public class SkinManager : MonoBehaviour
{
    private static SkinManager _instance;
    public static SkinManager Instance => _instance;

    [Header("Configuration")]
    [SerializeField] private SkinRegistry skinRegistry; // Drag the ScriptableObject here in Inspector

    // State
    public string EquippedSkinId { get; private set; } = "default";
    
    // Events
    public event Action<string> OnSkinChanged;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        _instance = this;
        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        // Load initial equipped skin from local save first (fast load)
        if (SaveManager.Instance.HasActiveSave)
        {
            EquippedSkinId = SaveManager.Instance.CurrentSave.equippedSkin;
        }
    }

    /// <summary>
    /// Apply a skin to a character object
    /// </summary>
    /// <param name="characterAnimator">The animator of the player character</param>
    /// <param name="characterSprite">The sprite renderer of the player character</param>
    public void ApplySkinToCharacter(Animator characterAnimator, SpriteRenderer characterSprite)
    {
        if (skinRegistry == null)
        {
            Debug.LogError("SkinRegistry not assigned in SkinManager!");
            return;
        }

        var assets = skinRegistry.GetSkinAssets(EquippedSkinId);
        if (assets != null)
        {
            // Apply Animations
            if (assets.animator != null && characterAnimator != null)
            {
                characterAnimator.runtimeAnimatorController = assets.animator;
            }

            // Apply Color/Sprite (Styles like Pico Park often use colors)
            if (characterSprite != null)
            {
                if (assets.staticBodySprite != null)
                    characterSprite.sprite = assets.staticBodySprite;
                
                // Optional: Tint the character if the sprite is white
                // characterSprite.color = assets.themeColor; 
            }
        }
    }

    /// <summary>
    /// Equip a new skin (Calls backend to save preference)
    /// </summary>
    public async Task<bool> EquipSkin(string skinId)
    {
        // 1. Validate we own it (Backend check happens in SkinService, but we can check local data too)
        var playerData = SaveManager.Instance.CurrentSave;
        if (playerData != null && !playerData.ownedSkins.Contains(skinId))
        {
            Debug.LogError("Cannot equip unowned skin!");
            return false;
        }

        // 2. Call Backend API
        string authToken = GameManager.Instance.AuthService.CurrentToken;
        bool success = await GameManager.Instance.SkinService.EquipSkin(skinId, authToken);

        if (success)
        {
            // 3. Update Local State
            EquippedSkinId = skinId;
            if (playerData != null)
            {
                playerData.equippedSkin = skinId;
                SaveManager.Instance.UpdateCurrentSave(playerData);
            }

            // 4. Notify Listeners (Player Controller will re-apply skin)
            OnSkinChanged?.Invoke(skinId);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Get the UI Icon for a skin
    /// </summary>
    public Sprite GetSkinIcon(string skinId)
    {
        if (skinRegistry == null) return null;
        return skinRegistry.GetSkinAssets(skinId)?.shopIcon;
    }
    
    /// <summary>
    /// Get the Theme Color for a skin
    /// </summary>
    public Color GetSkinColor(string skinId)
    {
        if (skinRegistry == null) return Color.white;
        return skinRegistry.GetSkinAssets(skinId)?.themeColor ?? Color.white;
    }
}
