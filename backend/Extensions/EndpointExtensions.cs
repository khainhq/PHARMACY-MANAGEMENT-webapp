public static class EndpointExtensions
{
    public static RouteHandlerBuilder RequireToken(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter((context, next) =>
        {
            var http = context.HttpContext;
            if (http.GetSession() is null) return ValueTask.FromResult<object?>(Results.Unauthorized());
            return next(context);
        });

    public static Session? GetSession(this HttpContext context) => context.Items["Session"] as Session;
}
