using System.Text.Json;

public interface IInvoiceService
{
    Task<IResult> GetListAsync();
    Task<IResult> GetByIdAsync(int id);
    Task<IResult> CreateAsync(Invoice invoice, string route);
    Task<IResult> UpdateAsync(int id, Invoice input);
    Task<IResult> PatchAsync(int id, JsonElement patch);
    Task<IResult> DeleteAsync(int id);
}
