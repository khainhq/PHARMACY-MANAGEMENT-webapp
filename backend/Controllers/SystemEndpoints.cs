using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
    private static void MapSystemEndpoints(WebApplication app)
    {
        app.MapGet("/", () => Results.Text("Welcome to the Pharmacy Management System."))
            .WithTags("System")
            .WithOpenApi();
    }
}
