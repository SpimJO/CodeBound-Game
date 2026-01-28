using UnityEngine.Networking;
using System.Threading.Tasks;

public interface IWebRequestHandler
{
    Task<UnityWebRequest> SendWebRequest(UnityWebRequest request);
}