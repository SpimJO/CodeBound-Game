using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text;

public class APIService : IAPIService
{
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly IWebRequestHandler _requestHandler;
    private readonly CircuitBreaker _circuitBreaker;
    private readonly Queue<QueuedRequest> _offlineQueue;
    private bool _isOnlineMode = true;

    public APIService(IWebRequestHandler requestHandler)
    {
        _baseUrl = APIConfig.BASE_URL;
        _apiKey = APIConfig.API_KEY;
        _requestHandler = requestHandler;
        _circuitBreaker = new CircuitBreaker(
            failureThreshold: 5,
            timeout: TimeSpan.FromSeconds(30)
        );
        _offlineQueue = new Queue<QueuedRequest>();
    }

    /// <summary>
    /// Setup common headers for all requests
    /// </summary>
    private void SetupRequestHeaders(UnityWebRequest request, string authToken = null)
    {
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("api-key", _apiKey);
        
        if (!string.IsNullOrEmpty(authToken))
        {
            request.SetRequestHeader("Authorization", $"Bearer {authToken}");
        }
    }

    public async Task<ApiResponse<T>> Post<T>(
        string endpoint,
        object data,
        string authToken = null
    )
    {
        // Circuit breaker check
        if (_circuitBreaker.IsOpen)
        {
            Debug.LogWarning("Circuit breaker is OPEN. Queueing request for later.");
            QueueRequestForLater(endpoint, "POST", data, authToken);
            return ApiResponse<T>.Failure("Service temporarily unavailable");
        }

        try
        {
            var response = await PostWithRetry<T>(endpoint, data, authToken, maxRetries: APIConfig.RETRY_MAX_ATTEMPTS);

            if (response.IsSuccess)
            {
                _circuitBreaker.RecordSuccess();
            }
            else
            {
                _circuitBreaker.RecordFailure();
            }

            return response;
        }
        catch (Exception ex)
        {
            _circuitBreaker.RecordFailure();
            Debug.LogError($"API Error: {ex.Message}");

            // Queue for offline processing
            QueueRequestForLater(endpoint, "POST", data, authToken);
            return ApiResponse<T>.Failure(ex.Message);
        }
    }

