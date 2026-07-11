using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

public static partial class PharmacyEndpoints
{
private static string NormalizeStatus(string? status) =>
    string.Equals(status, "Paid", StringComparison.OrdinalIgnoreCase) ||
    string.Equals(status, "Đã thanh toán", StringComparison.OrdinalIgnoreCase)
        ? "Paid"
        : "Pending";

private static bool IsValidPhoneNumber(string? phoneNumber) =>
    !string.IsNullOrWhiteSpace(phoneNumber) &&
    Regex.IsMatch(phoneNumber.Trim(), @"^(0\d{9}|\+\d{7,15})$", RegexOptions.CultureInvariant);

private static Task<IResult?> ValidateSupplierAsync(Supplier supplier, PharmacyDbContext db)
{
    supplier.SupplierName = supplier.SupplierName.Trim();
    supplier.PhoneNumber = supplier.PhoneNumber.Trim();
    supplier.Address = supplier.Address.Trim();

    if (!IsValidPhoneNumber(supplier.PhoneNumber))
    {
        return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." }));
    }

    return Task.FromResult<IResult?>(null);
}

private static Task<IResult?> ValidateEmployeeAsync(Employee employee, PharmacyDbContext db)
{
    employee.FullName = employee.FullName.Trim();
    employee.PhoneNumber = employee.PhoneNumber.Trim();
    employee.Gender = employee.Gender.Trim();
    employee.HireDate = employee.HireDate.Date;
    employee.BirthDate = employee.BirthDate?.Date;
    employee.ResignationDate = employee.ResignationDate?.Date;

    if (!IsValidPhoneNumber(employee.PhoneNumber))
    {
        return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." }));
    }

    var today = DateTime.UtcNow.Date;
    if (employee.HireDate == DateTime.MinValue)
    {
        return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Ngày sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm." }));
    }

    if (employee.BirthDate.HasValue)
    {
        var birthDate = employee.BirthDate.Value;
        if (birthDate.Year < 1900 || birthDate > today || employee.HireDate < birthDate.AddYears(16))
        {
            return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Ngày sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm." }));
        }

        employee.YearOfBirth = birthDate.Year;
    }
    else
    {
        var currentYear = today.Year;
        var hireYear = employee.HireDate.Year;
        if (employee.YearOfBirth < 1900 || employee.YearOfBirth > currentYear || hireYear - employee.YearOfBirth < 16)
        {
            return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Ngày sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm." }));
        }
    }

    if (!employee.IsActive && employee.ResignationDate.HasValue && employee.ResignationDate.Value < employee.HireDate)
    {
        return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Ngày nghỉ việc không được trước ngày vào làm." }));
    }

    return Task.FromResult<IResult?>(null);
}

private static async Task<IResult?> ValidateAccountAsync(Account account, PharmacyDbContext db)
{
    account.Username = account.Username.Trim();
    account.EmployeeID = string.IsNullOrWhiteSpace(account.EmployeeID) ? null : account.EmployeeID.Trim();

    if (string.IsNullOrWhiteSpace(account.Username))
    {
        return Results.BadRequest(new { error = "Vui lòng nhập tên tài khoản." });
    }

    if (account.AccountID == 0 && string.IsNullOrWhiteSpace(account.Password))
    {
        return Results.BadRequest(new { error = "Vui lòng nhập mật khẩu." });
    }

    if (account.AccountID != 0 && string.IsNullOrWhiteSpace(account.PasswordHash) && string.IsNullOrWhiteSpace(account.Password))
    {
        return Results.BadRequest(new { error = "Tài khoản chưa có mật khẩu hợp lệ." });
    }

    var role = await db.Roles.AsNoTracking().FirstOrDefaultAsync(x => x.RoleID == account.RoleID);
    if (role is null)
    {
        return Results.BadRequest(new { error = "Vai trò tài khoản không hợp lệ." });
    }

    if (await db.Accounts.AsNoTracking().AnyAsync(x => x.Username == account.Username && x.AccountID != account.AccountID))
    {
        return Results.BadRequest(new { error = "Tên tài khoản đã tồn tại." });
    }

    if (!string.IsNullOrWhiteSpace(account.EmployeeID))
    {
        var employeeExists = await db.Employees.AsNoTracking().AnyAsync(x => x.EmployeeID == account.EmployeeID);
        if (!employeeExists)
        {
            return Results.BadRequest(new { error = "Mã nhân viên không hợp lệ." });
        }

        var employeeHasAccount = await db.Accounts.AsNoTracking().AnyAsync(x => x.EmployeeID == account.EmployeeID && x.AccountID != account.AccountID);
        if (employeeHasAccount)
        {
            return Results.BadRequest(new { error = "Nhân viên này đã có tài khoản." });
        }
    }

    account.IsStaff = string.Equals(role.RoleName, "Admin", StringComparison.OrdinalIgnoreCase);
    return null;
}

private static async Task<string> GenerateCustomerIdAsync(PharmacyDbContext db)
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

private static async Task<string> GeneratePaymentIdAsync(PharmacyDbContext db)
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

private static void NormalizeAccount(Account account)
{
    if (!string.IsNullOrWhiteSpace(account.Password))
    {
        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(account.Password);
    }
}
}
