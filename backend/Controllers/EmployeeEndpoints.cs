using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
private static void MapEmployeeEndpoints(WebApplication app)
{
    const string route = "/api/auth/employees/";
    const string tag = "Authentication";

    app.MapGet(route, async (PharmacyDbContext db) =>
    {
        var employees = await db.Employees
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenByDescending(x => x.HireDate)
            .ThenBy(x => x.FullName)
            .ToListAsync();

        return Results.Ok(employees);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        return employee is null ? Results.NotFound() : Results.Ok(employee);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPost(route, async (Employee employee, PharmacyDbContext db) =>
    {
        employee.IsActive = true;
        employee.ResignationDate = null;

        var validationResult = await EntityValidation.ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        db.Employees.Add(employee);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }

        return Results.Created(route, employee);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPut($"{route}{{id}}/", async (string id, Employee input, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        employee.FullName = input.FullName;
        employee.PhoneNumber = input.PhoneNumber;
        employee.Gender = input.Gender;
        employee.BirthDate = input.BirthDate;
        employee.YearOfBirth = input.YearOfBirth;
        employee.HireDate = input.HireDate;
        employee.IsActive = input.IsActive;
        employee.ResignationDate = input.IsActive ? null : input.ResignationDate ?? DateTime.UtcNow.Date;

        var validationResult = await EntityValidation.ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }

        return Results.Ok(employee);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            var prop = typeof(Employee).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false).Cast<JsonPropertyNameAttribute>().FirstOrDefault()?.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase));
            if (prop is null || !prop.CanWrite) continue;
            prop.SetValue(employee, ConvertJson(jsonProp.Value, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType));
        }

        var validationResult = await EntityValidation.ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }

        return Results.Ok(employee);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
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
    }).RequireToken().WithTags(tag).WithOpenApi();
}
}
