using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace CodeBound.Editor
{
    /// <summary>
    /// Editor utility to automatically configure build settings with all scenes
    /// </summary>
    public class BuildSettingsManager : EditorWindow
    {
        [MenuItem("CodeBound/Configure Build Settings")]
        public static void ConfigureBuildSettings()
        {
            List<EditorBuildSettingsScene> sceneList = new List<EditorBuildSettingsScene>();
            
            // Add core scenes first (in order)
            string[] coreScenes = new string[]
            {
                "Assets/Scenes/Core/MainMenu.unity",
                "Assets/Scenes/Core/LevelSelect.unity",
                "Assets/Scenes/Core/CharacterSelect.unity"
            };
            
            foreach (string scenePath in coreScenes)
            {
                if (File.Exists(scenePath))
                {
                    sceneList.Add(new EditorBuildSettingsScene(scenePath, true));
                    Debug.Log($"Added core scene: {scenePath}");
                }
                else
                {
                    Debug.LogWarning($"Core scene not found: {scenePath}");
                }
            }
            
            // Add all level scenes (Level_1 to Level_100)
            string levelsPath = "Assets/Scenes/Levels";
            if (Directory.Exists(levelsPath))
            {
                for (int i = 1; i <= 100; i++)
                {
                    string levelPath = $"{levelsPath}/Level_{i}.unity";
                    if (File.Exists(levelPath))
                    {
                        sceneList.Add(new EditorBuildSettingsScene(levelPath, true));
                    }
                }
                Debug.Log($"Added {sceneList.Count - coreScenes.Length} level scenes");
            }
            
            // Update build settings
            EditorBuildSettings.scenes = sceneList.ToArray();
            
            Debug.Log($"Build settings configured with {sceneList.Count} total scenes!");
            Debug.Log("Scene order: MainMenu (0), LevelSelect (1), CharacterSelect (2), Level_1 (3)...");
        }
        
        [MenuItem("CodeBound/Verify All Scenes Exist")]
        public static void VerifyAllScenes()
        {
            int missingCount = 0;
            int existingCount = 0;
            
            Debug.Log("===== Scene Verification Report =====");
            
            // Check core scenes
            Debug.Log("\n--- Core Scenes ---");
            string[] coreScenes = new string[]
            {
                "Assets/Scenes/Core/MainMenu.unity",
                "Assets/Scenes/Core/LevelSelect.unity",
                "Assets/Scenes/Core/CharacterSelect.unity"
            };
            
            foreach (string scenePath in coreScenes)
            {
                if (File.Exists(scenePath))
                {
                    Debug.Log($"✓ {Path.GetFileName(scenePath)}");
                    existingCount++;
                }
                else
                {
                    Debug.LogWarning($"✗ Missing: {scenePath}");
                    missingCount++;
                }
            }
            
            // Check level scenes
            Debug.Log("\n--- Level Scenes ---");
            string levelsPath = "Assets/Scenes/Levels";
            List<int> missingLevels = new List<int>();
            
            for (int i = 1; i <= 100; i++)
            {
                string levelPath = $"{levelsPath}/Level_{i}.unity";
                if (File.Exists(levelPath))
                {
                    existingCount++;
                }
                else
                {
                    missingLevels.Add(i);
                    missingCount++;
                }
            }
            
            if (missingLevels.Count > 0)
            {
                Debug.LogWarning($"Missing {missingLevels.Count} level scenes: {string.Join(", ", missingLevels.Take(10))}...");
            }
            else
            {
                Debug.Log("✓ All 100 level scenes present");
            }
            
            // Summary
            Debug.Log($"\n===== Summary =====");
            Debug.Log($"Existing: {existingCount} scenes");
            Debug.Log($"Missing: {missingCount} scenes");
            
            if (missingCount == 0)
            {
                Debug.Log("✓ All scenes verified!");
            }
        }
        
        [MenuItem("CodeBound/List All Scenes in Build")]
        public static void ListBuildScenes()
        {
            Debug.Log("===== Scenes in Build Settings =====");
            
            EditorBuildSettingsScene[] scenes = EditorBuildSettings.scenes;
            
            if (scenes.Length == 0)
            {
                Debug.LogWarning("No scenes in build settings! Run 'Configure Build Settings' first.");
                return;
            }
            
            for (int i = 0; i < scenes.Length; i++)
            {
                string status = scenes[i].enabled ? "✓" : "✗";
                Debug.Log($"[{i}] {status} {scenes[i].path}");
            }
            
            Debug.Log($"\nTotal: {scenes.Length} scenes ({scenes.Count(s => s.enabled)} enabled)");
        }
    }
}
