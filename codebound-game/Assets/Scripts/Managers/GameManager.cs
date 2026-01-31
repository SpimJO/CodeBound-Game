using UnityEngine;
using System.Collections.Generic;
using System.Threading.Tasks;

/// <summary>
/// Main Game Manager with Dependency Injection
/// Initializes all core services and managers (FR1)
/// </summary>
public class GameManager : MonoBehaviour
{
    private static GameManager _instance;
    public static GameManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<GameManager>();
                if (_instance == null)
                {
                    GameObject go = new GameObject("GameManager");
                    _instance = go.AddComponent<GameManager>();
                    DontDestroyOnLoad(go);
                }
            }
            return _instance;
        }
    }

    [Header("Game Configuration")]
    [SerializeField] private bool developmentMode = true;
    [SerializeField] private bool enableDebugLogs = true;

    // Service dependencies
    public IAPIService APIService { get; private set; }
    public IStorageService StorageService { get; private set; }
    public IAchievementService AchievementService { get; private set; }
    public IAnalyticsService AnalyticsService { get; private set; }
    public IAuthService AuthService { get; private set; }
    public SkinService SkinService { get; private set; }

    // Manager references
    public SaveManager SaveManager { get; private set; }
    public LevelManager LevelManager { get; private set; }

    // Game state
    public bool IsGameInitialized { get; private set; }
    public bool IsOnlineMode { get; private set; }

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);
        
        // Set target framerate to 60fps for smooth platformer gameplay
        Application.targetFrameRate = 60;
        QualitySettings.vSyncCount = 1; // Enable VSync for smooth frame pacing
        
        InitializeServices();
        InitializeManagers();
    }

    private async void Start()
    {
        await InitializeGame();
    }

    private void InitializeServices()
    {
        Debug.Log("Initializing CodeBound services...");

        // Core services
        APIService = new APIService(new UnityWebRequestHandler());
        StorageService = new LocalStorageService();
        AchievementService = new AchievementService(APIService);
        AnalyticsService = new AnalyticsService();
        AuthService = new AuthService(APIService, StorageService);
        SkinService = new SkinService(APIService);

        Debug.Log("Services initialized successfully");
    }

    private void InitializeManagers()
    {
        Debug.Log("Initializing game managers...");

        // Add SaveManager if not present
        SaveManager = GetComponent<SaveManager>();
        if (SaveManager == null)
        {
            SaveManager = gameObject.AddComponent<SaveManager>();
        }

        // Add LevelManager if not present
        LevelManager = GetComponent<LevelManager>();
        if (LevelManager == null)
        {
            LevelManager = gameObject.AddComponent<LevelManager>();
        }

        Debug.Log("Managers initialized successfully");
    }

    private async Task InitializeGame()
    {
        Debug.Log("=== CodeBound: A 2D Game Journey Through Logic and Code ===");
        Debug.Log("Initializing game systems...");

        // Check network connectivity
        IsOnlineMode = await APIService.CheckConnectivity();
        Debug.Log($"Network Status: {(IsOnlineMode ? "Online" : "Offline")}");

        // Try auto-login if token exists
        if (IsOnlineMode)
        {
            bool autoLoginSuccess = await AuthService.TryAutoLogin();
            if (autoLoginSuccess)
            {
                Debug.Log("Auto-login successful");
            }
        }

        IsGameInitialized = true;
        Debug.Log("Game initialization complete!");
    }

    // ============================================================
    // GAME STATE
    // ============================================================

    public async Task<bool> StartNewGame(string username)
    {
        try
        {
            // Create new save in slot 0
            bool saveCreated = await SaveManager.CreateNewSave(0, username);
            if (!saveCreated)
            {
                Debug.LogError("Failed to create new save");
                return false;
            }

            Debug.Log($"New game started for {username}");
            return true;
        }
        catch (System.Exception ex)
        {
            Debug.LogError($"Error starting new game: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> ContinueGame(int slotIndex)
    {
        try
        {
            bool loaded = await SaveManager.LoadSave(slotIndex);
            if (!loaded)
            {
                Debug.LogError($"Failed to load save from slot {slotIndex}");
                return false;
            }

            Debug.Log($"Game continued from slot {slotIndex}");
            return true;
        }
        catch (System.Exception ex)
        {
            Debug.LogError($"Error continuing game: {ex.Message}");
            return false;
        }
    }

    public void ExitGame()
    {
        Debug.Log("Exiting game...");
        
        // Save before exit
        if (SaveManager.HasActiveSave)
        {
            _ = SaveManager.SaveGame();
        }

        #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
        #else
            Application.Quit();
        #endif
    }

    // ============================================================
    // UTILITY
    // ============================================================

    public void SetOnlineMode(bool online)
    {
        IsOnlineMode = online;
        Debug.Log($"Network mode changed: {(IsOnlineMode ? "Online" : "Offline")}");
    }

    private void OnApplicationQuit()
    {
        Debug.Log("CodeBound shutting down...");
    }
}