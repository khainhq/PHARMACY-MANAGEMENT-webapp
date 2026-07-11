using Microsoft.EntityFrameworkCore;

public sealed class PurchaseService : IPurchaseService
{
    private readonly PharmacyDbContext db;

    public PurchaseService(PharmacyDbContext db)
    {
        this.db = db;
    }

    public async Task<IResult> CreatePaymentAsync(PaymentCheckoutRequest request)
    {
        var validationResult = await ValidateRequestAsync(request);
        if (validationResult is not null)
        {
            return validationResult;
        }

        await using var transaction = await db.Database.BeginTransactionAsync();

        var paymentID = await PharmacyRules.GeneratePaymentIdAsync(db);
        var payment = CreatePayment(request, paymentID);
        db.Payments.Add(payment);

        var details = new List<PaymentDetail>();
        var itemResult = await AddPaymentDetailsAndUpdateStockAsync(request.items, paymentID, details);
        if (itemResult is not null)
        {
            return itemResult;
        }

        payment.TotalAmount = details.Sum(x => x.Quantity * x.UnitPrice);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Results.Created($"/api/medicines/payments/{paymentID}/", new
        {
            message = "Tạo phiếu nhập thành công",
            payment,
            paymentDetails = details
        });
    }

    private async Task<IResult?> ValidateRequestAsync(PaymentCheckoutRequest request)
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

        return null;
    }

    private static Payment CreatePayment(PaymentCheckoutRequest request, string paymentID) =>
        new()
        {
            PaymentID = paymentID,
            PaymentTime = DateTime.UtcNow,
            EmployeeID = request.employee,
            SupplierID = request.supplier,
            TotalAmount = 0,
            Status = PharmacyRules.NormalizeStatus(request.status)
        };

    private async Task<IResult?> AddPaymentDetailsAndUpdateStockAsync(
        List<PaymentCheckoutItem> items,
        string paymentID,
        List<PaymentDetail> details)
    {
        foreach (var item in items)
        {
            var validationResult = ValidateItem(item);
            if (validationResult is not null)
            {
                return validationResult;
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
        }

        return null;
    }

    private static IResult? ValidateItem(PaymentCheckoutItem item)
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

        return null;
    }
}
