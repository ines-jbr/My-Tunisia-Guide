namespace TourismAPI.Services;

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IConfiguration config,
        ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendVerificationCodeAsync(
        string toEmail,
        string toName,
        string code)
    {
        try
        {
            var host     = _config["Email:Host"]!;
            var port     = int.Parse(_config["Email:Port"]!);
            var username = _config["Email:Username"]!;
            var password = _config["Email:Password"]!;
            var from     = _config["Email:From"]!;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                "My Tunisia Guide", from));
            message.To.Add(new MailboxAddress(
                toName, toEmail));
            message.Subject =
                $"🇹🇳 Votre code de vérification : {code}";

            message.Body = new TextPart("html")
            {
                Text = $"""
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;
                             background:#0A0A0B;
                             color:#EAE6DD;
                             padding:40px;">
                  <div style="max-width:480px;
                              margin:auto;
                              background:#111113;
                              border:1px solid #252529;
                              border-radius:16px;
                              padding:32px;
                              text-align:center;">

                    <h1 style="color:#C8A96E;
                               font-size:1.5rem;
                               margin-bottom:8px;">
                      🇹🇳 My Tunisia Guide
                    </h1>

                    <p style="color:#A09890;
                              font-size:0.9rem;
                              margin-bottom:24px;">
                      Bonjour {toName}, voici votre code
                      de vérification :
                    </p>

                    <div style="background:#18181C;
                                border:2px solid #C8A96E;
                                border-radius:12px;
                                padding:24px;
                                margin:24px 0;">
                      <span style="font-size:2.5rem;
                                   font-weight:800;
                                   letter-spacing:12px;
                                   color:#C8A96E;">
                        {code}
                      </span>
                    </div>

                    <p style="color:#5A5650;
                              font-size:0.8rem;">
                      ⏱️ Ce code expire dans
                      <strong>10 minutes</strong>
                    </p>

                    <p style="color:#5A5650;
                              font-size:0.75rem;
                              margin-top:16px;">
                      Si vous n'avez pas demandé ce code,
                      ignorez cet email.
                    </p>
                  </div>
                </body>
                </html>
                """
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                host, port,
                SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation(
                "✅ Email envoyé à {email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex, "❌ Erreur envoi email");
            return false;
        }
    }
}