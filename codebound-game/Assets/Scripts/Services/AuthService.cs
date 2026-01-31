using System;
using UnityEngine;
using System.Threading.Tasks;

/// <summary>
/// Authentication service for login/registration (FR13)
/// Handles JWT token management and session validation
/// </summary>
public class AuthService : IAuthService
{
    private readonly IAPIService _apiService;
    private readonly IStorageService _storageService;
    private string _currentToken;

    private const string TOKEN_KEY = "auth_token";
    private const string USER_KEY = "user_data";

    public bool IsAuthenticated => !string.IsNullOrEmpty(_currentToken);
    public string CurrentToken => _currentToken;

    public AuthService(IAPIService apiService, IStorageService storageService)
    {
        _apiService = apiService;
        _storageService = storageService;
        _currentToken = "";
    }

    /// <summary>
    /// Register new user account (FR13)
    /// POST /auth/register
    /// </summary>
    public async Task<AuthResult> Register(string username, string email, string password)
    {
        try
        {
            var registerRequest = new RegisterRequest
            {
                username = username,
                email = email,
                password = password
            };

            var response = await _apiService.Post<RegisterResponse>(
                "/auth/register",
                registerRequest
            );

            if (response.IsSuccess && response.Data != null)
            {
                // Store token and user data
                _currentToken = response.Data.data.token;
                await _storageService.SaveData(TOKEN_KEY, _currentToken);

                // Create initial player data
                PlayerData playerData = new PlayerData
                {
                    userId = response.Data.data.user.id,
                    username = response.Data.data.user.username,
                    email = response.Data.data.user.email,
                    authToken = _currentToken,
                    currentLevel = 1,
                    highestLevel = 1,
                    totalTokens = 0,
                    equippedSkin = "default"
                };

                await _storageService.SaveData(USER_KEY, playerData);

                Debug.Log($"Registration successful! Welcome {username}");
                return new AuthResult
                {
                    success = true,
                    message = "Registration successful",
                    token = _currentToken,
                    userData = playerData
                };
            }

            return new AuthResult
            {
                success = false,
                message = response.ErrorMessage ?? "Registration failed",
                token = null,
                userData = null
            };
        }
        catch (Exception ex)
        {
            Debug.LogError($"Registration error: {ex.Message}");
            return new AuthResult
            {
                success = false,
                message = ex.Message,
                token = null,
                userData = null
            };
        }
    }

    /// <summary>
    /// Login existing user (FR13)
    /// POST /auth/login
    /// </summary>
    public async Task<AuthResult> Login(string username, string password)
    {
        try
        {
            var loginRequest = new LoginRequest
            {
                username = username,
                password = password
            };

            var response = await _apiService.Post<LoginResponse>(
                "/auth/login",
                loginRequest
            );

            if (response.IsSuccess && response.Data != null)
            {
                _currentToken = response.Data.data.token;
                await _storageService.SaveData(TOKEN_KEY, _currentToken);

                // Fetch full user data after login
                var sessionResult = await GetSessionData();

                if (sessionResult.success)
                {
                    Debug.Log($"Login successful! Welcome back {username}");
                    return sessionResult;
                }

                return new AuthResult
                {
                    success = true,
                    message = "Login successful",
                    token = _currentToken,
                    userData = null
                };
            }

            return new AuthResult
            {
                success = false,
                message = response.ErrorMessage ?? "Login failed",
                token = null,
                userData = null
            };
        }
        catch (Exception ex)
        {
            Debug.LogError($"Login error: {ex.Message}");
            return new AuthResult
            {
                success = false,
                message = ex.Message,
                token = null,
                userData = null
            };
        }
    }

    /// <summary>
    /// Get session data with user progress
    /// POST /auth/sessionToken
    /// </summary>
    public async Task<AuthResult> GetSessionData()
    {
        try
        {
            if (string.IsNullOrEmpty(_currentToken))
            {
                return new AuthResult
                {
                    success = false,
                    message = "No authentication token found",
                    token = null,
                    userData = null
                };
            }

            var response = await _apiService.Post<SessionResponse>(
                "/auth/sessionToken",
                new { }, // Empty body
                _currentToken
            );

            if (response.IsSuccess && response.Data != null)
            {
                // Convert backend response to PlayerData
                var backendUser = response.Data.data.user;
                PlayerData playerData = new PlayerData
                {
                    userId = backendUser.id,
                    username = backendUser.username,
                    email = backendUser.email,
                    avatar = backendUser.avatar,
                    authToken = _currentToken,
                    currentLevel = backendUser.progress.currentLevel,
                    highestLevel = backendUser.progress.highestLevel,
                    totalTokens = backendUser.progress.totalTokens,
                    totalPlayTime = backendUser.progress.totalPlayTime,
                    equippedSkin = backendUser.progress.equippedSkin ?? "default",
                    lastPlayed = DateTime.Parse(backendUser.progress.lastPlayed)
                };

                await _storageService.SaveData(USER_KEY, playerData);

                Debug.Log($"Session data loaded for {playerData.username}");
                return new AuthResult
                {
                    success = true,
                    message = "Session validated",
                    token = _currentToken,
                    userData = playerData
                };
            }

            return new AuthResult
            {
                success = false,
                message = "Failed to load session data",
                token = null,
                userData = null
            };
        }
        catch (Exception ex)
        {
            Debug.LogError($"Session error: {ex.Message}");
            return new AuthResult
            {
                success = false,
                message = ex.Message,
                token = null,
                userData = null
            };
        }
    }

