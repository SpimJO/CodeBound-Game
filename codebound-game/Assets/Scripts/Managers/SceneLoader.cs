using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;
using System.Threading.Tasks;

/// <summary>
/// Scene Loader - Handles async scene loading with loading screen
/// </summary>
public class SceneLoader : MonoBehaviour
{
    private static SceneLoader _instance;
    public static SceneLoader Instance => _instance;

    [Header("Scene Names")]
    public const string MAIN_MENU = "MainMenu";
    public const string LEVEL_SELECT = "LevelSelect";
    public const string CHARACTER_SELECT = "CharacterSelect";
    public const string SETTINGS = "Settings";
    public const string GAMEPLAY_PREFIX = "Level_";

    [Header("Loading Settings")]
    [SerializeField] private float minimumLoadTime = 0.5f;

    private bool isLoading = false;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);
    }

    /// <summary>
    /// Load scene asynchronously with loading screen
    /// </summary>
    public void LoadScene(string sceneName)
    {
        if (isLoading)
        {
            Debug.LogWarning("Already loading a scene!");
            return;
        }

        StartCoroutine(LoadSceneCoroutine(sceneName));
    }

    /// <summary>
    /// Load level scene by number
    /// </summary>
    public void LoadLevel(int levelNumber)
    {
        string sceneName = $"{GAMEPLAY_PREFIX}{levelNumber}";
        LoadScene(sceneName);
    }

    /// <summary>
    /// Load Main Menu
    /// </summary>
    public void LoadMainMenu()
    {
        LoadScene(MAIN_MENU);
    }

    /// <summary>
    /// Load Level Select
    /// </summary>
    public void LoadLevelSelect()
    {
        LoadScene(LEVEL_SELECT);
    }

    /// <summary>
    /// Load Character Select
    /// </summary>
    public void LoadCharacterSelect()
    {
        LoadScene(CHARACTER_SELECT);
    }

    private IEnumerator LoadSceneCoroutine(string sceneName)
    {
        isLoading = true;
        float startTime = Time.time;

        // Show loading screen
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowLoading($"Loading {sceneName}...");
        }

        // Start async loading
        AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName);
        operation.allowSceneActivation = false;

        // Update progress
        while (!operation.isDone)
        {
            float progress = Mathf.Clamp01(operation.progress / 0.9f);
            
            if (UIManager.Instance != null)
            {
                UIManager.Instance.UpdateLoadingProgress(progress, $"Loading... {(int)(progress * 100)}%");
            }

            // Check if loading is complete
            if (operation.progress >= 0.9f)
            {
                // Ensure minimum loading time for visual feedback
                float elapsedTime = Time.time - startTime;
                if (elapsedTime < minimumLoadTime)
                {
                    yield return new WaitForSeconds(minimumLoadTime - elapsedTime);
                }

                // Hide loading screen
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.HideLoading();
                }

                // Activate scene
                operation.allowSceneActivation = true;
            }

            yield return null;
        }

        isLoading = false;
        Debug.Log($"Scene loaded: {sceneName}");
    }

    /// <summary>
    /// Reload current scene
    /// </summary>
    public void ReloadCurrentScene()
    {
        string currentScene = SceneManager.GetActiveScene().name;
        LoadScene(currentScene);
    }

    /// <summary>
    /// Get current scene name
    /// </summary>
    public string GetCurrentSceneName()
    {
        return SceneManager.GetActiveScene().name;
    }

    /// <summary>
    /// Check if scene exists in build settings
    /// </summary>
    public bool SceneExists(string sceneName)
    {
        for (int i = 0; i < SceneManager.sceneCountInBuildSettings; i++)
        {
            string scenePath = SceneUtility.GetScenePathByBuildIndex(i);
            string name = System.IO.Path.GetFileNameWithoutExtension(scenePath);
            if (name == sceneName)
            {
                return true;
            }
        }
        return false;
    }
}
