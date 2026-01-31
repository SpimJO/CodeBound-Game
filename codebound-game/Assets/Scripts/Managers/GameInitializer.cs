using UnityEngine;

/// <summary>
/// Game Initializer - Ensures all core managers are created
/// Attach to an empty GameObject in a preload scene or the first scene
/// </summary>
public class GameInitializer : MonoBehaviour
{
    [Header("Core Manager Prefabs")]
    [SerializeField] private GameObject gameManagerPrefab;
    [SerializeField] private GameObject uiManagerPrefab;
    [SerializeField] private GameObject settingsManagerPrefab;
    [SerializeField] private GameObject sceneLoaderPrefab;

    private void Awake()
    {
        // Initialize in specific order
        EnsureManager<GameManager>("GameManager", gameManagerPrefab);
        EnsureManager<UIManager>("UIManager", uiManagerPrefab);
        EnsureManager<SettingsManager>("SettingsManager", settingsManagerPrefab);
        EnsureManager<SceneLoader>("SceneLoader", sceneLoaderPrefab);

        Debug.Log("=== CodeBound Game Initialization Complete ===");
    }

    private void EnsureManager<T>(string managerName, GameObject prefab) where T : MonoBehaviour
    {
        if (FindObjectOfType<T>() == null)
        {
            if (prefab != null)
            {
                Instantiate(prefab);
            }
            else
            {
                // Create empty GameObject with component
                GameObject go = new GameObject(managerName);
                go.AddComponent<T>();
            }
            
            Debug.Log($"Created {managerName}");
        }
    }
}
