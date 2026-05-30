namespace TourismAPI.Services;

using System.Text;
using System.Text.Json;
using TourismAPI.Models;

public static class PromptBuilder
{
    public static string Build(
        string userQuestion,
        List<PlaceRecord> places,
        JsonElement culturalKnowledge,
        string ragContext        = "",
        List<EventRecord>? events = null,
        string culturalContext   = "")
    {
        var sb = new StringBuilder();

        // Instruction simple et claire
        sb.AppendLine("Tu es un guide touristique expert en Tunisie.");
        sb.AppendLine("Réponds en JSON sur une seule ligne :");
        sb.AppendLine("{\"text\":\"ta réponse\",\"hasGeo\":true,\"places\":[\"nom1\"]}");
        sb.AppendLine("Règle : JSON uniquement, rien d'autre.");
        sb.AppendLine();

        // Lieux — max 8
        if (places.Any())
        {
            sb.AppendLine("Lieux disponibles :");
            foreach (var p in places.Take(8))
                sb.AppendLine($"- {p.Name} ({p.Type}, {p.Region})");
            sb.AppendLine();
        }

        // Événements — max 5
        if (events != null && events.Any())
        {
            sb.AppendLine("Événements :");
            foreach (var e in events.Take(5))
                sb.AppendLine($"- {e.Name} ({e.Category}, {e.StartDate})");
            sb.AppendLine();
        }

        // RAG — max 200 chars
        if (!string.IsNullOrEmpty(ragContext))
        {
            sb.AppendLine("Contexte :");
            sb.AppendLine(ragContext[..Math.Min(
                ragContext.Length, 200)]);
            sb.AppendLine();
        }

        // Question
        sb.AppendLine($"Question : {userQuestion}");

        return sb.ToString();
    }
}