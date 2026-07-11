public static partial class PharmacyEndpoints
{
    public static void MapPharmacyEndpoints(this WebApplication app)
    {
        MapSystemEndpoints(app);
        MapAuthEndpoints(app);
        MapSalesEndpoints(app);
        MapMedicineEndpoints(app);
        MapPaymentEndpoints(app);
        MapChatbotEndpoints(app);
    }
}