    /// <summary>
    /// Update user profile (username/avatar)
    /// PUT /auth/profile
    /// </summary>
    public async Task<bool> UpdateProfile(string username, string avatar)
    {
        try
        {
            var updateRequest = new ProfileUpdateRequest
            {
                username = username,
                avatar = avatar
            };

            var response = await _apiService.Put<ProfileUpdateResponse>(
                "/auth/profile",
                updateRequest,
                _currentToken
            );

            if (response.IsSuccess)
            {
                // Update local user data
                var localData = await _storageService.LoadData<PlayerData>(USER_KEY);
                if (localData != null)
                {
                    localData.username = username;
                    localData.avatar = avatar;
                    await _storageService.SaveData(USER_KEY, localData);
                }

                Debug.Log("Profile updated successfully");
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Profile update error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Load saved token and attempt auto-login
    /// </summary>
    public async Task<bool> TryAutoLogin()
    {
        try
        {
            bool hasToken = await _storageService.HasKey(TOKEN_KEY);
            if (!hasToken)
            {
                Debug.Log("No saved token found");
                return false;
            }

            _currentToken = await _storageService.LoadData<string>(TOKEN_KEY);

            if (string.IsNullOrEmpty(_currentToken))
            {
                return false;
            }

            // Validate token with session endpoint
            var sessionResult = await GetSessionData();

            if (sessionResult.success)
            {
                Debug.Log("Auto-login successful");
                return true;
            }

            // Token expired or invalid
            await Logout();
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Auto-login error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Logout and clear stored data
    /// </summary>
    public async Task Logout()
    {
        _currentToken = "";
        await _storageService.DeleteData(TOKEN_KEY);
        Debug.Log("Logged out successfully");
    }

    /// <summary>
    /// Check if token is expired (basic check)
    /// </summary>
    public bool IsTokenExpired()
    {
        // JWT tokens expire after 30 days according to backend
        // For now, just check if token exists
        return string.IsNullOrEmpty(_currentToken);
    }
}

// ============================================================
// INTERFACES AND DATA MODELS
// ============================================================

public interface IAuthService
{
    bool IsAuthenticated { get; }
    string CurrentToken { get; }
    Task<AuthResult> Register(string username, string email, string password);
    Task<AuthResult> Login(string username, string password);
    Task<AuthResult> GetSessionData();
    Task<bool> UpdateProfile(string username, string avatar);
    Task<bool> TryAutoLogin();
    Task Logout();
    bool IsTokenExpired();
}

[Serializable]
public class AuthResult
{
    public bool success;
    public string message;
    public string token;
    public PlayerData userData;
}

// Request Models
[Serializable]
public class RegisterRequest
{
    public string username;
    public string email;
    public string password;
}

[Serializable]
public class LoginRequest
{
    public string username;
    public string password;
}

[Serializable]
public class ProfileUpdateRequest
{
    public string username;
    public string avatar;
}

// Response Models (matching backend structure)
[Serializable]
public class RegisterResponse
{
    public bool success;
    public string message;
    public RegisterData data;
}

[Serializable]
public class RegisterData
{
    public UserInfo user;
    public string token;
}

[Serializable]
public class LoginResponse
{
    public bool success;
    public string message;
    public LoginData data;
}

[Serializable]
public class LoginData
{
    public string token;
}

[Serializable]
public class SessionResponse
{
    public bool success;
    public string message;
    public SessionData data;
}

[Serializable]
public class SessionData
{
    public UserWithProgress user;
}

[Serializable]
public class UserWithProgress
{
    public string id;
    public string username;
    public string email;
    public string avatar;
    public string created_at;
    public string updated_at;
    public UserProgressData progress;
}

[Serializable]
public class UserProgressData
{
    public int currentLevel;
    public int highestLevel;
    public int totalTokens;
    public float totalPlayTime;
    public string equippedSkin;
    public string lastPlayed;
}

[Serializable]
public class UserInfo
{
    public string id;
    public string username;
    public string email;
}

[Serializable]
public class ProfileUpdateResponse
{
    public bool success;
    public string message;
    public ProfileUpdateData data;
}

[Serializable]
public class ProfileUpdateData
{
    public UserInfo user;
}
