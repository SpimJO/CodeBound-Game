using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Skin Service - Fetches skin data dynamically from backend
/// NO STATIC DATA - All skins loaded from /skins/available endpoint
/// </summary>
public class SkinService
{
    private readonly IAPIService _apiService;
    private List<SkinData> _cachedSkins;
    private DateTime _lastCacheUpdate;
    private const float CACHE_DURATION = 3600f; // 1 hour

    public SkinService(IAPIService apiService)
    {
        _apiService = apiService;
        _cachedSkins = new List<SkinData>();
        _lastCacheUpdate = DateTime.MinValue;
    }

    /// <summary>
    /// Get all available skins from backend
    /// GET /skins/available (PUBLIC endpoint)
    /// </summary>
    public async Task<List<SkinData>> GetAvailableSkins(bool forceRefresh = false)
    {
        try
        {
            // Return cached if still valid
            if (!forceRefresh && _cachedSkins.Count > 0)
            {
                float timeSinceUpdate = (float)(DateTime.Now - _lastCacheUpdate).TotalSeconds;
                if (timeSinceUpdate < CACHE_DURATION)
                {
                    Debug.Log("Returning cached skins");
                    return _cachedSkins;
                }
            }

            Debug.Log("Fetching available skins from backend...");

            var response = await _apiService.Get<SkinsAvailableResponse>("/skins/available");

            if (response.IsSuccess && response.Data != null)
            {
                _cachedSkins = ConvertBackendSkinsToUnity(response.Data.data);
                _lastCacheUpdate = DateTime.Now;

                Debug.Log($"Loaded {_cachedSkins.Count} skins from backend");
                return _cachedSkins;
            }

            Debug.LogWarning("Failed to load skins from backend");
            return _cachedSkins; // Return cached even if expired
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching skins: {ex.Message}");
            return _cachedSkins; // Return cached on error
        }
    }

    /// <summary>
    /// Get owned skins for current user
    /// GET /skins (PROTECTED endpoint)
    /// </summary>
    public async Task<List<SkinData>> GetOwnedSkins(string authToken)
    {
        try
        {
            var response = await _apiService.Get<OwnedSkinsResponse>("/skins", authToken);

            if (response.IsSuccess && response.Data != null)
            {
                List<SkinData> ownedSkins = new List<SkinData>();

                // Convert backend response to SkinData
                foreach (var userSkin in response.Data.data)
                {
                    SkinData skin = await GetSkinById(userSkin.skinId);
                    if (skin != null)
                    {
                        skin.isOwned = true;
                        skin.purchasedAt = DateTime.Parse(userSkin.purchasedAt);
                        ownedSkins.Add(skin);
                    }
                }

                Debug.Log($"User owns {ownedSkins.Count} skins");
                return ownedSkins;
            }

            return new List<SkinData>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching owned skins: {ex.Message}");
            return new List<SkinData>();
        }
    }

    /// <summary>
    /// Purchase a skin with tokens
    /// POST /skins/purchase (PROTECTED endpoint)
    /// </summary>
    public async Task<PurchaseResult> PurchaseSkin(string skinId, int tokenCost, string authToken)
    {
        try
        {
            var purchaseRequest = new SkinPurchaseRequest(skinId, tokenCost);

            var response = await _apiService.Post<SkinPurchaseResponse>(
                "/skins/purchase",
                purchaseRequest,
                authToken
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Successfully purchased skin: {skinId}");
                return new PurchaseResult
                {
                    success = true,
                    message = "Skin purchased successfully",
                    remainingTokens = response.Data.data.progress.totalTokens,
                    skinId = skinId
                };
            }

            return new PurchaseResult
            {
                success = false,
                message = response.ErrorMessage ?? "Purchase failed",
                remainingTokens = 0,
                skinId = skinId
            };
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error purchasing skin: {ex.Message}");
            return new PurchaseResult
            {
                success = false,
                message = ex.Message,
                remainingTokens = 0,
                skinId = skinId
            };
        }
    }

