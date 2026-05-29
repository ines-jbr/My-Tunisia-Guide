namespace TourismAPI.Services;

using TourismAPI.Models;

public class OrchestratorService
{
    private readonly LlmService _llm;
    private readonly DataService _data;
    private readonly RagService _rag;
    private readonly CacheService _cache;
    private readonly GeoService _geo;
    private readonly ILogger<OrchestratorService> _logger;

    public OrchestratorService(
        LlmService llm,
        DataService data,
        RagService rag,
        CacheService cache,
        GeoService geo,
        ILogger<OrchestratorService> logger)
    {
        _llm    = llm;
        _data   = data;
        _rag    = rag;
        _cache  = cache;
        _geo    = geo;
        _logger = logger;
    }

    public async Task<ChatResponse> ProcessAsync(
        string userMessage)
    {
        _logger.LogInformation(
            "📩 Message : {msg}", userMessage);

        // ── Cache Redis
        var cached = await _cache.GetAsync(userMessage);
        if (cached != null)
        {
            cached.FromCache = true;
            _logger.LogInformation("⚡ Réponse depuis cache !");
            return cached;
        }

        // ── RAG
        var ragContext = await _rag.GetContextAsync(userMessage);

        // ── Détecter type et région
        var type   = DetectType(userMessage);
        var region = DetectRegion(userMessage);

        _logger.LogInformation(
            "🔎 Type: {type} | Région: {region}", 
            type ?? "tous", region ?? "toutes");

        // ── CSV filtré par type et région
        var places = _data.FilterPlaces(
            type:   type,
            region: region,
            limit:  15);

        // ── Si aucun résultat → prendre les 15 premiers
        if (!places.Any())
            places = _data.FilterPlaces(limit: 15);

        // ── Construire prompt
        var prompt = PromptBuilder.Build(
            userMessage,
            places,
            _data.CulturalKnowledge,
            ragContext);

        // ── Gemini
        var result = await _llm.AskAsync(prompt);

        // ── GeoJSON depuis CSV
        var geoJson = _geo.GetGeoJson(
            userMessage,
            result.Places);

        var response = new ChatResponse
        {
            Text      = result.Text,
            GeoJson   = geoJson,
            FromCache = false,
            Error     = result.Error
        };

        // ── Sauvegarder en cache
        await _cache.SetAsync(userMessage, response);

        return response;
    }

    private static string? DetectType(string message)
    {
        var msg = message.ToLower();

        if (msg.Contains("hôtel") ||
            msg.Contains("hotel") ||
            msg.Contains("hébergement") ||
            msg.Contains("dormir"))
            return "hotel";

        if (msg.Contains("restaurant") ||
            msg.Contains("manger") ||
            msg.Contains("dîner") ||
            msg.Contains("déjeuner") ||
            msg.Contains("cuisine"))
            return "restaurant";

        if (msg.Contains("musée") ||
            msg.Contains("musee"))
            return "museum";

        if (msg.Contains("plage") ||
            msg.Contains("beach") ||
            msg.Contains("mer"))
            return "beach";

        if (msg.Contains("site") ||
            msg.Contains("archéo") ||
            msg.Contains("ruines") ||
            msg.Contains("historique"))
            return "archaeological_site";

        if (msg.Contains("café") ||
            msg.Contains("cafe") ||
            msg.Contains("coffee"))
            return "cafe";

        return null;
    }

    private static string? DetectRegion(string message)
    {
        var regions = new[]
        {
            "Tunis",
            "Sfax",
            "Sousse",
            "Djerba",
            "Hammamet",
            "Monastir",
            "Bizerte",
            "Kairouan",
            "Nabeul",
            "Gabès",
            "Médenine",
            "Medenine",
            "Tozeur",
            "Tabarka",
            "Mahdia",
            "Zaghouan",
            "Béja",
            "Beja",
            "Jendouba",
            "Siliana",
            "Sidi Bou Said",
            "La Marsa",
            "Carthage"
        };

        foreach (var r in regions)
            if (message.Contains(
                r, StringComparison.OrdinalIgnoreCase))
                return r;

        return null;
    }
}