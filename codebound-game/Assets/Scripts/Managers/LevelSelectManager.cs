using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.Linq;

/// <summary>
/// Manages the visual "Tree Map" level selection screen.
/// Inspired by Fireboy & Watergirl level selection.
/// Handles node generation, path drawing, and scroll management for 100 levels.
/// </summary>
public class LevelSelectManager : MonoBehaviour
{
    [Header("Map Configuration")]
    [SerializeField] private GameObject levelNodePrefab; // Prefab with button, text, stars
    [SerializeField] private GameObject pathLinePrefab;  // Prefab for connecting lines
    [SerializeField] private Transform mapContainer;     // Scroll View Content parent
    [SerializeField] private float verticalSpacing = 150f;
    [SerializeField] private float horizontalSpacing = 200f;
    [SerializeField] private ScrollRect scrollRect;

    // Visual Settings
    [Header("Visuals")]
    [SerializeField] private Color lockedColor = Color.gray;
    [SerializeField] private Color unlockedColor = Color.white;
    [SerializeField] private Color completedColor = Color.yellow;
    [SerializeField] private Color pathLockedColor = new Color(0.5f, 0.5f, 0.5f, 0.5f);
    [SerializeField] private Color pathUnlockedColor = Color.yellow;

    private void Start()
    {
        // Wait for LevelManager to be ready
        if (LevelManager.Instance != null)
        {
            GenerateMap();
        }
        else
        {
            Debug.LogError("LevelManager not found!");
        }
    }

    /// <summary>
    /// Generates the visual node map based on LevelManager data.
    /// Layout: 
    /// - Levels are placed in a semi-random "Tree" structure or a structured Grid.
    /// - For this implementation, we use a winding path going up/right.
    /// </summary>
    public void GenerateMap()
    {
        // Clear existing map
        foreach (Transform child in mapContainer)
        {
            Destroy(child.gameObject);
        }

        List<LevelData> allLevels = LevelManager.Instance.GetAllLevels();
        Dictionary<int, RectTransform> nodePositions = new Dictionary<int, RectTransform>();

        // Generate Nodes
        foreach (var level in allLevels)
        {
            GameObject nodeObj = Instantiate(levelNodePrefab, mapContainer);
            RectTransform rect = nodeObj.GetComponent<RectTransform>();
            
            // Calculate Position (Winding path logic for "Tree" look)
            // This is a simple algorithm to spread 100 levels out visuals
            Vector2 position = CalculateNodePosition(level.levelNumber);
            rect.anchoredPosition = position;
            
            nodePositions[level.levelNumber] = rect;

            // Setup Node Data
            // Note: StartLevel would need to be a public method on LevelSelectNode component
            // nodeObj.GetComponent<LevelSelectNode>().Setup(level); 
            
            // Temporary quick setup until Node component exists
            SetupNodeVisuals(nodeObj, level);
        }

        // Generate Paths (Lines between nodes)
        foreach (var level in allLevels)
        {
            // If level requires a previous level, draw a line
            if (level.requiredLevel > 0 && nodePositions.ContainsKey(level.requiredLevel))
            {
                DrawPath(nodePositions[level.requiredLevel], nodePositions[level.levelNumber], level.isLocked);
            }
        }
        
        // Auto-scroll to current latest unlocked level
        // TODO: Implement FocusOnLevel(LevelManager.Instance.CurrentLevelNumber);
    }

    private void SetupNodeVisuals(GameObject nodeObj, LevelData level)
    {
        // Placeholder for actual UI component setup
        var button = nodeObj.GetComponent<Button>();
        if (button)
        {
            button.interactable = !level.isLocked;
            button.onClick.AddListener(() => LevelManager.Instance.LoadLevel(level.levelNumber));
        }

        var image = nodeObj.GetComponent<Image>();
        if (image)
        {
            if (level.isLocked) image.color = lockedColor;
            else if (level.totalCompletions > 0) image.color = completedColor;
            else image.color = unlockedColor;
        }
        
        // Find text component for number
        var text = nodeObj.GetComponentInChildren<TMPro.TextMeshProUGUI>();
        if (text) text.text = level.levelNumber.ToString();
    }

    private void DrawPath(RectTransform start, RectTransform end, bool isTargetLocked)
    {
        GameObject lineObj = Instantiate(pathLinePrefab, mapContainer);
        lineObj.transform.SetAsFirstSibling(); // Put lines behind nodes
        
        RectTransform lineRect = lineObj.GetComponent<RectTransform>();
        Image lineImage = lineObj.GetComponent<Image>();
        
        // Math to connect two points with a rotated rectangle
        Vector2 dir = (end.anchoredPosition - start.anchoredPosition).normalized;
        float distance = Vector2.Distance(start.anchoredPosition, end.anchoredPosition);
        
        lineRect.sizeDelta = new Vector2(distance, 5f); // 5px thickness
        lineRect.anchoredPosition = start.anchoredPosition + dir * distance * 0.5f;
        
        float angle = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;
        lineRect.localRotation = Quaternion.Euler(0, 0, angle);
        
        // Color based on lock state
        lineImage.color = isTargetLocked ? pathLockedColor : pathUnlockedColor;
    }

    /// <summary>
    /// Calculates a position creating a "Tree" or "Cave Map" feel.
    /// Winding S-shape going upwards.
    /// </summary>
    private Vector2 CalculateNodePosition(int levelNum)
    {
        int rowLength = 5;
        int row = (levelNum - 1) / rowLength;
        int col = (levelNum - 1) % rowLength;

        // Zig-Zag pattern
        if (row % 2 == 1) col = rowLength - 1 - col;

        float x = col * horizontalSpacing + (row % 2 * 50f); // Minimal offset
        float y = row * verticalSpacing;
        
        // Add some "organic" randomness for the tree look
        // In a real implementation, positions might be hand-set or loaded from a config
        float randomOffset = (levelNum * 123.45f) % 30f; 
        
        return new Vector2(x + randomOffset, y);
    }
}
