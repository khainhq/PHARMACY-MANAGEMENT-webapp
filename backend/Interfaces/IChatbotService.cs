using System.Text.Json;

public interface IChatbotService
{
    Task<IResult> ReplyAsync(JsonElement body, IWebHostEnvironment environment);
}
