using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using System.Threading.Tasks;

/// <summary>
/// Level Manager for 100 levels with sequential unlocking (FR11)
/// Handles level loading, progression, and completion tracking (FR7, FR8)
/// </summary>
public class LevelManager : MonoBehaviour
{
    private static LevelManager _instance;
    public static LevelManager Instance => _instance;

    [Header("Level Configuration")]
    [SerializeField] private int totalLevels = 100;
    [SerializeField] private TextAsset[] levelDefinitions; // JSON level configs

    // Level data storage
    private Dictionary<int, LevelData> _allLevels;
    private Dictionary<int, LevelCompletionRecord> _completionRecords;

    // Current level state
    public LevelData CurrentLevel { get; private set; }
    public int CurrentLevelNumber { get; private set; }
    public bool IsLevelActive { get; private set; }

    // Gameplay tracking
    private float _currentLevelStartTime;
    private int _hintsUsedThisLevel;
    private int _tokensCollectedThisLevel;
    private int _attemptCount;

    // Events
    public event Action<LevelData> OnLevelLoaded;
    public event Action<LevelCompletionRecord> OnLevelCompleted;
    public event Action OnLevelFailed;
    public event Action<int> OnLevelUnlocked;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);

        InitializeLevelManager();
    }

    public List<LevelData> GetAllLevels()
    {
        if (_allLevels == null) return new List<LevelData>();
        return _allLevels.Values.OrderBy(l => l.levelNumber).ToList();
    }

    public LevelData GetLevel(int levelNumber)
    {
        if (_allLevels != null && _allLevels.TryGetValue(levelNumber, out LevelData data))
            return data;
        return null;
    }

    public void LoadLevel(int levelNumber)
    {
        LevelData data = GetLevel(levelNumber);
        if (data == null)
        {
            Debug.LogError($"Level {levelNumber} not found!");
            return;
        }

        // Logic to load the scene
        // SceneManager.LoadScene(data.sceneName);
        CurrentLevel = data;
        // OnLevelLoaded?.Invoke(data);
        Debug.Log($"Loading Level {levelNumber}: {data.levelName}");
    }

    private void InitializeLevelManager()
    {
        _allLevels = new Dictionary<int, LevelData>();
        _completionRecords = new Dictionary<int, LevelCompletionRecord>();

        LoadAllLevelDefinitions();
        Debug.Log($"Level Manager initialized with {_allLevels.Count} levels");
    }

    // ============================================================
    // LEVEL LOADING
    // ============================================================

    /// <summary>
    /// Load level definitions from JSON files in Resources/LevelData
    /// </summary>
    private void LoadAllLevelDefinitions()
    {
        _allLevels.Clear();

        // 1. Load from Resources/LevelData
        TextAsset[] levelFiles = Resources.LoadAll<TextAsset>("LevelData");
        
        if (levelFiles != null && levelFiles.Length > 0)
        {
            foreach (TextAsset file in levelFiles)
            {
                try 
                {
                    LevelData data = JsonUtility.FromJson<LevelData>(file.text);
                    if (data != null)
                    {
                        _allLevels[data.levelNumber] = data;
                    }
                }
                catch (Exception e)
                {
                    Debug.LogError($"Failed to parse level data from {file.name}: {e.Message}");
                }
            }
        }
        
        Debug.Log($"Level Manager initialized with {_allLevels.Count} levels from Resources.");

        // Fallback if no files found (legacy test mode)
        if (_allLevels.Count == 0)
        {
            Debug.LogWarning("No level files found in Resources/LevelData. Creating test level.");
            _allLevels[1] = CreateTestLevel();
        }
    }

    /// <summary>
    /// Create a test level for development (REMOVE IN PRODUCTION)
    /// </summary>
    private LevelData CreateTestLevel()
    {
        return new LevelData
        {
            levelNumber = 1,
            levelName = "Basics: Hello World",
            category = LevelCategories.BASICS,
            difficulty = LevelDifficulty.Easy,
            puzzleDescription = "Write a program that prints 'Hello World'",
            objective = "Print 'Hello World' to the console",
            starterCode = "// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // Your code\n    }\n}",
            hints = new List<string> 
            { 
                "Use System.out.println() to print text",
                "The text should be exactly 'Hello World'",
                "Don't forget the semicolon!"
            },
            baseTokenReward = 50,
            perfectBonus = 25,
            speedBonus = 25,
            sceneName = "Level_1",
            tokensToCollect = 3,
            isLocked = false,
            requiredLevel = 0
        };
    }

    /// <summary>
    /// Start playing a level (FR3)
    /// </summary>
    public async Task<bool> LoadLevel(int levelNumber)
    {
        if (levelNumber < 1 || levelNumber > totalLevels)
        {
            Debug.LogError($"Invalid level number: {levelNumber}");
            return false;
        }

        // Check if level is unlocked (FR11)
        if (!IsLevelUnlocked(levelNumber))
        {
            Debug.LogWarning($"Level {levelNumber} is locked");
            return false;
        }

        if (!_allLevels.ContainsKey(levelNumber))
        {
            Debug.LogError($"Level {levelNumber} data not found");
            return false;
        }

        try
        {
            CurrentLevel = _allLevels[levelNumber];
            CurrentLevelNumber = levelNumber;
            IsLevelActive = true;

            // Reset level tracking
            _currentLevelStartTime = Time.time;
            _hintsUsedThisLevel = 0;
            _tokensCollectedThisLevel = 0;
            _attemptCount++;

            // Load Unity scene for the level
            await LoadLevelScene(CurrentLevel.sceneName);

            OnLevelLoaded?.Invoke(CurrentLevel);
            Debug.Log($"Level {levelNumber} loaded: {CurrentLevel.levelName}");
            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading level {levelNumber}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Complete current level and update progress (FR7)
    /// </summary>
    public async Task<LevelCompletionRecord> CompleteLevel(bool codeCorrect, int tokensEarned)
    {
        if (!IsLevelActive || CurrentLevel == null)
        {
            Debug.LogError("No active level to complete");
            return null;
        }

        float completionTime = Time.time - _currentLevelStartTime;

        // Calculate performance metrics
        bool isPerfect = _hintsUsedThisLevel == 0 && completionTime <= CurrentLevel.averageCompletionTime;
        int starsEarned = LevelUnlockLogic.CalculateStars(
            completionTime,
            _hintsUsedThisLevel,
            CurrentLevel.averageCompletionTime > 0 ? CurrentLevel.averageCompletionTime : 120f
        );

        // Create completion record
        LevelCompletionRecord record = new LevelCompletionRecord
        {
            levelNumber = CurrentLevelNumber,
            isCompleted = codeCorrect,
            starsEarned = starsEarned,
            tokensEarned = tokensEarned,
            completionTime = completionTime,
            hintsUsed = _hintsUsedThisLevel,
            isPerfect = isPerfect,
            completedAt = DateTime.Now,
            attemptCount = _attemptCount
        };

        // Save completion record
        _completionRecords[CurrentLevelNumber] = record;

        // Update player progress via SaveManager
        if (SaveManager.Instance.HasActiveSave)
        {
            var playerData = SaveManager.Instance.CurrentSave;

            // Update current level if progressing forward
            if (CurrentLevelNumber == playerData.currentLevel)
            {
                playerData.currentLevel = Mathf.Min(CurrentLevelNumber + 1, totalLevels);
            }

            // Update highest level
            if (CurrentLevelNumber > playerData.highestLevel)
            {
                playerData.highestLevel = CurrentLevelNumber;

                // Unlock next level
                int nextLevel = CurrentLevelNumber + 1;
                if (nextLevel <= totalLevels)
                {
                    OnLevelUnlocked?.Invoke(nextLevel);
                }
            }

            // Add tokens
            playerData.totalTokens += tokensEarned;

            // Add playtime
            playerData.totalPlayTime += completionTime;

            playerData.MarkDirty(); // Flag for backend sync

            // Sync with backend
            await SyncProgressWithBackend(record);

            // Save locally
            await SaveManager.Instance.SaveGame();
        }

        IsLevelActive = false;
        OnLevelCompleted?.Invoke(record);
        Debug.Log($"Level {CurrentLevelNumber} completed! Stars: {starsEarned}, Tokens: {tokensEarned}");

        return record;
    }

    /// <summary>
    /// Fail current level (FR8 - can retry)
    /// </summary>
    public void FailLevel()
    {
        if (!IsLevelActive)
        {
            return;
        }

        _attemptCount++;
        OnLevelFailed?.Invoke();
        Debug.Log($"Level {CurrentLevelNumber} failed. Attempt count: {_attemptCount}");
        // Player can retry - FR8 requirement
    }

    /// <summary>
    /// Complete current level with default values (convenience method)
    /// </summary>
    public async void CompleteCurrentLevel()
    {
        if (!IsLevelActive || CurrentLevel == null)
        {
            Debug.LogWarning("No active level to complete");
            return;
        }

        // Calculate default tokens
        int tokensEarned = CurrentLevel.baseTokenReward;
        if (_hintsUsedThisLevel == 0)
        {
            tokensEarned += CurrentLevel.perfectBonus;
        }

        await CompleteLevel(true, tokensEarned);
    }

    /// <summary>
    /// Retry current level (FR8)
    /// </summary>
    public async Task<bool> RetryLevel()
    {
        if (CurrentLevel == null)
        {
            Debug.LogError("No level to retry");
            return false;
        }

        int levelToRetry = CurrentLevelNumber;
        return await LoadLevel(levelToRetry);
    }

    // ============================================================
    // LEVEL UNLOCKING (FR11)
    // ============================================================

    /// <summary>
    /// Check if level is unlocked based on progression
    /// </summary>
    public bool IsLevelUnlocked(int levelNumber)
    {
        if (levelNumber == 1)
        {
            return true; // Level 1 always unlocked
        }

        if (!SaveManager.Instance.HasActiveSave)
        {
            return levelNumber == 1;
        }

        var playerData = SaveManager.Instance.CurrentSave;
        return LevelUnlockLogic.IsLevelUnlocked(levelNumber, playerData.highestLevel);
    }

    /// <summary>
    /// Get all unlocked levels
    /// </summary>
    public List<int> GetUnlockedLevels()
    {
        List<int> unlocked = new List<int>();

        if (!SaveManager.Instance.HasActiveSave)
        {
            unlocked.Add(1);
            return unlocked;
        }

        var playerData = SaveManager.Instance.CurrentSave;

        for (int i = 1; i <= totalLevels; i++)
        {
            if (IsLevelUnlocked(i))
            {
                unlocked.Add(i);
            }
        }

        return unlocked;
    }

    // ============================================================
    // LEVEL QUERIES
    // ============================================================

    /// <summary>
    /// Get level data by number
    /// </summary>
    public LevelData GetLevel(int levelNumber)
    {
        return _allLevels.ContainsKey(levelNumber) ? _allLevels[levelNumber] : null;
    }

    /// <summary>
    /// Get completion record for level
    /// </summary>
    public LevelCompletionRecord GetCompletionRecord(int levelNumber)
    {
        return _completionRecords.ContainsKey(levelNumber) ? _completionRecords[levelNumber] : null;
    }

    /// <summary>
    /// Check if level is completed
    /// </summary>
    public bool IsLevelCompleted(int levelNumber)
    {
        return _completionRecords.ContainsKey(levelNumber) && _completionRecords[levelNumber].isCompleted;
    }

    /// <summary>
    /// Get total completed levels
    /// </summary>
    public int GetTotalCompletedLevels()
    {
        return _completionRecords.Count(kvp => kvp.Value.isCompleted);
    }

    /// <summary>
    /// Get levels by category
    /// </summary>
    public List<LevelData> GetLevelsByCategory(string category)
    {
        return _allLevels.Values.Where(l => l.category == category).ToList();
    }

    // ============================================================
    // HINTS SYSTEM (FR6)
    // ============================================================

    /// <summary>
    /// Use a hint (decreases performance score)
    /// </summary>
    public string UseHint()
    {
        if (CurrentLevel == null || CurrentLevel.hints.Count == 0)
        {
            return "No hints available";
        }

        if (_hintsUsedThisLevel >= CurrentLevel.hints.Count)
        {
            return "All hints used";
        }

        string hint = CurrentLevel.hints[_hintsUsedThisLevel];
        _hintsUsedThisLevel++;

        Debug.Log($"Hint {_hintsUsedThisLevel} used: {hint}");
        return hint;
    }

    /// <summary>
    /// Get remaining hints count
    /// </summary>
    public int GetRemainingHints()
    {
        if (CurrentLevel == null)
        {
            return 0;
        }

        return Mathf.Max(0, CurrentLevel.hints.Count - _hintsUsedThisLevel);
    }

    // ============================================================
    // TOKEN COLLECTION
    // ============================================================

    /// <summary>
    /// Collect token in level (FR17)
    /// </summary>
    public void CollectToken()
    {
        _tokensCollectedThisLevel++;
        Debug.Log($"Token collected! Total this level: {_tokensCollectedThisLevel}");
    }

    public int GetCollectedTokensThisLevel()
    {
        return _tokensCollectedThisLevel;
    }

    // ============================================================
    // BACKEND SYNC
    // ============================================================

    private async Task SyncProgressWithBackend(LevelCompletionRecord record)
    {
        try
        {
            var playerData = SaveManager.Instance.CurrentSave;
            if (string.IsNullOrEmpty(playerData.authToken))
            {
                return; // Offline mode
            }

            var apiService = GameManager.Instance.APIService;

            // Send progress update to backend
            var progressRequest = new ProgressUpdateRequest(
                record.levelNumber,
                record.tokensEarned,
                record.completionTime,
                record.hintsUsed,
                record.isPerfect
            );

            var response = await apiService.Post<ProgressUpdateResponse>(
                "/progress/update",
                progressRequest,
                playerData.authToken
            );

            if (response.IsSuccess)
            {
                Debug.Log("Progress synced with backend");
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Backend sync error: {ex.Message}");
        }
    }

    // ============================================================
    // SCENE MANAGEMENT
    // ============================================================

    private async Task LoadLevelScene(string sceneName)
    {
        // Load Unity scene asynchronously
        // For now, just simulate loading
        await Task.Delay(500);
        Debug.Log($"Scene '{sceneName}' loaded");
    }

    // ============================================================
    // LEVEL LOADING FROM BACKEND OR JSON FILES
    // ============================================================

    /// <summary>
    /// Load levels from backend API (future implementation)
    /// GET /levels or GET /levels/{levelNumber}
    /// </summary>
    public async Task<bool> LoadLevelsFromBackend()
    {
        try
        {
            var apiService = GameManager.Instance.APIService;
            var authToken = SaveManager.Instance.CurrentSave?.authToken;

            // TODO: When backend /levels endpoint is ready:
            // var response = await apiService.Get<LevelListResponse>("/levels", authToken);
            // if (response.IsSuccess) { ... }

            Debug.LogWarning("Backend /levels endpoint not implemented yet");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading levels from backend: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Load levels from local JSON files in Resources/LevelData/
    /// </summary>
    public bool LoadLevelsFromResources()
    {
        try
        {
            // Load all JSON files from Resources/LevelData/
            TextAsset[] levelFiles = Resources.LoadAll<TextAsset>("LevelData");

            if (levelFiles.Length == 0)
            {
                Debug.LogWarning("No level files found in Resources/LevelData/");
                return false;
            }

            foreach (var file in levelFiles)
            {
                try
                {
                    LevelData level = JsonUtility.FromJson<LevelData>(file.text);
                    _allLevels[level.levelNumber] = level;
                    Debug.Log($"Loaded level {level.levelNumber}: {level.levelName}");
                }
                catch (Exception ex)
                {
                    Debug.LogError($"Error parsing level file {file.name}: {ex.Message}");
                }
            }

            Debug.Log($"Loaded {_allLevels.Count} levels from Resources");
            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading levels from Resources: {ex.Message}");
            return false;
        }
    }
}