    private async Task<ApiResponse<T>> PostWithRetry<T>(
        string endpoint,
        object data,
        string authToken,
        int maxRetries
    )
    {
        int attempt = 0;
        Exception lastException = null;

        while (attempt < maxRetries)
        {
            try
            {
                string url = $"{_baseUrl}{endpoint}";
                string jsonData = JsonUtility.ToJson(data);

                Debug.Log($"[API] POST {url}");

                UnityWebRequest request = new UnityWebRequest(url, "POST");
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.timeout = APIConfig.REQUEST_TIMEOUT_SECONDS;
                
                SetupRequestHeaders(request, authToken);

                await request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    Debug.Log($"[API] Response: {responseText}");
                    T responseData = JsonUtility.FromJson<T>(responseText);
                    return ApiResponse<T>.Success(responseData);
                }
                else
                {
                    Debug.LogWarning($"[API] Request failed: {request.error} - {request.downloadHandler?.text}");
                    lastException = new Exception($"{request.error}: {request.downloadHandler?.text}");
                    attempt++;

                    if (attempt < maxRetries)
                    {
                        // Exponential backoff
                        await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                    }
                }
            }
            catch (Exception ex)
            {
                lastException = ex;
                attempt++;

                if (attempt < maxRetries)
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                }
            }
        }

        return ApiResponse<T>.Failure(lastException?.Message ?? "Unknown error");
    }

    private void QueueRequestForLater(string endpoint, string method, object data, string authToken)
    {
        _offlineQueue.Enqueue(new QueuedRequest
        {
            Endpoint = endpoint,
            Method = method,
            Data = data,
            AuthToken = authToken,
            Timestamp = DateTime.Now
        });
    }

    // Implement other methods similarly
    public async Task<ApiResponse<T>> Get<T>(string endpoint, string authToken = null)
    {
         // Circuit breaker check
        if (_circuitBreaker.IsOpen)
        {
            return ApiResponse<T>.Failure("Service temporarily unavailable");
        }

        try
        {
            var response = await GetWithRetry<T>(endpoint, authToken, maxRetries: APIConfig.RETRY_MAX_ATTEMPTS);
            
            if (response.IsSuccess)
            {
                _circuitBreaker.RecordSuccess();
            }
            else
            {
                _circuitBreaker.RecordFailure();
            }
            
            return response;
        }
        catch (Exception ex)
        {
             _circuitBreaker.RecordFailure();
            Debug.LogError($"API Error: {ex.Message}");
            return ApiResponse<T>.Failure(ex.Message);
        }
    }

    private async Task<ApiResponse<T>> GetWithRetry<T>(
        string endpoint,
        string authToken,
        int maxRetries
    )
    {
        int attempt = 0;
        Exception lastException = null;

        while (attempt < maxRetries)
        {
            try
            {
                string url = $"{_baseUrl}{endpoint}";

                Debug.Log($"[API] GET {url}");

                UnityWebRequest request = UnityWebRequest.Get(url);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.timeout = APIConfig.REQUEST_TIMEOUT_SECONDS;
                
                SetupRequestHeaders(request, authToken);

                await request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    Debug.Log($"[API] Response: {responseText}");
                    T responseData = JsonUtility.FromJson<T>(responseText);
                    return ApiResponse<T>.Success(responseData);
                }
                else
                {
                    Debug.LogWarning($"[API] Request failed: {request.error} - {request.downloadHandler?.text}");
                    lastException = new Exception($"{request.error}: {request.downloadHandler?.text}");
                    attempt++;

                    if (attempt < maxRetries)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                    }
                }
            }
            catch (Exception ex)
            {
                lastException = ex;
                attempt++;

                if (attempt < maxRetries)
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                }
            }
        }

        return ApiResponse<T>.Failure(lastException?.Message ?? "Unknown error");
    }

    public async Task<ApiResponse<T>> Put<T>(string endpoint, object data, string authToken = null)
    {
        // Circuit breaker check
        if (_circuitBreaker.IsOpen)
        {
            return ApiResponse<T>.Failure("Service temporarily unavailable");
        }

        try
        {
            var response = await PutWithRetry<T>(endpoint, data, authToken, maxRetries: APIConfig.RETRY_MAX_ATTEMPTS);

            if (response.IsSuccess)
            {
                _circuitBreaker.RecordSuccess();
            }
            else
            {
                _circuitBreaker.RecordFailure();
            }

            return response;
        }
        catch (Exception ex)
        {
            _circuitBreaker.RecordFailure();
            Debug.LogError($"API Error: {ex.Message}");
            return ApiResponse<T>.Failure(ex.Message);
        }
    }

    private async Task<ApiResponse<T>> PutWithRetry<T>(
        string endpoint,
        object data,
        string authToken,
        int maxRetries
    )
    {
        int attempt = 0;
        Exception lastException = null;

        while (attempt < maxRetries)
        {
            try
            {
                string url = $"{_baseUrl}{endpoint}";
                string jsonData = JsonUtility.ToJson(data);

                Debug.Log($"[API] PUT {url}");

                UnityWebRequest request = new UnityWebRequest(url, "PUT");
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.timeout = APIConfig.REQUEST_TIMEOUT_SECONDS;
                
                SetupRequestHeaders(request, authToken);

                await request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    Debug.Log($"[API] Response: {responseText}");
                    T responseData = JsonUtility.FromJson<T>(responseText);
                    return ApiResponse<T>.Success(responseData);
                }
                else
                {
                    Debug.LogWarning($"[API] Request failed: {request.error} - {request.downloadHandler?.text}");
                    lastException = new Exception($"{request.error}: {request.downloadHandler?.text}");
                    attempt++;

                    if (attempt < maxRetries)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                    }
                }
            }
            catch (Exception ex)
            {
                lastException = ex;
                attempt++;

                if (attempt < maxRetries)
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                }
            }
        }

        return ApiResponse<T>.Failure(lastException?.Message ?? "Unknown error");
    }

    public async Task<bool> CheckConnectivity()
    {
        try
        {
            // First check Unity's network reachability
            if (Application.internetReachability == NetworkReachability.NotReachable)
            {
                Debug.Log("[API] No internet connection detected");
                _isOnlineMode = false;
                return false;
            }

            // Then try to ping the server
            string url = $"{_baseUrl}/health"; // Assumes a health endpoint exists
            
            UnityWebRequest request = UnityWebRequest.Get(url);
            request.timeout = 5; // Short timeout for connectivity check
            SetupRequestHeaders(request);
            
            await request.SendWebRequest();

            bool isOnline = request.result == UnityWebRequest.Result.Success;
            _isOnlineMode = isOnline;
            
            Debug.Log($"[API] Connectivity check: {(isOnline ? "Online" : "Offline")}");
            return isOnline;
        }
        catch (Exception ex)
        {
            Debug.LogWarning($"[API] Connectivity check failed: {ex.Message}");
            _isOnlineMode = false;
            return false;
        }
    }

    /// <summary>
    /// Process queued offline requests when back online
    /// </summary>
    public async Task ProcessOfflineQueue()
    {
        if (_offlineQueue.Count == 0)
        {
            return;
        }

        Debug.Log($"[API] Processing {_offlineQueue.Count} queued requests...");

        while (_offlineQueue.Count > 0)
        {
            var queuedRequest = _offlineQueue.Dequeue();
            
            try
            {
                // Re-send the queued request
                switch (queuedRequest.Method.ToUpper())
                {
                    case "POST":
                        await Post<object>(queuedRequest.Endpoint, queuedRequest.Data, queuedRequest.AuthToken);
                        break;
                    case "PUT":
                        await Put<object>(queuedRequest.Endpoint, queuedRequest.Data, queuedRequest.AuthToken);
                        break;
                }
                
                Debug.Log($"[API] Processed queued request: {queuedRequest.Method} {queuedRequest.Endpoint}");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[API] Failed to process queued request: {ex.Message}");
                // Re-queue if still failing
                _offlineQueue.Enqueue(queuedRequest);
                break; // Stop processing if we hit an error
            }
        }
    }

    public bool IsOnlineMode => _isOnlineMode;
    public int QueuedRequestCount => _offlineQueue.Count;
}