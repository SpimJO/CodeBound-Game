using System.Threading.Tasks;

public interface IAPIService
{
    Task<ApiResponse<T>> Get<T>(string endpoint, string authToken = null);
    Task<ApiResponse<T>> Post<T>(string endpoint, object data, string authToken = null);
    Task<ApiResponse<T>> Put<T>(string endpoint, object data, string authToken = null);
    Task<bool> CheckConnectivity();
}