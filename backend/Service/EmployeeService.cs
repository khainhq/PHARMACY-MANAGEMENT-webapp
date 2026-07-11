using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

public sealed class EmployeeService : IEmployeeService
{
    private readonly PharmacyDbContext db;

    public EmployeeService(PharmacyDbContext db)
    {
        this.db = db;
    }

    public async Task<IResult> GetListAsync()
    {
        var employees = await db.Employees
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenByDescending(x => x.HireDate)
            .ThenBy(x => x.FullName)
            .ToListAsync();

        return Results.Ok(employees);
    }

    public async Task<IResult> GetByIdAsync(string id)
    {
        var employee = await db.Employees.FindAsync(id);
        return employee is null ? Results.NotFound() : Results.Ok(employee);
    }

    public async Task<IResult> CreateAsync(Employee employee, string route)
    {
        employee.IsActive = true;
        employee.ResignationDate = null;

        var validationResult = await EntityValidation.ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        db.Employees.Add(employee);
        return await SaveEmployeeChangesAsync(() => Results.Created(route, employee));
    }

    public async Task<IResult> UpdateAsync(string id, Employee input)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        CopyEmployeeValues(employee, input);
        var validationResult = await EntityValidation.ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        return await SaveEmployeeChangesAsync(() => Results.Ok(employee));
    }

    public async Task<IResult> PatchAsync(string id, JsonElement patch)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        ApplyPatch(employee, patch);
        var validationResult = await EntityValidation.ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        return await SaveEmployeeChangesAsync(() => Results.Ok(employee));
    }

    public async Task<IResult> DeactivateAsync(string id)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        employee.IsActive = false;
        employee.ResignationDate ??= DateTime.UtcNow.Date;

        var accounts = await db.Accounts.Where(x => x.EmployeeID == id).ToListAsync();
        foreach (var account in accounts)
        {
            account.IsActive = false;
        }

        await db.SaveChangesAsync();
        return Results.Ok(employee);
    }

    private static void CopyEmployeeValues(Employee employee, Employee input)
    {
        employee.FullName = input.FullName;
        employee.PhoneNumber = input.PhoneNumber;
        employee.Gender = input.Gender;
        employee.BirthDate = input.BirthDate;
        employee.YearOfBirth = input.YearOfBirth;
        employee.HireDate = input.HireDate;
        employee.IsActive = input.IsActive;
        employee.ResignationDate = input.IsActive ? null : input.ResignationDate ?? DateTime.UtcNow.Date;
    }

    private static void ApplyPatch(Employee employee, JsonElement patch)
    {
        foreach (var jsonProp in patch.EnumerateObject())
        {
            var prop = typeof(Employee).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false)
                    .Cast<JsonPropertyNameAttribute>()
                    .FirstOrDefault()?.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase));

            if (prop is null || !prop.CanWrite) continue;

            var targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
            prop.SetValue(employee, ConvertJson(jsonProp.Value, targetType));
        }
    }

    private static object? ConvertJson(JsonElement value, Type type)
    {
        if (value.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return type.Name switch
        {
            nameof(String) => value.GetString(),
            nameof(Int32) => value.ValueKind == JsonValueKind.String ? int.Parse(value.GetString()!) : value.GetInt32(),
            nameof(Decimal) => value.GetDecimal(),
            nameof(Boolean) => value.GetBoolean(),
            nameof(DateTime) => value.GetDateTime(),
            _ => JsonSerializer.Deserialize(value.GetRawText(), type)
        };
    }

    private async Task<IResult> SaveEmployeeChangesAsync(Func<IResult> onSuccess)
    {
        try
        {
            await db.SaveChangesAsync();
            return onSuccess();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }
    }
}
