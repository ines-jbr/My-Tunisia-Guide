namespace TourismAPI.Models;

public class PlaceRecord
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Website { get; set; } = "";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Region { get; set; } = "";
}