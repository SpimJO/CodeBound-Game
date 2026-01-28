using System;

public class CircuitBreaker
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _timeout;
    private int _failureCount;
    private DateTime _lastFailureTime;
    private bool _isOpen;

    public CircuitBreaker(int failureThreshold, TimeSpan timeout)
    {
        _failureThreshold = failureThreshold;
        _timeout = timeout;
        _failureCount = 0;
        _isOpen = false;
    }

    public bool IsOpen
    {
        get
        {
            if (_isOpen && DateTime.Now - _lastFailureTime > _timeout)
            {
                // Half-open state
                _isOpen = false;
                _failureCount = 0;
            }
            return _isOpen;
        }
    }

    public void RecordSuccess()
    {
        _failureCount = 0;
        _isOpen = false;
    }

    public void RecordFailure()
    {
        _failureCount++;
        _lastFailureTime = DateTime.Now;
        if (_failureCount >= _failureThreshold)
        {
            _isOpen = true;
        }
    }
}