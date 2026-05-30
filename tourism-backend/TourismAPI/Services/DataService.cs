namespace TourismAPI.Services;

using System.Globalization;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;
using TourismAPI.Models;

public class DataService
{
    private readonly ILogger<DataService> _logger;
    private readonly string _dataPath;

    public List<PlaceRecord> Places { get; private set; } = new();
    public List<EventRecord> Events { get; private set; } = new();
    public JsonElement CulturalKnowledge { get; private set; }
    public JsonElement EventsData { get; private set; }

    public DataService(
        ILogger<DataService> logger,
        IWebHostEnvironment env)
    {
        _logger   = logger;
        _dataPath = Path.Combine(env.ContentRootPath, "Data");
        LoadData();
    }

    private void LoadData()
    {
        // ── CSV
        try
        {
            var csvPath   = Path.Combine(_dataPath, "2026.csv");
            var csvConfig = new CsvConfiguration(
                CultureInfo.InvariantCulture)
            {
                HasHeaderRecord   = true,
                MissingFieldFound = null,
                HeaderValidated   = null,
                PrepareHeaderForMatch = args =>
                    args.Header.ToLower(),
            };
            using var reader = new StreamReader(csvPath);
            using var csv    = new CsvReader(reader, csvConfig);
            Places = csv.GetRecords<PlaceRecord>().ToList();
            _logger.LogInformation(
                "✅ CSV chargé : {count} lieux", Places.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur CSV");
        }

        // ── cultural_knowledge.json
        try
        {
            var path = Path.Combine(
                _dataPath, "cultural_knowledge.json");
            CulturalKnowledge = JsonSerializer
                .Deserialize<JsonElement>(
                    File.ReadAllText(path));
            _logger.LogInformation(
                "✅ cultural_knowledge.json chargé");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur cultural_knowledge");
        }

        // ── events_data.json
        try
        {
            var path = Path.Combine(
                _dataPath, "events_data.json");
            EventsData = JsonSerializer
                .Deserialize<JsonElement>(
                    File.ReadAllText(path));

            // Parser les événements
            Events = ParseEvents(EventsData);
            _logger.LogInformation(
                "✅ events_data.json chargé : {count} événements",
                Events.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur events_data");
        }
    }

    private static List<EventRecord> ParseEvents(
        JsonElement eventsData)
    {
        var events = new List<EventRecord>();
        try
        {
            var regions = eventsData
                .GetProperty("regions");

            foreach (var region in regions.EnumerateObject())
            {
                var regionName = region.Name;
                if (!region.Value.TryGetProperty(
                    "events", out var evtArray))
                    continue;

                foreach (var evt in evtArray.EnumerateArray())
                {
                    events.Add(new EventRecord
                    {
                        Id          = GetStr(evt, "id"),
                        Name        = GetStr(evt, "name"),
                        Description = GetStr(evt, "description"),
                        Category    = GetStr(evt, "category"),
                        Subcategory = GetStr(evt, "subcategory"),
                        Venue       = GetStr(evt, "venue"),
                        Address     = GetStr(evt, "address"),
                        Latitude    = GetDbl(evt, "latitude"),
                        Longitude   = GetDbl(evt, "longitude"),
                        StartDate   = GetStr(evt, "start_date"),
                        EndDate     = GetStr(evt, "end_date"),
                        Region      = regionName
                    });
                }
            }
        }
        catch { /* structure différente → ignorer */ }
        return events;
    }

    private static string GetStr(JsonElement el, string key)
    {
        return el.TryGetProperty(key, out var v)
               ? v.GetString() ?? "" : "";
    }

    private static double GetDbl(JsonElement el, string key)
    {
        return el.TryGetProperty(key, out var v)
               ? v.GetDouble() : 0.0;
    }

    // ── Filtrer lieux
    public List<PlaceRecord> FilterPlaces(
        string? type   = null,
        string? region = null,
        int     limit  = 10)
    {
        var query = Places.AsEnumerable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(p =>
                p.Type.Contains(
                    type, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(region))
            query = query.Where(p =>
                p.Region.Contains(
                    region, StringComparison.OrdinalIgnoreCase));

        return query.Take(limit).ToList();
    }

    // ── Filtrer événements
    public List<EventRecord> FilterEvents(
        string? category = null,
        string? region   = null,
        int     limit    = 10)
    {
        var query = Events.AsEnumerable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e =>
                e.Category.Contains(
                    category,
                    StringComparison.OrdinalIgnoreCase) ||
                e.Subcategory.Contains(
                    category,
                    StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(region))
            query = query.Where(e =>
                e.Region.Contains(
                    region,
                    StringComparison.OrdinalIgnoreCase));

        return query.Take(limit).ToList();
    }

    // ── Contexte culturel pour une région
    public string GetCulturalContext(string region)
    {
        try
        {
            if (CulturalKnowledge.TryGetProperty(
                "regions", out var regions) &&
                regions.TryGetProperty(region, out var r))
            {
                return r.ToString()[..Math.Min(
                    r.ToString().Length, 800)];
            }
        }
        catch { }
        return "";
    }
}