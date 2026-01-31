using UnityEngine;
using UnityEngine.Events;
using System.Collections;

/// <summary>
/// Gameplay Manager - Manages in-level game state and flow
/// Handles pause, level completion, game over states
/// </summary>
public class GameplayManager : MonoBehaviour
{
    private static GameplayManager _instance;
    public static GameplayManager Instance => _instance;

    [Header("Gameplay State")]
    [SerializeField] private bool isPaused = false;
    [SerializeField] private bool isLevelComplete = false;
    [SerializeField] private bool isGameOver = false;

    [Header("UI References")]
    [SerializeField] private GameObject pauseMenuPanel;
    [SerializeField] private GameObject levelCompletePanel;
    [SerializeField] private GameObject gameOverPanel;
    [SerializeField] private CodeTerminal codeTerminal;

    [Header("Level References")]
    [SerializeField] private PlayerController playerController;
    [SerializeField] private TerminalInteractable[] terminals;
    [SerializeField] private LevelExit levelExit;

    [Header("Events")]
    public UnityEvent OnLevelStart;
    public UnityEvent OnLevelPaused;
    public UnityEvent OnLevelResumed;
    public UnityEvent OnLevelComplete;
    public UnityEvent OnGameOver;

    // Current level data
    private int currentLevelNumber;
    private float levelStartTime;

    public bool IsPaused => isPaused;
    public bool IsLevelComplete => isLevelComplete;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
    }

    private void Start()
    {
        InitializeLevel();
    }

    private void Update()
    {
        HandlePauseInput();
    }

    /// <summary>
    /// Initialize the current level
    /// </summary>
    private void InitializeLevel()
    {
        // Get current level from LevelManager
        if (LevelManager.Instance != null && LevelManager.Instance.CurrentLevel != null)
        {
            currentLevelNumber = LevelManager.Instance.CurrentLevelNumber;
            Debug.Log($"Starting level {currentLevelNumber}: {LevelManager.Instance.CurrentLevel.levelName}");
        }

        levelStartTime = Time.time;
        isPaused = false;
        isLevelComplete = false;
        isGameOver = false;

        // Hide all UI panels
        if (pauseMenuPanel) pauseMenuPanel.SetActive(false);
        if (levelCompletePanel) levelCompletePanel.SetActive(false);
        if (gameOverPanel) gameOverPanel.SetActive(false);

        // Find player if not assigned
        if (playerController == null)
        {
            playerController = FindObjectOfType<PlayerController>();
        }

        // Find terminals
        if (terminals == null || terminals.Length == 0)
        {
            terminals = FindObjectsOfType<TerminalInteractable>();
        }

        // Find level exit
        if (levelExit == null)
        {
            levelExit = FindObjectOfType<LevelExit>();
        }

        OnLevelStart?.Invoke();
    }

    /// <summary>
    /// Handle pause input (Escape key)
    /// </summary>
    private void HandlePauseInput()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            if (codeTerminal != null && codeTerminal.gameObject.activeInHierarchy)
            {
                // Close terminal instead of pausing
                codeTerminal.CloseTerminal();
                if (playerController != null)
                {
                    playerController.SetMovementEnabled(true);
                }
            }
            else if (isLevelComplete || isGameOver)
            {
                // Don't pause if level is complete or game over
                return;
            }
            else
            {
                TogglePause();
            }
        }
    }

    /// <summary>
    /// Toggle pause state
    /// </summary>
    public void TogglePause()
    {
        if (isPaused)
        {
            ResumeGame();
        }
        else
        {
            PauseGame();
        }
    }

    /// <summary>
    /// Pause the game
    /// </summary>
    public void PauseGame()
    {
        isPaused = true;
        Time.timeScale = 0f;

        if (pauseMenuPanel) pauseMenuPanel.SetActive(true);
        if (playerController) playerController.SetMovementEnabled(false);

        OnLevelPaused?.Invoke();
        Debug.Log("Game Paused");
    }

    /// <summary>
    /// Resume the game
    /// </summary>
    public void ResumeGame()
    {
        isPaused = false;
        Time.timeScale = 1f;

        if (pauseMenuPanel) pauseMenuPanel.SetActive(false);
        if (playerController) playerController.SetMovementEnabled(true);

        OnLevelResumed?.Invoke();
        Debug.Log("Game Resumed");
    }

    /// <summary>
    /// Complete the level
    /// </summary>
    public void CompleteLevelSuccess()
    {
        if (isLevelComplete) return;

        isLevelComplete = true;
        Time.timeScale = 1f; // Ensure time is running for animations

        if (levelCompletePanel) levelCompletePanel.SetActive(true);
        if (playerController) playerController.SetMovementEnabled(false);

        OnLevelComplete?.Invoke();
        Debug.Log("Level Complete!");
    }

    /// <summary>
    /// Game over (player died, ran out of time, etc.)
    /// </summary>
    public void TriggerGameOver()
    {
        if (isGameOver) return;

        isGameOver = true;

        if (gameOverPanel) gameOverPanel.SetActive(true);
        if (playerController) playerController.SetMovementEnabled(false);

        // Notify LevelManager
        if (LevelManager.Instance != null)
        {
            LevelManager.Instance.FailLevel();
        }

        OnGameOver?.Invoke();
        Debug.Log("Game Over!");
    }

    /// <summary>
    /// Retry current level
    /// </summary>
    public void RetryLevel()
    {
        Time.timeScale = 1f;

        if (LevelManager.Instance != null)
        {
            _ = LevelManager.Instance.RetryLevel();
        }
        else if (SceneLoader.Instance != null)
        {
            SceneLoader.Instance.ReloadCurrentScene();
        }
    }

    /// <summary>
    /// Go to level select
    /// </summary>
    public void GoToLevelSelect()
    {
        Time.timeScale = 1f;

        if (SceneLoader.Instance != null)
        {
            SceneLoader.Instance.LoadLevelSelect();
        }
    }

    /// <summary>
    /// Go to main menu
    /// </summary>
    public void GoToMainMenu()
    {
        Time.timeScale = 1f;

        if (SceneLoader.Instance != null)
        {
            SceneLoader.Instance.LoadMainMenu();
        }
    }

    /// <summary>
    /// Get elapsed time since level start
    /// </summary>
    public float GetElapsedTime()
    {
        return Time.time - levelStartTime;
    }

    private void OnDestroy()
    {
        // Ensure time scale is reset
        Time.timeScale = 1f;
    }
}
