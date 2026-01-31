using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// HUD Controller - Manages in-game UI elements during gameplay
/// Shows tokens, level info, timer, hints, and pause button
/// </summary>
public class HUDController : MonoBehaviour
{
    [Header("Level Info")]
    [SerializeField] private TextMeshProUGUI levelNameText;
    [SerializeField] private TextMeshProUGUI objectiveText;
    [SerializeField] private TextMeshProUGUI categoryText;

    [Header("Token Display")]
    [SerializeField] private TextMeshProUGUI tokenCountText;
    [SerializeField] private TextMeshProUGUI tokensCollectedText;

    [Header("Timer")]
    [SerializeField] private TextMeshProUGUI timerText;
    [SerializeField] private bool showTimer = true;

    [Header("Hints")]
    [SerializeField] private TextMeshProUGUI hintsRemainingText;
    [SerializeField] private Button hintButton;

    [Header("Buttons")]
    [SerializeField] private Button pauseButton;
    [SerializeField] private Button interactPromptButton;
    [SerializeField] private TextMeshProUGUI interactPromptText;

    [Header("Feedback")]
    [SerializeField] private GameObject tokenCollectedFeedback;
    [SerializeField] private Animator tokenAnimator;

    private void Start()
    {
        InitializeHUD();
    }

    private void Update()
    {
        UpdateTimer();
    }

    private void InitializeHUD()
    {
        // Setup button listeners
        if (pauseButton)
        {
            pauseButton.onClick.AddListener(OnPauseClicked);
        }
        if (hintButton)
        {
            hintButton.onClick.AddListener(OnHintClicked);
        }

        // Hide interact prompt initially
        if (interactPromptButton)
        {
            interactPromptButton.gameObject.SetActive(false);
        }

        // Load level info
        if (LevelManager.Instance?.CurrentLevel != null)
        {
            var level = LevelManager.Instance.CurrentLevel;
            
            if (levelNameText) levelNameText.text = level.levelName;
            if (objectiveText) objectiveText.text = level.objective;
            if (categoryText) categoryText.text = level.category;
            
            UpdateHintsDisplay();
        }

        // Load player token count
        UpdateTokenDisplay();
    }

    private void UpdateTimer()
    {
        if (!showTimer || timerText == null) return;

        if (GameplayManager.Instance != null)
        {
            float elapsed = GameplayManager.Instance.GetElapsedTime();
            timerText.text = FormatTime(elapsed);
        }
    }

    private string FormatTime(float seconds)
    {
        int minutes = Mathf.FloorToInt(seconds / 60);
        int secs = Mathf.FloorToInt(seconds % 60);
        return $"{minutes:00}:{secs:00}";
    }

    private void UpdateTokenDisplay()
    {
        if (tokenCountText && SaveManager.Instance?.CurrentSave != null)
        {
            tokenCountText.text = SaveManager.Instance.CurrentSave.totalTokens.ToString();
        }

        if (tokensCollectedText && LevelManager.Instance != null)
        {
            int collected = LevelManager.Instance.GetCollectedTokensThisLevel();
            int total = LevelManager.Instance.CurrentLevel?.tokensToCollect ?? 3;
            tokensCollectedText.text = $"{collected}/{total}";
        }
    }

    private void UpdateHintsDisplay()
    {
        if (hintsRemainingText && LevelManager.Instance != null)
        {
            int remaining = LevelManager.Instance.GetRemainingHints();
            hintsRemainingText.text = $"Hints: {remaining}";
            
            if (hintButton)
            {
                hintButton.interactable = remaining > 0;
            }
        }
    }

    // ============================================================
    // BUTTON HANDLERS
    // ============================================================

    private void OnPauseClicked()
    {
        if (GameplayManager.Instance != null)
        {
            GameplayManager.Instance.TogglePause();
        }
    }

    private void OnHintClicked()
    {
        if (LevelManager.Instance != null)
        {
            string hint = LevelManager.Instance.UseHint();
            
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowInfo($"💡 Hint: {hint}");
            }
            
            UpdateHintsDisplay();
        }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /// <summary>
    /// Show interaction prompt near player
    /// </summary>
    public void ShowInteractPrompt(string message = "Press E")
    {
        if (interactPromptButton)
        {
            interactPromptButton.gameObject.SetActive(true);
            if (interactPromptText) interactPromptText.text = message;
        }
    }

    /// <summary>
    /// Hide interaction prompt
    /// </summary>
    public void HideInteractPrompt()
    {
        if (interactPromptButton)
        {
            interactPromptButton.gameObject.SetActive(false);
        }
    }

    /// <summary>
    /// Show token collected feedback animation
    /// </summary>
    public void ShowTokenCollected(int amount)
    {
        UpdateTokenDisplay();

        if (tokenCollectedFeedback)
        {
            tokenCollectedFeedback.SetActive(true);
            StartCoroutine(HideFeedbackAfterDelay(tokenCollectedFeedback, 1f));
        }

        if (tokenAnimator)
        {
            tokenAnimator.SetTrigger("Collect");
        }
    }

    private System.Collections.IEnumerator HideFeedbackAfterDelay(GameObject obj, float delay)
    {
        yield return new WaitForSeconds(delay);
        if (obj) obj.SetActive(false);
    }

    /// <summary>
    /// Refresh all HUD displays
    /// </summary>
    public void RefreshHUD()
    {
        UpdateTokenDisplay();
        UpdateHintsDisplay();
    }

    private void OnDestroy()
    {
        if (pauseButton) pauseButton.onClick.RemoveAllListeners();
        if (hintButton) hintButton.onClick.RemoveAllListeners();
    }
}
