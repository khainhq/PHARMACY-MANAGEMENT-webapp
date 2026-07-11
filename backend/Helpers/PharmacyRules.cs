using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static class PharmacyRules
{
    public static string NormalizeStatus(string? status) =>
        string.Equals(status, "Paid", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(status, "Đã thanh toán", StringComparison.OrdinalIgnoreCase)
            ? "Paid"
            : "Pending";

    public static bool IsValidPhoneNumber(string? phoneNumber) =>
        !string.IsNullOrWhiteSpace(phoneNumber) &&
        Regex.IsMatch(phoneNumber.Trim(), @"^(0\d{9}|\+\d{7,15})$", RegexOptions.CultureInvariant);

    public static async Task<string> GenerateCustomerIdAsync(PharmacyDbContext db)
    {
        var next = await db.Customers.CountAsync() + 1;
        string id;
        do
        {
            id = $"CUS{next:000}";
            next++;
        }
        while (await db.Customers.AnyAsync(x => x.CustomerID == id));

        return id;
    }

    public static async Task<string> GeneratePaymentIdAsync(PharmacyDbContext db)
    {
        var next = await db.Payments.CountAsync() + 1;
        string id;
        do
        {
            id = $"PAY{next:000}";
            next++;
        }
        while (await db.Payments.AnyAsync(x => x.PaymentID == id));

        return id;
    }
}
