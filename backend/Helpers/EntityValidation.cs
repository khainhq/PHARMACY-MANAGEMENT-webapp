using Microsoft.EntityFrameworkCore;

public static class EntityValidation
{
    public static Task<IResult?> ValidateSupplierAsync(Supplier supplier, PharmacyDbContext db)
    {
        supplier.SupplierName = supplier.SupplierName.Trim();
        supplier.PhoneNumber = supplier.PhoneNumber.Trim();
        supplier.Address = supplier.Address.Trim();

        if (!PharmacyRules.IsValidPhoneNumber(supplier.PhoneNumber))
        {
            return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." }));
        }

        return Task.FromResult<IResult?>(null);
    }

    public static Task<IResult?> ValidateEmployeeAsync(Employee employee, PharmacyDbContext db)
    {
        employee.FullName = employee.FullName.Trim();
        employee.PhoneNumber = employee.PhoneNumber.Trim();
        employee.Gender = employee.Gender.Trim();
        employee.HireDate = employee.HireDate.Date;
        employee.BirthDate = employee.BirthDate?.Date;
        employee.ResignationDate = employee.ResignationDate?.Date;

        if (!PharmacyRules.IsValidPhoneNumber(employee.PhoneNumber))
        {
            return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." }));
        }

        var ageValidation = ValidateEmployeeAge(employee);
        if (ageValidation is not null)
        {
            return Task.FromResult<IResult?>(ageValidation);
        }

        if (!employee.IsActive && employee.ResignationDate.HasValue && employee.ResignationDate.Value < employee.HireDate)
        {
            return Task.FromResult<IResult?>(Results.BadRequest(new { error = "Ngày nghỉ việc không được trước ngày vào làm." }));
        }

        return Task.FromResult<IResult?>(null);
    }

    public static async Task<IResult?> ValidateAccountAsync(Account account, PharmacyDbContext db)
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

        var employeeValidation = await ValidateEmployeeAccountLinkAsync(account, db);
        if (employeeValidation is not null)
        {
            return employeeValidation;
        }

        account.IsStaff = string.Equals(role.RoleName, "Admin", StringComparison.OrdinalIgnoreCase);
        return null;
    }

    public static void NormalizeAccount(Account account)
    {
        if (!string.IsNullOrWhiteSpace(account.Password))
        {
            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(account.Password);
        }
    }

    private static IResult? ValidateEmployeeAge(Employee employee)
    {
        var today = DateTime.UtcNow.Date;
        if (employee.HireDate == DateTime.MinValue)
        {
            return InvalidEmployeeAgeResult();
        }

        if (employee.BirthDate.HasValue)
        {
            var birthDate = employee.BirthDate.Value;
            if (birthDate.Year < 1900 || birthDate > today || employee.HireDate < birthDate.AddYears(16))
            {
                return InvalidEmployeeAgeResult();
            }

            employee.YearOfBirth = birthDate.Year;
            return null;
        }

        var currentYear = today.Year;
        var hireYear = employee.HireDate.Year;
        if (employee.YearOfBirth < 1900 || employee.YearOfBirth > currentYear || hireYear - employee.YearOfBirth < 16)
        {
            return InvalidEmployeeAgeResult();
        }

        return null;
    }

    private static async Task<IResult?> ValidateEmployeeAccountLinkAsync(Account account, PharmacyDbContext db)
    {
        if (string.IsNullOrWhiteSpace(account.EmployeeID))
        {
            return null;
        }

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

        return null;
    }

    private static IResult InvalidEmployeeAgeResult() =>
        Results.BadRequest(new { error = "Ngày sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm." });
}
