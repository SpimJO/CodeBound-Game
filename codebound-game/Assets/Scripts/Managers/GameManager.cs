using UnityEngine;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    private static GameManager _instance;
    public static GameManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<GameManager>();
                if (_instance == null)
                {
                    GameObject go = new GameObject("GameManager");
                    _instance = go.AddComponent<GameManager>();
                    DontDestroyOnLoad(go);
                }
            }
            return _instance;
        }
    }

    // Service dependencies
    public IAPIService APIService { get; private set; }
    public IStorageService StorageService { get; private set; }
    public IAchievementService AchievementService { get; private set; }
    public IAnalyticsService AnalyticsService { get; private set; }

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);
        InitializeServices();
    }

    private void InitializeServices()
    {
        APIService = new APIService(new UnityWebRequestHandler());
        StorageService = new LocalStorageService();
        AchievementService = new AchievementService(APIService);
        AnalyticsService = new AnalyticsService();
    }
}