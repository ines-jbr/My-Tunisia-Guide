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
        string ragContext = "")
    {
        var sb = new StringBuilder();

        // Instruction stricte
        sb.AppendLine("""
            Tu es un assistant touristique expert en Tunisie.
            Réponds UNIQUEMENT avec ce JSON sur UNE SEULE LIGNE :
            {"text":"réponse","hasGeo":true,"places":["nom1"]}
            AUCUN commentaire. AUCUNE explication. JSON UNIQUEMENT.
            """);

        // Contexte RAG
        if (!string.IsNullOrEmpty(ragContext))
        {
            sb.AppendLine("\nCONTEXTE DOCUMENTAIRE:");
            sb.AppendLine(ragContext[..Math.Min(ragContext.Length, 500)]);
        }

        // Lieux disponibles — version simplifiée
        if (places.Any())
        {
            sb.AppendLine("\nLIEUX DISPONIBLES:");
            foreach (var p in places.Take(10))
                sb.AppendLine($"{p.Name} | {p.Type} | {p.Region}");
        }

        // Question
        sb.AppendLine($"\nQUESTION: {userQuestion}");
        sb.AppendLine("\nRéponds UNIQUEMENT avec le JSON demandé:");

        return sb.ToString();
    }
}