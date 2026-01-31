using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using System.IO;

public class LevelSceneGenerator : EditorWindow
{
    [MenuItem("CodeBound/Generate Level Scenes")]
    public static void GenerateLevelScenes()
    {
        string levelsPath = "Assets/Scenes/Levels";
        
        if (!Directory.Exists(levelsPath))
        {
            Directory.CreateDirectory(levelsPath);
        }

        for (int i = 1; i <= 100; i++)
        {
            string sceneName = $"Level_{i}";
            string scenePath = $"{levelsPath}/{sceneName}.unity";
            
            // Skip if scene already exists
            if (File.Exists(scenePath))
            {
                Debug.Log($"Scene {sceneName} already exists, skipping...");
                continue;
            }
            
            // Create new scene
            var newScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            
            // Add level controller GameObject
            GameObject levelController = new GameObject("LevelController");
            // Note: You'll need to add the actual LevelController component later
            
            // Add level config
            GameObject levelConfig = new GameObject("LevelConfig");
            // Note: You'll need to add the actual LevelData component later
            
            // Save scene
            EditorSceneManager.SaveScene(newScene, scenePath);
            Debug.Log($"Created scene: {sceneName}");
        }
        
        AssetDatabase.Refresh();
        Debug.Log("All 100 level scenes generated successfully!");
    }
}
