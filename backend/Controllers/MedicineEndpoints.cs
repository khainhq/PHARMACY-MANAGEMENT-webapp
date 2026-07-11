using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
    private static void MapMedicineEndpoints(WebApplication app)
    {
        MapCrud<Catalog, string>(app, "/api/medicines/catalogs/", db => db.Catalogs, x => x.CatalogID, tag: "Medicines");
        MapCrud<Unit, string>(app, "/api/medicines/units/", db => db.Units, x => x.UnitID, tag: "Medicines");
        MapCrud<Origin, string>(app, "/api/medicines/origins/", db => db.Origins, x => x.OriginID, tag: "Medicines");
        MapCrud<Medicine, string>(app, "/api/medicines/medicines/", db => db.Medicines, x => x.MedicineID, tag: "Medicines");
        MapCrud<Supplier, string>(app, "/api/medicines/suppliers/", db => db.Suppliers, x => x.SupplierID, validate: ValidateSupplierAsync, tag: "Medicines");
        app.MapPost("/api/medicines/payment-checkout/", async (PaymentCheckoutRequest request, PharmacyDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.employee) || string.IsNullOrWhiteSpace(request.supplier))
            {
                return Results.BadRequest(new { error = "Vui lòng chọn nhân viên và nhà cung cấp" });
            }

            if (request.items is null || request.items.Count == 0)
            {
                return Results.BadRequest(new { error = "Vui lòng thêm ít nhất một sản phẩm" });
            }

            if (!await db.Employees.AnyAsync(x => x.EmployeeID == request.employee))
            {
                return Results.BadRequest(new { error = "Nhân viên không tồn tại" });
            }

            if (!await db.Suppliers.AnyAsync(x => x.SupplierID == request.supplier))
            {
                return Results.BadRequest(new { error = "Nhà cung cấp không tồn tại" });
            }

            await using var transaction = await db.Database.BeginTransactionAsync();
            var paymentID = await GeneratePaymentIdAsync(db);
            var payment = new Payment
            {
                PaymentID = paymentID,
                PaymentTime = DateTime.UtcNow,
                EmployeeID = request.employee,
                SupplierID = request.supplier,
                TotalAmount = 0,
                Status = NormalizeStatus(request.status)
            };

            db.Payments.Add(payment);

            var details = new List<PaymentDetail>();
            decimal totalAmount = 0;

            foreach (var item in request.items)
            {
                if (string.IsNullOrWhiteSpace(item.medicine))
                {
                    return Results.BadRequest(new { error = "Sản phẩm trong phiếu nhập không hợp lệ" });
                }

                if (item.quantity <= 0)
                {
                    return Results.BadRequest(new { error = "Số lượng nhập phải lớn hơn 0" });
                }

                if (item.unitPrice <= 0)
                {
                    return Results.BadRequest(new { error = "Đơn giá nhập phải lớn hơn 0" });
                }

                var medicine = await db.Medicines.FirstOrDefaultAsync(x => x.MedicineID == item.medicine);
                if (medicine is null)
                {
                    return Results.BadRequest(new { error = $"Không tìm thấy thuốc {item.medicine}" });
                }

                medicine.StockQuantity += item.quantity;
                var detail = new PaymentDetail
                {
                    PaymentID = paymentID,
                    MedicineID = item.medicine,
                    Quantity = item.quantity,
                    UnitPrice = item.unitPrice
                };

                details.Add(detail);
                db.PaymentDetails.Add(detail);
                totalAmount += item.quantity * item.unitPrice;
            }

            payment.TotalAmount = totalAmount;
            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Results.Created($"/api/medicines/payments/{paymentID}/", new
            {
                message = "Tạo phiếu nhập thành công",
                payment,
                paymentDetails = details
            });
        }).RequireToken().WithTags("Payments").WithOpenApi();
        app.MapGet("/api/medicines/payment-statistics/", async (PharmacyDbContext db) =>
            Results.Ok(new
            {
                payment_count = await db.Payments.CountAsync(),
                total_payment = await db.PaymentDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
            })).RequireToken().WithTags("Payments").WithOpenApi();
    }
}
