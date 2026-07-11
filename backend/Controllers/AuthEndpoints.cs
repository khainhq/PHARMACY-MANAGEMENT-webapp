public static partial class PharmacyEndpoints
{
    private static void MapAuthEndpoints(WebApplication app)
    {
        app.MapPost("/api/auth/login/", async (LoginRequest request, IAuthService authService) =>
            await authService.LoginAsync(request)).WithTags("Authentication").WithOpenApi();

        app.MapPost("/api/auth/logout/", (HttpContext context, IAuthService authService) =>
            authService.Logout(context)).RequireToken().WithTags("Authentication").WithOpenApi();

        app.MapGet("/api/auth/me/", async (HttpContext context, IAuthService authService) =>
            await authService.GetCurrentUserAsync(context)).RequireToken().WithTags("Authentication").WithOpenApi();

        app.MapPost("/api/auth/reset-password/", async (ResetPasswordRequest request, IAuthService authService) =>
            await authService.ResetPasswordAsync(request)).RequireToken().WithTags("Authentication").WithOpenApi();

        MapCrud<Role, int>(app, "/api/auth/roles/", db => db.Roles, x => x.RoleID, tag: "Authentication");
        MapEmployeeEndpoints(app);
        MapCrud<Account, int>(
            app,
            "/api/auth/accounts/",
            db => db.Accounts,
            x => x.AccountID,
            EntityValidation.NormalizeAccount,
            EntityValidation.ValidateAccountAsync,
            "Authentication");
    }
}
