using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text;

public class APIService : IAPIService
{
    private readonly string _baseUrl;
    private readonly IWebRequestHandler _requestHandler;
    private readonly CircuitBreaker _circuitBreaker;
    private readonly Queue<QueuedRequest> _offlineQueue;
    private bool _isOnlineMode = true;

    public APIService(IWebRequestHandler requestHandler)
    {
        _baseUrl = APIConfig.BASE_URL;
        _requestHandler = requestHandler;
        _circuitBreaker = new CircuitBreaker(
            failureThreshold: 5,
            timeout: TimeSpan.FromSeconds(30)
        );
        _offlineQueue = new Queue<QueuedRequest>();
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
            var response = await PostWithRetry<T>(endpoint, data, authToken, maxRetries: 3);

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

                UnityWebRequest request = new UnityWebRequest(url, "POST");
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                if (!string.IsNullOrEmpty(authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                }

                await request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    T responseData = JsonUtility.FromJson<T>(responseText);
                    return ApiResponse<T>.Success(responseData);
                }
                else
                {
                    lastException = new Exception(request.error);
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
            return await GetWithRetry<T>(endpoint, authToken, maxRetries: 3);
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

                UnityWebRequest request = UnityWebRequest.Get(url);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                if (!string.IsNullOrEmpty(authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                }

                await request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    T responseData = JsonUtility.FromJson<T>(responseText);
                    return ApiResponse<T>.Success(responseData);
                }
                else
                {
                    lastException = new Exception(request.error);
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

    public Task<ApiResponse<T>> Put<T>(string endpoint, object data, string authToken = null)
    {
        // Implement PUT
        throw new NotImplementedException();
    }

    public Task<bool> CheckConnectivity()
    {
        // Implement connectivity check
        throw new NotImplementedException();
    }
}