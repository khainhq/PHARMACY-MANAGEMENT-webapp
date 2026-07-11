using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
    private static void MapSalesEndpoints(WebApplication app)
    {
        MapCrud<Customer, string>(app, "/api/sales/customers/", db => db.Customers, x => x.CustomerID, tag: "Sales");
        MapCrud<Order, string>(app, "/api/sales/orders/", db => db.Orders, x => x.OrderID, tag: "Sales");
        MapCrud<OrderDetail, int>(app, "/api/sales/order-details/", db => db.OrderDetails, x => x.Id, tag: "Sales");
        MapInvoiceEndpoints(app);
        MapCrud<InvoiceDetail, int>(app, "/api/sales/invoice-details/", db => db.InvoiceDetails, x => x.Id, tag: "Sales");
        app.MapPost("/api/sales/checkout/", async (CheckoutRequest request, PharmacyDbContext db) =>
        {
            if (request.items.Count == 0)
            {
                return Results.BadRequest(new { error = "Gio hang dang trong" });
            }

            var customerName = request.customerName.Trim();
            var phoneNumber = request.phoneNumber.Trim();
            if (string.IsNullOrWhiteSpace(customerName) || string.IsNullOrWhiteSpace(phoneNumber))
            {
                return Results.BadRequest(new { error = "Vui long nhap ten khach hang va so dien thoai" });
            }
            if (!IsValidPhoneNumber(phoneNumber))
            {
                return Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." });
            }

            await using var transaction = await db.Database.BeginTransactionAsync();

            var customer = await db.Customers.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber);
            if (customer is null)
            {
                customer = new Customer
                {
                    CustomerID = await GenerateCustomerIdAsync(db),
                    FullName = customerName,
                    PhoneNumber = phoneNumber,
                    Gender = string.IsNullOrWhiteSpace(request.gender) ? "Other" : request.gender,
                    JoinDate = DateTime.UtcNow.Date
                };
                db.Customers.Add(customer);
                await db.SaveChangesAsync();
            }
            else
            {
                customer.FullName = customerName;
                if (!string.IsNullOrWhiteSpace(request.gender))
                {
                    customer.Gender = request.gender;
                }
                await db.SaveChangesAsync();
            }

            var medicineIds = request.items.Select(x => x.medicine).Distinct().ToList();
            var medicines = await db.Medicines.Where(x => medicineIds.Contains(x.MedicineID)).ToDictionaryAsync(x => x.MedicineID);

            foreach (var item in request.items)
            {
                if (!medicines.TryGetValue(item.medicine, out var medicine))
                {
                    return Results.BadRequest(new { error = $"Khong tim thay thuoc {item.medicine}" });
                }

                if (item.quantity <= 0)
                {
                    return Results.BadRequest(new { error = "So luong thuoc phai lon hon 0" });
                }

                if (medicine.StockQuantity < item.quantity)
                {
                    return Results.BadRequest(new { error = $"Thuoc {medicine.MedicineName} khong du so luong ton kho" });
                }
            }

            var invoice = new Invoice
            {
                CustomerID = customer.CustomerID,
                Address = request.address.Trim(),
                PaymentMethod = request.paymentMethod,
                Status = NormalizeStatus(request.status)
            };
            db.Invoices.Add(invoice);
            await db.SaveChangesAsync();

            foreach (var item in request.items)
            {
                var medicine = medicines[item.medicine];
                db.InvoiceDetails.Add(new InvoiceDetail
                {
                    InvoiceID = invoice.InvoiceID,
                    MedicineID = item.medicine,
                    Quantity = item.quantity,
                    UnitPrice = item.unitPrice > 0 ? item.unitPrice : medicine.UnitPrice
                });
                medicine.StockQuantity -= item.quantity;
            }

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
        }).RequireToken().WithTags("Sales").WithOpenApi();
        app.MapGet("/api/sales/invoice-statistics/", async (PharmacyDbContext db) =>
            Results.Ok(new
            {
                invoice_count = await db.Invoices.CountAsync(),
                total_revenue = await db.InvoiceDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
            })).RequireToken().WithTags("Sales").WithOpenApi();
    }
}
