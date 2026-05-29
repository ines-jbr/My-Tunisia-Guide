namespace TourismAPI.Models;

public class LlmResult
{
    public string Text { get; set; } = "";
    public bool HasGeo { get; set; } = false;
    public List<string> Places { get; set; } = new();
    public string? Error { get; set; }
}