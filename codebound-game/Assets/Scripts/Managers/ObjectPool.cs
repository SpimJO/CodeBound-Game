using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Generic Object Pool for performance optimization
/// Reuses objects instead of Instantiate/Destroy
/// </summary>
public class ObjectPool : MonoBehaviour
{
    [Header("Pool Settings")]
    [SerializeField] private GameObject prefab;
    [SerializeField] private int initialSize = 20;
    [SerializeField] private int maxSize = 100;
    [SerializeField] private bool autoExpand = true;
    
    private Queue<GameObject> availableObjects = new Queue<GameObject>();
    private List<GameObject> allObjects = new List<GameObject>();
    private Transform poolParent;
    
    private void Awake()
    {
        // Create parent container for organization
        poolParent = new GameObject($"{prefab.name}_Pool").transform;
        poolParent.SetParent(transform);
        
        // Pre-instantiate initial objects
        for (int i = 0; i < initialSize; i++)
        {
            CreateNewObject();
        }
    }
    
    private GameObject CreateNewObject()
    {
        if (!autoExpand && allObjects.Count >= maxSize)
        {
            Debug.LogWarning($"Pool for {prefab.name} has reached max size {maxSize}");
            return null;
        }
        
        GameObject obj = Instantiate(prefab, poolParent);
        obj.SetActive(false);
        allObjects.Add(obj);
        availableObjects.Enqueue(obj);
        
        return obj;
    }
    
    /// <summary>
    /// Get object from pool
    /// </summary>
    public GameObject Get(Vector3 position, Quaternion rotation)
    {
        GameObject obj;
        
        if (availableObjects.Count > 0)
        {
            obj = availableObjects.Dequeue();
        }
        else
        {
            obj = CreateNewObject();
            if (obj == null) return null;
        }
        
        obj.transform.position = position;
        obj.transform.rotation = rotation;
        obj.SetActive(true);
        
        return obj;
    }
    
    /// <summary>
    /// Return object to pool
    /// </summary>
    public void ReturnToPool(GameObject obj)
    {
        if (obj == null) return;
        
        obj.SetActive(false);
        obj.transform.SetParent(poolParent);
        availableObjects.Enqueue(obj);
    }
    
    /// <summary>
    /// Return all active objects to pool
    /// </summary>
    public void ReturnAll()
    {
        foreach (GameObject obj in allObjects)
        {
            if (obj.activeInHierarchy)
            {
                ReturnToPool(obj);
            }
        }
    }
    
    /// <summary>
    /// Get pool statistics
    /// </summary>
    public void GetStats(out int total, out int active, out int available)
    {
        total = allObjects.Count;
        available = availableObjects.Count;
        active = total - available;
    }
}
