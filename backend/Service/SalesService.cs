using Microsoft.EntityFrameworkCore;

public sealed class SalesService : ISalesService
{
    private readonly PharmacyDbContext db;

    public SalesService(PharmacyDbContext db)
    {
        this.db = db;
    }

    public async Task<IResult> CheckoutAsync(CheckoutRequest request)
    {
        var validationResult = ValidateRequest(request);
        if (validationResult is not null)
        {
            return validationResult;
        }

        await using var transaction = await db.Database.BeginTransactionAsync();

        var customer = await FindOrCreateCustomerAsync(request);
        var medicines = await LoadMedicinesAsync(request.items);
        var inventoryValidation = ValidateCartItems(request.items, medicines);
        if (inventoryValidation is not null)
        {
            return inventoryValidation;
        }

        var invoice = await CreateInvoiceAsync(request, customer.CustomerID);
        AddInvoiceDetailsAndUpdateStock(request.items, medicines, invoice.InvoiceID);

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Results.Ok(new
        {
            invoiceID = invoice.InvoiceID,
            invoiceTime = invoice.InvoiceTime,
            customerID = customer.CustomerID,
            customerName = customer.FullName,
            status = invoice.Status,
            totalAmount = request.items.Sum(x => x.quantity * x.unitPrice)
        });
    }

    private static IResult? ValidateRequest(CheckoutRequest request)
    {
        if (request.items.Count == 0)
        {
            return Results.BadRequest(new { error = "Giỏ hàng đang trống" });
        }

        if (string.IsNullOrWhiteSpace(request.customerName) || string.IsNullOrWhiteSpace(request.phoneNumber))
        {
            return Results.BadRequest(new { error = "Vui lòng nhập tên khách hàng và số điện thoại" });
        }

        if (!PharmacyRules.IsValidPhoneNumber(request.phoneNumber))
        {
            return Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." });
        }

        return null;
    }

    private async Task<Customer> FindOrCreateCustomerAsync(CheckoutRequest request)
    {
        var customerName = request.customerName.Trim();
        var phoneNumber = request.phoneNumber.Trim();
        var customer = await db.Customers.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber);

        if (customer is null)
        {
            customer = new Customer
            {
                CustomerID = await PharmacyRules.GenerateCustomerIdAsync(db),
                FullName = customerName,
                PhoneNumber = phoneNumber,
                Gender = string.IsNullOrWhiteSpace(request.gender) ? "Other" : request.gender,
                JoinDate = DateTime.UtcNow.Date
            };
            db.Customers.Add(customer);
            await db.SaveChangesAsync();
            return customer;
        }

        customer.FullName = customerName;
        if (!string.IsNullOrWhiteSpace(request.gender))
        {
            customer.Gender = request.gender;
        }

        await db.SaveChangesAsync();
        return customer;
    }

    private async Task<Dictionary<string, Medicine>> LoadMedicinesAsync(List<CheckoutItem> items)
    {
        var medicineIds = items.Select(x => x.medicine).Distinct().ToList();
        return await db.Medicines
            .Where(x => medicineIds.Contains(x.MedicineID))
            .ToDictionaryAsync(x => x.MedicineID);
    }

    private static IResult? ValidateCartItems(List<CheckoutItem> items, Dictionary<string, Medicine> medicines)
    {
        foreach (var item in items)
        {
            if (!medicines.TryGetValue(item.medicine, out var medicine))
            {
                return Results.BadRequest(new { error = $"Không tìm thấy thuốc {item.medicine}" });
            }

            if (item.quantity <= 0)
            {
                return Results.BadRequest(new { error = "Số lượng thuốc phải lớn hơn 0" });
            }

            if (medicine.StockQuantity < item.quantity)
            {
                return Results.BadRequest(new { error = $"Thuốc {medicine.MedicineName} không đủ số lượng tồn kho" });
            }
        }

        return null;
    }

    private async Task<Invoice> CreateInvoiceAsync(CheckoutRequest request, string customerID)
    {
        var invoice = new Invoice
        {
            CustomerID = customerID,
            Address = request.address.Trim(),
            PaymentMethod = request.paymentMethod,
            Status = PharmacyRules.NormalizeStatus(request.status)
        };

        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();
        return invoice;
    }

    private void AddInvoiceDetailsAndUpdateStock(List<CheckoutItem> items, Dictionary<string, Medicine> medicines, int invoiceID)
    {
        foreach (var item in items)
        {
            var medicine = medicines[item.medicine];
            db.InvoiceDetails.Add(new InvoiceDetail
            {
                InvoiceID = invoiceID,
                MedicineID = item.medicine,
                Quantity = item.quantity,
                UnitPrice = item.unitPrice > 0 ? item.unitPrice : medicine.UnitPrice
            });
            medicine.StockQuantity -= item.quantity;
        }
    }
}
