using System;
using System.Collections.Generic;

/// <summary>
/// Level definition and puzzle configuration
/// Supports 100 levels with progressive difficulty (FR3, FR4, FR11)
/// </summary>
[Serializable]
public class LevelData
{
    // Level Identity
    public int levelNumber; // 1-100
    public string levelName; // "Basics: Hello World", "Loops: For Loop Challenge"
    public string category; // "Basics", "Variables", "Loops", "Conditionals", "Methods", "Arrays", etc.
    public LevelDifficulty difficulty;

    // Puzzle Configuration
    public string puzzleDescription; // Story/context for the level
    public string objective; // "Print 'Hello World'", "Calculate sum of array"
    public string starterCode; // Pre-filled code template
    public List<string> hints; // FR6 - Hints system
    public List<TestCase> testCases; // For code validation (FR4)

    // Rewards
    public int baseTokenReward; // Tokens for completion
    public int perfectBonus; // Extra tokens for perfect completion
    public int speedBonus; // Extra tokens for fast completion
    public List<string> unlockedAchievements; // Achievement IDs that can unlock

    // Level Design (2D Environment)
    public string sceneName; // Unity scene to load
    public List<string> requiredMechanics; // ["platform", "switch", "door", "terminal"]
    public int tokensToCollect; // Hidden tokens in level (FR17 equivalent)

    // Unlock Requirements
    public bool isLocked; // Sequential unlock (FR11)
    public int requiredLevel; // Previous level needed to unlock

    // Statistics
    public float averageCompletionTime;
    public float fastestCompletionTime;
    public int totalAttempts;
    public int totalCompletions;

    public LevelData()
    {
        levelNumber = 1;
        levelName = "Untitled Level";
        category = "Basics";
        difficulty = LevelDifficulty.Easy;
        
        puzzleDescription = "";
        objective = "";
        starterCode = "// Write your code here";
        hints = new List<string>();
        testCases = new List<TestCase>();

        baseTokenReward = 50;
        perfectBonus = 25;
        speedBonus = 25;
        unlockedAchievements = new List<string>();

        sceneName = "Level_1";
        requiredMechanics = new List<string>();
        tokensToCollect = 3;

        isLocked = true;
        requiredLevel = 0;

        averageCompletionTime = 0f;
        fastestCompletionTime = 0f;
        totalAttempts = 0;
        totalCompletions = 0;
    }
}

/// <summary>
/// Level difficulty categories
/// </summary>
public enum LevelDifficulty
{
    Easy,      // Levels 1-25: Basic syntax, print statements
    Medium,    // Levels 26-50: Variables, conditionals, simple loops
    Hard,      // Levels 51-75: Complex loops, arrays, methods
    Expert,    // Levels 76-100: Advanced logic, recursion, algorithms
    Challenge  // Bonus/optional levels
}

/// <summary>
/// Test case for code validation (FR4)
/// Matches backend JavaValidator logic
/// </summary>
[Serializable]
public class TestCase
{
    public string input; // Input to the program
    public string expectedOutput; // Expected console output
    public string description; // Test case description
    public bool isHidden; // Hidden test cases not shown to player

    public TestCase()
    {
        input = "";
        expectedOutput = "";
        description = "";
        isHidden = false;
    }

    public TestCase(string testInput, string expected, string desc = "", bool hidden = false)
    {
        input = testInput;
        expectedOutput = expected;
        description = desc;
        isHidden = hidden;
    }
}

/// <summary>
/// Player's completion record for a level
/// Stored locally and synced via /progress/update
/// </summary>
[Serializable]
public class LevelCompletionRecord
{
    public int levelNumber;
    public bool isCompleted;
    public int starsEarned; // 1-3 stars based on performance
    public int tokensEarned;
    public float completionTime;
    public int hintsUsed;
    public bool isPerfect; // No hints, fast completion
    public DateTime completedAt;
    public int attemptCount;

    public LevelCompletionRecord()
    {
        levelNumber = 1;
        isCompleted = false;
        starsEarned = 0;
        tokensEarned = 0;
        completionTime = 0f;
        hintsUsed = 0;
        isPerfect = false;
        completedAt = DateTime.Now;
        attemptCount = 0;
    }
}

/// <summary>
/// Level categories for organization (100 levels grouped)
/// </summary>
public static class LevelCategories
{
    public const string BASICS = "Basics";                 // Levels 1-10
    public const string VARIABLES = "Variables";           // Levels 11-20
    public const string OPERATORS = "Operators";           // Levels 21-25
    public const string CONDITIONALS = "Conditionals";     // Levels 26-35
    public const string LOOPS = "Loops";                   // Levels 36-50
    public const string ARRAYS = "Arrays";                 // Levels 51-60
    public const string METHODS = "Methods";               // Levels 61-70
    public const string OOP = "Object-Oriented";           // Levels 71-80
    public const string RECURSION = "Recursion";           // Levels 81-90
    public const string ALGORITHMS = "Algorithms";         // Levels 91-100

    public static string GetCategoryForLevel(int levelNumber)
    {
        if (levelNumber <= 10) return BASICS;
        if (levelNumber <= 20) return VARIABLES;
        if (levelNumber <= 25) return OPERATORS;
        if (levelNumber <= 35) return CONDITIONALS;
        if (levelNumber <= 50) return LOOPS;
        if (levelNumber <= 60) return ARRAYS;
        if (levelNumber <= 70) return METHODS;
        if (levelNumber <= 80) return OOP;
        if (levelNumber <= 90) return RECURSION;
        return ALGORITHMS;
    }
}

/// <summary>
/// Level unlock manager for sequential progression (FR11)
/// </summary>
public static class LevelUnlockLogic
{
    /// <summary>
    /// Check if a level is unlocked based on highest completed level
    /// </summary>
    public static bool IsLevelUnlocked(int levelNumber, int highestCompletedLevel)
    {
        // Level 1 is always unlocked
        if (levelNumber == 1) return true;

        // Sequential unlock: Level N requires Level N-1 to be completed
        return levelNumber <= highestCompletedLevel + 1;
    }

    /// <summary>
    /// Get the next level to play
    /// </summary>
    public static int GetNextLevel(int currentLevel)
    {
        return currentLevel + 1 > 100 ? 100 : currentLevel + 1;
    }

    /// <summary>
    /// Calculate stars earned based on performance
    /// </summary>
    public static int CalculateStars(float completionTime, int hintsUsed, float targetTime)
    {
        // 3 stars: Fast completion + no hints
        if (completionTime <= targetTime && hintsUsed == 0)
            return 3;

        // 2 stars: Normal completion + few hints
        if (completionTime <= targetTime * 1.5f && hintsUsed <= 2)
            return 2;

        // 1 star: Just completed
        return 1;
    }
}
