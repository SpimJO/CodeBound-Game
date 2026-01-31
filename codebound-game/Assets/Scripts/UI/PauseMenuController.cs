using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Pause Menu Controller - Handles pause menu UI
/// </summary>
public class PauseMenuController : MonoBehaviour
{
    [Header("Panel")]
    [SerializeField] private GameObject pausePanel;

    [Header("Buttons")]
    [SerializeField] private Button resumeButton;
    [SerializeField] private Button restartButton;
    [SerializeField] private Button settingsButton;
    [SerializeField] private Button levelSelectButton;
    [SerializeField] private Button mainMenuButton;

    [Header("Level Info")]
    [SerializeField] private TextMeshProUGUI levelNameText;
    [SerializeField] private TextMeshProUGUI levelProgressText;

    private void Awake()
    {
        InitializeButtons();
    }

    private void OnEnable()
    {
        UpdateLevelInfo();
    }

    private void InitializeButtons()
    {
        if (resumeButton) resumeButton.onClick.AddListener(OnResumeClicked);
        if (restartButton) restartButton.onClick.AddListener(OnRestartClicked);
        if (settingsButton) settingsButton.onClick.AddListener(OnSettingsClicked);
        if (levelSelectButton) levelSelectButton.onClick.AddListener(OnLevelSelectClicked);
        if (mainMenuButton) mainMenuButton.onClick.AddListener(OnMainMenuClicked);
    }

    private void UpdateLevelInfo()
    {
        if (LevelManager.Instance?.CurrentLevel != null)
        {
            var level = LevelManager.Instance.CurrentLevel;
            
            if (levelNameText)
            {
                levelNameText.text = $"Level {level.levelNumber}: {level.levelName}";
            }

            if (levelProgressText)
            {
                int current = LevelManager.Instance.CurrentLevelNumber;
                int total = 100;
                levelProgressText.text = $"Progress: {current}/{total}";
            }
        }
    }

    // ============================================================
    // BUTTON HANDLERS
    // ============================================================

    private void OnResumeClicked()
    {
        if (GameplayManager.Instance != null)
        {
            GameplayManager.Instance.ResumeGame();
        }
    }

    private void OnRestartClicked()
    {
        // Show confirmation dialog
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowConfirmDialog(
                "Restart this level?\nYour progress will be lost.",
                () => {
                    if (GameplayManager.Instance != null)
                    {
                        GameplayManager.Instance.RetryLevel();
                    }
                }
            );
        }
        else
        {
            // No confirmation, just restart
            if (GameplayManager.Instance != null)
            {
                GameplayManager.Instance.RetryLevel();
            }
        }
    }

    private void OnSettingsClicked()
    {
        if (SettingsManager.Instance != null)
        {
            SettingsManager.Instance.ShowSettingsPanel();
        }
    }

    private void OnLevelSelectClicked()
    {
        // Show confirmation
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowConfirmDialog(
                "Return to Level Select?\nYour current progress will be lost.",
                () => {
                    if (GameplayManager.Instance != null)
                    {
                        GameplayManager.Instance.GoToLevelSelect();
                    }
                }
            );
        }
        else
        {
            if (GameplayManager.Instance != null)
            {
                GameplayManager.Instance.GoToLevelSelect();
            }
        }
    }

    private void OnMainMenuClicked()
    {
        // Show confirmation
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowConfirmDialog(
                "Return to Main Menu?\nYour current progress will be lost.",
                () => {
                    if (GameplayManager.Instance != null)
                    {
                        GameplayManager.Instance.GoToMainMenu();
                    }
                }
            );
        }
        else
        {
            if (GameplayManager.Instance != null)
            {
                GameplayManager.Instance.GoToMainMenu();
            }
        }
    }

    private void OnDestroy()
    {
        if (resumeButton) resumeButton.onClick.RemoveAllListeners();
        if (restartButton) restartButton.onClick.RemoveAllListeners();
        if (settingsButton) settingsButton.onClick.RemoveAllListeners();
        if (levelSelectButton) levelSelectButton.onClick.RemoveAllListeners();
        if (mainMenuButton) mainMenuButton.onClick.RemoveAllListeners();
    }
}
