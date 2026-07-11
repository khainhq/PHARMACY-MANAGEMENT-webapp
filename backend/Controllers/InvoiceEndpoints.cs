using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
private static void MapInvoiceEndpoints(WebApplication app)
{
    const string route = "/api/sales/invoices/";
    const string tag = "Sales";

    app.MapGet(route, async (PharmacyDbContext db) =>
        Results.Ok(await GetInvoiceListAsync(db))).RequireToken().WithTags(tag).WithOpenApi();

    app.MapGet($"{route}{{id:int}}/", async (int id, PharmacyDbContext db) =>
    {
        var invoice = await GetInvoiceAsync(db, id);
        return invoice is null ? Results.NotFound() : Results.Ok(invoice);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPost(route, async (Invoice invoice, PharmacyDbContext db) =>
    {
        invoice.Status = NormalizeStatus(invoice.Status);
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();
        return Results.Created($"{route}{invoice.InvoiceID}/", await GetInvoiceAsync(db, invoice.InvoiceID));
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPut($"{route}{{id:int}}/", async (int id, Invoice input, PharmacyDbContext db) =>
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        invoice.CustomerID = input.CustomerID;
        invoice.Address = input.Address;
        invoice.PaymentMethod = input.PaymentMethod;
        invoice.Status = NormalizeStatus(input.Status);
        invoice.ReceiptImage = input.ReceiptImage ?? "";
        invoice.ReceiptFileName = input.ReceiptFileName ?? "";
        await db.SaveChangesAsync();
        return Results.Ok(await GetInvoiceAsync(db, id));
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPatch($"{route}{{id:int}}/", async (int id, JsonElement patch, PharmacyDbContext db) =>
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            if (jsonProp.NameEquals("status"))
            {
                invoice.Status = NormalizeStatus(jsonProp.Value.GetString());
            }
            else if (jsonProp.NameEquals("address"))
            {
                invoice.Address = jsonProp.Value.GetString() ?? "";
            }
            else if (jsonProp.NameEquals("paymentMethod"))
            {
                invoice.PaymentMethod = jsonProp.Value.GetString() ?? invoice.PaymentMethod;
            }
            else if (jsonProp.NameEquals("receiptImage"))
            {
                invoice.ReceiptImage = jsonProp.Value.GetString() ?? "";
            }
            else if (jsonProp.NameEquals("receiptFileName"))
            {
                invoice.ReceiptFileName = (jsonProp.Value.GetString() ?? "").Trim();
            }
        }

        await db.SaveChangesAsync();
        return Results.Ok(await GetInvoiceAsync(db, id));
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapDelete($"{route}{{id:int}}/", async (int id, PharmacyDbContext db) =>
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        var details = await db.InvoiceDetails.Where(x => x.InvoiceID == id).ToListAsync();
        db.InvoiceDetails.RemoveRange(details);
        db.Invoices.Remove(invoice);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken().WithTags(tag).WithOpenApi();
}

private static async Task<List<object>> GetInvoiceListAsync(PharmacyDbContext db)
{
    var invoices = await db.Invoices
        .AsNoTracking()
        .GroupJoin(db.Customers.AsNoTracking(), invoice => invoice.CustomerID, customer => customer.CustomerID, (invoice, customers) => new { invoice, customers })
        .SelectMany(x => x.customers.DefaultIfEmpty(), (x, customer) => new
        {
            x.invoice.InvoiceID,
            x.invoice.InvoiceTime,
            customer = x.invoice.CustomerID,
            customerName = customer != null ? customer.FullName : x.invoice.CustomerID,
            customerPhone = customer != null ? customer.PhoneNumber : "",
            x.invoice.Address,
            x.invoice.PaymentMethod,
            x.invoice.Status,
            totalAmount = db.InvoiceDetails
                .Where(detail => detail.InvoiceID == x.invoice.InvoiceID)
                .Sum(detail => (decimal?)detail.UnitPrice * detail.Quantity) ?? 0
        })
        .OrderByDescending(x => x.InvoiceTime)
        .ToListAsync();

    return invoices.Cast<object>().ToList();
}

private static async Task<object?> GetInvoiceAsync(PharmacyDbContext db, int id)
{
    return await db.Invoices
        .AsNoTracking()
        .Where(invoice => invoice.InvoiceID == id)
        .GroupJoin(db.Customers.AsNoTracking(), invoice => invoice.CustomerID, customer => customer.CustomerID, (invoice, customers) => new { invoice, customers })
        .SelectMany(x => x.customers.DefaultIfEmpty(), (x, customer) => new
        {
            x.invoice.InvoiceID,
            x.invoice.InvoiceTime,
            customer = x.invoice.CustomerID,
            customerName = customer != null ? customer.FullName : x.invoice.CustomerID,
            customerPhone = customer != null ? customer.PhoneNumber : "",
            x.invoice.Address,
            x.invoice.PaymentMethod,
            x.invoice.Status,
            x.invoice.ReceiptImage,
            x.invoice.ReceiptFileName,
            totalAmount = db.InvoiceDetails
                .Where(detail => detail.InvoiceID == x.invoice.InvoiceID)
                .Sum(detail => (decimal?)detail.UnitPrice * detail.Quantity) ?? 0
        })
        .FirstOrDefaultAsync();
}
}
