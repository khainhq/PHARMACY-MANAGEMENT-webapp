using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public static class DataSeeder
{
    public static async Task SeedAsync(PharmacyDbContext db)
    {
        await EnsureReferenceDataAsync(db);
        await EnsureDemoAccessDataAsync(db);
        await EnsureMedicineDataAsync(db);
        await EnsureDemoTransactionsAsync(db);
    }

    private static async Task EnsureDemoAccessDataAsync(PharmacyDbContext db)
    {
        var adminRole = await EnsureRoleAsync(db, "Admin");
        var salesRole = await EnsureRoleAsync(db, "Sales");
        var productRole = await EnsureRoleAsync(db, "Product_manager");

        await EnsureEmployeeAsync(db, new Employee { EmployeeID = "EMP001", FullName = "Nguyen Ho Quang Khai", PhoneNumber = "0900000001", Gender = "Male", BirthDate = new DateTime(2000, 3, 10), YearOfBirth = 2000, HireDate = DateTime.UtcNow.Date });
        await EnsureEmployeeAsync(db, new Employee { EmployeeID = "EMP002", FullName = "Nhan vien ban hang", PhoneNumber = "0900000002", Gender = "Female", BirthDate = new DateTime(2001, 5, 12), YearOfBirth = 2001, HireDate = DateTime.UtcNow.Date });
        await EnsureEmployeeAsync(db, new Employee { EmployeeID = "EMP003", FullName = "Quan ly san pham", PhoneNumber = "0900000003", Gender = "Male", BirthDate = new DateTime(1999, 9, 20), YearOfBirth = 1999, HireDate = DateTime.UtcNow.Date });

        await EnsureCustomerAsync(db, new Customer { CustomerID = "CUS001", FullName = "Khach hang 1", PhoneNumber = "0910000001", Gender = "Male" });
        await EnsureCustomerAsync(db, new Customer { CustomerID = "CUS002", FullName = "Khach hang 2", PhoneNumber = "0910000002", Gender = "Female" });

        await EnsureSupplierAsync(db, new Supplier { SupplierID = "SUP001", SupplierName = "Cong ty Duoc A", PhoneNumber = "0920000001", Address = "Thanh pho Ho Chi Minh" });
        await EnsureSupplierAsync(db, new Supplier { SupplierID = "SUP002", SupplierName = "Cong ty Duoc B", PhoneNumber = "0920000002", Address = "Ha Noi" });

        await db.SaveChangesAsync();

        await EnsureDemoAccountAsync(db, "admin", "admin123", "EMP001", adminRole.RoleID, isStaff: true);
        await EnsureDemoAccountAsync(db, "sales", "sales123", "EMP002", salesRole.RoleID, isStaff: false);
        await EnsureDemoAccountAsync(db, "product", "product123", "EMP003", productRole.RoleID, isStaff: false);

        await db.SaveChangesAsync();
    }

    private static async Task EnsureDemoTransactionsAsync(PharmacyDbContext db)
    {
        if (!await db.Orders.AnyAsync(x => x.OrderID == "ORD001"))
        {
            db.Orders.Add(new Order { OrderID = "ORD001", EmployeeID = "EMP002", CustomerID = "CUS001", TotalAmount = 70000 });
            db.OrderDetails.Add(new OrderDetail { OrderID = "ORD001", MedicineID = "MED001", Quantity = 2, UnitPrice = 35000 });
        }

        if (!await db.Payments.AnyAsync(x => x.PaymentID == "PAY001"))
        {
            db.Payments.Add(new Payment { PaymentID = "PAY001", EmployeeID = "EMP003", SupplierID = "SUP001", TotalAmount = 50000, Status = "Paid" });
            db.PaymentDetails.Add(new PaymentDetail { PaymentID = "PAY001", MedicineID = "MED001", Quantity = 2, UnitPrice = 25000 });
        }

        if (!await db.Invoices.AnyAsync())
        {
            var invoice = new Invoice { CustomerID = "CUS001", Address = "Thanh pho Ho Chi Minh", PaymentMethod = "Cash", Status = "Paid" };
            db.Invoices.Add(invoice);
            await db.SaveChangesAsync();
            db.InvoiceDetails.Add(new InvoiceDetail { InvoiceID = invoice.InvoiceID, MedicineID = "MED001", Quantity = 1, UnitPrice = 35000 });
        }

        await db.SaveChangesAsync();
    }

    private static async Task<Role> EnsureRoleAsync(PharmacyDbContext db, string roleName)
    {
        var role = await db.Roles.FirstOrDefaultAsync(x => x.RoleName == roleName);
        if (role is not null) return role;

        role = new Role { RoleName = roleName };
        db.Roles.Add(role);
        await db.SaveChangesAsync();
        return role;
    }

    private static async Task EnsureEmployeeAsync(PharmacyDbContext db, Employee seed)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.EmployeeID == seed.EmployeeID);
        if (employee is null)
        {
            db.Employees.Add(seed);
            return;
        }

        employee.FullName = seed.FullName;
        employee.PhoneNumber = seed.PhoneNumber;
        employee.Gender = seed.Gender;
        employee.BirthDate = seed.BirthDate;
        employee.YearOfBirth = seed.YearOfBirth;
        employee.HireDate = seed.HireDate;
    }

    private static async Task EnsureCustomerAsync(PharmacyDbContext db, Customer seed)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(x => x.CustomerID == seed.CustomerID);
        if (customer is null)
        {
            db.Customers.Add(seed);
            return;
        }

        customer.FullName = seed.FullName;
        customer.PhoneNumber = seed.PhoneNumber;
        customer.Gender = seed.Gender;
    }

    private static async Task EnsureSupplierAsync(PharmacyDbContext db, Supplier seed)
    {
        var supplier = await db.Suppliers.FirstOrDefaultAsync(x => x.SupplierID == seed.SupplierID);
        if (supplier is null)
        {
            db.Suppliers.Add(seed);
            return;
        }

        supplier.SupplierName = seed.SupplierName;
        supplier.PhoneNumber = seed.PhoneNumber;
        supplier.Address = seed.Address;
    }

    private static async Task EnsureDemoAccountAsync(
        PharmacyDbContext db,
        string username,
        string password,
        string employeeID,
        int roleID,
        bool isStaff)
    {
        var account = await db.Accounts.FirstOrDefaultAsync(x => x.Username == username);
        if (account is null)
        {
            db.Accounts.Add(new Account
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                EmployeeID = employeeID,
                RoleID = roleID,
                IsStaff = isStaff,
                IsActive = true
            });
            return;
        }

        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        account.EmployeeID = employeeID;
        account.RoleID = roleID;
        account.IsStaff = isStaff;
        account.IsActive = true;
    }

    private static async Task EnsureReferenceDataAsync(PharmacyDbContext db)
    {
        await AddCatalogIfMissing(db, "CAT001", "Thuoc giam dau");
        await AddCatalogIfMissing(db, "CAT002", "Tieu hoa");
        await AddCatalogIfMissing(db, "CAT003", "Thuoc khang sinh");
        await AddCatalogIfMissing(db, "CAT004", "Vitamin - Khoang chat");
        await AddCatalogIfMissing(db, "CAT005", "Cam cum - Ho");
        await AddCatalogIfMissing(db, "CAT006", "Tim mach - Huyet ap");
        await AddCatalogIfMissing(db, "CAT007", "Da lieu");

        await AddUnitIfMissing(db, "UNT001", "Hop");
        await AddUnitIfMissing(db, "UNT002", "Chai");
        await AddUnitIfMissing(db, "UNT003", "Vi");
        await AddUnitIfMissing(db, "UNT004", "Vien");
        await AddUnitIfMissing(db, "UNT005", "Goi");
        await AddUnitIfMissing(db, "UNT006", "Tuyp");
        await AddUnitIfMissing(db, "UNT007", "Lo");
        await AddUnitIfMissing(db, "UNT008", "Ong");

        await AddOriginIfMissing(db, "ORG001", "Viet Nam");
        await AddOriginIfMissing(db, "ORG002", "Phap");
        await AddOriginIfMissing(db, "ORG003", "My");
        await AddOriginIfMissing(db, "ORG004", "Nhat Ban");
        await AddOriginIfMissing(db, "ORG005", "An Do");
        await AddOriginIfMissing(db, "ORG006", "Duc");
        await AddOriginIfMissing(db, "ORG007", "Han Quoc");

        await db.SaveChangesAsync();
    }

    private static async Task EnsureMedicineDataAsync(PharmacyDbContext db)
    {
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED001", MedicineName = "Panadol Extra", Image = "/images/medicines/med001-panadol-extra.png", Ingredients = "Paracetamol, caffeine", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG002", StockQuantity = 120, ImportPrice = 25000, UnitPrice = 35000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED002", MedicineName = "Efferalgan", Image = "/images/medicines/med002-efferalgan.png", Ingredients = "Paracetamol", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG002", StockQuantity = 80, ImportPrice = 30000, UnitPrice = 45000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED003", MedicineName = "ACTADOL 500MG MEDIPHARCO 10X10", Image = "/images/medicines/med003-actadol-500mg-medipharco-10x10.png", Ingredients = "Paracetamol 500mg", UnitID = "UNT003", CatalogID = "CAT001", OriginID = "ORG001", StockQuantity = 40, ImportPrice = 350, UnitPrice = 500, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED004", MedicineName = "PARACETAMOL STADA 500MG 10X10", Image = "/images/medicines/med004-paracetamol-stada-500mg-10x10.jpg", Ingredients = "Paracetamol 500mg", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG001", StockQuantity = 43, ImportPrice = 35000, UnitPrice = 50000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED005", MedicineName = "TOVALGAN EF 500MG TRUONG THO 5X4 SUI", Image = "/images/medicines/med005-tovalgan-ef-500mg-truong-tho-5x4-sui.png", Ingredients = "Paracetamol 500mg", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG001", StockQuantity = 46, ImportPrice = 28000, UnitPrice = 40000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED006", MedicineName = "GLOTADOL 250MG ABBOTT 20 GOI X 2.5G", Image = "/images/medicines/med006-glotadol-250mg-abbott-20-goi-x-2-5g.png", Ingredients = "Paracetamol 250mg", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG003", StockQuantity = 49, ImportPrice = 33600, UnitPrice = 48000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED007", MedicineName = "GLOTADOL 150MG ABBOTT 20 GOI X 2G", Image = "/images/medicines/med007-glotadol-150mg-abbott-20-goi-x-2g.png", Ingredients = "Paracetamol 150mg", UnitID = "UNT001", CatalogID = "CAT001", OriginID = "ORG003", StockQuantity = 52, ImportPrice = 30800, UnitPrice = 44000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED008", MedicineName = "DAI TRANG TRUONG PHUC 3X10", Image = "/images/medicines/med008-dai-trang-truong-phuc-3x10.jpg", Ingredients = "Hoang lien, Moc huong, Bach truat, Bach thuoc, Ngu boi tu, Hau phac, Cam thao, Xa tien tu, Hoat thach", UnitID = "UNT001", CatalogID = "CAT002", OriginID = "ORG001", StockQuantity = 55, ImportPrice = 73500, UnitPrice = 105000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED009", MedicineName = "TRA GUNG TRAPHACO 10 GOI", Image = "/images/medicines/med009-tra-gung-traphaco-10-goi.png", Ingredients = "Gung tuoi 1.6g", UnitID = "UNT001", CatalogID = "CAT002", OriginID = "ORG001", StockQuantity = 58, ImportPrice = 9800, UnitPrice = 14000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED010", MedicineName = "PRUZENA 10MG DAVI 3X10", Image = "/images/medicines/med010-pruzena-10mg-davi-3x10.png", Ingredients = "Doxylamine 10mg, Pyridoxin hydroclorid 10mg", UnitID = "UNT003", CatalogID = "CAT002", OriginID = "ORG001", StockQuantity = 61, ImportPrice = 2660, UnitPrice = 3800, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED011", MedicineName = "NORMAGUT 250MG MEGA 3X10", Image = "/images/medicines/med011-normagut-250mg-mega-3x10.jpg", Ingredients = "Saccharomyces boulardii dong kho 250mg", UnitID = "UNT001", CatalogID = "CAT002", OriginID = "ORG003", StockQuantity = 64, ImportPrice = 147000, UnitPrice = 210000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED012", MedicineName = "NATRI BICARBONAT 500MG BIDIPHAR 160V", Image = "/images/medicines/med012-natri-bicarbonat-500mg-bidiphar-160v.jpg", Ingredients = "Natri hydrocarbonat 500mg", UnitID = "UNT001", CatalogID = "CAT002", OriginID = "ORG001", StockQuantity = 67, ImportPrice = 14140, UnitPrice = 20200, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED013", MedicineName = "NYST 25000IU OPC 10 GOI", Image = "/images/medicines/med013-nyst-25000iu-opc-10-goi.jpg", Ingredients = "Nystatin 25000iu", UnitID = "UNT001", CatalogID = "CAT003", OriginID = "ORG001", StockQuantity = 70, ImportPrice = 13300, UnitPrice = 19000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED014", MedicineName = "TIMBOV FARMAPRIM 1X3", Image = "/images/medicines/med014-timbov-farmaprim-1x3.jpg", Ingredients = "Clotrimazole 500mg", UnitID = "UNT003", CatalogID = "CAT003", OriginID = "ORG004", StockQuantity = 73, ImportPrice = 47833, UnitPrice = 68333, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED015", MedicineName = "SHAMPOO CLOBETASOL VCP 100ML", Image = "/images/medicines/med015-shampoo-clobetasol-vcp-100ml.jpg", Ingredients = "Clobetasol propionate 0.5mg", UnitID = "UNT001", CatalogID = "CAT003", OriginID = "ORG001", StockQuantity = 76, ImportPrice = 68600, UnitPrice = 98000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED016", MedicineName = "ATSIROX 1% AN THIEN 15G", Image = "/images/medicines/med016-atsirox-1-an-thien-15g.png", Ingredients = "Ciclopiroxolamine 100mg", UnitID = "UNT001", CatalogID = "CAT003", OriginID = "ORG001", StockQuantity = 79, ImportPrice = 45500, UnitPrice = 65000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED017", MedicineName = "POKEMINE MEDISUN 20X10ML", Image = "/images/medicines/med017-pokemine-medisun-20x10ml.png", Ingredients = "Sat 50mg", UnitID = "UNT001", CatalogID = "CAT004", OriginID = "ORG001", StockQuantity = 82, ImportPrice = 106400, UnitPrice = 152000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED018", MedicineName = "MYHEMO RELIV 3X10", Image = "/images/medicines/med018-myhemo-reliv-3x10.png", Ingredients = "Acid folic 0.35mg, Sat 100mg", UnitID = "UNT003", CatalogID = "CAT004", OriginID = "ORG003", StockQuantity = 85, ImportPrice = 3850, UnitPrice = 5500, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED019", MedicineName = "CARDIOTON LIPA 6X10", Image = "/images/medicines/med019-cardioton-lipa-6x10.png", Ingredients = "Ubidecarenone 30mg, D-alpha tocopherol 6.71mg", UnitID = "UNT003", CatalogID = "CAT004", OriginID = "ORG004", StockQuantity = 88, ImportPrice = 5367, UnitPrice = 7667, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED020", MedicineName = "BEROCCA BAYER 10V", Image = "/images/medicines/med020-berocca-bayer-10v.jpg", Ingredients = "Vitamin B1, B2, B6, B12, B3, B5, Vitamin C, Calcium, Magnesia, Kem", UnitID = "UNT006", CatalogID = "CAT004", OriginID = "ORG004", StockQuantity = 91, ImportPrice = 52500, UnitPrice = 75000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED021", MedicineName = "LONG HUYET PH 2X12 - TAN BAM TIM GIAM PHU NE", Image = "/images/medicines/med021-long-huyet-ph-2x12-tan-bam-tim-giam-phu-ne.jpg", Ingredients = "Cao kho huyet giac 280mg", UnitID = "UNT001", CatalogID = "CAT004", OriginID = "ORG001", StockQuantity = 94, ImportPrice = 32900, UnitPrice = 47000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED022", MedicineName = "TOCEMUX 200MG TRUONG THO 10X10", Image = "/images/medicines/med022-tocemux-200mg-truong-tho-10x10.png", Ingredients = "Acetylcysteine 200mg", UnitID = "UNT003", CatalogID = "CAT005", OriginID = "ORG001", StockQuantity = 97, ImportPrice = 500, UnitPrice = 700, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED023", MedicineName = "THUOC HO NGUOI LON OPC 90ML", Image = "/images/medicines/med023-thuoc-ho-nguoi-lon-opc-90ml.JPG", Ingredients = "Cineol, Hoang cam, Bach linh, Thien mon dong, Tang bach bi, Tien ho, Bach bo, Cat canh, Ty ba la, Menthol, Cam thao", UnitID = "UNT002", CatalogID = "CAT005", OriginID = "ORG001", StockQuantity = 100, ImportPrice = 26600, UnitPrice = 38000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED024", MedicineName = "SP AMBROXOL 30MG SHINPOONG 10X10", Image = "/images/medicines/med024-sp-ambroxol-30mg-shinpoong-10x10.png", Ingredients = "Ambroxol 30mg", UnitID = "UNT003", CatalogID = "CAT005", OriginID = "ORG004", StockQuantity = 103, ImportPrice = 280, UnitPrice = 400, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED025", MedicineName = "VIEN TRI HO TUSSIDAY OPC 10X10", Image = "/images/medicines/med025-vien-tri-ho-tussiday-opc-10x10.png", Ingredients = "Eucalyptol 100mg, tinh dau tan day la, tinh dau gung", UnitID = "UNT003", CatalogID = "CAT005", OriginID = "ORG001", StockQuantity = 106, ImportPrice = 616, UnitPrice = 880, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED026", MedicineName = "ATILUDE 250MG/5ML AN THIEN 6X5 ONG 5ML", Image = "/images/medicines/med026-atilude-250mg-5ml-an-thien-6x5-ong-5ml.jpg", Ingredients = "Carbocisteine 250mg", UnitID = "UNT008", CatalogID = "CAT005", OriginID = "ORG001", StockQuantity = 109, ImportPrice = 2100, UnitPrice = 3000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED027", MedicineName = "PANANGIN GEDEON 50V", Image = "/images/medicines/med027-panangin-gedeon-50v.jpg", Ingredients = "Kali aspartat khan 158mg, Magie 140mg", UnitID = "UNT003", CatalogID = "CAT006", OriginID = "ORG004", StockQuantity = 112, ImportPrice = 1974, UnitPrice = 2820, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED028", MedicineName = "CARDIOTON 30MG 3X10", Image = "/images/medicines/med028-cardioton-30mg-3x10.png", Ingredients = "Ubidecarenone 30mg, D-alpha tocopherol 6.71mg", UnitID = "UNT003", CatalogID = "CAT006", OriginID = "ORG004", StockQuantity = 115, ImportPrice = 5353, UnitPrice = 7647, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED029", MedicineName = "PAVICARDI 50MG/250IU CPC1HN 2X15", Image = "/images/medicines/med029-pavicardi-50mg-250iu-cpc1hn-2x15.png", Ingredients = "Coenzym Q10 50mg, Vitamin E 250iu", UnitID = "UNT003", CatalogID = "CAT006", OriginID = "ORG001", StockQuantity = 118, ImportPrice = 11200, UnitPrice = 16000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED030", MedicineName = "KETOCONAZOL 2% MEDIPHARCO 10G", Image = "/images/medicines/med030-ketoconazol-2-medipharco-10g.jpg", Ingredients = "Ketoconazol 20mg", UnitID = "UNT001", CatalogID = "CAT007", OriginID = "ORG001", StockQuantity = 121, ImportPrice = 7700, UnitPrice = 11000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED031", MedicineName = "PROMETHAZIN CREAM 2% MEDIPHARCO 10G", Image = "/images/medicines/med031-promethazin-cream-2-medipharco-10g.jpg", Ingredients = "Promethazine 100mg", UnitID = "UNT001", CatalogID = "CAT007", OriginID = "ORG001", StockQuantity = 124, ImportPrice = 7700, UnitPrice = 11000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });
        await AddMedicineIfMissing(db, new Medicine { MedicineID = "MED032", MedicineName = "LIFEDOVATE CREAM 0.05% HADIPHAR 10G", Image = "/images/medicines/med032-lifedovate-cream-0-05-hadiphar-10g.jpg", Ingredients = "Clobetasone butyrate 0.05%", UnitID = "UNT006", CatalogID = "CAT007", OriginID = "ORG001", StockQuantity = 127, ImportPrice = 24500, UnitPrice = 35000, ExpiryDate = DateTime.UtcNow.Date.AddYears(2) });

        await AddCategoryMedicineGroupsAsync(db);

        await db.SaveChangesAsync();
    }

    private static async Task AddCategoryMedicineGroupsAsync(PharmacyDbContext db)
    {
        var seedPath = Path.Combine(AppContext.BaseDirectory, "SeedData", "medicine-products.json");
        if (!File.Exists(seedPath))
        {
            seedPath = Path.Combine(Directory.GetCurrentDirectory(), "SeedData", "medicine-products.json");
        }

        if (!File.Exists(seedPath))
        {
            throw new FileNotFoundException("Khong tim thay du lieu seed san pham.", seedPath);
        }

        var json = await File.ReadAllTextAsync(seedPath);
        var products = JsonSerializer.Deserialize<List<MedicineProductSeed>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        }) ?? [];

        var seedIds = products.Select(product => product.MedicineID).ToHashSet(StringComparer.Ordinal);
        var obsoleteSeedMedicines = await db.Medicines
            .Where(medicine => string.Compare(medicine.MedicineID, "MED1001") >= 0 &&
                               string.Compare(medicine.MedicineID, "MED1330") <= 0 &&
                               !seedIds.Contains(medicine.MedicineID))
            .ToListAsync();

        db.Medicines.RemoveRange(obsoleteSeedMedicines);

        foreach (var product in products)
        {
            await AddMedicineIfMissing(db, new Medicine
            {
                MedicineID = product.MedicineID,
                MedicineName = product.MedicineName,
                Image = product.Image,
                Ingredients = string.Join("; ", new[]
                {
                    product.GroupLabel,
                    string.IsNullOrWhiteSpace(product.Sku) ? null : $"SKU: {product.Sku}",
                }.Where(value => !string.IsNullOrWhiteSpace(value))),
                UnitID = product.UnitID,
                CatalogID = product.CatalogID,
                OriginID = product.OriginID,
                StockQuantity = product.StockQuantity,
                ImportPrice = product.ImportPrice,
                UnitPrice = product.UnitPrice,
                ExpiryDate = DateTime.UtcNow.Date.AddYears(2),
            });
        }
    }

    private sealed record MedicineProductSeed(
        string MedicineID,
        string GroupLabel,
        string Sku,
        string MedicineName,
        string Image,
        string UnitName,
        string CatalogID,
        string UnitID,
        string OriginID,
        int StockQuantity,
        decimal ImportPrice,
        decimal UnitPrice);
    private static async Task AddCatalogIfMissing(PharmacyDbContext db, string id, string name)
    {
        if (!await db.Catalogs.AnyAsync(x => x.CatalogID == id || x.CatalogName == name))
        {
            db.Catalogs.Add(new Catalog { CatalogID = id, CatalogName = name });
        }
    }

    private static async Task AddUnitIfMissing(PharmacyDbContext db, string id, string name)
    {
        if (!await db.Units.AnyAsync(x => x.UnitID == id || x.UnitName == name))
        {
            db.Units.Add(new Unit { UnitID = id, UnitName = name });
        }
    }

    private static async Task AddOriginIfMissing(PharmacyDbContext db, string id, string name)
    {
        if (!await db.Origins.AnyAsync(x => x.OriginID == id || x.OriginName == name))
        {
            db.Origins.Add(new Origin { OriginID = id, OriginName = name });
        }
    }

    private static async Task AddMedicineIfMissing(PharmacyDbContext db, Medicine medicine)
    {
        if (IsGeneratedSeedMedicine(medicine.MedicineID))
        {
            var seededMedicine = await db.Medicines
                .FirstOrDefaultAsync(x => x.MedicineID == medicine.MedicineID);

            if (seededMedicine is null)
            {
                db.Medicines.Add(medicine);
                return;
            }

            seededMedicine.MedicineName = medicine.MedicineName;
            seededMedicine.Ingredients = medicine.Ingredients;
            seededMedicine.Image = medicine.Image;
            seededMedicine.UnitID = medicine.UnitID;
            seededMedicine.CatalogID = medicine.CatalogID;
            seededMedicine.OriginID = medicine.OriginID;
            seededMedicine.StockQuantity = medicine.StockQuantity;
            seededMedicine.ImportPrice = medicine.ImportPrice;
            seededMedicine.UnitPrice = medicine.UnitPrice;
            seededMedicine.ExpiryDate = medicine.ExpiryDate;
            return;
        }

        var existingMedicine = await db.Medicines
            .FirstOrDefaultAsync(x => x.MedicineID == medicine.MedicineID || x.MedicineName == medicine.MedicineName);

        if (existingMedicine is null)
        {
            db.Medicines.Add(medicine);
            return;
        }

        if (string.IsNullOrWhiteSpace(existingMedicine.Image) ||
            existingMedicine.Image.StartsWith("/media/", StringComparison.OrdinalIgnoreCase))
        {
            existingMedicine.Image = medicine.Image;
        }
    }

    private static bool IsGeneratedSeedMedicine(string medicineID) =>
        string.Compare(medicineID, "MED1001", StringComparison.Ordinal) >= 0 &&
        string.Compare(medicineID, "MED1330", StringComparison.Ordinal) <= 0;
}
