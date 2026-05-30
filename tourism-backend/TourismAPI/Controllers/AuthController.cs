namespace TourismAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using TourismAPI.Models;
using TourismAPI.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly EmailService _email;
    private readonly VerificationService _verify;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        EmailService email,
        VerificationService verify,
        ILogger<AuthController> logger)
    {
        _email  = email;
        _verify = verify;
        _logger = logger;
    }

    // POST api/auth/send-code
    [HttpPost("send-code")]
    public async Task<IActionResult> SendCode(
        [FromBody] SendCodeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Email invalide."
            });

        var code = _verify.GenerateCode(request.Email);
        var sent = await _email
            .SendVerificationCodeAsync(
                request.Email,
                request.Name,
                code);

        if (!sent)
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "Erreur envoi email."
            });

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Code envoyé !"
        });
    }

    // POST api/auth/verify-code
    [HttpPost("verify-code")]
    public IActionResult VerifyCode(
        [FromBody] VerifyCodeRequest request)
    {
        var valid = _verify.VerifyCode(
            request.Email, request.Code);

        if (!valid)
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Code incorrect ou expiré."
            });

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Code vérifié !"
        });
    }
}