using System;
using System.IO;
using System.Threading.Tasks;
using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Save Manager for local JSON storage + MySQL sync (FR12, NFR1)
/// Handles multiple save slots and offline/online synchronization
/// </summary>
public class SaveManager : MonoBehaviour
{
    private static SaveManager _instance;
    public static SaveManager Instance => _instance;

    [Header("Save Configuration")]
    [SerializeField] private int maxSaveSlots = 3;
    [SerializeField] private bool autoSaveEnabled = true;
    [SerializeField] private float autoSaveInterval = 300f; // 5 minutes

    private readonly IStorageService _localStorage;
    private readonly IAPIService _apiService;
    private string _saveFolderPath;
    private float _autoSaveTimer;

    // Current active save
    public PlayerData CurrentSave { get; private set; }
    public bool HasActiveSave => CurrentSave != null;
    public int CurrentSlot { get; private set; } = -1;

    // Events
    public event Action<PlayerData> OnSaveLoaded;
    public event Action<PlayerData> OnSaveCompleted;
    public event Action OnSaveDeleted;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);

        InitializeSaveSystem();
    }

    private void Update()
    {
        // Auto-save timer
        if (autoSaveEnabled && HasActiveSave)
        {
            _autoSaveTimer += Time.deltaTime;
            if (_autoSaveTimer >= autoSaveInterval)
            {
                _autoSaveTimer = 0f;
                _ = AutoSave();
            }
        }
    }

    private void InitializeSaveSystem()
    {
        // Set up save folder path
        _saveFolderPath = Path.Combine(Application.persistentDataPath, "Saves");

        // Create saves folder if it doesn't exist
        if (!Directory.Exists(_saveFolderPath))
        {
            Directory.CreateDirectory(_saveFolderPath);
            Debug.Log($"Created save folder at: {_saveFolderPath}");
        }

        Debug.Log($"Save system initialized. Save path: {_saveFolderPath}");
    }

    // ============================================================
    // SAVE SLOT MANAGEMENT (FR2)
    // ============================================================

    /// <summary>
    /// Get all save slots with metadata
    /// </summary>
    public List<SaveSlotInfo> GetAllSaveSlots()
    {
        List<SaveSlotInfo> slots = new List<SaveSlotInfo>();

        for (int i = 0; i < maxSaveSlots; i++)
        {
            string filePath = GetSaveFilePath(i);

            if (File.Exists(filePath))
            {
                try
                {
                    string json = File.ReadAllText(filePath);
                    SaveFileData saveData = JsonUtility.FromJson<SaveFileData>(json);

                    slots.Add(new SaveSlotInfo
                    {
                        slotIndex = i,
                        isEmpty = false,
                        username = saveData.playerData.username,
                        currentLevel = saveData.playerData.currentLevel,
                        totalTokens = saveData.playerData.totalTokens,
                        totalPlayTime = saveData.playerData.totalPlayTime,
                        lastSaved = saveData.lastSavedLocal
                    });
                }
                catch (Exception ex)
                {
                    Debug.LogError($"Error reading save slot {i}: {ex.Message}");
                    slots.Add(new SaveSlotInfo { slotIndex = i, isEmpty = true });
                }
            }
            else
            {
                slots.Add(new SaveSlotInfo { slotIndex = i, isEmpty = true });
            }
        }

        return slots;
    }

    /// <summary>
    /// Create new save file in specified slot
    /// </summary>
    public async Task<bool> CreateNewSave(int slotIndex, string username)
    {
        if (slotIndex < 0 || slotIndex >= maxSaveSlots)
        {
            Debug.LogError($"Invalid save slot: {slotIndex}");
            return false;
        }

        try
        {
            // Create new player data
            PlayerData newPlayer = new PlayerData
            {
                username = username,
                saveSlotName = $"Slot{slotIndex + 1}",
                currentLevel = 1,
                highestLevel = 1,
                totalTokens = 0,
                equippedSkin = "default",
                ownedSkins = new List<string> { "default" },
                lastSavedLocal = DateTime.Now
            };

            // Save locally
            bool localSaved = await SaveToFile(slotIndex, newPlayer);

            if (localSaved)
            {
                CurrentSave = newPlayer;
                CurrentSlot = slotIndex;
                OnSaveCompleted?.Invoke(CurrentSave);
                Debug.Log($"New save created in slot {slotIndex}: {username}");
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error creating new save: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Load save from specified slot
    /// </summary>
    public async Task<bool> LoadSave(int slotIndex)
    {
        if (slotIndex < 0 || slotIndex >= maxSaveSlots)
        {
            Debug.LogError($"Invalid save slot: {slotIndex}");
            return false;
        }

        try
        {
            string filePath = GetSaveFilePath(slotIndex);

            if (!File.Exists(filePath))
            {
                Debug.LogWarning($"No save file found in slot {slotIndex}");
                return false;
            }

            string json = File.ReadAllText(filePath);
            SaveFileData saveData = JsonUtility.FromJson<SaveFileData>(json);

            CurrentSave = saveData.playerData;
            CurrentSlot = slotIndex;

            // Check if we need to sync with backend
            if (CurrentSave.needsSync && !string.IsNullOrEmpty(CurrentSave.authToken))
            {
                await SyncWithBackend();
            }

            OnSaveLoaded?.Invoke(CurrentSave);
            Debug.Log($"Save loaded from slot {slotIndex}: {CurrentSave.username}");
            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading save: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Save current game progress to file (FR12)
    /// </summary>
    public async Task<bool> SaveGame()
    {
        if (!HasActiveSave)
        {
            Debug.LogWarning("No active save to save");
            return false;
        }

        try
        {
            CurrentSave.lastSavedLocal = DateTime.Now;
            bool saved = await SaveToFile(CurrentSlot, CurrentSave);

            if (saved)
            {
                OnSaveCompleted?.Invoke(CurrentSave);
                Debug.Log($"Game saved to slot {CurrentSlot}");
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error saving game: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Delete save file from slot
    /// </summary>
    public bool DeleteSave(int slotIndex)
    {
        if (slotIndex < 0 || slotIndex >= maxSaveSlots)
        {
            Debug.LogError($"Invalid save slot: {slotIndex}");
            return false;
        }

        try
        {
            string filePath = GetSaveFilePath(slotIndex);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);

                if (CurrentSlot == slotIndex)
                {
                    CurrentSave = null;
                    CurrentSlot = -1;
                }

                OnSaveDeleted?.Invoke();
                Debug.Log($"Save deleted from slot {slotIndex}");
                return true;
            }

            Debug.LogWarning($"No save file to delete in slot {slotIndex}");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error deleting save: {ex.Message}");
            return false;
        }
    }

    // ============================================================
    // AUTO-SAVE SYSTEM
    // ============================================================

    private async Task AutoSave()
    {
        if (HasActiveSave)
        {
            bool success = await SaveGame();
            if (success)
            {
                Debug.Log("Auto-save completed");
            }
        }
    }

    // ============================================================
    // BACKEND SYNCHRONIZATION (FR12)
    // ============================================================

    /// <summary>
    /// Sync local save with backend MySQL database
    /// </summary>
    public async Task<bool> SyncWithBackend()
    {
        if (!HasActiveSave)
        {
            Debug.LogWarning("No active save to sync");
            return false;
        }

        if (string.IsNullOrEmpty(CurrentSave.authToken))
        {
            Debug.LogWarning("No auth token - cannot sync with backend");
            return false;
        }

        try
        {
            // Use GameManager's API service
            var apiService = GameManager.Instance.APIService;

            // Sync progress
            var progressRequest = new ProgressUpdateRequest(
                CurrentSave.highestLevel,
                CurrentSave.totalTokens,
                CurrentSave.totalPlayTime,
                0, // hintsUsed
                false // isPerfect
            );

            var progressResponse = await apiService.Post<ProgressUpdateResponse>(
                "/progress/update",
                progressRequest,
                CurrentSave.authToken
            );

            if (progressResponse.IsSuccess)
            {
                CurrentSave.needsSync = false;
                await SaveGame();
                Debug.Log("Save synced with backend successfully");
                return true;
            }

            Debug.LogWarning("Failed to sync with backend");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Backend sync error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Load player data from backend (overwrite local)
    /// </summary>
    public async Task<bool> LoadFromBackend(string authToken)
    {
        try
        {
            var apiService = GameManager.Instance.APIService;

            var sessionResponse = await apiService.Post<SessionResponse>(
                "/auth/sessionToken",
                new { },
                authToken
            );

            if (sessionResponse.IsSuccess && sessionResponse.Data != null)
            {
                var backendUser = sessionResponse.Data.data.user;

                // Update current save with backend data
                if (HasActiveSave)
                {
                    CurrentSave.UpdateFromBackend(new ProgressData
                    {
                        currentLevel = backendUser.progress.currentLevel,
                        highestLevel = backendUser.progress.highestLevel,
                        totalTokens = backendUser.progress.totalTokens,
                        totalPlayTime = backendUser.progress.totalPlayTime,
                        equippedSkin = backendUser.progress.equippedSkin,
                        lastPlayed = backendUser.progress.lastPlayed
                    });

                    await SaveGame();
                    Debug.Log("Loaded data from backend successfully");
                    return true;
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading from backend: {ex.Message}");
            return false;
        }
    }

    // ============================================================
    // FILE OPERATIONS
    // ============================================================

    private async Task<bool> SaveToFile(int slotIndex, PlayerData playerData)
    {
        try
        {
            SaveFileData saveData = new SaveFileData
            {
                version = "1.0",
                lastSavedLocal = DateTime.Now,
                playerData = playerData
            };

            string json = JsonUtility.ToJson(saveData, true);
            string filePath = GetSaveFilePath(slotIndex);

            await File.WriteAllTextAsync(filePath, json);
            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error writing save file: {ex.Message}");
            return false;
        }
    }

    private string GetSaveFilePath(int slotIndex)
    {
        return Path.Combine(_saveFolderPath, $"save_slot_{slotIndex}.json");
    }

    // ============================================================
    // UTILITY
    // ============================================================

    public void UpdateCurrentSave(PlayerData updatedData)
    {
        if (HasActiveSave)
        {
            CurrentSave = updatedData;
            CurrentSave.MarkDirty(); // Flag for sync
        }
    }

    private void OnApplicationQuit()
    {
        // Save before quitting
        if (HasActiveSave)
        {
            _ = SaveGame();
        }
    }

    private void OnApplicationPause(bool pauseStatus)
    {
        // Save when app loses focus (mobile)
        if (pauseStatus && HasActiveSave)
        {
            _ = SaveGame();
        }
    }
}

// ============================================================
// DATA STRUCTURES
// ============================================================

[Serializable]
public class SaveFileData
{
    public string version;
    public DateTime lastSavedLocal;
    public PlayerData playerData;
}

[Serializable]
public class SaveSlotInfo
{
    public int slotIndex;
    public bool isEmpty;
    public string username;
    public int currentLevel;
    public int totalTokens;
    public float totalPlayTime;
    public DateTime lastSaved;
}

[Serializable]
public class ProgressUpdateResponse
{
    public bool success;
    public ProgressData data;
}
