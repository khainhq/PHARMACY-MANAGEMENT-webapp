using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public sealed class InvoiceService : IInvoiceService
{
    private readonly PharmacyDbContext db;

    public InvoiceService(PharmacyDbContext db)
    {
        this.db = db;
    }

    public async Task<IResult> GetListAsync() => Results.Ok(await BuildInvoiceListAsync());

    public async Task<IResult> GetByIdAsync(int id)
    {
        var invoice = await BuildInvoiceAsync(id);
        return invoice is null ? Results.NotFound() : Results.Ok(invoice);
    }

    public async Task<IResult> CreateAsync(Invoice invoice, string route)
    {
        invoice.Status = PharmacyRules.NormalizeStatus(invoice.Status);
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();
        return Results.Created($"{route}{invoice.InvoiceID}/", await BuildInvoiceAsync(invoice.InvoiceID));
    }

    public async Task<IResult> UpdateAsync(int id, Invoice input)
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        invoice.CustomerID = input.CustomerID;
        invoice.Address = input.Address;
        invoice.PaymentMethod = input.PaymentMethod;
        invoice.Status = PharmacyRules.NormalizeStatus(input.Status);
        invoice.ReceiptImage = input.ReceiptImage ?? "";
        invoice.ReceiptFileName = input.ReceiptFileName ?? "";

        await db.SaveChangesAsync();
        return Results.Ok(await BuildInvoiceAsync(id));
    }

    public async Task<IResult> PatchAsync(int id, JsonElement patch)
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            ApplyPatch(invoice, jsonProp);
        }

        await db.SaveChangesAsync();
        return Results.Ok(await BuildInvoiceAsync(id));
    }

    public async Task<IResult> DeleteAsync(int id)
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        var details = await db.InvoiceDetails.Where(x => x.InvoiceID == id).ToListAsync();
        db.InvoiceDetails.RemoveRange(details);
        db.Invoices.Remove(invoice);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private static void ApplyPatch(Invoice invoice, JsonProperty jsonProp)
    {
        if (jsonProp.NameEquals("status"))
        {
            invoice.Status = PharmacyRules.NormalizeStatus(jsonProp.Value.GetString());
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

    private async Task<List<object>> BuildInvoiceListAsync()
    {
        var invoices = await QueryInvoices()
            .OrderByDescending(x => x.InvoiceTime)
            .ToListAsync();

        return invoices.Cast<object>().ToList();
    }

    private async Task<object?> BuildInvoiceAsync(int id)
    {
        return await QueryInvoices()
            .Where(invoice => invoice.InvoiceID == id)
            .FirstOrDefaultAsync();
    }

    private IQueryable<InvoiceListProjection> QueryInvoices()
    {
        return db.Invoices
            .AsNoTracking()
            .GroupJoin(db.Customers.AsNoTracking(), invoice => invoice.CustomerID, customer => customer.CustomerID, (invoice, customers) => new { invoice, customers })
            .SelectMany(x => x.customers.DefaultIfEmpty(), (x, customer) => new InvoiceListProjection(
                x.invoice.InvoiceID,
                x.invoice.InvoiceTime,
                x.invoice.CustomerID,
                customer != null ? customer.FullName : x.invoice.CustomerID,
                customer != null ? customer.PhoneNumber : "",
                x.invoice.Address,
                x.invoice.PaymentMethod,
                x.invoice.Status,
                x.invoice.ReceiptImage,
                x.invoice.ReceiptFileName,
                db.InvoiceDetails
                    .Where(detail => detail.InvoiceID == x.invoice.InvoiceID)
                    .Sum(detail => (decimal?)detail.UnitPrice * detail.Quantity) ?? 0));
    }

    private sealed record InvoiceListProjection(
        int InvoiceID,
        DateTime InvoiceTime,
        string customer,
        string customerName,
        string customerPhone,
        string Address,
        string PaymentMethod,
        string Status,
        string ReceiptImage,
        string ReceiptFileName,
        decimal totalAmount);
}
