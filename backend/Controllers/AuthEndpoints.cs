using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
    private static void MapAuthEndpoints(WebApplication app)
    {
        app.MapPost("/api/auth/login/", async (LoginRequest request, PharmacyDbContext db, TokenStore tokens) =>
        {
            var account = await db.Accounts.Include(a => a.Role).FirstOrDefaultAsync(a => a.Username == request.username);
            if (account is null || !account.IsActive || !BCrypt.Net.BCrypt.Verify(request.password, account.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var token = tokens.Create(account.AccountID, account.Username, account.Role.RoleName);
            return Results.Ok(new { token, username = account.Username, role = account.Role.RoleName });
        }).WithTags("Authentication").WithOpenApi();

        app.MapPost("/api/auth/logout/", (HttpContext context, TokenStore tokens) =>
        {
            var token = context.Request.Headers.Authorization.ToString().Replace("Token ", "", StringComparison.OrdinalIgnoreCase);
            tokens.Remove(token);
            return Results.Ok(new { message = "Dang xuat thanh cong" });
        }).RequireToken().WithTags("Authentication").WithOpenApi();

        app.MapGet("/api/auth/me/", async (HttpContext context, PharmacyDbContext db) =>
        {
            var session = context.GetSession()!;
            var account = await db.Accounts.Include(a => a.Role).Include(a => a.Employee).FirstAsync(a => a.AccountID == session.AccountID);
            return Results.Ok(new { username = account.Username, role = account.Role.RoleName, employee = account.Employee });
        }).RequireToken().WithTags("Authentication").WithOpenApi();

        app.MapPost("/api/auth/reset-password/", async (ResetPasswordRequest request, PharmacyDbContext db) =>
        {
            var account = await db.Accounts.FirstOrDefaultAsync(a => a.Username == request.username);
            if (account is null) return Results.NotFound(new { error = "Tai khoan khong ton tai" });
            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.new_password);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Mat khau da duoc dat lai" });
        }).RequireToken().WithTags("Authentication").WithOpenApi();

        MapCrud<Role, int>(app, "/api/auth/roles/", db => db.Roles, x => x.RoleID, tag: "Authentication");
        MapEmployeeEndpoints(app);
        MapCrud<Account, int>(app, "/api/auth/accounts/", db => db.Accounts, x => x.AccountID, NormalizeAccount, ValidateAccountAsync, "Authentication");
    }
}
