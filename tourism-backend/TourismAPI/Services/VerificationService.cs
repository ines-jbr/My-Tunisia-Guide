namespace TourismAPI.Services;

public class VerificationService
{
    // Stockage temporaire des codes
    // clé = email, valeur = (code, expiration)
    private static readonly Dictionary<string,
        (string Code, DateTime Expiry)> _codes = new();

    private readonly ILogger<VerificationService> _logger;

    public VerificationService(
        ILogger<VerificationService> logger)
    {
        _logger = logger;
    }

    // Générer et stocker un code
    public string GenerateCode(string email)
    {
        var code = new Random()
            .Next(100000, 999999)
            .ToString();

        _codes[email] = (code, DateTime.Now.AddMinutes(10));

        _logger.LogInformation(
            "🔑 Code généré pour {email}", email);

        return code;
    }

    // Vérifier le code
    public bool VerifyCode(string email, string code)
    {
        if (!_codes.TryGetValue(email, out var entry))
            return false;

        if (DateTime.Now > entry.Expiry)
        {
            _codes.Remove(email);
            return false;
        }

        if (entry.Code != code)
            return false;

        _codes.Remove(email);
        return true;
    }
}