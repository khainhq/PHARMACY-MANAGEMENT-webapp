using System.Text.Json;

public interface IEmployeeService
{
    Task<IResult> GetListAsync();
    Task<IResult> GetByIdAsync(string id);
    Task<IResult> CreateAsync(Employee employee, string route);
    Task<IResult> UpdateAsync(string id, Employee input);
    Task<IResult> PatchAsync(string id, JsonElement patch);
    Task<IResult> DeactivateAsync(string id);
}
