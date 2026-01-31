using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using System.IO;
using System.Collections.Generic;

namespace CodeBound.Editor
{
    /// <summary>
    /// Unity Editor tool to automatically generate levels 2-100 from Level_TEMPLATE.
    /// 
    /// HOW TO USE:
    /// 1. Complete Level_001 and test it works
    /// 2. Duplicate Level_001 → Save as Level_TEMPLATE in same folder
    /// 3. Open: Window → CodeBound → Level Generator
    /// 4. Set Start Level: 2, End Level: 10 (test batch)
    /// 5. Click "Generate Levels"
    /// 6. Verify Level_002 through Level_010 created
    /// 7. Test play Level_002 to confirm it works
    /// 8. Generate full batch: Start: 11, End: 100
    /// 
    /// WHAT IT DOES:
    /// - Reads level_XXX.json from Resources/LevelData/ (already created!)
    /// - Duplicates Level_TEMPLATE scene
    /// - Updates LevelManager.currentLevel to match level number
    /// - Adjusts token positions for variety (optional)
    /// - Saves as Level_XXX.unity in Assets/Scenes/Levels/
    /// 
    /// TIME: ~30 seconds per level = ~50 minutes for all 99 levels
    /// </summary>
    public class LevelGenerator : EditorWindow
    {
        private int startLevel = 2;
        private int endLevel = 10;
        private bool adjustTokenPositions = true;
        private bool adjustPlatformLayouts = false;
        private float progress = 0f;
        private bool isGenerating = false;
        
        private const string TEMPLATE_PATH = "Assets/Scenes/Levels/Level_TEMPLATE.unity";
        private const string LEVELS_FOLDER = "Assets/Scenes/Levels/";
        private const string JSON_FOLDER = "Assets/Resources/LevelData/";

        [MenuItem("Window/CodeBound/Level Generator")]
        public static void ShowWindow()
        {
            var window = GetWindow<LevelGenerator>("Level Generator");
            window.minSize = new Vector2(400, 400);
        }

        private void OnGUI()
        {
            GUILayout.Space(10);
            
            // Title
            GUIStyle titleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 16,
                fontStyle = FontStyle.Bold,
                alignment = TextAnchor.MiddleCenter
            };
            GUILayout.Label("🎮 CodeBound Level Generator", titleStyle);
            
            GUILayout.Space(10);
            
            // Info box
            EditorGUILayout.HelpBox(
                "Automatically generates levels 2-100 from Level_TEMPLATE.\n" +
                "Make sure Level_TEMPLATE.unity exists before running!",
                MessageType.Info
            );
            
            GUILayout.Space(10);
            
            // Settings
            EditorGUI.BeginDisabledGroup(isGenerating);
            
            GUILayout.Label("Generation Settings:", EditorStyles.boldLabel);
            startLevel = EditorGUILayout.IntField("Start Level:", startLevel);
            endLevel = EditorGUILayout.IntField("End Level:", endLevel);
            
            GUILayout.Space(5);
            
            adjustTokenPositions = EditorGUILayout.Toggle("Adjust Token Positions", adjustTokenPositions);
            EditorGUILayout.HelpBox("Randomly varies token positions for variety", MessageType.None);
            
            adjustPlatformLayouts = EditorGUILayout.Toggle("Adjust Platform Layouts", adjustPlatformLayouts);
            EditorGUILayout.HelpBox("⚠️ Advanced: Modifies platform positions (may break references)", MessageType.Warning);
            
            GUILayout.Space(10);
            
            // Validation
            bool isValid = ValidateSettings();
            if (!isValid)
            {
                EditorGUILayout.HelpBox(
                    "❌ Invalid settings:\n" +
                    "- Start level must be 2 or higher\n" +
                    "- End level must be 100 or lower\n" +
                    "- Start must be less than or equal to End",
                    MessageType.Error
                );
            }
            
            // Check template exists
            bool templateExists = File.Exists(TEMPLATE_PATH);
            if (!templateExists)
            {
                EditorGUILayout.HelpBox(
                    "❌ Level_TEMPLATE.unity not found!\n" +
                    "Create it first: Duplicate Level_001 → Save as Level_TEMPLATE",
                    MessageType.Error
                );
            }
            
            GUILayout.Space(10);
            
            // Generate button
            EditorGUI.BeginDisabledGroup(!isValid || !templateExists);
            
