namespace TourismAPI.Models;

public class EventRecord
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public string Subcategory { get; set; } = "";
    public string Venue { get; set; } = "";
    public string Address { get; set; } = "";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public string Region { get; set; } = "";
}