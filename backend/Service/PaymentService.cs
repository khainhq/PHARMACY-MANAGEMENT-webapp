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
        var payments = await db.Payments
            .AsNoTracking()
            .OrderByDescending(x => x.PaymentTime)
            .ToListAsync();

        var paymentIds = payments.Select(payment => payment.PaymentID).ToList();
        var employeeIds = payments.Select(payment => payment.EmployeeID).Distinct().ToList();
        var supplierIds = payments.Select(payment => payment.SupplierID).Distinct().ToList();

        var employees = await db.Employees
            .AsNoTracking()
            .Where(employee => employeeIds.Contains(employee.EmployeeID))
            .ToDictionaryAsync(employee => employee.EmployeeID);

        var suppliers = await db.Suppliers
            .AsNoTracking()
            .Where(supplier => supplierIds.Contains(supplier.SupplierID))
            .ToDictionaryAsync(supplier => supplier.SupplierID);

        var details = await BuildPaymentDetailsAsync(paymentIds);

        return payments
            .Select(payment =>
            {
                employees.TryGetValue(payment.EmployeeID, out var employee);
                suppliers.TryGetValue(payment.SupplierID, out var supplier);

                var paymentDetails = details
                    .Where(detail => detail.payment == payment.PaymentID)
                    .ToList();

                return (object)new
                {
                    paymentID = payment.PaymentID,
                    paymentTime = payment.PaymentTime,
                    employee = payment.EmployeeID,
                    employeeName = employee?.FullName ?? payment.EmployeeID,
                    supplier = payment.SupplierID,
                    supplierName = supplier?.SupplierName ?? payment.SupplierID,
                    totalAmount = payment.TotalAmount,
                    status = payment.Status,
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
                var paymentID = item.GetType().GetProperty("paymentID")?.GetValue(item)?.ToString();
                return string.Equals(paymentID, id, StringComparison.OrdinalIgnoreCase);
            });
    }

    private async Task<List<PaymentDetailListItem>> BuildPaymentDetailsAsync(List<string> paymentIds)
    {
        var details = await db.PaymentDetails
            .AsNoTracking()
            .Where(detail => paymentIds.Contains(detail.PaymentID))
            .ToListAsync();

        var medicineIds = details.Select(detail => detail.MedicineID).Distinct().ToList();
        var medicines = await db.Medicines
            .AsNoTracking()
            .Where(medicine => medicineIds.Contains(medicine.MedicineID))
            .ToDictionaryAsync(medicine => medicine.MedicineID);

        return details
            .Select(detail =>
            {
                medicines.TryGetValue(detail.MedicineID, out var medicine);

                return new PaymentDetailListItem(
                    detail.Id,
                    detail.PaymentID,
                    detail.MedicineID,
                    medicine?.MedicineName ?? detail.MedicineID,
                    detail.Quantity,
                    detail.UnitPrice);
            })
            .ToList();
    }
}