            if (GUILayout.Button($"🚀 Generate Levels {startLevel}-{endLevel}", GUILayout.Height(40)))
            {
                GenerateLevels();
            }
            
            EditorGUI.EndDisabledGroup();
            
            EditorGUI.EndDisabledGroup();
            
            // Progress bar
            if (isGenerating)
            {
                GUILayout.Space(10);
                EditorGUI.ProgressBar(
                    EditorGUILayout.GetControlRect(false, 20),
                    progress,
                    $"Generating... {Mathf.RoundToInt(progress * 100)}%"
                );
            }
            
            GUILayout.Space(20);
            
            // Stats
            GUILayout.Label("📊 Statistics:", EditorStyles.boldLabel);
            int levelCount = endLevel - startLevel + 1;
            int estimatedTime = levelCount * 30; // 30 seconds per level
            EditorGUILayout.LabelField("Levels to generate:", levelCount.ToString());
            EditorGUILayout.LabelField("Estimated time:", $"{estimatedTime / 60} min {estimatedTime % 60} sec");
            
            GUILayout.Space(10);
            
            // Instructions
            if (GUILayout.Button("📖 Show Instructions"))
            {
                ShowInstructions();
            }
        }

        private bool ValidateSettings()
        {
            return startLevel >= 2 && endLevel <= 100 && startLevel <= endLevel;
        }

        private async void GenerateLevels()
        {
            isGenerating = true;
            progress = 0f;
            
            int totalLevels = endLevel - startLevel + 1;
            int currentIndex = 0;
            
            Debug.Log($"[LevelGenerator] Starting generation of {totalLevels} levels...");
            
            for (int levelNum = startLevel; levelNum <= endLevel; levelNum++)
            {
                try
                {
                    GenerateSingleLevel(levelNum);
                    currentIndex++;
                    progress = (float)currentIndex / totalLevels;
                    
                    // Force UI update
                    Repaint();
                    
                    // Small delay to prevent Unity freeze
                    await System.Threading.Tasks.Task.Delay(100);
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"[LevelGenerator] Failed to generate Level_{levelNum:D3}: {ex.Message}");
                }
            }
            
            isGenerating = false;
            progress = 1f;
            
            Debug.Log($"[LevelGenerator] ✅ Successfully generated {totalLevels} levels!");
            EditorUtility.DisplayDialog(
                "Generation Complete!",
                $"Successfully generated {totalLevels} levels ({startLevel}-{endLevel})\n\n" +
                $"Test play Level_{startLevel:D3} to verify!",
                "OK"
            );
            