    /// <summary>
    /// Equip a skin
    /// POST /skins/equip (PROTECTED endpoint)
    /// </summary>
    public async Task<bool> EquipSkin(string skinId, string authToken)
    {
        try
        {
            var equipRequest = new SkinEquipRequest(skinId);

            var response = await _apiService.Post<SkinEquipResponse>(
                "/skins/equip",
                equipRequest,
                authToken
            );

            if (response.IsSuccess)
            {
                Debug.Log($"Successfully equipped skin: {skinId}");
                return true;
            }

            Debug.LogWarning($"Failed to equip skin: {response.ErrorMessage}");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error equipping skin: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Get specific skin by ID from cache or backend
    /// </summary>
    public async Task<SkinData> GetSkinById(string skinId)
    {
        // Check cache first
        if (_cachedSkins.Count > 0)
        {
            var cached = _cachedSkins.Find(s => s.skinId == skinId);
            if (cached != null) return cached;
        }

        // Fetch from backend if not in cache
        var allSkins = await GetAvailableSkins();
        return allSkins.Find(s => s.skinId == skinId);
    }

    /// <summary>
    /// Check if player can afford a skin
    /// </summary>
    public bool CanAfford(int tokenCost, int playerTokens)
    {
        return playerTokens >= tokenCost;
    }

    /// <summary>
    /// Convert backend skin response to Unity SkinData
    /// </summary>
    private List<SkinData> ConvertBackendSkinsToUnity(List<BackendSkinData> backendSkins)
    {
        List<SkinData> skins = new List<SkinData>();

        foreach (var backendSkin in backendSkins)
        {
            SkinData skin = new SkinData
            {
                skinId = backendSkin.id,
                skinName = backendSkin.name,
                description = backendSkin.description,
                tokenCost = backendSkin.tokenCost,
                isDefault = backendSkin.isDefault,
                isOwned = false, // Will be set when checking owned skins
                isEquipped = false,
                purchasedAt = null,
                // Map backend IDs to Unity asset paths
                spriteSheetPath = GetSpritePathForSkin(backendSkin.id),
                animatorController = GetAnimatorPathForSkin(backendSkin.id)
            };

            skins.Add(skin);
        }

        return skins;
    }

    /// <summary>
    /// Map skin ID to Unity sprite sheet path
    /// Matches backend skin IDs: default, cyber, ninja, robot, pirate, wizard, knight, space
    /// </summary>
    private string GetSpritePathForSkin(string skinId)
    {
        return skinId switch
        {
            "default" => "Sprites/Characters/Default",
            "cyber" => "Sprites/Characters/Cyber",
            "ninja" => "Sprites/Characters/Ninja",
            "robot" => "Sprites/Characters/Robot",
            "pirate" => "Sprites/Characters/Pirate",
            "wizard" => "Sprites/Characters/Wizard",
            "knight" => "Sprites/Characters/Knight",
            "space" => "Sprites/Characters/Space",
            _ => "Sprites/Characters/Default"
        };
    }

    /// <summary>
    /// Map skin ID to Unity animator controller path
    /// Matches backend skin IDs: default, cyber, ninja, robot, pirate, wizard, knight, space
    /// </summary>
    private string GetAnimatorPathForSkin(string skinId)
    {
        return skinId switch
        {
            "default" => "Animations/Characters/DefaultAnimator",
            "cyber" => "Animations/Characters/CyberAnimator",
            "ninja" => "Animations/Characters/NinjaAnimator",
            "robot" => "Animations/Characters/RobotAnimator",
            "pirate" => "Animations/Characters/PirateAnimator",
            "wizard" => "Animations/Characters/WizardAnimator",
            "knight" => "Animations/Characters/KnightAnimator",
            "space" => "Animations/Characters/SpaceAnimator",
            _ => "Animations/Characters/DefaultAnimator"
        };
    }
}

// ============================================================
// BACKEND RESPONSE MODELS
// ============================================================

[Serializable]
public class SkinsAvailableResponse
{
    public bool success;
    public List<BackendSkinData> data;
}

[Serializable]
public class BackendSkinData
{
    public string id;
    public string name;
    public string description;
    public int tokenCost;
    public bool isDefault;
}

[Serializable]
public class OwnedSkinsResponse
{
    public bool success;
    public List<UserSkinData> data;
}

[Serializable]
public class UserSkinData
{
    public string id;
    public string userId;
    public string skinId;
    public string purchasedAt;
    public int purchasedWithTokens;
}

[Serializable]
public class SkinPurchaseResponse
{
    public bool success;
    public SkinPurchaseData data;
}

[Serializable]
public class SkinPurchaseData
{
    public UserSkinData skin;
    public PurchaseProgressData progress;
}

[Serializable]
public class PurchaseProgressData
{
    public int totalTokens;
    public int currentLevel;
    public int highestLevel;
}

[Serializable]
public class SkinEquipResponse
{
    public bool success;
    public EquipData data;
}

[Serializable]
public class EquipData
{
    public string id;
    public string userId;
    public string equippedSkin;
}

[Serializable]
public class PurchaseResult
{
    public bool success;
    public string message;
    public int remainingTokens;
    public string skinId;
}
