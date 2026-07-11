using System.Text.Json;

public static partial class PharmacyEndpoints
{
    private static void MapEmployeeEndpoints(WebApplication app)
    {
        const string route = "/api/auth/employees/";
        const string tag = "Authentication";

        app.MapGet(route, async (IEmployeeService employeeService) =>
            await employeeService.GetListAsync()).RequireToken().WithTags(tag).WithOpenApi();

        app.MapGet($"{route}{{id}}/", async (string id, IEmployeeService employeeService) =>
            await employeeService.GetByIdAsync(id)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPost(route, async (Employee employee, IEmployeeService employeeService) =>
            await employeeService.CreateAsync(employee, route)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPut($"{route}{{id}}/", async (string id, Employee input, IEmployeeService employeeService) =>
            await employeeService.UpdateAsync(id, input)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, IEmployeeService employeeService) =>
            await employeeService.PatchAsync(id, patch)).RequireToken().WithTags(tag).WithOpenApi();

        app.MapDelete($"{route}{{id}}/", async (string id, IEmployeeService employeeService) =>
            await employeeService.DeactivateAsync(id)).RequireToken().WithTags(tag).WithOpenApi();
    }
}
