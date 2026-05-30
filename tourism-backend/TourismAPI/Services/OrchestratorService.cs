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

    public async Task<ChatResponse> ProcessAsync(string userMessage)
    {
        _logger.LogInformation("📩 Message : {msg}", userMessage);

        // ── Cache
        var cached = await _cache.GetAsync(userMessage);
        if (cached != null)
        {
            cached.FromCache = true;
            _logger.LogInformation("⚡ Réponse depuis cache !");
            return cached;
        }

        // ── RAG
        var ragContext = await _rag.GetContextAsync(userMessage);

        // ── Détecter type, région et événement
        var type    = DetectType(userMessage);
        var region  = DetectRegion(userMessage);
        var isEvent = DetectIsEvent(userMessage);

        _logger.LogInformation(
            "🔎 Type: {type} | Région: {region} | Event: {evt}",
            type ?? "tous", region ?? "toutes", isEvent);

        // ── Filtrer lieux
        var places = _data.FilterPlaces(
            type:   isEvent ? null : type,
            region: region,
            limit:  15);

        if (!places.Any())
            places = _data.FilterPlaces(limit: 15);

        // ── Filtrer événements
        var events = isEvent
            ? _data.FilterEvents(type, region, limit: 10)
            : new List<EventRecord>();

        // ── Contexte culturel région
        var culturalContext = region != null
            ? _data.GetCulturalContext(region)
            : "";

        // ── Construire prompt
        var prompt = PromptBuilder.Build(
            userMessage,
            places,
            _data.CulturalKnowledge,
            ragContext,
            events,
            culturalContext);

        // ── Gemini
        var result = await _llm.AskAsync(prompt);

        // ── GeoJSON lieux
        var geoJson = _geo.GetGeoJson(userMessage, result.Places);

        // ── GeoJSON événements si pertinent
        if (isEvent && events.Any() && geoJson == null)
            geoJson = BuildEventsGeoJson(events);

        var response = new ChatResponse
        {
            Text      = result.Text,
            GeoJson   = geoJson,
            FromCache = false,
            Error     = result.Error
        };

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

        if (msg.Contains("festival") ||
            msg.Contains("concert") ||
            msg.Contains("spectacle"))
            return "festival";

        return null;
    }

    private static string? DetectRegion(string message)
    {
        var regions = new[]
        {
            "Tunis", "Sfax", "Sousse", "Djerba",
            "Hammamet", "Monastir", "Bizerte",
            "Kairouan", "Nabeul", "Gabès",
            "Médenine", "Medenine", "Tozeur",
            "Tabarka", "Mahdia", "Zaghouan",
            "Béja", "Beja", "Jendouba", "Siliana",
            "Sidi Bou Said", "La Marsa", "Carthage"
        };

        foreach (var r in regions)
            if (message.Contains(
                r, StringComparison.OrdinalIgnoreCase))
                return r;

        return null;
    }

    private static bool DetectIsEvent(string message)
    {
        var msg = message.ToLower();
        return msg.Contains("festival")    ||
               msg.Contains("événement")   ||
               msg.Contains("evenement")   ||
               msg.Contains("concert")     ||
               msg.Contains("cinéma")      ||
               msg.Contains("cinema")      ||
               msg.Contains("exposition")  ||
               msg.Contains("spectacle")   ||
               msg.Contains("agenda")      ||
               msg.Contains("programme");
    }

    private static object BuildEventsGeoJson(
        List<EventRecord> events)
    {
        return new
        {
            type     = "FeatureCollection",
            features = events
                .Where(e => e.Latitude != 0)
                .Select(e => new
                {
                    type     = "Feature",
                    geometry = new
                    {
                        type        = "Point",
                        coordinates = new[] { e.Longitude, e.Latitude }
                    },
                    properties = new
                    {
                        name     = e.Name,
                        type     = "event",
                        category = e.Category,
                        venue    = e.Venue,
                        date     = e.StartDate,
                        region   = e.Region
                    }
                }).ToList()
        };
    }
}