namespace TourismAPI.Services;

using System.Text.Json;
using TourismAPI.Models;

public class GeoService
{
    private readonly DataService _data;
    private readonly ILogger<GeoService> _logger;

    public GeoService(
        DataService data,
        ILogger<GeoService> logger)
    {
        _data   = data;
        _logger = logger;
    }

    public object? GetGeoJson(
        string userMessage,
        List<string> mentionedPlaces)
    {
        try
        {
            // Détecter le type depuis le message
            var type   = DetectType(userMessage);
            var region = DetectRegion(userMessage);

            // Filtrer les lieux
            var places = _data.FilterPlaces(
                type:   type,
                region: region,
                limit:  20);

            // Si des lieux sont mentionnés par Gemini → priorité
            if (mentionedPlaces.Any())
            {
                var mentioned = _data.Places
                    .Where(p => mentionedPlaces
                        .Any(m => p.Name.Contains(
                            m, StringComparison.OrdinalIgnoreCase)))
                    .Take(20)
                    .ToList();

                if (mentioned.Any())
                    places = mentioned;
            }

            if (!places.Any())
                return null;

            _logger.LogInformation(
                "🗺️ GeoJSON : {count} lieux", places.Count);

            // Construire GeoJSON
            return BuildGeoJson(places);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur GeoService");
            return null;
        }
    }

    private static string? DetectType(string message)
    {
        var msg = message.ToLower();
        if (msg.Contains("hôtel") || msg.Contains("hotel"))
            return "hotel";
        if (msg.Contains("restaurant") || msg.Contains("manger"))
            return "restaurant";
        if (msg.Contains("musée") || msg.Contains("musee"))
            return "museum";
        if (msg.Contains("plage") || msg.Contains("beach"))
            return "beach";
        if (msg.Contains("site") || msg.Contains("archéo"))
            return "archaeological_site";
        return null;
    }

    private static string? DetectRegion(string message)
    {
        var regions = new[]
        {
            "Tunis", "Sfax", "Sousse", "Djerba",
            "Hammamet", "Monastir", "Bizerte",
            "Kairouan", "Nabeul", "Gabès"
        };

        foreach (var region in regions)
            if (message.Contains(
                region, StringComparison.OrdinalIgnoreCase))
                return region;

        return null;
    }

    private static object BuildGeoJson(List<PlaceRecord> places)
    {
        return new
        {
            type     = "FeatureCollection",
            features = places.Select(p => new
            {
                type     = "Feature",
                geometry = new
                {
                    type        = "Point",
                    coordinates = new[]
                    {
                        p.Longitude,
                        p.Latitude
                    }
                },
                properties = new
                {
                    name    = p.Name,
                    type    = p.Type,
                    region  = p.Region,
                    phone   = p.Phone,
                    website = p.Website
                }
            }).ToList()
        };
    }
}