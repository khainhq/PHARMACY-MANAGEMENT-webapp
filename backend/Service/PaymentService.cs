using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public sealed class PaymentService : IPaymentService
{
    private readonly PharmacyDbContext db;

    public PaymentService(PharmacyDbContext db)
    {
        this.db = db;
    }

    public async Task<IResult> GetListAsync() => Results.Ok(await BuildPaymentListAsync());

    public async Task<IResult> GetByIdAsync(string id)
    {
        var payment = await BuildPaymentAsync(id);
        return payment is null ? Results.NotFound() : Results.Ok(payment);
    }

    public async Task<IResult> CreateAsync(Payment payment, string route)
    {
        payment.Status = PharmacyRules.NormalizeStatus(payment.Status);
        db.Payments.Add(payment);
        await db.SaveChangesAsync();
        return Results.Created($"{route}{payment.PaymentID}/", await BuildPaymentAsync(payment.PaymentID));
    }

    public async Task<IResult> UpdateAsync(string id, Payment input)
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        payment.EmployeeID = input.EmployeeID;
        payment.SupplierID = input.SupplierID;
        payment.TotalAmount = input.TotalAmount;
        payment.Status = PharmacyRules.NormalizeStatus(input.Status);

        await db.SaveChangesAsync();
        return Results.Ok(await BuildPaymentAsync(id));
    }

    public async Task<IResult> PatchAsync(string id, JsonElement patch)
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
        return Results.Ok(await BuildPaymentAsync(id));
    }

    public async Task<IResult> DeleteAsync(string id)
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        var details = await db.PaymentDetails.Where(x => x.PaymentID == id).ToListAsync();
        db.PaymentDetails.RemoveRange(details);
        db.Payments.Remove(payment);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private async Task<List<object>> BuildPaymentListAsync()
    {
        var payments = await QueryPayments()
            .OrderByDescending(x => x.PaymentTime)
            .ToListAsync();

        var paymentIds = payments.Select(x => x.PaymentID).ToList();
        var details = await BuildPaymentDetailsAsync(paymentIds);

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

    private async Task<object?> BuildPaymentAsync(string id)
    {
        return (await BuildPaymentListAsync())
            .FirstOrDefault(item =>
            {
                var paymentID = item.GetType().GetProperty("PaymentID")?.GetValue(item)?.ToString();
                return string.Equals(paymentID, id, StringComparison.OrdinalIgnoreCase);
            });
    }

    private IQueryable<PaymentListProjection> QueryPayments()
    {
        return db.Payments
            .AsNoTracking()
            .GroupJoin(db.Suppliers.AsNoTracking(), payment => payment.SupplierID, supplier => supplier.SupplierID, (payment, suppliers) => new { payment, suppliers })
            .SelectMany(x => x.suppliers.DefaultIfEmpty(), (x, supplier) => new { x.payment, supplier })
            .GroupJoin(db.Employees.AsNoTracking(), x => x.payment.EmployeeID, employee => employee.EmployeeID, (x, employees) => new { x.payment, x.supplier, employees })
            .SelectMany(x => x.employees.DefaultIfEmpty(), (x, employee) => new PaymentListProjection(
                x.payment.PaymentID,
                x.payment.PaymentTime,
                x.payment.EmployeeID,
                employee != null ? employee.FullName : x.payment.EmployeeID,
                x.payment.SupplierID,
                x.supplier != null ? x.supplier.SupplierName : x.payment.SupplierID,
                x.payment.TotalAmount,
                x.payment.Status));
    }

    private async Task<List<PaymentDetailListItem>> BuildPaymentDetailsAsync(List<string> paymentIds)
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

    private sealed record PaymentListProjection(
        string PaymentID,
        DateTime PaymentTime,
        string employee,
        string employeeName,
        string supplier,
        string supplierName,
        decimal TotalAmount,
        string Status);
}
