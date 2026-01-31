# Level Data Directory

This folder contains JSON files for all 100 game levels.

## File Naming Convention
- `level_001.json` - Level 1
- `level_002.json` - Level 2
- ...
- `level_100.json` - Level 100

## JSON Structure Example

```json
{
  "levelNumber": 1,
  "levelName": "Basics: Hello World",
  "category": "Basics",
  "difficulty": 0,
  "puzzleDescription": "Write a program that prints 'Hello World' to the console",
  "objective": "Print 'Hello World'",
  "starterCode": "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
  "hints": [
    "Use System.out.println() to print text",
    "The text should be exactly 'Hello World'",
    "Don't forget the semicolon!"
  ],
  "testCases": [
    {
      "input": "",
      "expectedOutput": "Hello World",
      "description": "Should print 'Hello World'",
      "isHidden": false
    }
  ],
  "baseTokenReward": 50,
  "perfectBonus": 25,
  "speedBonus": 25,
  "sceneName": "Level_1",
  "requiredMechanics": ["terminal"],
  "tokensToCollect": 3,
  "isLocked": false,
  "requiredLevel": 0
}
```

## Difficulty Values
- `0` = Easy (Levels 1-25)
- `1` = Medium (Levels 26-50)
- `2` = Hard (Levels 51-75)
- `3` = Expert (Levels 76-100)

## Categories
- **Basics** (Levels 1-10): Print statements, basic syntax
- **Variables** (Levels 11-20): Data types, variable declaration
- **Operators** (Levels 21-25): Arithmetic, comparison, logical
- **Conditionals** (Levels 26-35): if/else, switch
- **Loops** (Levels 36-50): for, while, do-while
- **Arrays** (Levels 51-60): Arrays, ArrayList
- **Methods** (Levels 61-70): Functions, parameters, return
- **OOP** (Levels 71-80): Classes, objects, inheritance
- **Recursion** (Levels 81-90): Recursive functions
- **Algorithms** (Levels 91-100): Sorting, searching, optimization

## Future: Backend Integration

Instead of local JSON files, levels can be fetched from backend:

```csharp
// Future backend endpoint:
GET /levels - Get all levels
GET /levels/{levelNumber} - Get specific level
```

This allows for:
- Dynamic level updates without app updates
- User-generated content
- A/B testing different level designs
- Analytics on level difficulty

## Current Implementation

Levels are loaded via `LevelManager.LoadLevelsFromResources()` which reads all JSON files from this directory at game startup.
