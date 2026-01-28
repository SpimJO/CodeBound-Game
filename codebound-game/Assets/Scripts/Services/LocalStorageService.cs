using UnityEngine;
using System.Threading.Tasks;

public class LocalStorageService : IStorageService
{
    public Task SaveData<T>(string key, T data)
    {
        string json = JsonUtility.ToJson(data);
        PlayerPrefs.SetString(key, json);
        PlayerPrefs.Save();
        return Task.CompletedTask;
    }

    public Task<T> LoadData<T>(string key)
    {
        if (PlayerPrefs.HasKey(key))
        {
            string json = PlayerPrefs.GetString(key);
            T data = JsonUtility.FromJson<T>(json);
            return Task.FromResult(data);
        }
        return Task.FromResult(default(T));
    }

    public Task<bool> HasKey(string key)
    {
        return Task.FromResult(PlayerPrefs.HasKey(key));
    }

    public Task DeleteData(string key)
    {
        PlayerPrefs.DeleteKey(key);
        return Task.CompletedTask;
    }
}