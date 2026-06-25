using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddDbContext<PharmacyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<TokenStore>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseMiddleware<TokenAuthMiddleware>();

app.MapGet("/", () => Results.Text("Welcome to the Pharmacy Management System."));

app.MapPost("/api/auth/login/", async (LoginRequest request, PharmacyDbContext db, TokenStore tokens) =>
{
    var account = await db.Accounts.Include(a => a.Role).FirstOrDefaultAsync(a => a.Username == request.username);
    if (account is null || !account.IsActive || !BCrypt.Net.BCrypt.Verify(request.password, account.PasswordHash))
    {
        return Results.Unauthorized();
    }

    var token = tokens.Create(account.AccountID, account.Username, account.Role.RoleName);
    return Results.Ok(new { token, username = account.Username, role = account.Role.RoleName });
});

app.MapPost("/api/auth/logout/", (HttpContext context, TokenStore tokens) =>
{
    var token = context.Request.Headers.Authorization.ToString().Replace("Token ", "", StringComparison.OrdinalIgnoreCase);
    tokens.Remove(token);
    return Results.Ok(new { message = "Dang xuat thanh cong" });
}).RequireToken();

app.MapGet("/api/auth/me/", async (HttpContext context, PharmacyDbContext db) =>
{
    var session = context.GetSession()!;
    var account = await db.Accounts.Include(a => a.Role).Include(a => a.Employee).FirstAsync(a => a.AccountID == session.AccountID);
    return Results.Ok(new { username = account.Username, role = account.Role.RoleName, employee = account.Employee });
}).RequireToken();

app.MapPost("/api/auth/reset-password/", async (ResetPasswordRequest request, PharmacyDbContext db) =>
{
    var account = await db.Accounts.FirstOrDefaultAsync(a => a.Username == request.username);
    if (account is null) return Results.NotFound(new { error = "Tai khoan khong ton tai" });
    account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.new_password);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Mat khau da duoc dat lai" });
}).RequireToken();

MapCrud<Role, int>(app, "/api/auth/roles/", db => db.Roles, x => x.RoleID);
MapCrud<Employee, string>(app, "/api/auth/employees/", db => db.Employees, x => x.EmployeeID);
MapCrud<Account, int>(app, "/api/auth/accounts/", db => db.Accounts, x => x.AccountID, NormalizeAccount);
MapCrud<Customer, string>(app, "/api/sales/customers/", db => db.Customers, x => x.CustomerID);
MapCrud<Catalog, string>(app, "/api/medicines/catalogs/", db => db.Catalogs, x => x.CatalogID);
MapCrud<Unit, string>(app, "/api/medicines/units/", db => db.Units, x => x.UnitID);
MapCrud<Origin, string>(app, "/api/medicines/origins/", db => db.Origins, x => x.OriginID);
MapCrud<Medicine, string>(app, "/api/medicines/medicines/", db => db.Medicines, x => x.MedicineID);
MapCrud<Supplier, string>(app, "/api/medicines/suppliers/", db => db.Suppliers, x => x.SupplierID);
MapCrud<Order, string>(app, "/api/sales/orders/", db => db.Orders, x => x.OrderID);
MapCrud<OrderDetail, int>(app, "/api/sales/order-details/", db => db.OrderDetails, x => x.Id);
MapCrud<Invoice, int>(app, "/api/sales/invoices/", db => db.Invoices, x => x.InvoiceID);
MapCrud<InvoiceDetail, int>(app, "/api/sales/invoice-details/", db => db.InvoiceDetails, x => x.Id);
MapCrud<Payment, string>(app, "/api/medicines/payments/", db => db.Payments, x => x.PaymentID);
MapCrud<PaymentDetail, int>(app, "/api/medicines/payment-details/", db => db.PaymentDetails, x => x.Id);

app.MapGet("/api/sales/invoice-statistics/", async (PharmacyDbContext db) =>
    Results.Ok(new
    {
        invoice_count = await db.Invoices.CountAsync(),
        total_revenue = await db.InvoiceDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
    })).RequireToken();

app.MapGet("/api/medicines/payment-statistics/", async (PharmacyDbContext db) =>
    Results.Ok(new
    {
        payment_count = await db.Payments.CountAsync(),
        total_payment = await db.PaymentDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
    })).RequireToken();

