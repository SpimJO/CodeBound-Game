using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Central manager for all object pools
/// Performance optimization - avoid Instantiate/Destroy
/// </summary>
public class PoolManager : MonoBehaviour
{
    private static PoolManager _instance;
    public static PoolManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject go = new GameObject("PoolManager");
                _instance = go.AddComponent<PoolManager>();
                DontDestroyOnLoad(go);
            }
            return _instance;
        }
    }
    
    [Header("Prefab References")]
    public GameObject tokenPrefab;
    public GameObject particleSparkle;
    public GameObject particleCollect;
    public GameObject particleCodeSuccess;
    
    [Header("Pool Sizes")]
    [SerializeField] private int tokenPoolSize = 50;
    [SerializeField] private int particlePoolSize = 30;
    
    private Dictionary<string, ObjectPool> pools = new Dictionary<string, ObjectPool>();
    
    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        _instance = this;
        DontDestroyOnLoad(gameObject);
        
        InitializePools();
    }
    
    private void InitializePools()
    {
        // Token pool
        if (tokenPrefab != null)
        {
            CreatePool("Token", tokenPrefab, tokenPoolSize, 200);
        }
        
        // Particle pools
        if (particleSparkle != null)
        {
            CreatePool("ParticleSparkle", particleSparkle, particlePoolSize, 100);
        }
        
        if (particleCollect != null)
        {
            CreatePool("ParticleCollect", particleCollect, particlePoolSize, 100);
        }
        
        if (particleCodeSuccess != null)
        {
            CreatePool("ParticleCodeSuccess", particleCodeSuccess, 10, 20);
        }
        
        Debug.Log($"PoolManager initialized with {pools.Count} pools");
    }
    
    /// <summary>
    /// Create a new object pool
    /// </summary>
    public ObjectPool CreatePool(string poolName, GameObject prefab, int initialSize, int maxSize)
    {
        if (pools.ContainsKey(poolName))
        {
            Debug.LogWarning($"Pool {poolName} already exists!");
            return pools[poolName];
        }
        
        GameObject poolObj = new GameObject($"Pool_{poolName}");
        poolObj.transform.SetParent(transform);
        
        ObjectPool pool = poolObj.AddComponent<ObjectPool>();
        // Configure pool via reflection since fields are private
        var prefabField = pool.GetType().GetField("prefab", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var sizeField = pool.GetType().GetField("initialSize", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var maxField = pool.GetType().GetField("maxSize", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        
        prefabField?.SetValue(pool, prefab);
        sizeField?.SetValue(pool, initialSize);
        maxField?.SetValue(pool, maxSize);
        
        pools[poolName] = pool;
        return pool;
    }
    
    /// <summary>
    /// Spawn token from pool
    /// </summary>
    public GameObject SpawnToken(Vector3 position)
    {
        if (pools.TryGetValue("Token", out ObjectPool pool))
        {
            return pool.Get(position, Quaternion.identity);
        }
        
        Debug.LogError("Token pool not found!");
        return null;
    }
    
    /// <summary>
    /// Spawn particle effect from pool
    /// </summary>
    public GameObject SpawnParticle(string particleType, Vector3 position)
    {
        string poolName = $"Particle{particleType}";
        
        if (pools.TryGetValue(poolName, out ObjectPool pool))
        {
            return pool.Get(position, Quaternion.identity);
        }
        
        Debug.LogWarning($"Particle pool {poolName} not found!");
        return null;
    }
    
    /// <summary>
    /// Return object to its pool
    /// </summary>
    public void ReturnToPool(GameObject obj, string poolName)
    {
        if (pools.TryGetValue(poolName, out ObjectPool pool))
        {
            pool.ReturnToPool(obj);
        }
    }
    
    /// <summary>
    /// Return token to pool
    /// </summary>
    public void ReturnToken(GameObject token)
    {
        ReturnToPool(token, "Token");
    }
    
    /// <summary>
    /// Return particle to pool
    /// </summary>
    public void ReturnParticle(GameObject particle, string particleType)
    {
        ReturnToPool(particle, $"Particle{particleType}");
    }
    
    /// <summary>
    /// Clear all pools (for level transitions)
    /// </summary>
    public void ClearAllPools()
    {
        foreach (var pool in pools.Values)
        {
            pool.ReturnAll();
        }
    }
    
    /// <summary>
    /// Get pool statistics for debugging
    /// </summary>
    public void LogPoolStats()
    {
        Debug.Log("=== POOL STATISTICS ===");
        foreach (var kvp in pools)
        {
            kvp.Value.GetStats(out int total, out int active, out int available);
            Debug.Log($"{kvp.Key}: Total={total}, Active={active}, Available={available}");
        }
    }
}
