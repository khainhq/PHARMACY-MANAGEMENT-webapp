using System.Collections.Concurrent;
using System.Security.Cryptography;

public sealed class TokenStore
{
    private readonly ConcurrentDictionary<string, Session> _tokens = new();

    public string Create(int accountID, string username, string role)
    {
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        _tokens[token] = new Session(accountID, username, role);
        return token;
    }

    public bool TryGet(string token, out Session session) => _tokens.TryGetValue(token, out session!);
    public void Remove(string token) => _tokens.TryRemove(token, out _);
}
