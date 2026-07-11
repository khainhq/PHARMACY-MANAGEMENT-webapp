using System.Text.Json;

public static partial class PharmacyEndpoints
{
    private static void MapPaymentEndpoints(WebApplication app)
    {
        const string route = "/api/medicines/payments/";
        const string tag = "Payments";

        app.MapGet(route, async (IPaymentService paymentService) =>
            await paymentService.GetListAsync()).RequireToken().WithTags(tag).WithOpenApi();

        app.MapGet($"{route}{{id}}/", async (string id, IPaymentService paymentService) =>
            await paymentService.GetByIdAsync(id)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPost(route, async (Payment payment, IPaymentService paymentService) =>
            await paymentService.CreateAsync(payment, route)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPut($"{route}{{id}}/", async (string id, Payment input, IPaymentService paymentService) =>
            await paymentService.UpdateAsync(id, input)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, IPaymentService paymentService) =>
            await paymentService.PatchAsync(id, patch)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapDelete($"{route}{{id}}/", async (string id, IPaymentService paymentService) =>
            await paymentService.DeleteAsync(id)).RequireToken().WithTags(tag).WithOpenApi();
    }
}
