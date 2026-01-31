using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;

/// <summary>
/// Main Menu Controller - Handles navigation from the main menu
/// Manages Play, Character Select, Settings, and Quit buttons
/// </summary>
public class MainMenuController : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private Button playButton;
    [SerializeField] private Button characterSelectButton;
    [SerializeField] private Button settingsButton;
    [SerializeField] private Button quitButton;
    [SerializeField] private Button loginButton;
    [SerializeField] private Button registerButton;

    [Header("Panels")]
    [SerializeField] private GameObject mainMenuPanel;
    [SerializeField] private GameObject loginPanel;
    [SerializeField] private GameObject loadingPanel;
    [SerializeField] private TextMeshProUGUI loadingText;

    [Header("Login Fields")]
    [SerializeField] private TMP_InputField usernameInput;
    [SerializeField] private TMP_InputField passwordInput;
    [SerializeField] private TextMeshProUGUI errorText;

    [Header("User Info Display")]
    [SerializeField] private TextMeshProUGUI welcomeText;
    [SerializeField] private TextMeshProUGUI tokenCountText;

    private bool isLoggedIn = false;

    private void Start()
    {
        InitializeMenu();
        CheckLoginStatus();
    }

    private void InitializeMenu()
    {
        // Setup button listeners
        if (playButton) playButton.onClick.AddListener(OnPlayClicked);
        if (characterSelectButton) characterSelectButton.onClick.AddListener(OnCharacterSelectClicked);
        if (settingsButton) settingsButton.onClick.AddListener(OnSettingsClicked);
        if (quitButton) quitButton.onClick.AddListener(OnQuitClicked);
        if (loginButton) loginButton.onClick.AddListener(OnLoginClicked);
        if (registerButton) registerButton.onClick.AddListener(OnRegisterClicked);

        // Hide loading panel
        if (loadingPanel) loadingPanel.SetActive(false);
        if (errorText) errorText.text = "";
    }

    private void CheckLoginStatus()
    {
        // Check if user has saved token
        string savedToken = PlayerPrefs.GetString("AuthToken", "");
        
        if (!string.IsNullOrEmpty(savedToken))
        {
            isLoggedIn = true;
            ShowMainMenu();
            LoadUserInfo();
        }
        else
        {
            ShowLoginPanel();
        }
    }

    private async void LoadUserInfo()
    {
        if (SaveManager.Instance != null)
        {
            PlayerData player = SaveManager.Instance.CurrentSave;
            if (player != null)
            {
                if (welcomeText) welcomeText.text = $"Welcome, {player.username}!";
                if (tokenCountText) tokenCountText.text = $"Tokens: {player.totalTokens}";
            }
            else
            {
                // Try to load from backend via GameManager's AuthService
                if (GameManager.Instance?.AuthService != null)
                {
                    var sessionResult = await GameManager.Instance.AuthService.GetSessionData();
                    if (sessionResult.success && sessionResult.userData != null)
                    {
                        player = sessionResult.userData;
                        if (welcomeText) welcomeText.text = $"Welcome, {player.username}!";
                        if (tokenCountText) tokenCountText.text = $"Tokens: {player.totalTokens}";
                    }
                }
            }
        }
    }

    private void ShowMainMenu()
    {
        if (mainMenuPanel) mainMenuPanel.SetActive(true);
        if (loginPanel) loginPanel.SetActive(false);
    }

    private void ShowLoginPanel()
    {
        if (mainMenuPanel) mainMenuPanel.SetActive(false);
        if (loginPanel) loginPanel.SetActive(true);
    }

    // ============================================================
    // BUTTON HANDLERS
    // ============================================================

    private void OnPlayClicked()
    {
        if (!isLoggedIn)
        {
            ShowError("Please log in first!");
            return;
        }

        Debug.Log("Loading Level Select...");
        LoadSceneAsync("LevelSelect");
    }

    private void OnCharacterSelectClicked()
    {
        if (!isLoggedIn)
        {
            ShowError("Please log in first!");
            return;
        }

        Debug.Log("Loading Character Select...");
        LoadSceneAsync("CharacterSelect");
    }

    private void OnSettingsClicked()
    {
        Debug.Log("Opening Settings...");
        // TODO: Show settings panel (can be a popup instead of scene change)
        // For now, could open a settings scene
        // LoadSceneAsync("Settings");
        
        // Or show settings panel overlay
        if (SettingsManager.Instance != null)
        {
            SettingsManager.Instance.ShowSettingsPanel();
        }
    }

    private void OnQuitClicked()
    {
        Debug.Log("Quitting game...");
        
        #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
        #else
            Application.Quit();
        #endif
    }

    private async void OnLoginClicked()
    {
        string username = usernameInput?.text ?? "";
        string password = passwordInput?.text ?? "";

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            ShowError("Please enter username and password");
            return;
        }

        ShowLoading("Logging in...");

        if (GameManager.Instance?.AuthService != null)
        {
            var result = await GameManager.Instance.AuthService.Login(username, password);
            
            HideLoading();

            if (result.success)
            {
                isLoggedIn = true;
                PlayerPrefs.SetString("AuthToken", result.token);
                PlayerPrefs.Save();
                ShowMainMenu();
                LoadUserInfo();
            }
            else
            {
                ShowError(result.message ?? "Login failed. Please check your credentials.");
            }
        }
        else
        {
            HideLoading();
            ShowError("AuthService not available!");
        }
    }

    private void OnRegisterClicked()
    {
        Debug.Log("Opening Registration...");
        // TODO: Navigate to registration scene or show registration panel
        LoadSceneAsync("Register");
    }

    // ============================================================
    // UI HELPERS
    // ============================================================

    private void ShowLoading(string message)
    {
        if (loadingPanel) loadingPanel.SetActive(true);
        if (loadingText) loadingText.text = message;
    }

    private void HideLoading()
    {
        if (loadingPanel) loadingPanel.SetActive(false);
    }

    private void ShowError(string message)
    {
        if (errorText)
        {
            errorText.text = message;
            errorText.color = Color.red;
        }
        Debug.LogError($"MainMenu Error: {message}");
    }

    private async void LoadSceneAsync(string sceneName)
    {
        ShowLoading($"Loading {sceneName}...");

        await Task.Delay(500); // Small delay for visual feedback

        try
        {
            AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName);
            
            while (!operation.isDone)
            {
                // Update loading bar if you have one
                float progress = Mathf.Clamp01(operation.progress / 0.9f);
                // if (loadingSlider) loadingSlider.value = progress;
                await Task.Yield();
            }
        }
        catch (System.Exception e)
        {
            HideLoading();
            ShowError($"Failed to load scene: {e.Message}");
        }
    }

    private void OnDestroy()
    {
        // Clean up listeners
        if (playButton) playButton.onClick.RemoveAllListeners();
        if (characterSelectButton) characterSelectButton.onClick.RemoveAllListeners();
        if (settingsButton) settingsButton.onClick.RemoveAllListeners();
        if (quitButton) quitButton.onClick.RemoveAllListeners();
        if (loginButton) loginButton.onClick.RemoveAllListeners();
        if (registerButton) registerButton.onClick.RemoveAllListeners();
    }
}
