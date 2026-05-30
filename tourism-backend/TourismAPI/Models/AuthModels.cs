namespace TourismAPI.Models;

public class SendCodeRequest
{
    public string Name  { get; set; } = "";
    public string Email { get; set; } = "";
}

public class VerifyCodeRequest
{
    public string Name     { get; set; } = "";
    public string Email    { get; set; } = "";
    public string Password { get; set; } = "";
    public string Code     { get; set; } = "";
}

public class AuthResponse
{
    public bool   Success { get; set; }
    public string Message { get; set; } = "";
}