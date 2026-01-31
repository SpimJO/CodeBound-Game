using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Level Exit - Triggers level completion and transitions to next level
/// </summary>
public class LevelExit : MonoBehaviour
{
    [Header("Exit Settings")]
    [SerializeField] private bool requiresTerminalCompletion = true;
    [SerializeField] private string linkedTerminalId = "terminal_01";
    [SerializeField] private int nextLevelNumber = 2;

    [Header("Visual")]
    [SerializeField] private SpriteRenderer exitSprite;
    [SerializeField] private Sprite lockedSprite;
    [SerializeField] private Sprite unlockedSprite;
    [SerializeField] private ParticleSystem portalParticles;
    [SerializeField] private ParticleSystem exitParticles;

    [Header("Audio")]
    [SerializeField] private AudioClip exitSound;
    [SerializeField] private AudioClip lockedSound;

    private AudioSource audioSource;
    private bool isUnlocked = false;

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
        // Start locked if required
        if (requiresTerminalCompletion)
        {
            SetLocked(true);
        }
        else
        {
            SetLocked(false);
        }
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (!collision.CompareTag("Player")) return;

        if (!isUnlocked)
        {
            // Show locked feedback
            if (lockedSound && audioSource)
            {
                audioSource.PlayOneShot(lockedSound);
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowInfo("Complete the terminal puzzle to unlock the exit!");
            }

            return;
        }

        // Trigger level completion
        StartCoroutine(CompleteLevel(collision.gameObject));
    }

    private System.Collections.IEnumerator CompleteLevel(GameObject player)
    {
        Debug.Log($"Level completed! Moving to level {nextLevelNumber}");

        // Play exit effects
        if (exitSound && audioSource)
        {
            audioSource.PlayOneShot(exitSound);
        }

        if (exitParticles)
        {
            exitParticles.Play();
        }

        // Disable player movement
        var playerController = player.GetComponent<PlayerController>();
        if (playerController != null)
        {
            playerController.SetMovementEnabled(false);
        }

        // Show loading
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowLoading("Level Complete!");
        }

        // Update progress
        if (LevelManager.Instance != null)
        {
            LevelManager.Instance.CompleteCurrentLevel();
        }

        // Wait for effects
        yield return new WaitForSeconds(1.5f);

        // Transition to next level
        LoadNextLevel();
    }

    private void LoadNextLevel()
    {
        if (LevelManager.Instance != null)
        {
            // Check if there's a next level
            LevelData nextLevel = LevelManager.Instance.GetLevel(nextLevelNumber);
            
            if (nextLevel != null)
            {
                // Load next level scene
                string sceneName = $"Level_{nextLevelNumber}";
                SceneManager.LoadScene(sceneName);
            }
            else
            {
                // No more levels - return to level select or show completion
                Debug.Log("All levels completed!");
                SceneManager.LoadScene("LevelSelect");
            }
        }
        else
        {
            // Fallback to level select
            SceneManager.LoadScene("LevelSelect");
        }
    }

    /// <summary>
    /// Unlock the exit
    /// </summary>
    public void Unlock()
    {
        SetLocked(false);
    }

    /// <summary>
    /// Set locked/unlocked state
    /// </summary>
    public void SetLocked(bool locked)
    {
        isUnlocked = !locked;

        // Update visuals
        if (exitSprite)
        {
            if (isUnlocked && unlockedSprite)
            {
                exitSprite.sprite = unlockedSprite;
            }
            else if (!isUnlocked && lockedSprite)
            {
                exitSprite.sprite = lockedSprite;
            }
        }

        // Enable/disable portal particles
        if (portalParticles)
        {
            if (isUnlocked)
            {
                portalParticles.Play();
            }
            else
            {
                portalParticles.Stop();
            }
        }
    }

    /// <summary>
    /// Called when linked terminal is completed
    /// </summary>
    public void OnTerminalCompleted(string terminalId)
    {
        if (requiresTerminalCompletion && terminalId == linkedTerminalId)
        {
            Unlock();
        }
    }
}
