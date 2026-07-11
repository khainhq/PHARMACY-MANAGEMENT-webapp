using System.Text.Json;

public static partial class PharmacyEndpoints
{
    private static void MapInvoiceEndpoints(WebApplication app)
    {
        const string route = "/api/sales/invoices/";
        const string tag = "Sales";

        app.MapGet(route, async (IInvoiceService invoiceService) =>
            await invoiceService.GetListAsync()).RequireToken().WithTags(tag).WithOpenApi();

        app.MapGet($"{route}{{id:int}}/", async (int id, IInvoiceService invoiceService) =>
            await invoiceService.GetByIdAsync(id)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPost(route, async (Invoice invoice, IInvoiceService invoiceService) =>
            await invoiceService.CreateAsync(invoice, route)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPut($"{route}{{id:int}}/", async (int id, Invoice input, IInvoiceService invoiceService) =>
            await invoiceService.UpdateAsync(id, input)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPatch($"{route}{{id:int}}/", async (int id, JsonElement patch, IInvoiceService invoiceService) =>
            await invoiceService.PatchAsync(id, patch)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapDelete($"{route}{{id:int}}/", async (int id, IInvoiceService invoiceService) =>
            await invoiceService.DeleteAsync(id)).RequireToken().WithTags(tag).WithOpenApi();
    }
}
