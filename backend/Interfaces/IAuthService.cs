public interface IAuthService
{
    Task<IResult> LoginAsync(LoginRequest request);
    IResult Logout(HttpContext context);
    Task<IResult> GetCurrentUserAsync(HttpContext context);
    Task<IResult> ResetPasswordAsync(ResetPasswordRequest request);
}
