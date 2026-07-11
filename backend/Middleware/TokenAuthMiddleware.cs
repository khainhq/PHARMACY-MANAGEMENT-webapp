public sealed class TokenAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TokenStore tokens)
    {
        var header = context.Request.Headers.Authorization.ToString();
        if (header.StartsWith("Token ", StringComparison.OrdinalIgnoreCase) && tokens.TryGet(header[6..], out var session))
        {
            context.Items["Session"] = session;
        }

        await next(context);
    }
}
