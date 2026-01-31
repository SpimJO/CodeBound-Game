using UnityEngine;
using System.Collections.Generic;
using CodeBound.Services;

namespace CodeBound.Managers
{
    /// <summary>
    /// Manages player sprite/skin changes and animations
    /// Non-static implementation - attached to Player GameObject
    /// </summary>
    public class PlayerSpriteManager : MonoBehaviour
    {
        [Header("Sprite Components")]
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private Animator animator;
        
        [Header("Available Skins")]
        [SerializeField] private List<SkinData> availableSkins = new List<SkinData>();
        
        private string currentSkinId = "default";
        private ISkinService skinService;
        
        private void Awake()
        {
            // Get components if not assigned
            if (spriteRenderer == null)
                spriteRenderer = GetComponent<SpriteRenderer>();
            
            if (animator == null)
                animator = GetComponent<Animator>();
        }
        
        private async void Start()
        {
            // Get skin service
            skinService = ServiceLocator.GetService<ISkinService>();
            
            // Load equipped skin from backend
            if (skinService != null)
            {
                try
                {
                    string equippedSkinId = await skinService.GetEquippedSkin();
                    ApplySkin(equippedSkinId);
                }
                catch (System.Exception ex)
                {
                    Debug.LogWarning($"Failed to load equipped skin, using default: {ex.Message}");
                    ApplySkin("default");
                }
            }
            else
            {
                ApplySkin("default");
            }
        }
        
        /// <summary>
        /// Apply a specific skin to the player
        /// </summary>
        public void ApplySkin(string skinId)
        {
            SkinData skinData = availableSkins.Find(s => s.skinId == skinId);
            
            if (skinData != null)
            {
                currentSkinId = skinId;
                
                // Update animator controller if skin has custom animations
                if (skinData.animatorController != null && animator != null)
                {
                    animator.runtimeAnimatorController = skinData.animatorController;
                }
                
                // Update sprite if using single sprite mode
                if (skinData.idleSprite != null && spriteRenderer != null && animator == null)
                {
                    spriteRenderer.sprite = skinData.idleSprite;
                }
                
                Debug.Log($"Applied skin: {skinId}");
            }
            else
            {
                Debug.LogWarning($"Skin not found: {skinId}, using default");
                ApplySkin("default");
            }
        }
        
        /// <summary>
        /// Get current equipped skin ID
        /// </summary>
        public string GetCurrentSkin()
        {
            return currentSkinId;
        }
        
        /// <summary>
        /// Refresh skin from backend (call after equipping new skin)
        /// </summary>
        public async void RefreshSkin()
        {
            if (skinService != null)
            {
                try
                {
                    string equippedSkinId = await skinService.GetEquippedSkin();
                    ApplySkin(equippedSkinId);
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"Failed to refresh skin: {ex.Message}");
                }
            }
        }
    }
    
    /// <summary>
    /// Data structure for skin configuration
    /// </summary>
    [System.Serializable]
    public class SkinData
    {
        [Header("Skin Info")]
        public string skinId;
        public string skinName;
        
        [Header("Visual Assets")]
        public Sprite idleSprite;  // For static display
        public RuntimeAnimatorController animatorController;  // For animations
        
        [Header("Optional Effects")]
        public GameObject particleEffectPrefab;  // Skin-specific particles
        public Color glowColor = Color.white;  // Skin-specific glow/trail color
    }
}
