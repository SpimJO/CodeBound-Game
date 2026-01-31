using UnityEngine;

/// <summary>
/// Terminal Interactable - Opens the code terminal when player interacts
/// Used to solve coding puzzles in each level
/// </summary>
public class TerminalInteractable : MonoBehaviour, IInteractable
{
    [Header("Terminal Settings")]
    [SerializeField] private string terminalId = "terminal_01";
    [SerializeField] private int levelNumber = 1; // Level this terminal belongs to
    [SerializeField] private bool isCompleted = false;

    [Header("Visual Feedback")]
    [SerializeField] private SpriteRenderer terminalSprite;
    [SerializeField] private Sprite activeSprite;
    [SerializeField] private Sprite completedSprite;
    [SerializeField] private GameObject interactPrompt; // "Press E to interact" UI
    [SerializeField] private ParticleSystem completionParticles;

    [Header("Audio")]
    [SerializeField] private AudioClip activateSound;
    [SerializeField] private AudioClip completeSound;

    private AudioSource audioSource;
    private bool playerInRange = false;

    private void Awake()
    {
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }

        if (interactPrompt) interactPrompt.SetActive(false);
    }

    private void Start()
    {
        // Check if this terminal was already completed
        if (SaveManager.Instance?.CurrentSave != null)
        {
            // Check completion status from save data
            // isCompleted = SaveManager.Instance.IsTerminalCompleted(terminalId);
            UpdateVisuals();
        }
    }

    public void Interact(PlayerController player)
    {
        if (isCompleted)
        {
            Debug.Log($"Terminal {terminalId} already completed!");
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowInfo("This terminal has already been completed!");
            }
            return;
        }

        Debug.Log($"Opening terminal: {terminalId}");

        // Play activation sound
        if (activateSound && audioSource)
        {
            audioSource.PlayOneShot(activateSound);
        }

        // Get level data and open terminal
        if (LevelManager.Instance != null)
        {
            LevelData levelData = LevelManager.Instance.GetLevel(levelNumber);
            if (levelData != null)
            {
                // Find CodeTerminal in scene
                CodeTerminal terminal = FindObjectOfType<CodeTerminal>();
                if (terminal != null)
                {
                    terminal.OpenTerminal(levelData);
                    
                    // Disable player movement while terminal is open
                    player.SetMovementEnabled(false);
                }
                else
                {
                    Debug.LogError("CodeTerminal not found in scene!");
                }
            }
            else
            {
                Debug.LogError($"Level data not found for level {levelNumber}");
            }
        }
    }

    /// <summary>
    /// Mark terminal as completed and update visuals
    /// </summary>
    public void SetCompleted(bool completed)
    {
        isCompleted = completed;

        if (completed)
        {
            // Play completion effects
            if (completeSound && audioSource)
            {
                audioSource.PlayOneShot(completeSound);
            }
            if (completionParticles)
            {
                completionParticles.Play();
            }
        }

        UpdateVisuals();
    }

    private void UpdateVisuals()
    {
        if (terminalSprite)
        {
            if (isCompleted && completedSprite)
            {
                terminalSprite.sprite = completedSprite;
            }
            else if (activeSprite)
            {
                terminalSprite.sprite = activeSprite;
            }
        }
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Player"))
        {
            playerInRange = true;
            if (interactPrompt && !isCompleted)
            {
                interactPrompt.SetActive(true);
            }
        }
    }

    private void OnTriggerExit2D(Collider2D collision)
    {
        if (collision.CompareTag("Player"))
        {
            playerInRange = false;
            if (interactPrompt)
            {
                interactPrompt.SetActive(false);
            }
        }
    }
}
