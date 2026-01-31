using UnityEngine;

/// <summary>
/// PC Station Interactable - Opens the code terminal (IDE)
/// Player presses [E] to access the coding interface
/// Loads current level challenge into terminal
/// </summary>
[RequireComponent(typeof(Collider2D))]
public class PCStationInteractable : MonoBehaviour
{
    [Header("Interaction Settings")]
    [SerializeField] private KeyCode interactKey = KeyCode.E;
    [SerializeField] private float interactionRadius = 2f;

    [Header("Visual Feedback")]
    [SerializeField] private GameObject interactionPrompt; // UI: "Press E to Code"
    [SerializeField] private SpriteRenderer pcSprite;
    [SerializeField] private Color highlightColor = new Color(0, 1, 1, 1); // Cyan
    [SerializeField] private ParticleSystem screenGlowEffect;
    [SerializeField] private Light2D screenLight; // Optional

    [Header("Terminal Reference")]
    [SerializeField] private CodeTerminal codeTerminal;

    [Header("Level Data")]
    [SerializeField] private int levelNumber = 1;

    private LevelData currentLevelData;
    private bool playerInRange = false;
    private Color originalColor;
    private Transform playerTransform;

    private void Start()
    {
        InitializePCStation();
        LoadLevelData();
    }

    private void InitializePCStation()
    {
        // Hide interaction prompt initially
        if (interactionPrompt) interactionPrompt.SetActive(false);

        // Store original color
        if (pcSprite) originalColor = pcSprite.color;

        // Find CodeTerminal if not assigned
        if (codeTerminal == null)
        {
            codeTerminal = FindObjectOfType<CodeTerminal>();
            if (codeTerminal == null)
            {
                Debug.LogError("CodeTerminal not found! Assign it in the inspector or add to scene.");
            }
        }

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
                Debug.Log($"PC Station loaded: {currentLevelData.levelName}");
            }
        }
    }

    private void Update()
    {
        if (playerInRange && Input.GetKeyDown(interactKey))
        {
            OpenTerminal();
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
            
            // Highlight PC
            if (pcSprite) pcSprite.color = highlightColor;
            
            // Play screen glow effect
            if (screenGlowEffect && !screenGlowEffect.isPlaying) 
                screenGlowEffect.Play();
            
            // Brighten screen light
            if (screenLight) screenLight.intensity = 1.5f;
            
            Debug.Log("Player near PC Station - Press E to code");
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
            if (pcSprite) pcSprite.color = originalColor;
            
            // Stop screen glow
            if (screenGlowEffect) screenGlowEffect.Stop();
            
            // Dim screen light
            if (screenLight) screenLight.intensity = 1f;
        }
    }

    // ============================================================
    // TERMINAL INTERACTION
    // ============================================================

    /// <summary>
    /// Open the code terminal with current level data
    /// </summary>
    public void OpenTerminal()
    {
        if (currentLevelData == null)
        {
            Debug.LogWarning("No level data loaded!");
            return;
        }

        if (codeTerminal == null)
        {
            Debug.LogError("CodeTerminal reference missing!");
            return;
        }

        // Open terminal with level data
        codeTerminal.OpenTerminal(currentLevelData);

        // Freeze player movement (optional)
        if (playerTransform != null)
        {
            var playerController = playerTransform.GetComponent<PlayerController>();
            if (playerController != null)
            {
                playerController.enabled = false; // Disable movement while coding
            }
        }

        Debug.Log($"Terminal opened: {currentLevelData.levelName}");
    }

    /// <summary>
    /// Called by CodeTerminal when player exits
    /// </summary>
    public void OnTerminalClosed()
    {
        // Re-enable player movement
        if (playerTransform != null)
        {
            var playerController = playerTransform.GetComponent<PlayerController>();
            if (playerController != null)
            {
                playerController.enabled = true;
            }
        }

        Debug.Log("Player returned from terminal");
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
