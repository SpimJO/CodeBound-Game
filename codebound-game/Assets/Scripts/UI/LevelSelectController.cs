using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Collections.Generic;
using CodeBound.Models;
using CodeBound.Services;

namespace CodeBound.UI
{
    /// <summary>
    /// Controls the Level Select scene with level grid and progression
    /// </summary>
    public class LevelSelectController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject levelButtonPrefab;
        [SerializeField] private Transform levelGridContainer;
        [SerializeField] private GameObject levelInfoPanel;
        [SerializeField] private Text levelNameText;
        [SerializeField] private Text levelDescriptionText;
        [SerializeField] private Text bestScoreText;
        
        [Header("Services")]
        private IProgressService progressService;
        
        private List<GameObject> levelButtons = new List<GameObject>();
        private int selectedLevel = -1;
        
        private void Start()
        {
            InitializeLevelSelect();
        }
        
        private void InitializeLevelSelect()
        {
            // Get services from ServiceLocator
            progressService = ServiceLocator.GetService<IProgressService>();
            
            GenerateLevelButtons();
            LoadUserProgress();
            
            Debug.Log("Level Select initialized");
        }
        
        private void GenerateLevelButtons()
        {
            if (levelGridContainer == null || levelButtonPrefab == null)
            {
                Debug.LogWarning("Level grid container or button prefab not assigned!");
                return;
            }
            
            // Generate 100 level buttons
            for (int i = 1; i <= 100; i++)
            {
                GameObject buttonObj = Instantiate(levelButtonPrefab, levelGridContainer);
                buttonObj.name = $"LevelButton_{i}";
                
                // Set button text
                Text buttonText = buttonObj.GetComponentInChildren<Text>();
                if (buttonText != null)
                {
                    buttonText.text = i.ToString();
                }
                
                // Add click listener
                int levelNumber = i; // Capture for lambda
                Button button = buttonObj.GetComponent<Button>();
                if (button != null)
                {
                    button.onClick.AddListener(() => OnLevelButtonClicked(levelNumber));
                }
                
                levelButtons.Add(buttonObj);
            }
        }
        
        private async void LoadUserProgress()
        {
            if (progressService == null)
            {
                Debug.LogWarning("Progress service not available");
                return;
            }
            
            try
            {
                var progress = await progressService.GetUserProgress();
                
                if (progress != null)
                {
                    UpdateLevelButtonStates(progress.HighestLevel);
                }
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to load user progress: {ex.Message}");
            }
        }
        
        private void UpdateLevelButtonStates(int highestUnlockedLevel)
        {
            for (int i = 0; i < levelButtons.Count; i++)
            {
                int levelNumber = i + 1;
                Button button = levelButtons[i].GetComponent<Button>();
                
                if (button != null)
                {
                    // Lock levels beyond highest unlocked
                    button.interactable = levelNumber <= highestUnlockedLevel;
                    
                    // Visual feedback for locked levels
                    Image buttonImage = button.GetComponent<Image>();
                    if (buttonImage != null)
                    {
                        buttonImage.color = button.interactable ? Color.white : Color.gray;
                    }
                }
            }
        }
        
        private void OnLevelButtonClicked(int levelNumber)
        {
            selectedLevel = levelNumber;
            Debug.Log($"Level {levelNumber} selected");
            
            ShowLevelInfo(levelNumber);
        }
        
        private void ShowLevelInfo(int levelNumber)
        {
            if (levelInfoPanel != null)
            {
                levelInfoPanel.SetActive(true);
                
                if (levelNameText != null)
                    levelNameText.text = $"Level {levelNumber}";
                
                if (levelDescriptionText != null)
                    levelDescriptionText.text = GetLevelDescription(levelNumber);
                
                // TODO: Load and display best score from backend
                if (bestScoreText != null)
                    bestScoreText.text = "Best: ---";
            }
        }
        
        private string GetLevelDescription(int levelNumber)
        {
            // TODO: Load from level data ScriptableObject
            return $"Complete Level {levelNumber} to progress!";
        }
        
        #region Button Handlers
        
        public void OnPlaySelectedLevel()
        {
            if (selectedLevel > 0)
            {
                Debug.Log($"Loading Level_{selectedLevel}");
                SceneManager.LoadScene($"Level_{selectedLevel}");
            }
            else
            {
                Debug.LogWarning("No level selected!");
            }
        }
        
        public void OnBackButtonClicked()
        {
            Debug.Log("Returning to Main Menu");
            SceneManager.LoadScene("MainMenu");
        }
        
        public void OnCloseLevelInfo()
        {
            if (levelInfoPanel != null)
            {
                levelInfoPanel.SetActive(false);
            }
            selectedLevel = -1;
        }
        
        #endregion
    }
}
