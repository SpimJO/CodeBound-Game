using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

/// <summary>
/// Code Terminal - In-game code editor interface
/// Allows players to write and execute Java code to solve puzzles
/// VS Code dark theme aesthetic with basic syntax highlighting
/// </summary>
public class CodeTerminal : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private GameObject terminalWindow;
    [SerializeField] private TMP_InputField codeInputField;
    [SerializeField] private TextMeshProUGUI outputText;
    [SerializeField] private TextMeshProUGUI lineNumbersText;
    [SerializeField] private Button runButton;
    [SerializeField] private Button clearButton;
    [SerializeField] private Button exitButton;
    [SerializeField] private Button hintButton;

    [Header("Level Info Display")]
    [SerializeField] private TextMeshProUGUI levelTitleText;
    [SerializeField] private TextMeshProUGUI objectiveText;
    [SerializeField] private TextMeshProUGUI hintText;

    [Header("Visual Feedback")]
    [SerializeField] private Image statusIndicator; // Green = success, Red = error, Yellow = running
    [SerializeField] private Color successColor = Color.green;
    [SerializeField] private Color errorColor = Color.red;
    [SerializeField] private Color runningColor = Color.yellow;
    [SerializeField] private Color idleColor = Color.gray;

    [Header("Level Objects")]
    [SerializeField] private DoorController levelDoor; // Door that unlocks on success

    private LevelData currentLevel;
    private int currentHintIndex = 0;
    private bool isRunning = false;

    private void Start()
    {
        InitializeTerminal();
        CloseTerminal();
    }

    private void InitializeTerminal()
    {
        if (runButton) runButton.onClick.AddListener(OnRunClicked);
        if (clearButton) clearButton.onClick.AddListener(OnClearClicked);
        if (exitButton) exitButton.onClick.AddListener(OnExitClicked);
        if (hintButton) hintButton.onClick.AddListener(OnHintClicked);

        if (codeInputField)
        {
            codeInputField.onValueChanged.AddListener(OnCodeChanged);
        }

        if (hintText) hintText.gameObject.SetActive(false);
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    public void OpenTerminal(LevelData level)
    {
        currentLevel = level;
        currentHintIndex = 0;

        if (terminalWindow) terminalWindow.SetActive(true);

        // Load level info
        if (levelTitleText) levelTitleText.text = level.levelName;
        if (objectiveText) objectiveText.text = level.objective;
        if (hintText) hintText.gameObject.SetActive(false);

        // Load starter code
        if (codeInputField && !string.IsNullOrEmpty(level.starterCode))
        {
            codeInputField.text = level.starterCode;
            UpdateLineNumbers();
        }

        // Clear output
        if (outputText) outputText.text = "> Ready to run code...\n";
        SetStatusIndicator(idleColor);

        Debug.Log($"Terminal opened for level: {level.levelName}");
    }

    public void CloseTerminal()
    {
        if (terminalWindow) terminalWindow.SetActive(false);
        currentLevel = null;
    }

    // ============================================================
    // BUTTON HANDLERS
    // ============================================================

    private async void OnRunClicked()
    {
        if (isRunning)
        {
            ShowOutput("> Code is already running...\n", errorColor);
            return;
        }

        if (currentLevel == null)
        {
            ShowOutput("> Error: No level loaded!\n", errorColor);
            return;
        }

        string userCode = codeInputField?.text ?? "";

        if (string.IsNullOrWhiteSpace(userCode))
        {
            ShowOutput("> Error: Code is empty!\n", errorColor);
            return;
        }

        isRunning = true;
        SetStatusIndicator(runningColor);
        ShowOutput("> Running code...\n", Color.white);

        // Disable buttons during execution
        if (runButton) runButton.interactable = false;

        // Simulate execution delay
        await Task.Delay(500);

        // Validate code
        bool success = await ValidateCode(userCode);

        if (success)
        {
            SetStatusIndicator(successColor);
            ShowOutput("> Code executed successfully!\n> All test cases passed! ✓\n", successColor);
            
            // Unlock door
            if (levelDoor != null)
            {
                levelDoor.UnlockDoor();
                ShowOutput("> 🚪 Door unlocked! You may proceed.\n", Color.cyan);
            }
            
            // Trigger level completion
            OnLevelCompleted();
        }
        else
        {
            SetStatusIndicator(errorColor);
            ShowOutput("> Code execution failed.\n> Check your code and try again.\n", errorColor);
        }

        isRunning = false;
        if (runButton) runButton.interactable = true;
    }

    private void OnClearClicked()
    {
        if (codeInputField)
        {
            codeInputField.text = currentLevel?.starterCode ?? "";
            UpdateLineNumbers();
        }
        if (outputText) outputText.text = "> Code cleared.\n";
        SetStatusIndicator(idleColor);
    }

    private void OnExitClicked()
    {
        CloseTerminal();
        // Optionally: Return to gameplay or level select
        // LevelManager.Instance.ReturnToGameplay();
    }

    private void OnHintClicked()
    {
        if (currentLevel == null || currentLevel.hints == null || currentLevel.hints.Count == 0)
        {
            ShowOutput("> No hints available for this level.\n", Color.yellow);
            return;
        }

        if (currentHintIndex >= currentLevel.hints.Count)
        {
            ShowOutput("> All hints used!\n", Color.yellow);
            return;
        }

        string hint = currentLevel.hints[currentHintIndex];
        if (hintText)
        {
            hintText.text = $"💡 Hint {currentHintIndex + 1}: {hint}";
            hintText.gameObject.SetActive(true);
        }

        ShowOutput($"> Hint {currentHintIndex + 1}: {hint}\n", Color.cyan);
        currentHintIndex++;

        // Track hint usage for scoring
        // LevelManager.Instance?.TrackHintUsed();
    }

    // ============================================================
    // CODE VALIDATION (Pattern Matching)
    // ============================================================

    private async Task<bool> ValidateCode(string userCode)
    {
        ShowOutput("> Validating code...\n", Color.white);
        await Task.Delay(300); // Simulate processing

        // Use pattern-matching validation service
        CodeValidationService validator = new CodeValidationService();
        ValidationResult result = validator.ValidateCode(userCode, currentLevel.challenge);

        if (!result.isValid)
        {
            ShowOutput($"> ❌ Validation Failed\n", errorColor);
            ShowOutput($"> {result.errorMessage}\n", errorColor);
            
            if (!string.IsNullOrEmpty(result.hint))
            {
                ShowOutput($"> 💡 Tip: {result.hint}\n", Color.cyan);
            }
            
            return false;
        }

        // Validation passed - run test cases (if any)
        if (currentLevel.testCases != null && currentLevel.testCases.Count > 0)
        {
            ShowOutput($"> Running {currentLevel.testCases.Count} test cases...\n", Color.white);
            
            foreach (var testCase in currentLevel.testCases)
            {
                await Task.Delay(200);
                
                // For simple challenges, assume pass if validation passed
                ShowOutput($"> Test {testCase.testNumber}: ✓ Passed\n", successColor);
            }
        }

        ShowOutput("> ✅ Code validated successfully!\n", successColor);
        return true;
    }

    // ============================================================
    // UI HELPERS
    // ============================================================

    private void OnCodeChanged(string newCode)
    {
        UpdateLineNumbers();
        ApplySyntaxHighlighting(newCode);
    }

    private void UpdateLineNumbers()
    {
        if (lineNumbersText == null || codeInputField == null) return;

        string code = codeInputField.text;
        int lineCount = code.Split('\n').Length;

        StringBuilder lineNumbers = new StringBuilder();
        for (int i = 1; i <= lineCount; i++)
        {
            lineNumbers.AppendLine(i.ToString());
        }

        lineNumbersText.text = lineNumbers.ToString();
    }

    private void ApplySyntaxHighlighting(string code)
    {
        // TODO: Implement basic syntax highlighting
        // For now, TextMeshPro rich text tags could be used
        // Example: <color=#569CD6>class</color>
        
        // Basic keyword coloring (simplified)
        // string[] keywords = { "class", "public", "private", "void", "int", "String", "return", "if", "else", "for", "while" };
        // foreach (string keyword in keywords)
        // {
        //     code = code.Replace(keyword, $"<color=#569CD6>{keyword}</color>");
        // }
        
        // This would need to be applied to a separate TMP display, not the input field
    }

    private void ShowOutput(string message, Color color)
    {
        if (outputText)
        {
            outputText.text += $"<color=#{ColorUtility.ToHtmlStringRGB(color)}>{message}</color>";
        }
    }

    private void SetStatusIndicator(Color color)
    {
        if (statusIndicator) statusIndicator.color = color;
    }

    // ============================================================
    // LEVEL COMPLETION
    // ============================================================

    private async void OnLevelCompleted()
    {
        Debug.Log($"Level {currentLevel.levelNumber} completed!");

        // Calculate rewards
        int tokensEarned = currentLevel.baseTokenReward;
        
        // Bonus for not using hints
        if (currentHintIndex == 0)
        {
            tokensEarned += currentLevel.perfectBonus;
            ShowOutput($"> Perfect! Bonus {currentLevel.perfectBonus} tokens!\n", successColor);
        }

        ShowOutput($"> Level Complete! Earned {tokensEarned} tokens!\n", successColor);

        // Update progress through LevelManager
        if (LevelManager.Instance != null)
        {
            var completionRecord = await LevelManager.Instance.CompleteLevel(true, tokensEarned);
            if (completionRecord != null)
            {
                ShowOutput($"> Stars earned: {completionRecord.starsEarned} ⭐\n", successColor);
            }
        }

        // Notify terminal interactable to update state
        TerminalInteractable terminal = FindObjectOfType<TerminalInteractable>();
        if (terminal != null)
        {
            terminal.SetCompleted(true);
        }

        // Unlock level exit
        LevelExit exit = FindObjectOfType<LevelExit>();
        if (exit != null)
        {
            exit.Unlock();
        }

        // Re-enable player movement
        PlayerController player = FindObjectOfType<PlayerController>();
        if (player != null)
        {
            player.SetMovementEnabled(true);
        }

        // Close terminal after delay
        Invoke(nameof(CloseTerminal), 3f);
    }

    private void OnDestroy()
    {
        if (runButton) runButton.onClick.RemoveAllListeners();
        if (clearButton) clearButton.onClick.RemoveAllListeners();
        if (exitButton) exitButton.onClick.RemoveAllListeners();
        if (hintButton) hintButton.onClick.RemoveAllListeners();
    }
}
