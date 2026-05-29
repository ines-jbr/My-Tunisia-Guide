namespace TourismAPI.Models;

public class ChatResponse
{
    public string Text { get; set; } = string.Empty;
    public object? GeoJson { get; set; }
    public bool FromCache { get; set; } = false;
    public string? Error { get; set; }
}