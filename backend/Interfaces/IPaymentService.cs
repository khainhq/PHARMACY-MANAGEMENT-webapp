using System.Text.Json;

public interface IPaymentService
{
    Task<IResult> GetListAsync();
    Task<IResult> GetByIdAsync(string id);
    Task<IResult> CreateAsync(Payment payment, string route);
    Task<IResult> UpdateAsync(string id, Payment input);
    Task<IResult> PatchAsync(string id, JsonElement patch);
    Task<IResult> DeleteAsync(string id);
}
