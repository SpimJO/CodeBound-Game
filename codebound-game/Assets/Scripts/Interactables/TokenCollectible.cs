using UnityEngine;

/// <summary>
/// Collectible token with magnetic pull effect
/// Uses object pooling for performance - NO Instantiate/Destroy!
/// </summary>
[RequireComponent(typeof(CircleCollider2D))]
public class TokenCollectible : MonoBehaviour
{
    [Header("Token Settings")]
    [SerializeField] private int tokenValue = 1;
    [SerializeField] private float magneticRange = 2f;
    [SerializeField] private float magneticSpeed = 5f;
    
    [Header("Visual Effects")]
    [SerializeField] private float rotationSpeed = 180f;
    [SerializeField] private float bobSpeed = 2f;
    [SerializeField] private float bobHeight = 0.2f;
    
    // Cached components (performance optimization - cache once, reuse forever)
    private Transform playerTransform;
    private bool isBeingCollected = false;
    private Vector3 startPosition;
    private CircleCollider2D col;
    private SpriteRenderer spriteRenderer;
    
    private void Awake()
    {
        col = GetComponent<CircleCollider2D>();
        col.isTrigger = true;
        
        spriteRenderer = GetComponent<SpriteRenderer>();
    }
    
    private void OnEnable()
    {
        // Reset state when spawned from pool
        isBeingCollected = false;
        startPosition = transform.position;
        
        // Cache player reference (optimization - FindGameObjectWithTag ONCE, not every frame)
        if (playerTransform == null)
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerTransform = player.transform;
            }
        }
    }
    
    private void Update()
    {
        // Rotation animation
        transform.Rotate(0f, 0f, rotationSpeed * Time.deltaTime);
        
        // Bob animation (if not being collected)
        if (!isBeingCollected)
        {
            float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed) * bobHeight;
            transform.position = new Vector3(transform.position.x, newY, transform.position.z);
        }
        else
        {
            // Move toward player (magnetic effect)
            if (playerTransform != null)
            {
                transform.position = Vector3.MoveTowards(
                    transform.position,
                    playerTransform.position,
                    magneticSpeed * Time.deltaTime
                );
            }
        }
        
        // Check magnetic range
        if (playerTransform != null && !isBeingCollected)
        {
            float distance = Vector3.Distance(transform.position, playerTransform.position);
            if (distance <= magneticRange)
            {
                isBeingCollected = true;
            }
        }
    }
    
    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            CollectToken();
        }
    }
    
    private void CollectToken()
    {
        // Add token to player's count
        LevelController levelController = FindObjectOfType<LevelController>();
        if (levelController != null)
        {
            levelController.AddTokens(tokenValue);
        }
        
        // Spawn particle effect
        SpawnCollectParticle();
        
        // Play sound effect
        PlayCollectSound();
        
        // Return to pool instead of Destroy (HUGE performance gain!)
        if (PoolManager.Instance != null)
        {
            PoolManager.Instance.ReturnToken(gameObject);
        }
        else
        {
            gameObject.SetActive(false);
        }
    }
    
    private void SpawnCollectParticle()
    {
        if (PoolManager.Instance != null)
        {
            GameObject particle = PoolManager.Instance.SpawnParticle("Collect", transform.position);
            if (particle != null)
            {
                // Auto-return particle after animation
                ParticleSystem ps = particle.GetComponent<ParticleSystem>();
                if (ps != null)
                {
                    float duration = ps.main.duration;
                    StartCoroutine(ReturnParticleAfterDelay(particle, duration));
                }
            }
        }
    }
    
    private System.Collections.IEnumerator ReturnParticleAfterDelay(GameObject particle, float delay)
    {
        yield return new WaitForSeconds(delay);
        if (PoolManager.Instance != null)
        {
            PoolManager.Instance.ReturnParticle(particle, "Collect");
        }
    }
    
    private void PlayCollectSound()
    {
        // TODO: Integrate with AudioManager when created
        // AudioManager.Instance?.PlaySFX("TokenCollect");
    }
    
    private void OnDrawGizmosSelected()
    {
        // Visualize magnetic range
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, magneticRange);
    }
}
