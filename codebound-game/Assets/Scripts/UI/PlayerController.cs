using UnityEngine;
using System.Collections;

/// <summary>
/// Player Controller - 2D Platformer Movement
/// Handles WASD/Arrow keys movement, jumping, and interactions
/// </summary>
[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(Collider2D))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement Settings")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpForce = 12f;
    [SerializeField] private float accelerationTime = 0.1f;
    [SerializeField] private float decelerationTime = 0.1f;

    [Header("Ground Check")]
    [SerializeField] private Transform groundCheck;
    [SerializeField] private float groundCheckRadius = 0.2f;
    [SerializeField] private LayerMask groundLayer;

    [Header("Interaction")]
    [SerializeField] private float interactionRange = 1.5f;
    [SerializeField] private LayerMask interactableLayer;
    [SerializeField] private KeyCode interactKey = KeyCode.E;

    [Header("Animation")]
    [SerializeField] private Animator animator;
    [SerializeField] private SpriteRenderer spriteRenderer;

    [Header("Audio")]
    [SerializeField] private AudioClip jumpSound;
    [SerializeField] private AudioClip landSound;
    [SerializeField] private AudioClip interactSound;

    // Components
    private Rigidbody2D rb;
    private AudioSource audioSource;

    // Movement state
    private float moveInput;
    private float currentVelocityX;
    private bool isGrounded;
    private bool wasGrounded;
    private bool canMove = true;

    // Animation hashes
    private int animIsMoving;
    private int animIsJumping;
    private int animIsInteracting;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        audioSource = GetComponent<AudioSource>();
        
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }

        // Cache animation parameter hashes
        if (animator != null)
        {
            animIsMoving = Animator.StringToHash("isMoving");
            animIsJumping = Animator.StringToHash("isJumping");
            animIsInteracting = Animator.StringToHash("isInteracting");
        }
    }

    private void Update()
    {
        if (!canMove) return;

        HandleInput();
        CheckGround();
        HandleInteraction();
        UpdateAnimations();
    }

    private void FixedUpdate()
    {
        if (!canMove) return;

        ApplyMovement();
    }

    // ============================================================
    // INPUT HANDLING
    // ============================================================

    private void HandleInput()
    {
        // Horizontal movement input
        moveInput = Input.GetAxisRaw("Horizontal");

        // Jump input
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            Jump();
        }
    }

    // ============================================================
    // MOVEMENT
    // ============================================================

    private void ApplyMovement()
    {
        // Smooth acceleration/deceleration
        float targetVelocityX = moveInput * moveSpeed;
        float smoothTime = Mathf.Abs(moveInput) > 0.1f ? accelerationTime : decelerationTime;
        
        currentVelocityX = Mathf.Lerp(currentVelocityX, targetVelocityX, smoothTime * 10f * Time.fixedDeltaTime);

        // Apply velocity
        rb.velocity = new Vector2(currentVelocityX, rb.velocity.y);

        // Flip sprite based on direction
        if (spriteRenderer != null && Mathf.Abs(moveInput) > 0.1f)
        {
            spriteRenderer.flipX = moveInput < 0;
        }
    }

    private void Jump()
    {
        rb.velocity = new Vector2(rb.velocity.x, jumpForce);
        PlaySound(jumpSound);

        if (animator != null)
        {
            animator.SetBool(animIsJumping, true);
        }

        Debug.Log("Player jumped!");
    }

    // ============================================================
    // GROUND CHECK
    // ============================================================

    private void CheckGround()
    {
        wasGrounded = isGrounded;

        // Check if player is on ground using overlap circle
        if (groundCheck != null)
        {
            isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayer);
        }
        else
        {
            // Fallback: raycast down from player center
            RaycastHit2D hit = Physics2D.Raycast(transform.position, Vector2.down, 0.6f, groundLayer);
            isGrounded = hit.collider != null;
        }

        // Landing detection
        if (isGrounded && !wasGrounded)
        {
            OnLand();
        }
    }

    private void OnLand()
    {
        PlaySound(landSound);

        if (animator != null)
        {
            animator.SetBool(animIsJumping, false);
        }

        // Landing effect (dust particles, squash animation, etc.)
        // TODO: Instantiate landing VFX
    }

    // ============================================================
    // INTERACTION
    // ============================================================

    private void HandleInteraction()
    {
        if (Input.GetKeyDown(interactKey))
        {
            TryInteract();
        }
    }

    private void TryInteract()
    {
        // Check for interactable objects in range
        Collider2D[] hits = Physics2D.OverlapCircleAll(transform.position, interactionRange, interactableLayer);

        if (hits.Length > 0)
        {
            // Find closest interactable
            Collider2D closest = GetClosestInteractable(hits);
            
            if (closest != null)
            {
                IInteractable interactable = closest.GetComponent<IInteractable>();
                if (interactable != null)
                {
                    interactable.Interact(this);
                    PlaySound(interactSound);
                    
                    if (animator != null)
                    {
                        animator.SetTrigger(animIsInteracting);
                    }

                    Debug.Log($"Interacted with: {closest.gameObject.name}");
                }
            }
        }
    }

    private Collider2D GetClosestInteractable(Collider2D[] interactables)
    {
        Collider2D closest = null;
        float minDistance = float.MaxValue;

        foreach (Collider2D col in interactables)
        {
            float distance = Vector2.Distance(transform.position, col.transform.position);
            if (distance < minDistance)
            {
                minDistance = distance;
                closest = col;
            }
        }

        return closest;
    }

    // ============================================================
    // ANIMATIONS
    // ============================================================

    private void UpdateAnimations()
    {
        if (animator == null) return;

        // Update movement animation
        bool isMoving = Mathf.Abs(moveInput) > 0.1f && isGrounded;
        animator.SetBool(animIsMoving, isMoving);

        // Update jumping animation
        animator.SetBool(animIsJumping, !isGrounded);
    }

    // ============================================================
    // AUDIO
    // ============================================================

    private void PlaySound(AudioClip clip)
    {
        if (audioSource != null && clip != null)
        {
            audioSource.PlayOneShot(clip);
        }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    public void SetMovementEnabled(bool enabled)
    {
        if (enabled)
        {
            EnableMovement();
        }
        else
        {
            DisableMovement();
        }
    }

    public void EnableMovement()
    {
        canMove = true;
    }

    public void DisableMovement()
    {
        canMove = false;
        moveInput = 0;
        currentVelocityX = 0;
        rb.velocity = new Vector2(0, rb.velocity.y);
    }

    public void Teleport(Vector3 position)
    {
        transform.position = position;
        rb.velocity = Vector2.zero;
        currentVelocityX = 0;
    }

    public bool IsGrounded() => isGrounded;
    public bool IsMoving() => Mathf.Abs(moveInput) > 0.1f;

    // ============================================================
    // GIZMOS (Debug Visualization)
    // ============================================================

    private void OnDrawGizmosSelected()
    {
        // Draw ground check radius
        if (groundCheck != null)
        {
            Gizmos.color = isGrounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(groundCheck.position, groundCheckRadius);
        }

        // Draw interaction range
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, interactionRange);
    }
}

/// <summary>
/// Interface for interactable objects (terminals, doors, switches, etc.)
/// </summary>
public interface IInteractable
{
    void Interact(PlayerController player);
}
