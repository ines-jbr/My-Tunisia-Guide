namespace TourismAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using TourismAPI.Models;
using TourismAPI.Services;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly OrchestratorService _orchestrator;
    private readonly ILogger<ChatController> _logger;

    public ChatController(
        OrchestratorService orchestrator,
        ILogger<ChatController> logger)
    {
        _orchestrator = orchestrator;
        _logger = logger;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage(
        [FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Le message est vide." });

        try
        {
            var response = await _orchestrator.ProcessAsync(request.Message);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur orchestrateur");
            return StatusCode(500, new ChatResponse
            {
                Error = "Erreur interne du serveur."
            });
        }
    }

    [HttpGet("health")]
    public IActionResult Health() =>
        Ok(new { status = "ok", timestamp = DateTime.UtcNow });
}