using System;

public class QueuedRequest
{
    public string Endpoint { get; set; }
    public string Method { get; set; }
    public object Data { get; set; }
    public string AuthToken { get; set; }
    public DateTime Timestamp { get; set; }
}