app.MapPost("/chatbot/", async (JsonElement body) =>
{
    await Task.CompletedTask;
    var message = body.TryGetProperty("message", out var value) ? value.GetString() : "";
    return Results.Ok(new { response = $"Toi da nhan cau hoi: {message}" });
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PharmacyDbContext>();
    await InitializeDatabaseAsync(db);
}

app.Run();

static async Task InitializeDatabaseAsync(PharmacyDbContext db)
{
    const int maxAttempts = 30;
    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            await DataSeeder.SeedAsync(db);
            return;
        }
        catch when (attempt < maxAttempts)
        {
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }
}

static void MapCrud<TEntity, TKey>(
    WebApplication app,
    string route,
    Func<PharmacyDbContext, DbSet<TEntity>> set,
    Func<TEntity, TKey> key,
    Action<TEntity>? beforeSave = null) where TEntity : class
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
    }).RequireToken();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var entity = await set(db).FindAsync(ConvertKey<TKey>(id));
        return entity is null ? Results.NotFound() : Results.Ok(entity);
    }).RequireToken();

    app.MapPost(route, async (TEntity entity, PharmacyDbContext db) =>
    {
        beforeSave?.Invoke(entity);
        set(db).Add(entity);
        await db.SaveChangesAsync();
        return Results.Created(route, entity);
    }).RequireToken();

    app.MapPut($"{route}{{id}}/", async (string id, TEntity input, PharmacyDbContext db) =>
    {
        var existing = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (existing is null) return Results.NotFound();
        db.Entry(existing).CurrentValues.SetValues(input);
        beforeSave?.Invoke(existing);
        await db.SaveChangesAsync();
        return Results.Ok(existing);
    }).RequireToken();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var existing = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (existing is null) return Results.NotFound();
        foreach (var jsonProp in patch.EnumerateObject())
        {
            var prop = typeof(TEntity).GetProperties().FirstOrDefault(p => string.Equals(p.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase));
            if (prop is null || !prop.CanWrite) continue;
            prop.SetValue(existing, ConvertJson(jsonProp.Value, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType));
        }
        beforeSave?.Invoke(existing);
        await db.SaveChangesAsync();
        return Results.Ok(existing);
    }).RequireToken();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var entity = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (entity is null) return Results.NotFound();
        set(db).Remove(entity);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken();
}

static object ConvertKey<TKey>(string value) => typeof(TKey) == typeof(int) ? int.Parse(value) : value;

static object? ConvertJson(JsonElement value, Type type) => type.Name switch
{
    nameof(String) => value.GetString(),
    nameof(Int32) => value.GetInt32(),
    nameof(Decimal) => value.GetDecimal(),
    nameof(Boolean) => value.GetBoolean(),
    nameof(DateTime) => value.GetDateTime(),
    _ => JsonSerializer.Deserialize(value.GetRawText(), type)
};

static void NormalizeAccount(Account account)
{
    if (!string.IsNullOrWhiteSpace(account.Password))
    {
        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(account.Password);
    }
}

static class EndpointExtensions
{
    public static RouteHandlerBuilder RequireToken(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter((context, next) =>
        {
            var http = context.HttpContext;
            if (http.GetSession() is null) return ValueTask.FromResult<object?>(Results.Unauthorized());
            return next(context);
        });

    public static Session? GetSession(this HttpContext context) => context.Items["Session"] as Session;
}

sealed class TokenAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TokenStore tokens)
    {
        var header = context.Request.Headers.Authorization.ToString();
        if (header.StartsWith("Token ", StringComparison.OrdinalIgnoreCase) && tokens.TryGet(header[6..], out var session))
        {
            context.Items["Session"] = session;
        }
        await next(context);
    }
}

sealed class TokenStore
{
    private readonly ConcurrentDictionary<string, Session> _tokens = new();

    public string Create(int accountID, string username, string role)
    {
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        _tokens[token] = new Session(accountID, username, role);
        return token;
    }

    public bool TryGet(string token, out Session session) => _tokens.TryGetValue(token, out session!);
    public void Remove(string token) => _tokens.TryRemove(token, out _);
}

record Session(int AccountID, string Username, string Role);
record LoginRequest(string username, string password);
record ResetPasswordRequest(string username, string new_password);
