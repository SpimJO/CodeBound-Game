using UnityEngine.Networking;
using System.Threading.Tasks;

public class UnityWebRequestHandler : IWebRequestHandler
{
    public async Task<UnityWebRequest> SendWebRequest(UnityWebRequest request)
    {
        await request.SendWebRequest();
        return request;
    }
}