using UnityEngine;
using UnityEngine.SceneManagement;
using CodeBound.Models;
using CodeBound.Services;
using CodeBound.Managers;

namespace CodeBound.Controllers
{
    /// <summary>
    /// Controls individual level gameplay, win/lose conditions, and progression
    /// </summary>
    public class LevelController : MonoBehaviour
    {
        [Header("Level Configuration")]
        [SerializeField] private int levelNumber;
        [SerializeField] private LevelData levelData;
        
        [Header("UI References")]
        [SerializeField] private GameObject levelCompletePanel;
        [SerializeField] private GameObject levelFailedPanel;
        [SerializeField] private GameObject pausePanel;
        [SerializeField] private GameObject hudPanel;
        
        [Header("Services")]
        private IProgressService progressService;
        private IGameSessionService sessionService;
        
        private float levelStartTime;
        private int tokensCollected;
        private bool levelCompleted;
        private string sessionId;
        
        private void Start()
        {
            InitializeLevel();
        }
        
        private async void InitializeLevel()
        {
            // Get services
            progressService = ServiceLocator.GetService<IProgressService>();
            sessionService = ServiceLocator.GetService<IGameSessionService>();
            
            // Start session tracking
            if (sessionService != null)
            {
                sessionId = await sessionService.StartSession(levelNumber);
            }
            
            levelStartTime = Time.time;
            tokensCollected = 0;
            levelCompleted = false;
            
            // Show HUD, hide other panels
            if (hudPanel != null) hudPanel.SetActive(true);
            if (levelCompletePanel != null) levelCompletePanel.SetActive(false);
            if (levelFailedPanel != null) levelFailedPanel.SetActive(false);
            if (pausePanel != null) pausePanel.SetActive(false);
            
            Debug.Log($"Level {levelNumber} initialized");
        }
        
        /// <summary>
        /// Call this when level objectives are completed
        /// </summary>
        public async void OnLevelComplete()
        {
            if (levelCompleted) return;
            
            levelCompleted = true;
            float completionTime = Time.time - levelStartTime;
            
            Debug.Log($"Level {levelNumber} completed! Time: {completionTime:F2}s, Tokens: {tokensCollected}");
            
            // Calculate score/stars
            int stars = CalculateStars(completionTime);
            
            // Update backend progress
            if (progressService != null)
            {
                try
                {
                    await progressService.UpdateLevelProgress(levelNumber, stars, tokensCollected, completionTime);
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"Failed to update progress: {ex.Message}");
                }
            }
            
            // End session
            if (sessionService != null && !string.IsNullOrEmpty(sessionId))
            {
                try
                {
                    await sessionService.EndSession(sessionId, (int)completionTime, tokensCollected, true);
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"Failed to end session: {ex.Message}");
                }
            }
            
            // Show completion UI
            ShowLevelComplete(stars);
        }
        
        /// <summary>
        /// Call this when player fails the level
        /// </summary>
        public async void OnLevelFailed()
        {
            if (levelCompleted) return;
            
            levelCompleted = true;
            float playTime = Time.time - levelStartTime;
            
            Debug.Log($"Level {levelNumber} failed after {playTime:F2}s");
            
            // End session as failed
            if (sessionService != null && !string.IsNullOrEmpty(sessionId))
            {
                try
                {
                    await sessionService.EndSession(sessionId, (int)playTime, tokensCollected, false);
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"Failed to end session: {ex.Message}");
                }
            }
            
            // Show failed UI
            ShowLevelFailed();
        }
        
        public void OnTokenCollected(int amount = 1)
        {
            tokensCollected += amount;
            Debug.Log($"Tokens collected: {tokensCollected}");
            // TODO: Update HUD
        }
        
        private int CalculateStars(float completionTime)
        {
            if (levelData == null) return 1;
            
            // Award stars based on completion time
            if (completionTime <= levelData.ThreeStarTime) return 3;
            if (completionTime <= levelData.TwoStarTime) return 2;
            return 1;
        }
        
        private void ShowLevelComplete(int stars)
        {
            if (levelCompletePanel != null)
            {
                levelCompletePanel.SetActive(true);
                // TODO: Display stars, tokens, time
            }
            
            if (hudPanel != null) hudPanel.SetActive(false);
        }
        
        private void ShowLevelFailed()
        {
            if (levelFailedPanel != null)
            {
                levelFailedPanel.SetActive(true);
            }
            
            if (hudPanel != null) hudPanel.SetActive(false);
        }
        
        #region Button Handlers
        
        public void OnPauseButtonClicked()
        {
            Time.timeScale = 0f;
            if (pausePanel != null) pausePanel.SetActive(true);
            Debug.Log("Game paused");
        }
        
        public void OnResumeButtonClicked()
        {
            Time.timeScale = 1f;
            if (pausePanel != null) pausePanel.SetActive(false);
            Debug.Log("Game resumed");
        }
        
        public void OnRestartButtonClicked()
        {
            Time.timeScale = 1f;
            Debug.Log("Restarting level");
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
        }
        
        public void OnNextLevelButtonClicked()
        {
            Time.timeScale = 1f;
            int nextLevel = levelNumber + 1;
            
            if (nextLevel <= 100)
            {
                Debug.Log($"Loading Level_{nextLevel}");
                SceneManager.LoadScene($"Level_{nextLevel}");
            }
            else
            {
                Debug.Log("All levels completed! Returning to menu");
                SceneManager.LoadScene("MainMenu");
            }
        }
        
        public void OnBackToMenuButtonClicked()
        {
            Time.timeScale = 1f;
            Debug.Log("Returning to Level Select");
            SceneManager.LoadScene("LevelSelect");
        }
        
        #endregion
        
        private void OnDestroy()
        {
            // Ensure timescale is reset
            Time.timeScale = 1f;
        }
    }
}
