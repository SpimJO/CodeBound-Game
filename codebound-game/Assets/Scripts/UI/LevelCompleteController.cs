using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

/// <summary>
/// Level Complete Panel Controller - Shows completion stats and rewards
/// </summary>
public class LevelCompleteController : MonoBehaviour
{
    [Header("Panel")]
    [SerializeField] private GameObject completePanel;

    [Header("Stats Display")]
    [SerializeField] private TextMeshProUGUI levelTitleText;
    [SerializeField] private TextMeshProUGUI completionTimeText;
    [SerializeField] private TextMeshProUGUI tokensEarnedText;
    [SerializeField] private TextMeshProUGUI hintsUsedText;

    [Header("Stars Display")]
    [SerializeField] private Image[] starImages;
    [SerializeField] private Sprite starFilled;
    [SerializeField] private Sprite starEmpty;
    [SerializeField] private float starAnimDelay = 0.3f;

    [Header("Buttons")]
    [SerializeField] private Button nextLevelButton;
    [SerializeField] private Button retryButton;
    [SerializeField] private Button levelSelectButton;

    [Header("Animation")]
    [SerializeField] private Animator panelAnimator;

    private int currentLevelNumber;

    private void Awake()
    {
        InitializeButtons();
    }

    private void OnEnable()
    {
        ShowCompletionStats();
    }

    private void InitializeButtons()
    {
        if (nextLevelButton) nextLevelButton.onClick.AddListener(OnNextLevelClicked);
        if (retryButton) retryButton.onClick.AddListener(OnRetryClicked);
        if (levelSelectButton) levelSelectButton.onClick.AddListener(OnLevelSelectClicked);
    }

    private void ShowCompletionStats()
    {
        if (LevelManager.Instance == null) return;

        currentLevelNumber = LevelManager.Instance.CurrentLevelNumber;
        var completionRecord = LevelManager.Instance.GetCompletionRecord(currentLevelNumber);
        var levelData = LevelManager.Instance.CurrentLevel;

        if (completionRecord == null || levelData == null) return;

        // Display level title
        if (levelTitleText)
        {
            levelTitleText.text = $"Level {currentLevelNumber}: {levelData.levelName}";
        }

        // Display time
        if (completionTimeText)
        {
            completionTimeText.text = FormatTime(completionRecord.completionTime);
        }

        // Display tokens
        if (tokensEarnedText)
        {
            tokensEarnedText.text = $"+{completionRecord.tokensEarned}";
        }

        // Display hints used
        if (hintsUsedText)
        {
            hintsUsedText.text = completionRecord.hintsUsed.ToString();
        }

        // Animate stars
        StartCoroutine(AnimateStars(completionRecord.starsEarned));

        // Check if next level exists
        int nextLevel = currentLevelNumber + 1;
        bool hasNextLevel = LevelManager.Instance.GetLevel(nextLevel) != null;
        if (nextLevelButton)
        {
            nextLevelButton.gameObject.SetActive(hasNextLevel);
        }
    }

    private IEnumerator AnimateStars(int starsEarned)
    {
        // Reset all stars to empty
        foreach (var star in starImages)
        {
            if (star && starEmpty)
            {
                star.sprite = starEmpty;
            }
        }

        // Animate each earned star
        for (int i = 0; i < starsEarned && i < starImages.Length; i++)
        {
            yield return new WaitForSeconds(starAnimDelay);

            if (starImages[i] && starFilled)
            {
                starImages[i].sprite = starFilled;

                // Optional: Scale punch animation
                StartCoroutine(ScalePunch(starImages[i].transform));
            }
        }
    }

    private IEnumerator ScalePunch(Transform target)
    {
        Vector3 originalScale = target.localScale;
        Vector3 punchedScale = originalScale * 1.3f;

        float duration = 0.2f;
        float elapsed = 0f;

        // Scale up
        while (elapsed < duration / 2)
        {
            elapsed += Time.deltaTime;
            target.localScale = Vector3.Lerp(originalScale, punchedScale, elapsed / (duration / 2));
            yield return null;
        }

        // Scale down
        elapsed = 0f;
        while (elapsed < duration / 2)
        {
            elapsed += Time.deltaTime;
            target.localScale = Vector3.Lerp(punchedScale, originalScale, elapsed / (duration / 2));
            yield return null;
        }

        target.localScale = originalScale;
    }

    private string FormatTime(float seconds)
    {
        int minutes = Mathf.FloorToInt(seconds / 60);
        int secs = Mathf.FloorToInt(seconds % 60);
        return $"{minutes:00}:{secs:00}";
    }

    // ============================================================
    // BUTTON HANDLERS
    // ============================================================

    private void OnNextLevelClicked()
    {
        int nextLevel = currentLevelNumber + 1;

        if (LevelManager.Instance != null)
        {
            _ = LevelManager.Instance.LoadLevel(nextLevel);
        }
        else if (SceneLoader.Instance != null)
        {
            SceneLoader.Instance.LoadLevel(nextLevel);
        }
    }

    private void OnRetryClicked()
    {
        if (GameplayManager.Instance != null)
        {
            GameplayManager.Instance.RetryLevel();
        }
    }

    private void OnLevelSelectClicked()
    {
        if (GameplayManager.Instance != null)
        {
            GameplayManager.Instance.GoToLevelSelect();
        }
    }

    private void OnDestroy()
    {
        if (nextLevelButton) nextLevelButton.onClick.RemoveAllListeners();
        if (retryButton) retryButton.onClick.RemoveAllListeners();
        if (levelSelectButton) levelSelectButton.onClick.RemoveAllListeners();
    }
}