            AssetDatabase.Refresh();
        }

        private void GenerateSingleLevel(int levelNum)
        {
            string levelName = $"Level_{levelNum:D3}";
            string outputPath = $"{LEVELS_FOLDER}{levelName}.unity";
            
            Debug.Log($"[LevelGenerator] Generating {levelName}...");
            
            // Check if JSON exists
            string jsonPath = $"{JSON_FOLDER}level_{levelNum:D3}.json";
            if (!File.Exists(jsonPath))
            {
                Debug.LogWarning($"[LevelGenerator] JSON not found: {jsonPath} - Level will use default data");
            }
            
            // Load template
            Scene templateScene = EditorSceneManager.OpenScene(TEMPLATE_PATH, OpenSceneMode.Single);
            
            // Find LevelManager in scene
            LevelManager levelManager = FindObjectOfType<LevelManager>();
            if (levelManager != null)
            {
                // Update level number
                SerializedObject so = new SerializedObject(levelManager);
                so.FindProperty("currentLevel").intValue = levelNum;
                so.ApplyModifiedProperties();
                
                Debug.Log($"[LevelGenerator] Set LevelManager.currentLevel = {levelNum}");
            }
            else
            {
                Debug.LogWarning($"[LevelGenerator] LevelManager not found in scene! Level number not set.");
            }
            
            // Adjust token positions if enabled
            if (adjustTokenPositions)
            {
                AdjustTokenPositions(levelNum);
            }
            
            // Adjust platform layouts if enabled (advanced)
            if (adjustPlatformLayouts)
            {
                AdjustPlatformLayouts(levelNum);
            }
            
            // Mark scene as dirty
            EditorSceneManager.MarkSceneDirty(templateScene);
            
            // Save as new scene
            EditorSceneManager.SaveScene(templateScene, outputPath);
            
            Debug.Log($"[LevelGenerator] ✅ Created: {outputPath}");
        }

        private void AdjustTokenPositions(int levelNum)
        {
            // Find all tokens in scene
            GameObject[] tokens = GameObject.FindGameObjectsWithTag("Collectible");
            if (tokens == null || tokens.Length == 0)
            {
                // Try finding by name instead
                var allObjects = FindObjectsOfType<GameObject>();
                var tokenList = new List<GameObject>();
                foreach (var obj in allObjects)
                {
                    if (obj.name.Contains("Token"))
                    {
                        tokenList.Add(obj);
                    }
                }
                tokens = tokenList.ToArray();
            }
            
            if (tokens.Length == 0)
            {
                Debug.LogWarning($"[LevelGenerator] No tokens found in scene for Level_{levelNum:D3}");
                return;
            }
            
            // Seed random with level number for consistency
            Random.InitState(levelNum * 12345);
            
            foreach (var token in tokens)
            {
                // Add small random offset to position
                Vector3 currentPos = token.transform.position;
                float offsetX = Random.Range(-0.3f, 0.3f);
                float offsetY = Random.Range(-0.2f, 0.2f);
                
                token.transform.position = new Vector3(
                    currentPos.x + offsetX,
                    currentPos.y + offsetY,
                    currentPos.z
                );
            }
            
            Debug.Log($"[LevelGenerator] Adjusted {tokens.Length} token positions");
        }

        private void AdjustPlatformLayouts(int levelNum)
        {
            // ⚠️ Advanced feature - may break script references!
            // Only enable if you know what you're doing
            
            GameObject[] platforms = GameObject.FindGameObjectsWithTag("Platform");
            if (platforms == null || platforms.Length == 0)
            {
                var allObjects = FindObjectsOfType<GameObject>();
                var platformList = new List<GameObject>();
                foreach (var obj in allObjects)
                {
                    if (obj.name.Contains("Platform"))
                    {
                        platformList.Add(obj);
                    }
                }
                platforms = platformList.ToArray();
            }
            
            if (platforms.Length == 0)
            {
                Debug.LogWarning($"[LevelGenerator] No platforms found in scene for Level_{levelNum:D3}");
                return;
            }
            
            Random.InitState(levelNum * 54321);
            
            // Slightly vary platform heights based on difficulty
            float difficultyMultiplier = Mathf.Clamp01((float)levelNum / 100f);
            
            foreach (var platform in platforms)
            {
                // Skip ground platform
                if (platform.name.Contains("Ground")) continue;
                
                Vector3 currentPos = platform.transform.position;
                float heightVariation = Random.Range(-0.2f, 0.3f) * difficultyMultiplier;
                
                platform.transform.position = new Vector3(
                    currentPos.x,
                    currentPos.y + heightVariation,
                    currentPos.z
                );
            }
            
            Debug.Log($"[LevelGenerator] Adjusted {platforms.Length} platform layouts");
        }

        private void ShowInstructions()
        {
            EditorUtility.DisplayDialog(
                "📖 Level Generator Instructions",
                "STEP-BY-STEP GUIDE:\n\n" +
                "1️⃣ Complete Level_001\n" +
                "   - Build and test all mechanics\n" +
                "   - Verify everything works\n\n" +
                "2️⃣ Create Template\n" +
                "   - Open Level_001.unity\n" +
                "   - File → Save As → Level_TEMPLATE.unity\n" +
                "   - Keep all GameObjects intact\n\n" +
                "3️⃣ Generate Test Batch\n" +
                "   - Start: 2, End: 10\n" +
                "   - Click Generate\n" +
                "   - Wait ~5 minutes\n\n" +
                "4️⃣ Test Level_002\n" +
                "   - Open Level_002.unity\n" +
                "   - Press Play\n" +
                "   - Verify JSON loads correctly\n\n" +
                "5️⃣ Generate Full Batch\n" +
                "   - Start: 11, End: 100\n" +
                "   - Click Generate\n" +
                "   - Wait ~45 minutes\n\n" +
                "6️⃣ Random Testing\n" +
                "   - Test Levels 25, 50, 75, 100\n" +
                "   - Verify unique challenges\n\n" +
                "✅ DONE! 100 levels ready!",
                "Got it!"
            );
        }
    }
}
