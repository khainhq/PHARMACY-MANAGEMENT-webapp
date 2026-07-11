using System.Text.Json;

public static partial class PharmacyEndpoints
{
    private static void MapChatbotEndpoints(WebApplication app)
    {
        app.MapPost("/chatbot/", async (JsonElement body, IWebHostEnvironment environment, IChatbotService chatbotService) =>
            await chatbotService.ReplyAsync(body, environment)).WithTags("Chatbot").WithOpenApi();
    }
}
