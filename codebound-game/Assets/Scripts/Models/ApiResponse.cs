public class ApiResponse<T>
{
    public bool IsSuccess { get; private set; }
    public T Data { get; private set; }
    public string Error { get; private set; }
    
    // Alias for Error (for compatibility)
    public string ErrorMessage => Error;

    private ApiResponse(bool isSuccess, T data, string error)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
    }

    public static ApiResponse<T> Success(T data)
    {
        return new ApiResponse<T>(true, data, null);
    }

    public static ApiResponse<T> Failure(string error)
    {
        return new ApiResponse<T>(false, default(T), error);
    }
}