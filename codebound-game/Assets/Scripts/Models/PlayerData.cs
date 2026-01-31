using System;
using System.Collections.Generic;

/// <summary>
/// Main player data model matching backend User + UserProgress structure
/// Handles local save and backend sync for FR12
/// </summary>
[Serializable]
public class PlayerData
{
    // User Authentication (from backend /auth)
    public string userId;
    public string username;
    public string email;
    public string avatar;
    public string authToken; // JWT token for API calls

    // Progress Data (from backend /progress)
    public int currentLevel;
    public int highestLevel;
    public int totalTokens;
    public float totalPlayTime; // in seconds
    public string equippedSkin; // default, cyber, ninja, robot, pirate, wizard, knight, space
    public DateTime lastPlayed;

    // Local Save Metadata
    public string saveSlotName; // For multiple save files (FR2)
    public DateTime lastSavedLocal;
    public bool needsSync; // Flag for offline changes to sync

    // Achievement Progress (from backend /achievements)
    public List<UserAchievement> achievements;

    // Owned Skins (from backend /skins)
    public List<string> ownedSkins; // skinIds

    // Settings (Local only)
    public GameSettings settings;

    public PlayerData()
    {
        userId = "";
        username = "Player";
        email = "";
        avatar = null;
        authToken = "";
        
        currentLevel = 1;
        highestLevel = 1;
        totalTokens = 0;
        totalPlayTime = 0f;
        equippedSkin = "default";
        lastPlayed = DateTime.Now;

        saveSlotName = "Slot1";
        lastSavedLocal = DateTime.Now;
        needsSync = false;

        achievements = new List<UserAchievement>();
        ownedSkins = new List<string> { "default" }; // Everyone starts with default
        settings = new GameSettings();
    }

    /// <summary>
    /// Update progress data from backend response
    /// </summary>
    public void UpdateFromBackend(ProgressData backendData)
    {
        currentLevel = backendData.currentLevel;
        highestLevel = backendData.highestLevel;
        totalTokens = backendData.totalTokens;
        totalPlayTime = backendData.totalPlayTime;
        equippedSkin = backendData.equippedSkin ?? "default";
        lastPlayed = DateTime.Parse(backendData.lastPlayed);
        needsSync = false;
    }

    /// <summary>
    /// Mark data as needing sync when offline changes are made
    /// </summary>
    public void MarkDirty()
    {
        needsSync = true;
        lastSavedLocal = DateTime.Now;
    }
}

/// <summary>
/// Achievement tracking (matches backend UserAchievement)
/// </summary>
[Serializable]
public class UserAchievement
{
    public string achievementId; // first_level, level_10, speed_demon, etc.
    public int progress; // 0-100
    public bool isUnlocked;
    public DateTime? unlockedAt;

    public UserAchievement(string id)
    {
        achievementId = id;
        progress = 0;
        isUnlocked = false;
        unlockedAt = null;
    }
}

/// <summary>
/// Progress data from backend /progress endpoint
/// </summary>
[Serializable]
public class ProgressData
{
    public string id;
    public string userId;
    public int currentLevel;
    public int highestLevel;
    public int totalTokens;
    public float totalPlayTime;
    public string lastPlayed;
    public string equippedSkin;
    public string created_at;
    public string updated_at;
}

/// <summary>
/// Request body for /progress/update endpoint (FR7)
/// </summary>
[Serializable]
public class ProgressUpdateRequest
{
    public int levelCompleted;
    public int tokensEarned;
    public float timeSpent;
    public int hintsUsed;
    public bool isPerfect; // No hints, fast completion

    public ProgressUpdateRequest(int level, int tokens, float time, int hints, bool perfect)
    {
        levelCompleted = level;
        tokensEarned = tokens;
        timeSpent = time;
        hintsUsed = hints;
        isPerfect = perfect;
    }
}

/// <summary>
/// Game settings (local only) for FR6 - Options menu
/// </summary>
[Serializable]
public class GameSettings
{
    public float masterVolume;
    public float musicVolume;
    public float sfxVolume;
    public float brightness;
    public bool showHints;
    public bool enableParticles;
    public KeyBindings keyBindings;

    public GameSettings()
    {
        masterVolume = 1.0f;
        musicVolume = 0.7f;
        sfxVolume = 0.8f;
        brightness = 0.5f;
        showHints = true;
        enableParticles = true;
        keyBindings = new KeyBindings();
    }
}

/// <summary>
/// Keybindings for customizable controls
/// </summary>
[Serializable]
public class KeyBindings
{
    public string moveLeft;
    public string moveRight;
    public string jump;
    public string interact;
    public string openTerminal;
    public string switchCharacter;

    public KeyBindings()
    {
        moveLeft = "A";
        moveRight = "D";
        jump = "W";
        interact = "E";
        openTerminal = "T";
        switchCharacter = "Tab";
    }
}
