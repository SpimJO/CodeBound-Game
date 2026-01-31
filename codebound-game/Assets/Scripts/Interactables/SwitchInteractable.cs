using UnityEngine;
using UnityEngine.Events;

/// <summary>
/// Switch/Button - Activates connected mechanisms when pressed
/// Can be floor pressure plates or wall buttons
/// </summary>
public class SwitchInteractable : MonoBehaviour, IInteractable
{
    public enum SwitchType
    {
        Toggle,         // Stays in state after interaction
        Momentary,      // Only active while pressed
        OneShot         // Can only be activated once
    }

    [Header("Switch Settings")]
    [SerializeField] private string switchId = "switch_01";
    [SerializeField] private SwitchType switchType = SwitchType.Toggle;
    [SerializeField] private bool isActive = false;
    [SerializeField] private bool requiresPlayer = true; // Only player can activate

    [Header("Visual")]
    [SerializeField] private SpriteRenderer switchSprite;
    [SerializeField] private Sprite activeSprite;
    [SerializeField] private Sprite inactiveSprite;
    [SerializeField] private Color activeColor = Color.green;
    [SerializeField] private Color inactiveColor = Color.red;

    [Header("Audio")]
    [SerializeField] private AudioClip activateSound;
    [SerializeField] private AudioClip deactivateSound;

    [Header("Events")]
    [SerializeField] private UnityEvent OnActivated;
    [SerializeField] private UnityEvent OnDeactivated;

    [Header("Connected Objects")]
    [SerializeField] private DoorController[] connectedDoors;
    [SerializeField] private GameObject[] objectsToEnable;
    [SerializeField] private GameObject[] objectsToDisable;

    private AudioSource audioSource;
    private bool usedOneShot = false;

    public bool IsActive => isActive;

    private void Awake()
    {
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }
    }

    private void Start()
    {
        UpdateVisuals();
    }

    public void Interact(PlayerController player)
    {
        if (switchType == SwitchType.OneShot && usedOneShot)
        {
            Debug.Log($"Switch {switchId} has already been used!");
            return;
        }

        ToggleSwitch();
    }

    /// <summary>
    /// Toggle switch state
    /// </summary>
    public void ToggleSwitch()
    {
        if (isActive)
        {
            Deactivate();
        }
        else
        {
            Activate();
        }
    }

    /// <summary>
    /// Activate the switch
    /// </summary>
    public void Activate()
    {
        if (isActive && switchType != SwitchType.Momentary) return;

        isActive = true;

        if (switchType == SwitchType.OneShot)
        {
            usedOneShot = true;
        }

        // Play sound
        if (activateSound && audioSource)
        {
            audioSource.PlayOneShot(activateSound);
        }

        // Update visuals
        UpdateVisuals();

        // Trigger events
        OnActivated?.Invoke();

        // Activate connected objects
        foreach (var door in connectedDoors)
        {
            if (door != null)
            {
                door.OpenDoor();
            }
        }

        foreach (var obj in objectsToEnable)
        {
            if (obj != null)
            {
                obj.SetActive(true);
            }
        }

        foreach (var obj in objectsToDisable)
        {
            if (obj != null)
            {
                obj.SetActive(false);
            }
        }

        Debug.Log($"Switch {switchId} activated!");
    }

    /// <summary>
    /// Deactivate the switch
    /// </summary>
    public void Deactivate()
    {
        if (!isActive) return;
        if (switchType == SwitchType.OneShot) return; // Can't deactivate one-shot

        isActive = false;

        // Play sound
        if (deactivateSound && audioSource)
        {
            audioSource.PlayOneShot(deactivateSound);
        }

        // Update visuals
        UpdateVisuals();

        // Trigger events
        OnDeactivated?.Invoke();

        // Deactivate connected objects
        foreach (var door in connectedDoors)
        {
            if (door != null)
            {
                door.CloseDoor();
            }
        }

        foreach (var obj in objectsToEnable)
        {
            if (obj != null)
            {
                obj.SetActive(false);
            }
        }

        foreach (var obj in objectsToDisable)
        {
            if (obj != null)
            {
                obj.SetActive(true);
            }
        }

        Debug.Log($"Switch {switchId} deactivated!");
    }

    private void UpdateVisuals()
    {
        if (switchSprite)
        {
            if (isActive && activeSprite)
            {
                switchSprite.sprite = activeSprite;
            }
            else if (!isActive && inactiveSprite)
            {
                switchSprite.sprite = inactiveSprite;
            }

            // Also update color
            switchSprite.color = isActive ? activeColor : inactiveColor;
        }
    }

    // Pressure plate behavior - auto activate when stepped on
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (switchType == SwitchType.Momentary)
        {
            if (!requiresPlayer || collision.CompareTag("Player"))
            {
                Activate();
            }
        }
    }

    private void OnTriggerExit2D(Collider2D collision)
    {
        if (switchType == SwitchType.Momentary)
        {
            if (!requiresPlayer || collision.CompareTag("Player"))
            {
                Deactivate();
            }
        }
    }
}
