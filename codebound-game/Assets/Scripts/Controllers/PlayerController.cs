using UnityEngine;

/// <summary>
/// 2D Platformer Player Controller
/// Uses FixedUpdate for physics (60fps optimization)
/// </summary>
[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(Collider2D))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpForce = 10f;
    [SerializeField] private float acceleration = 10f;
    [SerializeField] private float deceleration = 10f;
    
    [Header("Ground Check")]
    [SerializeField] private Transform groundCheck;
    [SerializeField] private float groundCheckRadius = 0.2f;
    [SerializeField] private LayerMask groundLayer;
    
    [Header("Jump Settings")]
    [SerializeField] private float coyoteTime = 0.2f;
    [SerializeField] private float jumpBufferTime = 0.2f;
    
    // Cached components (optimization)
    private Rigidbody2D rb;
    private Collider2D col;
    private SpriteRenderer spriteRenderer;
    private Animator animator;
    
    // Input
    private float horizontalInput;
    private bool jumpPressed;
    
    // State
    private bool isGrounded;
    private float coyoteTimeCounter;
    private float jumpBufferCounter;
    private float currentVelocityX;
    
    // Animation hash IDs (optimization - avoid string comparison)
    private static readonly int IsWalking = Animator.StringToHash("IsWalking");
    private static readonly int IsJumping = Animator.StringToHash("IsJumping");
    private static readonly int IsFalling = Animator.StringToHash("IsFalling");
    
    private void Awake()
    {
        // Cache all components once (optimization)
        rb = GetComponent<Rigidbody2D>();
        col = GetComponent<Collider2D>();
        spriteRenderer = GetComponent<SpriteRenderer>();
        animator = GetComponent<Animator>();
        
        // Configure Rigidbody2D for platformer
        rb.gravityScale = 2.5f;
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
        rb.freezeRotation = true;
    }
    
    private void Update()
    {
        // Handle input (Update - for immediate response)
        HandleInput();
        
        // Update timers
        UpdateTimers();
        
        // Update animations
        UpdateAnimations();
    }
    
    private void FixedUpdate()
    {
        // All physics in FixedUpdate (50 times/sec default)
        CheckGroundStatus();
        ApplyMovement();
        HandleJump();
    }
    
    private void HandleInput()
    {
        // Get input
        horizontalInput = Input.GetAxisRaw("Horizontal");
        
        // Jump input with buffer
        if (Input.GetButtonDown("Jump"))
        {
            jumpPressed = true;
            jumpBufferCounter = jumpBufferTime;
        }
    }
    
    private void UpdateTimers()
    {
        // Coyote time (jump grace period after leaving ground)
        if (isGrounded)
        {
            coyoteTimeCounter = coyoteTime;
        }
        else
        {
            coyoteTimeCounter -= Time.deltaTime;
        }
        
        // Jump buffer (jump input before landing)
        if (jumpBufferCounter > 0)
        {
            jumpBufferCounter -= Time.deltaTime;
        }
    }
    
    private void CheckGroundStatus()
    {
        // Check if grounded using overlap circle (optimization)
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayer);
    }
    
    private void ApplyMovement()
    {
        // Smooth acceleration/deceleration
        float targetVelocity = horizontalInput * moveSpeed;
        float velocityChange = (targetVelocity - currentVelocityX);
        
        if (Mathf.Abs(velocityChange) > 0.01f)
        {
            float accel = horizontalInput != 0 ? acceleration : deceleration;
            currentVelocityX = Mathf.MoveTowards(currentVelocityX, targetVelocity, accel * Time.fixedDeltaTime);
        }
        
        // Apply velocity (keep existing Y velocity)
        rb.velocity = new Vector2(currentVelocityX, rb.velocity.y);
        
        // Flip sprite based on direction
        if (horizontalInput > 0)
        {
            spriteRenderer.flipX = false;
        }
        else if (horizontalInput < 0)
        {
            spriteRenderer.flipX = true;
        }
    }
    
    private void HandleJump()
    {
        // Jump with coyote time and jump buffer
        if (jumpBufferCounter > 0 && coyoteTimeCounter > 0)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
            jumpBufferCounter = 0;
            jumpPressed = false;
            
            // Play jump sound
            // AudioManager.Instance.PlaySFX("Jump");
        }
        
        // Variable jump height (release jump button early = shorter jump)
        if (Input.GetButtonUp("Jump") && rb.velocity.y > 0)
        {
            rb.velocity = new Vector2(rb.velocity.x, rb.velocity.y * 0.5f);
        }
    }
    
    private void UpdateAnimations()
    {
        if (animator == null) return;
        
        // Use hash IDs instead of strings (optimization)
        animator.SetBool(IsWalking, Mathf.Abs(horizontalInput) > 0.1f && isGrounded);
        animator.SetBool(IsJumping, !isGrounded && rb.velocity.y > 0.1f);
        animator.SetBool(IsFalling, !isGrounded && rb.velocity.y < -0.1f);
    }
    
    // Public API
    public bool IsGrounded => isGrounded;
    public float HorizontalVelocity => currentVelocityX;
    
    private void OnDrawGizmosSelected()
    {
        // Visualize ground check
        if (groundCheck != null)
        {
            Gizmos.color = isGrounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(groundCheck.position, groundCheckRadius);
        }
    }
}
