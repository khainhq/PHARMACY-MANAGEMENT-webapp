using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
private static void MapPaymentEndpoints(WebApplication app)
{
    const string route = "/api/medicines/payments/";
    const string tag = "Payments";

    app.MapGet(route, async (PharmacyDbContext db) =>
        Results.Ok(await GetPaymentListAsync(db))).RequireToken().WithTags(tag).WithOpenApi();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var payment = await GetPaymentAsync(db, id);
        return payment is null ? Results.NotFound() : Results.Ok(payment);
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPost(route, async (Payment payment, PharmacyDbContext db) =>
    {
        payment.Status = PharmacyRules.NormalizeStatus(payment.Status);
        db.Payments.Add(payment);
        await db.SaveChangesAsync();
        return Results.Created($"{route}{payment.PaymentID}/", await GetPaymentAsync(db, payment.PaymentID));
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPut($"{route}{{id}}/", async (string id, Payment input, PharmacyDbContext db) =>
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        payment.EmployeeID = input.EmployeeID;
        payment.SupplierID = input.SupplierID;
        payment.TotalAmount = input.TotalAmount;
        payment.Status = PharmacyRules.NormalizeStatus(input.Status);
        await db.SaveChangesAsync();
        return Results.Ok(await GetPaymentAsync(db, id));
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            if (jsonProp.NameEquals("status"))
            {
                payment.Status = PharmacyRules.NormalizeStatus(jsonProp.Value.GetString());
            }
        }

        await db.SaveChangesAsync();
        return Results.Ok(await GetPaymentAsync(db, id));
    }).RequireToken().WithTags(tag).WithOpenApi();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        var details = await db.PaymentDetails.Where(x => x.PaymentID == id).ToListAsync();
        db.PaymentDetails.RemoveRange(details);
        db.Payments.Remove(payment);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken().WithTags(tag).WithOpenApi();
}

private static async Task<List<object>> GetPaymentListAsync(PharmacyDbContext db)
{
    var payments = await db.Payments
        .AsNoTracking()
        .GroupJoin(db.Suppliers.AsNoTracking(), payment => payment.SupplierID, supplier => supplier.SupplierID, (payment, suppliers) => new { payment, suppliers })
        .SelectMany(x => x.suppliers.DefaultIfEmpty(), (x, supplier) => new { x.payment, supplier })
        .GroupJoin(db.Employees.AsNoTracking(), x => x.payment.EmployeeID, employee => employee.EmployeeID, (x, employees) => new { x.payment, x.supplier, employees })
        .SelectMany(x => x.employees.DefaultIfEmpty(), (x, employee) => new
        {
            x.payment.PaymentID,
            x.payment.PaymentTime,
            employee = x.payment.EmployeeID,
            employeeName = employee != null ? employee.FullName : x.payment.EmployeeID,
            supplier = x.payment.SupplierID,
            supplierName = x.supplier != null ? x.supplier.SupplierName : x.payment.SupplierID,
            x.payment.TotalAmount,
            x.payment.Status
        })
        .OrderByDescending(x => x.PaymentTime)
        .ToListAsync();

    var paymentIds = payments.Select(x => x.PaymentID).ToList();
    var details = await GetPaymentDetailsAsync(db, paymentIds);

    return payments
        .Select(payment =>
        {
            var paymentDetails = details
                .Where(detail => detail.payment == payment.PaymentID)
                .ToList();

            return (object)new
            {
                payment.PaymentID,
                payment.PaymentTime,
                payment.employee,
                payment.employeeName,
                payment.supplier,
                payment.supplierName,
                payment.TotalAmount,
                payment.Status,
                details = paymentDetails,
                medicineSummary = string.Join(", ", paymentDetails.Select(detail => $"{detail.medicineName} x{detail.quantity}"))
            };
        })
        .ToList();
}

private static async Task<object?> GetPaymentAsync(PharmacyDbContext db, string id)
{
    var payment = (await GetPaymentListAsync(db))
        .FirstOrDefault(item =>
        {
            var paymentID = item.GetType().GetProperty("PaymentID")?.GetValue(item)?.ToString();
            return string.Equals(paymentID, id, StringComparison.OrdinalIgnoreCase);
        });

    return payment;
}

private static async Task<List<PaymentDetailListItem>> GetPaymentDetailsAsync(PharmacyDbContext db, List<string> paymentIds)
{
    return await db.PaymentDetails
        .AsNoTracking()
        .Where(detail => paymentIds.Contains(detail.PaymentID))
        .GroupJoin(db.Medicines.AsNoTracking(), detail => detail.MedicineID, medicine => medicine.MedicineID, (detail, medicines) => new { detail, medicines })
        .SelectMany(x => x.medicines.DefaultIfEmpty(), (x, medicine) => new PaymentDetailListItem(
            x.detail.Id,
            x.detail.PaymentID,
            x.detail.MedicineID,
            medicine != null ? medicine.MedicineName : x.detail.MedicineID,
            x.detail.Quantity,
            x.detail.UnitPrice))
        .ToListAsync();
}
}
