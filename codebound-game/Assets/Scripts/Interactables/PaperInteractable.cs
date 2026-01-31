using UnityEngine;
using TMPro;

/// <summary>
/// Paper Interactable - Displays the coding challenge
/// Player presses [E] to read the challenge details
/// Shows: Level objective, puzzle description, hints available
/// </summary>
[RequireComponent(typeof(Collider2D))]
public class PaperInteractable : MonoBehaviour
{
    [Header("Interaction Settings")]
    [SerializeField] private KeyCode interactKey = KeyCode.E;
    [SerializeField] private float interactionRadius = 2f;
    [SerializeField] private LayerMask playerLayer;

    [Header("Visual Feedback")]
    [SerializeField] private GameObject interactionPrompt; // UI: "Press E to Read"
    [SerializeField] private SpriteRenderer paperSprite;
    [SerializeField] private Color highlightColor = Color.yellow;
    [SerializeField] private ParticleSystem glowEffect;

    [Header("Challenge Display UI")]
    [SerializeField] private GameObject challengePanel;
    [SerializeField] private TextMeshProUGUI challengeTitleText;
    [SerializeField] private TextMeshProUGUI challengeDescriptionText;
    [SerializeField] private TextMeshProUGUI objectiveText;
    [SerializeField] private TextMeshProUGUI hintsAvailableText;
    [SerializeField] private UnityEngine.UI.Button closeButton;

    [Header("Level Data")]
    [SerializeField] private int levelNumber = 1;

    private LevelData currentLevelData;
    private bool playerInRange = false;
    private Color originalColor;
    private Transform playerTransform;

    private void Start()
    {
        InitializePaper();
        LoadLevelData();
    }

    private void InitializePaper()
    {
        // Hide UI elements initially
        if (interactionPrompt) interactionPrompt.SetActive(false);
        if (challengePanel) challengePanel.SetActive(false);

        // Setup close button
        if (closeButton) closeButton.onClick.AddListener(CloseChallenge);

        // Store original color
        if (paperSprite) originalColor = paperSprite.color;

        // Setup collider as trigger
        Collider2D col = GetComponent<Collider2D>();
        col.isTrigger = true;
    }

    private void LoadLevelData()
    {
        // Load level data from Resources
        if (LevelManager.Instance != null)
        {
            currentLevelData = LevelManager.Instance.GetLevelData(levelNumber);
            
            if (currentLevelData == null)
            {
                Debug.LogError($"Failed to load level data for level {levelNumber}");
            }
            else
            {
                Debug.Log($"Paper loaded challenge: {currentLevelData.levelName}");
            }
        }
    }

    private void Update()
    {
        if (playerInRange && Input.GetKeyDown(interactKey))
        {
            ShowChallenge();
        }
    }

    // ============================================================
    // TRIGGER DETECTION
    // ============================================================

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            playerInRange = true;
            playerTransform = other.transform;
            
            // Show interaction prompt
            if (interactionPrompt) interactionPrompt.SetActive(true);
            
            // Highlight paper
            if (paperSprite) paperSprite.color = highlightColor;
            
            // Play glow effect
            if (glowEffect && !glowEffect.isPlaying) glowEffect.Play();
            
            Debug.Log("Player near Paper - Press E to read challenge");
        }
    }

    private void OnTriggerExit2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            playerInRange = false;
            playerTransform = null;
            
            // Hide interaction prompt
            if (interactionPrompt) interactionPrompt.SetActive(false);
            
            // Reset color
            if (paperSprite) paperSprite.color = originalColor;
            
            // Stop glow effect
            if (glowEffect) glowEffect.Stop();
        }
    }

    // ============================================================
    // CHALLENGE DISPLAY
    // ============================================================

    /// <summary>
    /// Show the challenge details panel
    /// </summary>
    public void ShowChallenge()
    {
        if (currentLevelData == null)
        {
            Debug.LogWarning("No level data loaded!");
            return;
        }

        // Show challenge panel
        if (challengePanel) challengePanel.SetActive(true);

        // Populate challenge info
        if (challengeTitleText) 
            challengeTitleText.text = currentLevelData.levelName;
        
        if (challengeDescriptionText) 
            challengeDescriptionText.text = currentLevelData.puzzleDescription;
        
        if (objectiveText) 
            objectiveText.text = $"<b>Objective:</b> {currentLevelData.objective}";
        
        if (hintsAvailableText)
        {
            int hintCount = currentLevelData.hints?.Count ?? 0;
            hintsAvailableText.text = $"💡 Hints Available: {hintCount}";
        }

        // Pause game (optional)
        Time.timeScale = 0f;

        Debug.Log($"Challenge displayed: {currentLevelData.levelName}");
    }

    /// <summary>
    /// Close the challenge panel
    /// </summary>
    public void CloseChallenge()
    {
        if (challengePanel) challengePanel.SetActive(false);
        
        // Resume game
        Time.timeScale = 1f;
        
        Debug.Log("Challenge panel closed");
    }

    // ============================================================
    // GIZMOS (Editor Visualization)
    // ============================================================

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(transform.position, interactionRadius);
    }
}
