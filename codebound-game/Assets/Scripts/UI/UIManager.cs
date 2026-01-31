using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

/// <summary>
/// UI Manager - Global UI utilities and helpers
/// Handles common UI operations like notifications, loading screens, popups
/// </summary>
public class UIManager : MonoBehaviour
{
    private static UIManager _instance;
    public static UIManager Instance => _instance;

    [Header("Global UI Elements")]
    [SerializeField] private Canvas mainCanvas;
    [SerializeField] private GameObject notificationPanel;
    [SerializeField] private TextMeshProUGUI notificationText;
    [SerializeField] private GameObject confirmDialogPanel;
    [SerializeField] private TextMeshProUGUI confirmDialogText;
    [SerializeField] private Button confirmYesButton;
    [SerializeField] private Button confirmNoButton;

    [Header("Loading Screen")]
    [SerializeField] private GameObject loadingOverlay;
    [SerializeField] private TextMeshProUGUI loadingText;
    [SerializeField] private Slider loadingProgressBar;

    [Header("Notification Settings")]
    [SerializeField] private float notificationDuration = 3f;
    [SerializeField] private Color successColor = Color.green;
    [SerializeField] private Color errorColor = Color.red;
    [SerializeField] private Color infoColor = Color.cyan;

    private System.Action confirmCallback;
    private System.Action cancelCallback;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);

        InitializeUI();
    }

    private void InitializeUI()
    {
        if (notificationPanel) notificationPanel.SetActive(false);
        if (confirmDialogPanel) confirmDialogPanel.SetActive(false);
        if (loadingOverlay) loadingOverlay.SetActive(false);

        if (confirmYesButton) confirmYesButton.onClick.AddListener(OnConfirmYes);
        if (confirmNoButton) confirmNoButton.onClick.AddListener(OnConfirmNo);
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    public void ShowNotification(string message, NotificationType type = NotificationType.Info)
    {
        if (notificationPanel == null || notificationText == null) return;

        notificationText.text = message;
        
        switch (type)
        {
            case NotificationType.Success:
                notificationText.color = successColor;
                break;
            case NotificationType.Error:
                notificationText.color = errorColor;
                break;
            case NotificationType.Info:
            default:
                notificationText.color = infoColor;
                break;
        }

        notificationPanel.SetActive(true);
        StartCoroutine(HideNotificationAfterDelay());
    }

    private IEnumerator HideNotificationAfterDelay()
    {
        yield return new WaitForSeconds(notificationDuration);
        if (notificationPanel) notificationPanel.SetActive(false);
    }

    // ============================================================
    // CONFIRM DIALOG
    // ============================================================

    public void ShowConfirmDialog(string message, System.Action onConfirm, System.Action onCancel = null)
    {
        if (confirmDialogPanel == null || confirmDialogText == null) return;

        confirmDialogText.text = message;
        confirmDialogPanel.SetActive(true);

        confirmCallback = onConfirm;
        cancelCallback = onCancel;
    }

    private void OnConfirmYes()
    {
        confirmDialogPanel.SetActive(false);
        confirmCallback?.Invoke();
        confirmCallback = null;
        cancelCallback = null;
    }

    private void OnConfirmNo()
    {
        confirmDialogPanel.SetActive(false);
        cancelCallback?.Invoke();
        confirmCallback = null;
        cancelCallback = null;
    }

    // ============================================================
    // LOADING SCREEN
    // ============================================================

    public void ShowLoading(string message = "Loading...")
    {
        if (loadingOverlay == null) return;

        if (loadingText) loadingText.text = message;
        if (loadingProgressBar) loadingProgressBar.value = 0;
        loadingOverlay.SetActive(true);
    }

    public void UpdateLoadingProgress(float progress, string message = null)
    {
        if (loadingProgressBar) loadingProgressBar.value = progress;
        if (!string.IsNullOrEmpty(message) && loadingText) loadingText.text = message;
    }

    public void HideLoading()
    {
        if (loadingOverlay) loadingOverlay.SetActive(false);
    }

    // ============================================================
    // UTILITY METHODS
    // ============================================================

    public void ShowSuccess(string message)
    {
        ShowNotification(message, NotificationType.Success);
    }

    public void ShowError(string message)
    {
        ShowNotification(message, NotificationType.Error);
        Debug.LogError($"UI Error: {message}");
    }

    public void ShowInfo(string message)
    {
        ShowNotification(message, NotificationType.Info);
    }

    // ============================================================
    // BUTTON HELPERS
    // ============================================================

    public void DisableButton(Button button, float duration)
    {
        if (button == null) return;
        button.interactable = false;
        StartCoroutine(EnableButtonAfterDelay(button, duration));
    }

    private IEnumerator EnableButtonAfterDelay(Button button, float delay)
    {
        yield return new WaitForSeconds(delay);
        if (button != null) button.interactable = true;
    }

    // ============================================================
    // SCREEN FADE (Optional)
    // ============================================================

    public IEnumerator FadeOut(float duration = 1f)
    {
        CanvasGroup canvasGroup = mainCanvas?.GetComponent<CanvasGroup>();
        if (canvasGroup == null) yield break;

        float elapsedTime = 0f;
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            canvasGroup.alpha = Mathf.Lerp(1f, 0f, elapsedTime / duration);
            yield return null;
        }
        canvasGroup.alpha = 0f;
    }

    public IEnumerator FadeIn(float duration = 1f)
    {
        CanvasGroup canvasGroup = mainCanvas?.GetComponent<CanvasGroup>();
        if (canvasGroup == null) yield break;

        float elapsedTime = 0f;
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            canvasGroup.alpha = Mathf.Lerp(0f, 1f, elapsedTime / duration);
            yield return null;
        }
        canvasGroup.alpha = 1f;
    }
}

public enum NotificationType
{
    Success,
    Error,
    Info
}
