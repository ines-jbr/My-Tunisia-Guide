namespace TourismAPI.Services;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using StackExchange.Redis;
using TourismAPI.Models;

public class CacheService
{
    private readonly IDatabase _db;
    private readonly ILogger<CacheService> _logger;
    private readonly TimeSpan _ttl = TimeSpan.FromHours(1);

    public CacheService(
        IConfiguration config,
        ILogger<CacheService> logger)
    {
        _logger = logger;
        var connStr = config["Redis:ConnectionString"]
                      ?? "localhost:6379";
        var redis = ConnectionMultiplexer.Connect(connStr);
        _db = redis.GetDatabase();
        _logger.LogInformation("✅ Redis connecté");
    }

    public async Task<ChatResponse?> GetAsync(string query)
    {
        try
        {
            var key  = ComputeKey(query);
            var json = await _db.StringGetAsync(key);

            if (json.IsNullOrEmpty)
                return null;

            _logger.LogInformation(
                "⚡ Cache HIT : {key}", key);

            return JsonSerializer
                .Deserialize<ChatResponse>(json!);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur cache GET");
            return null;
        }
    }

    public async Task SetAsync(
        string query, ChatResponse response)
    {
        try
        {
            var key  = ComputeKey(query);
            var json = JsonSerializer.Serialize(response);
            await _db.StringSetAsync(key, json, _ttl);

            _logger.LogInformation(
                "💾 Cache SET : {key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur cache SET");
        }
    }

    private static string ComputeKey(string query)
    {
        var bytes = SHA256.HashData(
            Encoding.UTF8.GetBytes(
                query.ToLower().Trim()));
        return "chat:" +
               Convert.ToHexString(bytes)[..16];
    }
}