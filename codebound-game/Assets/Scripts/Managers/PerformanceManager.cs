using UnityEngine;
using UnityEngine.Rendering;

/// <summary>
/// Performance optimization manager
/// Handles quality settings for optimal 60fps
/// </summary>
public class PerformanceManager : MonoBehaviour
{
    private static PerformanceManager _instance;
    public static PerformanceManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject go = new GameObject("PerformanceManager");
                _instance = go.AddComponent<PerformanceManager>();
                DontDestroyOnLoad(go);
            }
            return _instance;
        }
    }
    
    [Header("FPS Settings")]
    [SerializeField] private int targetFrameRate = 60;
    [SerializeField] private bool enableVSync = true;
    
    [Header("Quality Settings")]
    [SerializeField] private bool optimizeFor2D = true;
    [SerializeField] private bool disableShadows = true;
    
    [Header("Performance Monitoring")]
    [SerializeField] private bool showFPSCounter = false;
    [SerializeField] private float updateInterval = 0.5f;
    
    // FPS tracking
    private float deltaTime = 0f;
    private float fps = 0f;
    private float timer = 0f;
    
    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        _instance = this;
        DontDestroyOnLoad(gameObject);
        
        ApplyOptimalSettings();
    }
    
    private void ApplyOptimalSettings()
    {
        // Set target framerate
        Application.targetFrameRate = targetFrameRate;
        
        // VSync configuration
        QualitySettings.vSyncCount = enableVSync ? 1 : 0;
        
        if (optimizeFor2D)
        {
            // Optimize for 2D platformer
            
            // Disable shadows (not needed for 2D)
            if (disableShadows)
            {
                QualitySettings.shadows = ShadowQuality.Disable;
            }
            
            // Reduce pixel light count (2D uses sprites, not 3D lighting)
            QualitySettings.pixelLightCount = 1;
            
            // Disable realtime reflection probes
            QualitySettings.realtimeReflectionProbes = false;
            
            // Set texture quality to full
            QualitySettings.masterTextureLimit = 0;
            
            // Enable anisotropic filtering for sharp textures
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
            
            // Disable anti-aliasing (pixel art doesn't need it)
            QualitySettings.antiAliasing = 0;
            
            // Optimize physics
            Physics2D.autoSyncTransforms = false; // Manual sync for better performance
            Time.fixedDeltaTime = 1f / 50f; // 50 physics updates per second
        }
        
        Debug.Log($"Performance settings applied: {targetFrameRate}fps, VSync={enableVSync}");
    }
    
    private void Update()
    {
        if (showFPSCounter)
        {
            UpdateFPSCounter();
        }
    }
    
    private void UpdateFPSCounter()
    {
        timer += Time.unscaledDeltaTime;
        deltaTime += (Time.unscaledDeltaTime - deltaTime) * 0.1f;
        
        if (timer >= updateInterval)
        {
            fps = 1f / deltaTime;
            timer = 0f;
        }
    }
    
    private void OnGUI()
    {
        if (showFPSCounter)
        {
            int w = Screen.width, h = Screen.height;
            GUIStyle style = new GUIStyle();
            
            Rect rect = new Rect(10, 10, w, h * 2 / 100);
            style.alignment = TextAnchor.UpperLeft;
            style.fontSize = h * 2 / 50;
            style.normal.textColor = fps >= 55 ? Color.green : (fps >= 30 ? Color.yellow : Color.red);
            
            string text = $"FPS: {Mathf.Ceil(fps)}";
            GUI.Label(rect, text, style);
        }
    }
    
    /// <summary>
    /// Enable/disable FPS counter
    /// </summary>
    public void SetFPSCounterVisible(bool visible)
    {
        showFPSCounter = visible;
    }
    
    /// <summary>
    /// Get current FPS
    /// </summary>
    public float GetCurrentFPS()
    {
        return fps;
    }
    
    /// <summary>
    /// Check if game is running at target framerate
    /// </summary>
    public bool IsRunningAtTargetFPS(float tolerance = 5f)
    {
        return Mathf.Abs(fps - targetFrameRate) <= tolerance;
    }
}
