using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
    private static void MapMedicineEndpoints(WebApplication app)
    {
        MapCrud<Catalog, string>(app, "/api/medicines/catalogs/", db => db.Catalogs, x => x.CatalogID, tag: "Medicines");
        MapCrud<Unit, string>(app, "/api/medicines/units/", db => db.Units, x => x.UnitID, tag: "Medicines");
        MapCrud<Origin, string>(app, "/api/medicines/origins/", db => db.Origins, x => x.OriginID, tag: "Medicines");
        MapCrud<Medicine, string>(app, "/api/medicines/medicines/", db => db.Medicines, x => x.MedicineID, tag: "Medicines");
        MapCrud<Supplier, string>(
            app,
            "/api/medicines/suppliers/",
            db => db.Suppliers,
            x => x.SupplierID,
            validate: EntityValidation.ValidateSupplierAsync,
            tag: "Medicines");
        app.MapPost("/api/medicines/payment-checkout/", async (PaymentCheckoutRequest request, IPurchaseService purchaseService) =>
            await purchaseService.CreatePaymentAsync(request)).RequireToken().WithTags("Payments").WithOpenApi();
        app.MapGet("/api/medicines/payment-statistics/", async (PharmacyDbContext db) =>
            Results.Ok(new
            {
                payment_count = await db.Payments.CountAsync(),
                total_payment = await db.PaymentDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
            })).RequireToken().WithTags("Payments").WithOpenApi();
    }
}
