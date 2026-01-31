using System;
using System.Text.RegularExpressions;
using UnityEngine;

/// <summary>
/// Simple client-side code validation using pattern matching
/// PHASE 1: Basic validation (no backend needed)
/// PHASE 2: Can upgrade to backend execution later
/// </summary>
public class CodeValidationService
{
    /// <summary>
    /// Validate if code solves the challenge
    /// Uses pattern matching instead of actual Java execution
    /// </summary>
    public ValidationResult ValidateCode(string code, LevelChallenge challenge)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Code cannot be empty"
            };
        }

        // Remove comments and extra whitespace for checking
        string cleanCode = RemoveComments(code).Trim();

        // Check based on challenge type
        switch (challenge.challengeType)
        {
            case "print":
                return ValidatePrintChallenge(cleanCode, challenge);
            
            case "variables":
                return ValidateVariableChallenge(cleanCode, challenge);
            
            case "conditional":
                return ValidateConditionalChallenge(cleanCode, challenge);
            
            case "loops":
                return ValidateLoopChallenge(cleanCode, challenge);
            
            case "methods":
                return ValidateMethodChallenge(cleanCode, challenge);
            
            case "arrays":
                return ValidateArrayChallenge(cleanCode, challenge);
            
            default:
                return ValidateGenericChallenge(cleanCode, challenge);
        }
    }

    /// <summary>
    /// Validate print challenges (Level 1-10)
    /// Example: Print "Hello World"
    /// </summary>
    private ValidationResult ValidatePrintChallenge(string code, LevelChallenge challenge)
    {
        // Check if code contains System.out.println
        if (!code.Contains("System.out.println"))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "You must use System.out.println() to print output"
            };
        }

        // Check if expected output is in the code
        foreach (string expectedOutput in challenge.expectedOutput)
        {
            // Allow both single and double quotes
            string pattern1 = $"System.out.println\\(\"{Regex.Escape(expectedOutput)}\"\\)";
            string pattern2 = $"System.out.println\\('{Regex.Escape(expectedOutput)}'\\)";
            
            if (!Regex.IsMatch(code, pattern1) && !Regex.IsMatch(code, pattern2))
            {
                return new ValidationResult
                {
                    isValid = false,
                    errorMessage = $"Expected output: \"{expectedOutput}\""
                };
            }
        }

        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Validate variable declaration challenges (Level 11-25)
    /// Example: Create int variable named "age" with value 25
    /// </summary>
    private ValidationResult ValidateVariableChallenge(string code, LevelChallenge challenge)
    {
        // Check for variable declarations based on requirements
        string requiredVarType = challenge.requirements.ContainsKey("variableType") 
            ? challenge.requirements["variableType"] 
            : "int";
        
        string requiredVarName = challenge.requirements.ContainsKey("variableName")
            ? challenge.requirements["variableName"]
            : "number";

        // Pattern: int age = 25;
        string pattern = $@"{requiredVarType}\s+{requiredVarName}\s*=";
        
        if (!Regex.IsMatch(code, pattern))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = $"Declare a {requiredVarType} variable named '{requiredVarName}'"
            };
        }

        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Validate conditional (if/else) challenges (Level 26-40)
    /// </summary>
    private ValidationResult ValidateConditionalChallenge(string code, LevelChallenge challenge)
    {
        // Check for if statement
        if (!Regex.IsMatch(code, @"if\s*\("))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Use an if statement to check the condition"
            };
        }

        // Check for else if challenge requires it
        if (challenge.requirements.ContainsKey("requiresElse") && 
            challenge.requirements["requiresElse"] == "true")
        {
            if (!code.Contains("else"))
            {
                return new ValidationResult
                {
                    isValid = false,
                    errorMessage = "Don't forget the else statement"
                };
            }
        }

        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Validate loop challenges (Level 41-60)
    /// </summary>
    private ValidationResult ValidateLoopChallenge(string code, LevelChallenge challenge)
    {
        string requiredLoopType = challenge.requirements.ContainsKey("loopType")
            ? challenge.requirements["loopType"]
            : "for";

        // Check for loop type
        if (requiredLoopType == "for" && !Regex.IsMatch(code, @"for\s*\("))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Use a for loop to solve this challenge"
            };
        }
        else if (requiredLoopType == "while" && !Regex.IsMatch(code, @"while\s*\("))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Use a while loop to solve this challenge"
            };
        }

        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Validate method/function challenges (Level 61-80)
    /// </summary>
    private ValidationResult ValidateMethodChallenge(string code, LevelChallenge challenge)
    {
        string requiredMethodName = challenge.requirements.ContainsKey("methodName")
            ? challenge.requirements["methodName"]
            : "calculate";

        // Pattern: public static void methodName(
        string pattern = $@"(public|private)\s+(static\s+)?(\w+)\s+{requiredMethodName}\s*\(";
        
        if (!Regex.IsMatch(code, pattern))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = $"Create a method named '{requiredMethodName}'"
            };
        }

        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Validate array challenges (Level 81-100)
    /// </summary>
    private ValidationResult ValidateArrayChallenge(string code, LevelChallenge challenge)
    {
        // Check for array declaration
        if (!Regex.IsMatch(code, @"\[\s*\]") && !Regex.IsMatch(code, @"new\s+\w+\["))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Create an array to solve this challenge"
            };
        }

        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Generic validation for advanced challenges
    /// </summary>
    private ValidationResult ValidateGenericChallenge(string code, LevelChallenge challenge)
    {
        // Basic syntax checks
        if (!code.Contains("public class"))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Your code must contain a public class"
            };
        }

        if (!code.Contains("public static void main"))
        {
            return new ValidationResult
            {
                isValid = false,
                errorMessage = "Your code must contain a main method"
            };
        }

        // If all basic checks pass, assume valid
        return new ValidationResult { isValid = true };
    }

    /// <summary>
    /// Remove Java comments from code
    /// </summary>
    private string RemoveComments(string code)
    {
        // Remove single-line comments
        code = Regex.Replace(code, @"//.*", "");
        
        // Remove multi-line comments
        code = Regex.Replace(code, @"/\*.*?\*/", "", RegexOptions.Singleline);
        
        return code;
    }
}

/// <summary>
/// Result of code validation
/// </summary>
[Serializable]
public class ValidationResult
{
    public bool isValid;
    public string errorMessage;
    public string hint; // Optional hint if validation fails

    public ValidationResult()
    {
        isValid = false;
        errorMessage = "";
        hint = "";
    }
}
