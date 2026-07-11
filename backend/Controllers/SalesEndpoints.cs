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
        app.MapPost("/api/sales/checkout/", async (CheckoutRequest request, ISalesService salesService) =>
            await salesService.CheckoutAsync(request)).RequireToken().WithTags("Sales").WithOpenApi();
        app.MapGet("/api/sales/invoice-statistics/", async (PharmacyDbContext db) =>
            Results.Ok(new
            {
                invoice_count = await db.Invoices.CountAsync(),
                total_revenue = await db.InvoiceDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
            })).RequireToken().WithTags("Sales").WithOpenApi();
    }
}
