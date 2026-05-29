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
    public JsonElement CulturalKnowledge { get; private set; }

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
        // ── Charger CSV
        try
        {
            var csvPath   = Path.Combine(_dataPath, "2026.csv");
            var csvConfig = new CsvConfiguration(
                CultureInfo.InvariantCulture)
            {
                HasHeaderRecord  = true,
                MissingFieldFound = null,
                HeaderValidated   = null,
                PrepareHeaderForMatch = args => args.Header.ToLower(),
            };
            using var reader = new StreamReader(csvPath);
            using var csv    = new CsvReader(reader, csvConfig);
            Places = csv.GetRecords<PlaceRecord>().ToList();
            _logger.LogInformation(
                "✅ CSV chargé : {count} lieux", Places.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur chargement CSV");
        }

        // ── Charger JSON culturel
        try
        {
            var jsonPath = Path.Combine(
                _dataPath, "cultural_knowledge.json");
            var jsonText = File.ReadAllText(jsonPath);
            CulturalKnowledge = JsonSerializer
                .Deserialize<JsonElement>(jsonText);
            _logger.LogInformation(
                "✅ cultural_knowledge.json chargé");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur chargement JSON");
        }
    }

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
}