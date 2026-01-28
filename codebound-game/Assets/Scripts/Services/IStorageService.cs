using System.Threading.Tasks;

public interface IStorageService
{
    Task SaveData<T>(string key, T data);
    Task<T> LoadData<T>(string key);
    Task<bool> HasKey(string key);
    Task DeleteData(string key);
}