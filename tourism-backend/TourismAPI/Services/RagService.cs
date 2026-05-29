namespace TourismAPI.Services;
// Ajouter en haut du fichier
using Qdrant.Client;
using Qdrant.Client.Grpc;
using System.Text;
using System.Text.Json;

public class RagService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _qdrantUrl;
    private readonly string _collection;
    private readonly ILogger<RagService> _logger;

    private const string EmbedModel =
        "models/gemini-embedding-001";

    public RagService(
        IConfiguration config,
        ILogger<RagService> logger)
    {
        _logger     = logger;
        _apiKey     = config["Gemini:ApiKey"]!;
        _qdrantUrl  = $"http://{config["Qdrant:Host"]}:{config["Qdrant:Port"]}";
        _collection = config["Qdrant:Collection"] ?? "tourism_docs";
        _http       = new HttpClient();
    }

    private async Task<List<float>> GetQueryEmbeddingAsync(
        string query)
    {
        var url = $"https://generativelanguage.googleapis.com" +
                  $"/v1beta/{EmbedModel}:embedContent" +
                  $"?key={_apiKey}";

        var body = new
        {
            model   = EmbedModel,
            content = new
            {
                parts = new[] { new { text = query } }
            }
        };

        var res  = await _http.PostAsJsonAsync(url, body);
        var json = await res.Content
            .ReadFromJsonAsync<JsonElement>();

        var values = json
            .GetProperty("embedding")
            .GetProperty("values")
            .EnumerateArray()
            .Select(v => v.GetSingle())
            .ToList();

        return values;
    }

    private async Task<List<string>> SearchSimilarChunksAsync(
        List<float> queryVector, int topK = 5)
    {
        var qdrant = new QdrantClient("localhost", 6334);
        var results = await qdrant.SearchAsync(
            collectionName : _collection,
            vector         : queryVector.ToArray(),
            limit          : (ulong)topK,
            payloadSelector: true
        );

        return results
            .Select(r => r.Payload.ContainsKey("text")
                ? r.Payload["text"].StringValue
                : "")
            .Where(t => !string.IsNullOrEmpty(t))
            .ToList();
}
    public async Task<string> GetContextAsync(string query)
    {
        try
        {
            _logger.LogInformation("🔍 RAG search: {q}", query);

            var vector = await GetQueryEmbeddingAsync(query);
            var chunks = await SearchSimilarChunksAsync(vector, topK: 5);

            if (!chunks.Any())
            {
                _logger.LogWarning("⚠️ Aucun chunk trouvé");
                return "";
            }

            var context = string.Join("\n---\n", chunks);
            _logger.LogInformation(
                "✅ {count} chunks trouvés", chunks.Count);

            return context;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur RAG");
            return "";
        }
    }
}