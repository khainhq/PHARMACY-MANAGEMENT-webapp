using Microsoft.EntityFrameworkCore;

public sealed class AuthService : IAuthService
{
    private readonly PharmacyDbContext db;
    private readonly TokenStore tokens;

    public AuthService(PharmacyDbContext db, TokenStore tokens)
    {
        this.db = db;
        this.tokens = tokens;
    }

    public async Task<IResult> LoginAsync(LoginRequest request)
    {
        var account = await db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Username == request.username);

        if (account is null || !account.IsActive || !BCrypt.Net.BCrypt.Verify(request.password, account.PasswordHash))
        {
            return Results.Unauthorized();
        }

        var token = tokens.Create(account.AccountID, account.Username, account.Role.RoleName);
        return Results.Ok(new { token, username = account.Username, role = account.Role.RoleName });
    }

    public IResult Logout(HttpContext context)
    {
        var token = context.Request.Headers.Authorization.ToString().Replace("Token ", "", StringComparison.OrdinalIgnoreCase);
        tokens.Remove(token);
        return Results.Ok(new { message = "Đăng xuất thành công" });
    }

    public async Task<IResult> GetCurrentUserAsync(HttpContext context)
    {
        var session = context.GetSession()!;
        var account = await db.Accounts
            .Include(a => a.Role)
            .Include(a => a.Employee)
            .FirstAsync(a => a.AccountID == session.AccountID);

        return Results.Ok(new { username = account.Username, role = account.Role.RoleName, employee = account.Employee });
    }

    public async Task<IResult> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Username == request.username);
        if (account is null)
        {
            return Results.NotFound(new { error = "Tài khoản không tồn tại" });
        }

        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.new_password);
        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Mật khẩu đã được đặt lại" });
    }
}
