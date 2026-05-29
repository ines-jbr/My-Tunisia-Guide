namespace TourismAPI.Services;

using System.Text;
using System.Text.Json;
using TourismAPI.Models;

public class LlmService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<LlmService> _logger;

    public LlmService(
        IConfiguration config,
        ILogger<LlmService> logger)
    {
        _logger = logger;
        _apiKey = config["Gemini:ApiKey"]!;
        _model  = config["Gemini:Model"] ?? "gemini-3.5-flash";
        _http   = new HttpClient();
    }

    public async Task<LlmResult> AskAsync(string prompt)
    {
        var url = $"https://generativelanguage.googleapis.com" +
                  $"/v1beta/models/{_model}:generateContent" +
                  $"?key={_apiKey}";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature     = 0.7,
                maxOutputTokens = 1024
            }
        };

        var json    = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(
            json, Encoding.UTF8, "application/json");

        _logger.LogInformation("📤 Envoi requête à Gemini...");

        var response     = await _http.PostAsync(url, content);
        var responseText = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("❌ Erreur Gemini: {err}", responseText);
            return new LlmResult
            {
                Text  = "Erreur communication avec Gemini.",
                Error = responseText
            };
        }

        // Parser réponse Gemini
        var geminiResponse = JsonSerializer
            .Deserialize<JsonElement>(responseText);

        var rawText = geminiResponse
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";

        _logger.LogInformation("📥 Réponse Gemini reçue");

        // Nettoyer la réponse
        rawText = rawText
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        // Extraire uniquement le JSON
        var jsonStart = rawText.IndexOf('{');
        var jsonEnd   = rawText.LastIndexOf('}');

        if (jsonStart >= 0 && jsonEnd >= 0)
            rawText = rawText.Substring(
                jsonStart, jsonEnd - jsonStart + 1);

        // Parser le JSON retourné par Gemini
        try
        {
            var parsed = JsonSerializer.Deserialize<JsonElement>(rawText);
            // Extraire le texte propre
            var text = parsed.TryGetProperty("text", out var t)
                       ? t.GetString() ?? rawText : rawText;

            // Nettoyer les \n dans le texte
            text = text.Replace("\\n", "\n").Trim();


            return new LlmResult
            {
                Text   = text,
                HasGeo = parsed.TryGetProperty("hasGeo", out var hg)
                         && hg.GetBoolean(),
                Places = parsed.TryGetProperty("places", out var pl)
                         ? pl.EnumerateArray()
                             .Select(p => p.GetString() ?? "")
                             .ToList()
                         : new List<string>()
            };
        }
        catch
        {
            return new LlmResult { Text = rawText };
        }
    }
}