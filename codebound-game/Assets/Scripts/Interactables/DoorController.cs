using UnityEngine;

/// <summary>
/// Door Controller - Opens when puzzle is completed or switch is activated
/// Can require multiple conditions to open
/// </summary>
public class DoorController : MonoBehaviour, IInteractable
{
    [Header("Door Settings")]
    [SerializeField] private string doorId = "door_01";
    [SerializeField] private bool isOpen = false;
    [SerializeField] private bool requiresTerminal = true; // Door opens when terminal is completed
    [SerializeField] private string linkedTerminalId = "terminal_01";

    [Header("Movement")]
    [SerializeField] private Transform openPosition;
    [SerializeField] private Transform closedPosition;
    [SerializeField] private float moveSpeed = 3f;
    [SerializeField] private bool isVertical = true; // Vertical slide vs horizontal

    [Header("Visual Feedback")]
    [SerializeField] private SpriteRenderer doorSprite;
    [SerializeField] private Sprite openSprite;
    [SerializeField] private Sprite closedSprite;
    [SerializeField] private ParticleSystem openParticles;

    [Header("Audio")]
    [SerializeField] private AudioClip openSound;
    [SerializeField] private AudioClip closeSound;
    [SerializeField] private AudioClip lockedSound;

    private AudioSource audioSource;
    private Collider2D doorCollider;
    private Vector3 targetPosition;

    private void Awake()
    {
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }

        doorCollider = GetComponent<Collider2D>();
    }

    private void Start()
    {
        // Set initial position
        if (closedPosition != null)
        {
            targetPosition = closedPosition.position;
        }
        else
        {
            targetPosition = transform.position;
            closedPosition = transform;
        }

        // Subscribe to terminal completion events if required
        if (requiresTerminal)
        {
            // Listen for terminal completion
            // This could be done through events or checking state
        }
    }

    private void Update()
    {
        // Smoothly move door to target position
        if (Vector3.Distance(transform.position, targetPosition) > 0.01f)
        {
            transform.position = Vector3.MoveTowards(
                transform.position, 
                targetPosition, 
                moveSpeed * Time.deltaTime
            );
        }
    }

    public void Interact(PlayerController player)
    {
        if (isOpen)
        {
            Debug.Log($"Door {doorId} is already open!");
            return;
        }

        if (requiresTerminal)
        {
            // Check if linked terminal is completed
            // For now, show locked message
            if (lockedSound && audioSource)
            {
                audioSource.PlayOneShot(lockedSound);
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowInfo("Complete the terminal puzzle to open this door!");
            }

            Debug.Log($"Door {doorId} requires terminal {linkedTerminalId} to be completed!");
        }
        else
        {
            // Manual door can be toggled
            ToggleDoor();
        }
    }

    /// <summary>
    /// Open the door
    /// </summary>
    public void OpenDoor()
    {
        if (isOpen) return;

        isOpen = true;

        if (openPosition != null)
        {
            targetPosition = openPosition.position;
        }
        else
        {
            // Default: move up for vertical, right for horizontal
            targetPosition = transform.position + (isVertical ? Vector3.up * 3f : Vector3.right * 3f);
        }

        // Disable collider so player can pass
        if (doorCollider)
        {
            doorCollider.enabled = false;
        }

        // Update visuals
        if (doorSprite && openSprite)
        {
            doorSprite.sprite = openSprite;
        }

        // Play effects
        if (openSound && audioSource)
        {
            audioSource.PlayOneShot(openSound);
        }
        if (openParticles)
        {
            openParticles.Play();
        }

        Debug.Log($"Door {doorId} opened!");
    }

    /// <summary>
    /// Close the door
    /// </summary>
    public void CloseDoor()
    {
        if (!isOpen) return;

        isOpen = false;

        if (closedPosition != null)
        {
            targetPosition = closedPosition.position;
        }

        // Re-enable collider
        if (doorCollider)
        {
            doorCollider.enabled = true;
        }

        // Update visuals
        if (doorSprite && closedSprite)
        {
            doorSprite.sprite = closedSprite;
        }

        // Play sound
        if (closeSound && audioSource)
        {
            audioSource.PlayOneShot(closeSound);
        }

        Debug.Log($"Door {doorId} closed!");
    }

    /// <summary>
    /// Toggle door state
    /// </summary>
    public void ToggleDoor()
    {
        if (isOpen)
        {
            CloseDoor();
        }
        else
        {
            OpenDoor();
        }
    }

    /// <summary>
    /// Called when linked terminal is completed
    /// </summary>
    public void OnTerminalCompleted(string terminalId)
    {
        if (requiresTerminal && terminalId == linkedTerminalId)
        {
            OpenDoor();
        }
    }

    /// <summary>
    /// Unlock and open door (called by CodeTerminal on validation success)
    /// </summary>
    public void UnlockDoor()
    {
        OpenDoor();
    }
}
