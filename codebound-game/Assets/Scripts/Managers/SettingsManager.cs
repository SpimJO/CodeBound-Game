using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Settings Manager - Handles game settings (audio, graphics, controls)
/// Singleton pattern for global access
/// </summary>
public class SettingsManager : MonoBehaviour
{
    private static SettingsManager _instance;
    public static SettingsManager Instance => _instance;

    [Header("Settings Panel")]
    [SerializeField] private GameObject settingsPanel;
    [SerializeField] private Button closeButton;

    [Header("Audio Settings")]
    [SerializeField] private Slider masterVolumeSlider;
    [SerializeField] private Slider musicVolumeSlider;
    [SerializeField] private Slider sfxVolumeSlider;
    [SerializeField] private Toggle muteToggle;

    [Header("Graphics Settings")]
    [SerializeField] private TMP_Dropdown qualityDropdown;
    [SerializeField] private Toggle fullscreenToggle;
    [SerializeField] private TMP_Dropdown resolutionDropdown;

    [Header("Gameplay Settings")]
    [SerializeField] private Slider brightnessSlider;
    [SerializeField] private Toggle hintsToggle;
    [SerializeField] private Toggle autosaveToggle;

    // Settings Values
    private float masterVolume = 1.0f;
    private float musicVolume = 0.8f;
    private float sfxVolume = 1.0f;
    private bool isMuted = false;
    private int qualityLevel = 2;
    private bool isFullscreen = true;
    private float brightness = 1.0f;
    private bool hintsEnabled = true;
    private bool autosaveEnabled = true;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);

        LoadSettings();
        InitializeUI();
    }

    private void Start()
    {
        if (settingsPanel) settingsPanel.SetActive(false);
    }

    private void InitializeUI()
    {
        // Audio
        if (masterVolumeSlider)
        {
            masterVolumeSlider.value = masterVolume;
            masterVolumeSlider.onValueChanged.AddListener(SetMasterVolume);
        }
        if (musicVolumeSlider)
        {
            musicVolumeSlider.value = musicVolume;
            musicVolumeSlider.onValueChanged.AddListener(SetMusicVolume);
        }
        if (sfxVolumeSlider)
        {
            sfxVolumeSlider.value = sfxVolume;
            sfxVolumeSlider.onValueChanged.AddListener(SetSFXVolume);
        }
        if (muteToggle)
        {
            muteToggle.isOn = isMuted;
            muteToggle.onValueChanged.AddListener(SetMute);
        }

        // Graphics
        if (qualityDropdown)
        {
            qualityDropdown.value = qualityLevel;
            qualityDropdown.onValueChanged.AddListener(SetQuality);
        }
        if (fullscreenToggle)
        {
            fullscreenToggle.isOn = isFullscreen;
            fullscreenToggle.onValueChanged.AddListener(SetFullscreen);
        }

        // Gameplay
        if (brightnessSlider)
        {
            brightnessSlider.value = brightness;
            brightnessSlider.onValueChanged.AddListener(SetBrightness);
        }
        if (hintsToggle)
        {
            hintsToggle.isOn = hintsEnabled;
            hintsToggle.onValueChanged.AddListener(SetHints);
        }
        if (autosaveToggle)
        {
            autosaveToggle.isOn = autosaveEnabled;
            autosaveToggle.onValueChanged.AddListener(SetAutosave);
        }

        // Close button
        if (closeButton) closeButton.onClick.AddListener(HideSettingsPanel);
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    public void ShowSettingsPanel()
    {
        if (settingsPanel) settingsPanel.SetActive(true);
    }

    public void HideSettingsPanel()
    {
        if (settingsPanel) settingsPanel.SetActive(false);
        SaveSettings();
    }

    // ============================================================
    // AUDIO SETTINGS
    // ============================================================

    public void SetMasterVolume(float volume)
    {
        masterVolume = volume;
        AudioListener.volume = isMuted ? 0 : masterVolume;
    }

    public void SetMusicVolume(float volume)
    {
        musicVolume = volume;
        // TODO: Apply to music audio source
        // if (MusicManager.Instance) MusicManager.Instance.SetVolume(musicVolume);
    }

    public void SetSFXVolume(float volume)
    {
        sfxVolume = volume;
        // TODO: Apply to SFX audio sources
    }

    public void SetMute(bool mute)
    {
        isMuted = mute;
        AudioListener.volume = isMuted ? 0 : masterVolume;
    }

    // ============================================================
    // GRAPHICS SETTINGS
    // ============================================================

    public void SetQuality(int level)
    {
        qualityLevel = level;
        QualitySettings.SetQualityLevel(qualityLevel);
        Debug.Log($"Quality set to: {QualitySettings.names[qualityLevel]}");
    }

    public void SetFullscreen(bool fullscreen)
    {
        isFullscreen = fullscreen;
        Screen.fullScreen = isFullscreen;
    }

    public void SetResolution(int index)
    {
        // Resolution handling
        Resolution[] resolutions = Screen.resolutions;
        if (index >= 0 && index < resolutions.Length)
        {
            Resolution res = resolutions[index];
            Screen.SetResolution(res.width, res.height, isFullscreen);
        }
    }

    // ============================================================
    // GAMEPLAY SETTINGS
    // ============================================================

    public void SetBrightness(float value)
    {
        brightness = value;
        // TODO: Apply brightness to camera or post-processing
        // Camera.main.GetComponent<PostProcessing>()?.SetBrightness(brightness);
    }

    public void SetHints(bool enabled)
    {
        hintsEnabled = enabled;
    }

    public void SetAutosave(bool enabled)
    {
        autosaveEnabled = enabled;
    }

    // ============================================================
    // GETTERS
    // ============================================================

    public float MasterVolume => masterVolume;
    public float MusicVolume => musicVolume;
    public float SFXVolume => sfxVolume;
    public bool IsMuted => isMuted;
    public int QualityLevel => qualityLevel;
    public bool IsFullscreen => isFullscreen;
    public float Brightness => brightness;
    public bool HintsEnabled => hintsEnabled;
    public bool AutosaveEnabled => autosaveEnabled;

    // ============================================================
    // SAVE/LOAD SETTINGS
    // ============================================================

    private void SaveSettings()
    {
        PlayerPrefs.SetFloat("MasterVolume", masterVolume);
        PlayerPrefs.SetFloat("MusicVolume", musicVolume);
        PlayerPrefs.SetFloat("SFXVolume", sfxVolume);
        PlayerPrefs.SetInt("Muted", isMuted ? 1 : 0);
        PlayerPrefs.SetInt("QualityLevel", qualityLevel);
        PlayerPrefs.SetInt("Fullscreen", isFullscreen ? 1 : 0);
        PlayerPrefs.SetFloat("Brightness", brightness);
        PlayerPrefs.SetInt("HintsEnabled", hintsEnabled ? 1 : 0);
        PlayerPrefs.SetInt("AutosaveEnabled", autosaveEnabled ? 1 : 0);
        PlayerPrefs.Save();

        Debug.Log("Settings saved!");
    }

    private void LoadSettings()
    {
        masterVolume = PlayerPrefs.GetFloat("MasterVolume", 1.0f);
        musicVolume = PlayerPrefs.GetFloat("MusicVolume", 0.8f);
        sfxVolume = PlayerPrefs.GetFloat("SFXVolume", 1.0f);
        isMuted = PlayerPrefs.GetInt("Muted", 0) == 1;
        qualityLevel = PlayerPrefs.GetInt("QualityLevel", 2);
        isFullscreen = PlayerPrefs.GetInt("Fullscreen", 1) == 1;
        brightness = PlayerPrefs.GetFloat("Brightness", 1.0f);
        hintsEnabled = PlayerPrefs.GetInt("HintsEnabled", 1) == 1;
        autosaveEnabled = PlayerPrefs.GetInt("AutosaveEnabled", 1) == 1;

        // Apply loaded settings
        AudioListener.volume = isMuted ? 0 : masterVolume;
        QualitySettings.SetQualityLevel(qualityLevel);
        Screen.fullScreen = isFullscreen;

        Debug.Log("Settings loaded!");
    }

    public void ResetToDefaults()
    {
        masterVolume = 1.0f;
        musicVolume = 0.8f;
        sfxVolume = 1.0f;
        isMuted = false;
        qualityLevel = 2;
        isFullscreen = true;
        brightness = 1.0f;
        hintsEnabled = true;
        autosaveEnabled = true;

        // Update UI
        if (masterVolumeSlider) masterVolumeSlider.value = masterVolume;
        if (musicVolumeSlider) musicVolumeSlider.value = musicVolume;
        if (sfxVolumeSlider) sfxVolumeSlider.value = sfxVolume;
        if (muteToggle) muteToggle.isOn = isMuted;
        if (qualityDropdown) qualityDropdown.value = qualityLevel;
        if (fullscreenToggle) fullscreenToggle.isOn = isFullscreen;
        if (brightnessSlider) brightnessSlider.value = brightness;
        if (hintsToggle) hintsToggle.isOn = hintsEnabled;
        if (autosaveToggle) autosaveToggle.isOn = autosaveEnabled;

        SaveSettings();
    }
}
