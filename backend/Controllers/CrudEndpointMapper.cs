using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
private static void MapCrud<TEntity, TKey>(
    WebApplication app,
    string route,
    Func<PharmacyDbContext, DbSet<TEntity>> set,
    Func<TEntity, TKey> key,
    Action<TEntity>? beforeSave = null,
    Func<TEntity, PharmacyDbContext, Task<IResult?>>? validate = null,
    string tag = "General") where TEntity : class
{
    app.MapGet(route, async (HttpRequest request, PharmacyDbContext db) =>
    {
        var query = set(db).AsQueryable();
        foreach (var pair in request.Query)
        {
            var prop = typeof(TEntity).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, pair.Key, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false).Cast<JsonPropertyNameAttribute>().FirstOrDefault()?.Name, pair.Key, StringComparison.OrdinalIgnoreCase));
            if (prop is null) continue;
            query = query.Where(e => EF.Property<object>(e, prop.Name)!.ToString() == pair.Value.ToString());
        }
        return Results.Ok(await query.AsNoTracking().ToListAsync());
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var entity = await set(db).FindAsync(ConvertKey<TKey>(id));
        return entity is null ? Results.NotFound() : Results.Ok(entity);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPost(route, async (TEntity entity, PharmacyDbContext db) =>
    {
        if (validate is not null)
        {
            var validationResult = await validate(entity, db);
            if (validationResult is not null) return validationResult;
        }
        beforeSave?.Invoke(entity);
        set(db).Add(entity);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu đã tồn tại hoặc không hợp lệ." });
        }
        return Results.Created(route, entity);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPut($"{route}{{id}}/", async (string id, TEntity input, PharmacyDbContext db) =>
    {
        var existing = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (existing is null) return Results.NotFound();
        var currentPasswordHash = existing is Account existingAccount ? existingAccount.PasswordHash : null;
        db.Entry(existing).CurrentValues.SetValues(input);
        if (existing is Account account && string.IsNullOrWhiteSpace(account.PasswordHash) && !string.IsNullOrWhiteSpace(currentPasswordHash))
        {
            account.PasswordHash = currentPasswordHash;
        }
        if (validate is not null)
        {
            var validationResult = await validate(existing, db);
            if (validationResult is not null) return validationResult;
        }
        beforeSave?.Invoke(existing);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu đã tồn tại hoặc không hợp lệ." });
        }
        return Results.Ok(existing);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var existing = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (existing is null) return Results.NotFound();
        foreach (var jsonProp in patch.EnumerateObject())
        {
            var prop = typeof(TEntity).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false).Cast<JsonPropertyNameAttribute>().FirstOrDefault()?.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase));
            if (prop is null || !prop.CanWrite) continue;
            prop.SetValue(existing, ConvertJson(jsonProp.Value, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType));
        }
        if (validate is not null)
        {
            var validationResult = await validate(existing, db);
            if (validationResult is not null) return validationResult;
        }
        beforeSave?.Invoke(existing);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu đã tồn tại hoặc không hợp lệ." });
        }
        return Results.Ok(existing);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var entity = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (entity is null) return Results.NotFound();
        set(db).Remove(entity);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken().WithTags(tag).WithOpenApi();
}

private static object ConvertKey<TKey>(string value) => typeof(TKey) == typeof(int) ? int.Parse(value) : value;

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
}
