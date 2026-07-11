using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
    private static void MapChatbotEndpoints(WebApplication app)
    {
        app.MapPost("/chatbot/", async (JsonElement body, IWebHostEnvironment environment) =>
        {
            var message = body.TryGetProperty("message", out var messageProperty) ? messageProperty.GetString()?.Trim() ?? "" : "";
            if (string.IsNullOrWhiteSpace(message))
            {
                return Results.BadRequest(new { reply = "Bạn vui lòng nhập câu hỏi cần hỗ trợ." });
            }

            var guidePath = Path.Combine(environment.ContentRootPath, "Docs", "ChatbotGuide.md");
            var guide = File.Exists(guidePath) ? await File.ReadAllTextAsync(guidePath) : "";
            var offlineReply = BuildOfflineChatbotReply(message, guide);

            return Results.Ok(new { reply = offlineReply });
        }).WithTags("Chatbot").WithOpenApi();
    }
}
