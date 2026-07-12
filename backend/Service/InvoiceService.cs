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
        var invoices = await db.Invoices
            .AsNoTracking()
            .OrderByDescending(x => x.InvoiceTime)
            .ToListAsync();

        return await BuildInvoiceDtosAsync(invoices);
    }

    private async Task<object?> BuildInvoiceAsync(int id)
    {
        var invoice = await db.Invoices
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.InvoiceID == id);

        if (invoice is null) return null;

        return (await BuildInvoiceDtosAsync(new[] { invoice })).FirstOrDefault();
    }

    private async Task<List<object>> BuildInvoiceDtosAsync(IReadOnlyCollection<Invoice> invoices)
    {
        var invoiceIds = invoices.Select(invoice => invoice.InvoiceID).ToList();
        var customerIds = invoices.Select(invoice => invoice.CustomerID).Distinct().ToList();

        var customers = await db.Customers
            .AsNoTracking()
            .Where(customer => customerIds.Contains(customer.CustomerID))
            .ToDictionaryAsync(customer => customer.CustomerID);

        var totals = await db.InvoiceDetails
            .AsNoTracking()
            .Where(detail => invoiceIds.Contains(detail.InvoiceID))
            .GroupBy(detail => detail.InvoiceID)
            .Select(group => new
            {
                invoiceID = group.Key,
                totalAmount = group.Sum(detail => detail.UnitPrice * detail.Quantity)
            })
            .ToDictionaryAsync(item => item.invoiceID, item => item.totalAmount);

        return invoices
            .Select(invoice =>
            {
                customers.TryGetValue(invoice.CustomerID, out var customer);
                totals.TryGetValue(invoice.InvoiceID, out var totalAmount);

                return new
                {
                    invoiceID = invoice.InvoiceID,
                    invoiceTime = invoice.InvoiceTime,
                    customer = invoice.CustomerID,
                    customerName = customer?.FullName ?? invoice.CustomerID,
                    customerPhone = customer?.PhoneNumber ?? "",
                    address = invoice.Address,
                    paymentMethod = invoice.PaymentMethod,
                    status = invoice.Status,
                    receiptImage = invoice.ReceiptImage,
                    receiptFileName = invoice.ReceiptFileName,
                    totalAmount
                };
            })
            .Cast<object>()
            .ToList();
    }
}
