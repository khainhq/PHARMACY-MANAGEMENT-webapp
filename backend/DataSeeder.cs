using Microsoft.EntityFrameworkCore;

public static class DataSeeder
{
    public static async Task SeedAsync(PharmacyDbContext db)
    {
        if (await db.Roles.AnyAsync()) return;

        db.Roles.AddRange(
            new Role { RoleID = 1, RoleName = "Admin" },
            new Role { RoleID = 2, RoleName = "Sales" },
            new Role { RoleID = 3, RoleName = "Product_manager" });

        db.Employees.AddRange(
            new Employee { EmployeeID = "EMP001", FullName = "Nguyen Hoang Khai", PhoneNumber = "0900000001", Gender = "Male", YearOfBirth = 2000, HireDate = DateTime.UtcNow.Date },
            new Employee { EmployeeID = "EMP002", FullName = "Nhan vien ban hang", PhoneNumber = "0900000002", Gender = "Female", YearOfBirth = 2001, HireDate = DateTime.UtcNow.Date },
            new Employee { EmployeeID = "EMP003", FullName = "Quan ly san pham", PhoneNumber = "0900000003", Gender = "Male", YearOfBirth = 1999, HireDate = DateTime.UtcNow.Date });

        db.Customers.AddRange(
            new Customer { CustomerID = "CUS001", FullName = "Khach hang 1", PhoneNumber = "0910000001", Gender = "Male" },
            new Customer { CustomerID = "CUS002", FullName = "Khach hang 2", PhoneNumber = "0910000002", Gender = "Female" });

        db.Catalogs.AddRange(
            new Catalog { CatalogID = "CAT001", CatalogName = "Giam dau" },
            new Catalog { CatalogID = "CAT002", CatalogName = "Tieu hoa" });

        db.Units.AddRange(
            new Unit { UnitID = "UNT001", UnitName = "Hop" },
            new Unit { UnitID = "UNT002", UnitName = "Chai" });

        db.Origins.AddRange(
            new Origin { OriginID = "ORG001", OriginName = "Viet Nam" },
            new Origin { OriginID = "ORG002", OriginName = "Phap" });

        db.Suppliers.AddRange(
            new Supplier { SupplierID = "SUP001", SupplierName = "Cong ty Duoc A", PhoneNumber = "0920000001", Address = "Thanh pho Ho Chi Minh" },
            new Supplier { SupplierID = "SUP002", SupplierName = "Cong ty Duoc B", PhoneNumber = "0920000002", Address = "Ha Noi" });

        db.Medicines.AddRange(
            new Medicine { MedicineID = "MED001", MedicineName = "Panadol Extra", Image = "/media/medicines/Panadol-Extra.png", Ingredients = "Paracetamol, caffeine", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG002", StockQuantity = 120, ImportPrice = 25000, UnitPrice = 35000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) },
            new Medicine { MedicineID = "MED002", MedicineName = "Efferalgan", Image = "/media/medicines/Efferalgan.png", Ingredients = "Paracetamol", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG002", StockQuantity = 80, ImportPrice = 30000, UnitPrice = 45000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });

        db.Accounts.AddRange(
            new Account { AccountID = 1, Username = "admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), EmployeeID = "EMP001", RoleID = 1, IsStaff = true, IsActive = true },
            new Account { AccountID = 2, Username = "sales", PasswordHash = BCrypt.Net.BCrypt.HashPassword("sales123"), EmployeeID = "EMP002", RoleID = 2, IsStaff = false, IsActive = true },
            new Account { AccountID = 3, Username = "product", PasswordHash = BCrypt.Net.BCrypt.HashPassword("product123"), EmployeeID = "EMP003", RoleID = 3, IsStaff = false, IsActive = true });

        db.Orders.Add(new Order { OrderID = "ORD001", EmployeeID = "EMP002", CustomerID = "CUS001", TotalAmount = 70000 });
        db.Payments.Add(new Payment { PaymentID = "PAY001", EmployeeID = "EMP003", SupplierID = "SUP001", TotalAmount = 50000 });

        await db.SaveChangesAsync();

        db.OrderDetails.Add(new OrderDetail { OrderID = "ORD001", MedicineID = "MED001", Quantity = 2, UnitPrice = 35000 });
        db.PaymentDetails.Add(new PaymentDetail { PaymentID = "PAY001", MedicineID = "MED001", Quantity = 2, UnitPrice = 25000 });
        db.Invoices.Add(new Invoice { InvoiceID = 1, CustomerID = "CUS001", Address = "Thanh pho Ho Chi Minh", PaymentMethod = "Cash", Status = "Paid" });
        await db.SaveChangesAsync();
        db.InvoiceDetails.Add(new InvoiceDetail { InvoiceID = 1, MedicineID = "MED001", Quantity = 1, UnitPrice = 35000 });
        await db.SaveChangesAsync();
    }
}
