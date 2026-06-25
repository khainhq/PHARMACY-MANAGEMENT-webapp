using System.Collections.Concurrent;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddDbContext<PharmacyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<TokenStore>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseMiddleware<TokenAuthMiddleware>();

app.MapGet("/", () => Results.Text("Welcome to the Pharmacy Management System."));

app.MapPost("/api/auth/login/", async (LoginRequest request, PharmacyDbContext db, TokenStore tokens) =>
{
    var account = await db.Accounts.Include(a => a.Role).FirstOrDefaultAsync(a => a.Username == request.username);
    if (account is null || !account.IsActive || !BCrypt.Net.BCrypt.Verify(request.password, account.PasswordHash))
    {
        return Results.Unauthorized();
    }

    var token = tokens.Create(account.AccountID, account.Username, account.Role.RoleName);
    return Results.Ok(new { token, username = account.Username, role = account.Role.RoleName });
});

app.MapPost("/api/auth/logout/", (HttpContext context, TokenStore tokens) =>
{
    var token = context.Request.Headers.Authorization.ToString().Replace("Token ", "", StringComparison.OrdinalIgnoreCase);
    tokens.Remove(token);
    return Results.Ok(new { message = "Dang xuat thanh cong" });
}).RequireToken();

app.MapGet("/api/auth/me/", async (HttpContext context, PharmacyDbContext db) =>
{
    var session = context.GetSession()!;
    var account = await db.Accounts.Include(a => a.Role).Include(a => a.Employee).FirstAsync(a => a.AccountID == session.AccountID);
    return Results.Ok(new { username = account.Username, role = account.Role.RoleName, employee = account.Employee });
}).RequireToken();

app.MapPost("/api/auth/reset-password/", async (ResetPasswordRequest request, PharmacyDbContext db) =>
{
    var account = await db.Accounts.FirstOrDefaultAsync(a => a.Username == request.username);
    if (account is null) return Results.NotFound(new { error = "Tai khoan khong ton tai" });
    account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.new_password);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Mat khau da duoc dat lai" });
}).RequireToken();

MapCrud<Role, int>(app, "/api/auth/roles/", db => db.Roles, x => x.RoleID);
MapEmployeeEndpoints(app);
MapCrud<Account, int>(app, "/api/auth/accounts/", db => db.Accounts, x => x.AccountID, NormalizeAccount, ValidateAccountAsync);
MapCrud<Customer, string>(app, "/api/sales/customers/", db => db.Customers, x => x.CustomerID);
MapCrud<Catalog, string>(app, "/api/medicines/catalogs/", db => db.Catalogs, x => x.CatalogID);
MapCrud<Unit, string>(app, "/api/medicines/units/", db => db.Units, x => x.UnitID);
MapCrud<Origin, string>(app, "/api/medicines/origins/", db => db.Origins, x => x.OriginID);
MapCrud<Medicine, string>(app, "/api/medicines/medicines/", db => db.Medicines, x => x.MedicineID);
MapCrud<Supplier, string>(app, "/api/medicines/suppliers/", db => db.Suppliers, x => x.SupplierID, validate: ValidateSupplierAsync);
MapCrud<Order, string>(app, "/api/sales/orders/", db => db.Orders, x => x.OrderID);
MapCrud<OrderDetail, int>(app, "/api/sales/order-details/", db => db.OrderDetails, x => x.Id);
MapInvoiceEndpoints(app);
MapCrud<InvoiceDetail, int>(app, "/api/sales/invoice-details/", db => db.InvoiceDetails, x => x.Id);
MapPaymentEndpoints(app);
MapCrud<PaymentDetail, int>(app, "/api/medicines/payment-details/", db => db.PaymentDetails, x => x.Id);

app.MapPost("/api/sales/checkout/", async (CheckoutRequest request, PharmacyDbContext db) =>
{
    if (request.items.Count == 0)
    {
        return Results.BadRequest(new { error = "Gio hang dang trong" });
    }

    var customerName = request.customerName.Trim();
    var phoneNumber = request.phoneNumber.Trim();
    if (string.IsNullOrWhiteSpace(customerName) || string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { error = "Vui long nhap ten khach hang va so dien thoai" });
    }
    if (!IsValidPhoneNumber(phoneNumber))
    {
        return Results.BadRequest(new { error = "Số điện thoại không đúng định dạng." });
    }

    await using var transaction = await db.Database.BeginTransactionAsync();

    var customer = await db.Customers.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber);
    if (customer is null)
    {
        customer = new Customer
        {
            CustomerID = await GenerateCustomerIdAsync(db),
            FullName = customerName,
            PhoneNumber = phoneNumber,
            Gender = string.IsNullOrWhiteSpace(request.gender) ? "Other" : request.gender,
            JoinDate = DateTime.UtcNow.Date
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
    }
    else
    {
        customer.FullName = customerName;
        if (!string.IsNullOrWhiteSpace(request.gender))
        {
            customer.Gender = request.gender;
        }
        await db.SaveChangesAsync();
    }

    var medicineIds = request.items.Select(x => x.medicine).Distinct().ToList();
    var medicines = await db.Medicines.Where(x => medicineIds.Contains(x.MedicineID)).ToDictionaryAsync(x => x.MedicineID);

    foreach (var item in request.items)
    {
        if (!medicines.TryGetValue(item.medicine, out var medicine))
        {
            return Results.BadRequest(new { error = $"Khong tim thay thuoc {item.medicine}" });
        }

        if (item.quantity <= 0)
        {
            return Results.BadRequest(new { error = "So luong thuoc phai lon hon 0" });
        }

        if (medicine.StockQuantity < item.quantity)
        {
            return Results.BadRequest(new { error = $"Thuoc {medicine.MedicineName} khong du so luong ton kho" });
        }
    }

    var invoice = new Invoice
    {
        CustomerID = customer.CustomerID,
        Address = request.address.Trim(),
        PaymentMethod = request.paymentMethod,
        Status = NormalizeStatus(request.status)
    };
    db.Invoices.Add(invoice);
    await db.SaveChangesAsync();

    foreach (var item in request.items)
    {
        var medicine = medicines[item.medicine];
        db.InvoiceDetails.Add(new InvoiceDetail
        {
            InvoiceID = invoice.InvoiceID,
            MedicineID = item.medicine,
            Quantity = item.quantity,
            UnitPrice = item.unitPrice > 0 ? item.unitPrice : medicine.UnitPrice
        });
        medicine.StockQuantity -= item.quantity;
    }

    await db.SaveChangesAsync();
    await transaction.CommitAsync();

    return Results.Ok(new
    {
        invoiceID = invoice.InvoiceID,
        invoiceTime = invoice.InvoiceTime,
        customerID = customer.CustomerID,
        customerName = customer.FullName,
        status = invoice.Status,
        totalAmount = request.items.Sum(x => x.quantity * x.unitPrice)
    });
}).RequireToken();

app.MapPost("/api/medicines/payment-checkout/", async (PaymentCheckoutRequest request, PharmacyDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.employee) || string.IsNullOrWhiteSpace(request.supplier))
    {
        return Results.BadRequest(new { error = "Vui lòng chọn nhân viên và nhà cung cấp" });
    }

    if (request.items is null || request.items.Count == 0)
    {
        return Results.BadRequest(new { error = "Vui lòng thêm ít nhất một sản phẩm" });
    }

    if (!await db.Employees.AnyAsync(x => x.EmployeeID == request.employee))
    {
        return Results.BadRequest(new { error = "Nhân viên không tồn tại" });
    }

    if (!await db.Suppliers.AnyAsync(x => x.SupplierID == request.supplier))
    {
        return Results.BadRequest(new { error = "Nhà cung cấp không tồn tại" });
    }

    await using var transaction = await db.Database.BeginTransactionAsync();
    var paymentID = await GeneratePaymentIdAsync(db);
    var payment = new Payment
    {
        PaymentID = paymentID,
        PaymentTime = DateTime.UtcNow,
        EmployeeID = request.employee,
        SupplierID = request.supplier,
        TotalAmount = 0,
        Status = NormalizeStatus(request.status)
    };

    db.Payments.Add(payment);

    var details = new List<PaymentDetail>();
    decimal totalAmount = 0;

    foreach (var item in request.items)
    {
        if (string.IsNullOrWhiteSpace(item.medicine))
        {
            return Results.BadRequest(new { error = "Sản phẩm trong phiếu nhập không hợp lệ" });
        }

        if (item.quantity <= 0)
        {
            return Results.BadRequest(new { error = "Số lượng nhập phải lớn hơn 0" });
        }

        if (item.unitPrice <= 0)
        {
            return Results.BadRequest(new { error = "Đơn giá nhập phải lớn hơn 0" });
        }

        var medicine = await db.Medicines.FirstOrDefaultAsync(x => x.MedicineID == item.medicine);
        if (medicine is null)
        {
            return Results.BadRequest(new { error = $"Không tìm thấy thuốc {item.medicine}" });
        }

        medicine.StockQuantity += item.quantity;
        var detail = new PaymentDetail
        {
            PaymentID = paymentID,
            MedicineID = item.medicine,
            Quantity = item.quantity,
            UnitPrice = item.unitPrice
        };

        details.Add(detail);
        db.PaymentDetails.Add(detail);
        totalAmount += item.quantity * item.unitPrice;
    }

    payment.TotalAmount = totalAmount;
    await db.SaveChangesAsync();
    await transaction.CommitAsync();

    return Results.Created($"/api/medicines/payments/{paymentID}/", new
    {
        message = "Tạo phiếu nhập thành công",
        payment,
        paymentDetails = details
    });
}).RequireToken();

app.MapGet("/api/sales/invoice-statistics/", async (PharmacyDbContext db) =>
    Results.Ok(new
    {
        invoice_count = await db.Invoices.CountAsync(),
        total_revenue = await db.InvoiceDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
    })).RequireToken();

app.MapGet("/api/medicines/payment-statistics/", async (PharmacyDbContext db) =>
    Results.Ok(new
    {
        payment_count = await db.Payments.CountAsync(),
        total_payment = await db.PaymentDetails.SumAsync(x => (decimal?)x.UnitPrice * x.Quantity) ?? 0
    })).RequireToken();

app.MapPost("/chatbot/", async (JsonElement body, IWebHostEnvironment environment) =>
{
    var message = body.TryGetProperty("message", out var messageProperty) ? messageProperty.GetString()?.Trim() ?? "" : "";
    if (string.IsNullOrWhiteSpace(message))
    {
        return Results.BadRequest(new { reply = "Bạn vui lòng nhập câu hỏi cần hỗ trợ." });
    }

    var guidePath = Path.Combine(environment.ContentRootPath, "Docs", "ChatbotGuide.md");
    var guide = File.Exists(guidePath) ? await File.ReadAllTextAsync(guidePath) : "";
    var offlineReply = BuildOfflineChatbotReply(message, guide);

    return Results.Ok(new { reply = offlineReply });
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PharmacyDbContext>();
    await InitializeDatabaseAsync(db);
}

app.Run();

static async Task InitializeDatabaseAsync(PharmacyDbContext db)
{
    const int maxAttempts = 30;
    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            await DataSeeder.SeedAsync(db);
            return;
        }
        catch when (attempt < maxAttempts)
        {
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }
}

static void MapInvoiceEndpoints(WebApplication app)
{
    const string route = "/api/sales/invoices/";

    app.MapGet(route, async (PharmacyDbContext db) =>
        Results.Ok(await GetInvoiceListAsync(db))).RequireToken();

    app.MapGet($"{route}{{id:int}}/", async (int id, PharmacyDbContext db) =>
    {
        var invoice = await GetInvoiceAsync(db, id);
        return invoice is null ? Results.NotFound() : Results.Ok(invoice);
    }).RequireToken();

    app.MapPost(route, async (Invoice invoice, PharmacyDbContext db) =>
    {
        invoice.Status = NormalizeStatus(invoice.Status);
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();
        return Results.Created($"{route}{invoice.InvoiceID}/", await GetInvoiceAsync(db, invoice.InvoiceID));
    }).RequireToken();

    app.MapPut($"{route}{{id:int}}/", async (int id, Invoice input, PharmacyDbContext db) =>
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        invoice.CustomerID = input.CustomerID;
        invoice.Address = input.Address;
        invoice.PaymentMethod = input.PaymentMethod;
        invoice.Status = NormalizeStatus(input.Status);
        invoice.ReceiptImage = input.ReceiptImage ?? "";
        invoice.ReceiptFileName = input.ReceiptFileName ?? "";
        await db.SaveChangesAsync();
        return Results.Ok(await GetInvoiceAsync(db, id));
    }).RequireToken();

    app.MapPatch($"{route}{{id:int}}/", async (int id, JsonElement patch, PharmacyDbContext db) =>
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            if (jsonProp.NameEquals("status"))
            {
                invoice.Status = NormalizeStatus(jsonProp.Value.GetString());
            }
            else if (jsonProp.NameEquals("address"))
            {
                invoice.Address = jsonProp.Value.GetString() ?? "";
            }
            else if (jsonProp.NameEquals("paymentMethod"))
            {
                invoice.PaymentMethod = jsonProp.Value.GetString() ?? invoice.PaymentMethod;
            }
            else if (jsonProp.NameEquals("receiptImage"))
            {
                invoice.ReceiptImage = jsonProp.Value.GetString() ?? "";
            }
            else if (jsonProp.NameEquals("receiptFileName"))
            {
                invoice.ReceiptFileName = (jsonProp.Value.GetString() ?? "").Trim();
            }
        }

        await db.SaveChangesAsync();
        return Results.Ok(await GetInvoiceAsync(db, id));
    }).RequireToken();

    app.MapDelete($"{route}{{id:int}}/", async (int id, PharmacyDbContext db) =>
    {
        var invoice = await db.Invoices.FindAsync(id);
        if (invoice is null) return Results.NotFound();

        var details = await db.InvoiceDetails.Where(x => x.InvoiceID == id).ToListAsync();
        db.InvoiceDetails.RemoveRange(details);
        db.Invoices.Remove(invoice);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken();
}

static async Task<List<object>> GetInvoiceListAsync(PharmacyDbContext db)
{
    var invoices = await db.Invoices
        .AsNoTracking()
        .GroupJoin(db.Customers.AsNoTracking(), invoice => invoice.CustomerID, customer => customer.CustomerID, (invoice, customers) => new { invoice, customers })
        .SelectMany(x => x.customers.DefaultIfEmpty(), (x, customer) => new
        {
            x.invoice.InvoiceID,
            x.invoice.InvoiceTime,
            customer = x.invoice.CustomerID,
            customerName = customer != null ? customer.FullName : x.invoice.CustomerID,
            customerPhone = customer != null ? customer.PhoneNumber : "",
            x.invoice.Address,
            x.invoice.PaymentMethod,
            x.invoice.Status,
            totalAmount = db.InvoiceDetails
                .Where(detail => detail.InvoiceID == x.invoice.InvoiceID)
                .Sum(detail => (decimal?)detail.UnitPrice * detail.Quantity) ?? 0
        })
        .OrderByDescending(x => x.InvoiceTime)
        .ToListAsync();

    return invoices.Cast<object>().ToList();
}

static async Task<object?> GetInvoiceAsync(PharmacyDbContext db, int id)
{
    return await db.Invoices
        .AsNoTracking()
        .Where(invoice => invoice.InvoiceID == id)
        .GroupJoin(db.Customers.AsNoTracking(), invoice => invoice.CustomerID, customer => customer.CustomerID, (invoice, customers) => new { invoice, customers })
        .SelectMany(x => x.customers.DefaultIfEmpty(), (x, customer) => new
        {
            x.invoice.InvoiceID,
            x.invoice.InvoiceTime,
            customer = x.invoice.CustomerID,
            customerName = customer != null ? customer.FullName : x.invoice.CustomerID,
            customerPhone = customer != null ? customer.PhoneNumber : "",
            x.invoice.Address,
            x.invoice.PaymentMethod,
            x.invoice.Status,
            x.invoice.ReceiptImage,
            x.invoice.ReceiptFileName,
            totalAmount = db.InvoiceDetails
                .Where(detail => detail.InvoiceID == x.invoice.InvoiceID)
                .Sum(detail => (decimal?)detail.UnitPrice * detail.Quantity) ?? 0
        })
        .FirstOrDefaultAsync();
}

static void MapPaymentEndpoints(WebApplication app)
{
    const string route = "/api/medicines/payments/";

    app.MapGet(route, async (PharmacyDbContext db) =>
        Results.Ok(await GetPaymentListAsync(db))).RequireToken();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var payment = await GetPaymentAsync(db, id);
        return payment is null ? Results.NotFound() : Results.Ok(payment);
    }).RequireToken();

    app.MapPost(route, async (Payment payment, PharmacyDbContext db) =>
    {
        payment.Status = NormalizeStatus(payment.Status);
        db.Payments.Add(payment);
        await db.SaveChangesAsync();
        return Results.Created($"{route}{payment.PaymentID}/", await GetPaymentAsync(db, payment.PaymentID));
    }).RequireToken();

    app.MapPut($"{route}{{id}}/", async (string id, Payment input, PharmacyDbContext db) =>
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        payment.EmployeeID = input.EmployeeID;
        payment.SupplierID = input.SupplierID;
        payment.TotalAmount = input.TotalAmount;
        payment.Status = NormalizeStatus(input.Status);
        await db.SaveChangesAsync();
        return Results.Ok(await GetPaymentAsync(db, id));
    }).RequireToken();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            if (jsonProp.NameEquals("status"))
            {
                payment.Status = NormalizeStatus(jsonProp.Value.GetString());
            }
        }

        await db.SaveChangesAsync();
        return Results.Ok(await GetPaymentAsync(db, id));
    }).RequireToken();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var payment = await db.Payments.FindAsync(id);
        if (payment is null) return Results.NotFound();

        var details = await db.PaymentDetails.Where(x => x.PaymentID == id).ToListAsync();
        db.PaymentDetails.RemoveRange(details);
        db.Payments.Remove(payment);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken();
}

static async Task<List<object>> GetPaymentListAsync(PharmacyDbContext db)
{
    var payments = await db.Payments
        .AsNoTracking()
        .GroupJoin(db.Suppliers.AsNoTracking(), payment => payment.SupplierID, supplier => supplier.SupplierID, (payment, suppliers) => new { payment, suppliers })
        .SelectMany(x => x.suppliers.DefaultIfEmpty(), (x, supplier) => new { x.payment, supplier })
        .GroupJoin(db.Employees.AsNoTracking(), x => x.payment.EmployeeID, employee => employee.EmployeeID, (x, employees) => new { x.payment, x.supplier, employees })
        .SelectMany(x => x.employees.DefaultIfEmpty(), (x, employee) => new
        {
            x.payment.PaymentID,
            x.payment.PaymentTime,
            employee = x.payment.EmployeeID,
            employeeName = employee != null ? employee.FullName : x.payment.EmployeeID,
            supplier = x.payment.SupplierID,
            supplierName = x.supplier != null ? x.supplier.SupplierName : x.payment.SupplierID,
            x.payment.TotalAmount,
            x.payment.Status
        })
        .OrderByDescending(x => x.PaymentTime)
        .ToListAsync();

    var paymentIds = payments.Select(x => x.PaymentID).ToList();
    var details = await GetPaymentDetailsAsync(db, paymentIds);

    return payments
        .Select(payment =>
        {
            var paymentDetails = details
                .Where(detail => detail.payment == payment.PaymentID)
                .ToList();

            return (object)new
            {
                payment.PaymentID,
                payment.PaymentTime,
                payment.employee,
                payment.employeeName,
                payment.supplier,
                payment.supplierName,
                payment.TotalAmount,
                payment.Status,
                details = paymentDetails,
                medicineSummary = string.Join(", ", paymentDetails.Select(detail => $"{detail.medicineName} x{detail.quantity}"))
            };
        })
        .ToList();
}

static async Task<object?> GetPaymentAsync(PharmacyDbContext db, string id)
{
    var payment = (await GetPaymentListAsync(db))
        .FirstOrDefault(item =>
        {
            var paymentID = item.GetType().GetProperty("PaymentID")?.GetValue(item)?.ToString();
            return string.Equals(paymentID, id, StringComparison.OrdinalIgnoreCase);
        });

    return payment;
}

static async Task<List<PaymentDetailListItem>> GetPaymentDetailsAsync(PharmacyDbContext db, List<string> paymentIds)
{
    return await db.PaymentDetails
        .AsNoTracking()
        .Where(detail => paymentIds.Contains(detail.PaymentID))
        .GroupJoin(db.Medicines.AsNoTracking(), detail => detail.MedicineID, medicine => medicine.MedicineID, (detail, medicines) => new { detail, medicines })
        .SelectMany(x => x.medicines.DefaultIfEmpty(), (x, medicine) => new PaymentDetailListItem(
            x.detail.Id,
            x.detail.PaymentID,
            x.detail.MedicineID,
            medicine != null ? medicine.MedicineName : x.detail.MedicineID,
            x.detail.Quantity,
            x.detail.UnitPrice))
        .ToListAsync();
}

static string NormalizeStatus(string? status) =>
    string.Equals(status, "Paid", StringComparison.OrdinalIgnoreCase) ||
    string.Equals(status, "Đã thanh toán", StringComparison.OrdinalIgnoreCase)
        ? "Paid"
        : "Pending";

static void MapEmployeeEndpoints(WebApplication app)
{
    const string route = "/api/auth/employees/";

    app.MapGet(route, async (PharmacyDbContext db) =>
    {
        var employees = await db.Employees
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenByDescending(x => x.HireDate)
            .ThenBy(x => x.FullName)
            .ToListAsync();

        return Results.Ok(employees);
    }).RequireToken();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        return employee is null ? Results.NotFound() : Results.Ok(employee);
    }).RequireToken();

    app.MapPost(route, async (Employee employee, PharmacyDbContext db) =>
    {
        employee.IsActive = true;
        employee.ResignationDate = null;

        var validationResult = await ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        db.Employees.Add(employee);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }

        return Results.Created(route, employee);
    }).RequireToken();

    app.MapPut($"{route}{{id}}/", async (string id, Employee input, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        employee.FullName = input.FullName;
        employee.PhoneNumber = input.PhoneNumber;
        employee.Gender = input.Gender;
        employee.BirthDate = input.BirthDate;
        employee.YearOfBirth = input.YearOfBirth;
        employee.HireDate = input.HireDate;
        employee.IsActive = input.IsActive;
        employee.ResignationDate = input.IsActive ? null : input.ResignationDate ?? DateTime.UtcNow.Date;

        var validationResult = await ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }

        return Results.Ok(employee);
    }).RequireToken();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        foreach (var jsonProp in patch.EnumerateObject())
        {
            var prop = typeof(Employee).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false).Cast<JsonPropertyNameAttribute>().FirstOrDefault()?.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase));
            if (prop is null || !prop.CanWrite) continue;
            prop.SetValue(employee, ConvertJson(jsonProp.Value, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType));
        }

        var validationResult = await ValidateEmployeeAsync(employee, db);
        if (validationResult is not null) return validationResult;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu nhân viên đã tồn tại hoặc không hợp lệ." });
        }

        return Results.Ok(employee);
    }).RequireToken();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return Results.NotFound();

        employee.IsActive = false;
        employee.ResignationDate ??= DateTime.UtcNow.Date;

        var accounts = await db.Accounts.Where(x => x.EmployeeID == id).ToListAsync();
        foreach (var account in accounts)
        {
            account.IsActive = false;
        }

        await db.SaveChangesAsync();
        return Results.Ok(employee);
    }).RequireToken();
}

static void MapCrud<TEntity, TKey>(
    WebApplication app,
    string route,
    Func<PharmacyDbContext, DbSet<TEntity>> set,
    Func<TEntity, TKey> key,
    Action<TEntity>? beforeSave = null,
    Func<TEntity, PharmacyDbContext, Task<IResult?>>? validate = null) where TEntity : class
{
    app.MapGet(route, async (HttpRequest request, PharmacyDbContext db) =>
    {
        var query = set(db).AsQueryable();
        foreach (var pair in request.Query)
        {
            var prop = typeof(TEntity).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, pair.Key, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false).Cast<JsonPropertyNameAttribute>().FirstOrDefault()?.Name, pair.Key, StringComparison.OrdinalIgnoreCase));
            if (prop is null) continue;
            query = query.Where(e => EF.Property<object>(e, prop.Name)!.ToString() == pair.Value.ToString());
        }
        return Results.Ok(await query.AsNoTracking().ToListAsync());
    }).RequireToken();

    app.MapGet($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var entity = await set(db).FindAsync(ConvertKey<TKey>(id));
        return entity is null ? Results.NotFound() : Results.Ok(entity);
    }).RequireToken();

    app.MapPost(route, async (TEntity entity, PharmacyDbContext db) =>
    {
        if (validate is not null)
        {
            var validationResult = await validate(entity, db);
            if (validationResult is not null) return validationResult;
        }
        beforeSave?.Invoke(entity);
        set(db).Add(entity);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu đã tồn tại hoặc không hợp lệ." });
        }
        return Results.Created(route, entity);
    }).RequireToken();

    app.MapPut($"{route}{{id}}/", async (string id, TEntity input, PharmacyDbContext db) =>
    {
        var existing = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (existing is null) return Results.NotFound();
        var currentPasswordHash = existing is Account existingAccount ? existingAccount.PasswordHash : null;
        db.Entry(existing).CurrentValues.SetValues(input);
        if (existing is Account account && string.IsNullOrWhiteSpace(account.PasswordHash) && !string.IsNullOrWhiteSpace(currentPasswordHash))
        {
            account.PasswordHash = currentPasswordHash;
        }
        if (validate is not null)
        {
            var validationResult = await validate(existing, db);
            if (validationResult is not null) return validationResult;
        }
        beforeSave?.Invoke(existing);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu đã tồn tại hoặc không hợp lệ." });
        }
        return Results.Ok(existing);
    }).RequireToken();

    app.MapPatch($"{route}{{id}}/", async (string id, JsonElement patch, PharmacyDbContext db) =>
    {
        var existing = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (existing is null) return Results.NotFound();
        foreach (var jsonProp in patch.EnumerateObject())
        {
            var prop = typeof(TEntity).GetProperties().FirstOrDefault(p =>
                string.Equals(p.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.GetCustomAttributes(typeof(JsonPropertyNameAttribute), false).Cast<JsonPropertyNameAttribute>().FirstOrDefault()?.Name, jsonProp.Name, StringComparison.OrdinalIgnoreCase));
            if (prop is null || !prop.CanWrite) continue;
            prop.SetValue(existing, ConvertJson(jsonProp.Value, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType));
        }
        if (validate is not null)
        {
            var validationResult = await validate(existing, db);
            if (validationResult is not null) return validationResult;
        }
        beforeSave?.Invoke(existing);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new { error = "Dữ liệu đã tồn tại hoặc không hợp lệ." });
        }
        return Results.Ok(existing);
    }).RequireToken();

    app.MapDelete($"{route}{{id}}/", async (string id, PharmacyDbContext db) =>
    {
        var entity = await set(db).FindAsync(ConvertKey<TKey>(id));
        if (entity is null) return Results.NotFound();
        set(db).Remove(entity);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).RequireToken();
}

static object ConvertKey<TKey>(string value) => typeof(TKey) == typeof(int) ? int.Parse(value) : value;

static object? ConvertJson(JsonElement value, Type type)
{
    if (value.ValueKind == JsonValueKind.Null)
    {
        return null;
    }

    return type.Name switch
    {
        nameof(String) => value.GetString(),
        nameof(Int32) => value.ValueKind == JsonValueKind.String ? int.Parse(value.GetString()!) : value.GetInt32(),
        nameof(Decimal) => value.GetDecimal(),
        nameof(Boolean) => value.GetBoolean(),
        nameof(DateTime) => value.GetDateTime(),
        _ => JsonSerializer.Deserialize(value.GetRawText(), type)
    };
}

static bool IsValidPhoneNumber(string? phoneNumber) =>
    !string.IsNullOrWhiteSpace(phoneNumber) &&
    Regex.IsMatch(phoneNumber.Trim(), @"^(0\d{9}|\+\d{7,15})$", RegexOptions.CultureInvariant);

static Task<IResult?> ValidateSupplierAsync(Supplier supplier, PharmacyDbContext db)
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

static Task<IResult?> ValidateEmployeeAsync(Employee employee, PharmacyDbContext db)
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

static async Task<IResult?> ValidateAccountAsync(Account account, PharmacyDbContext db)
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

static async Task<string> GenerateCustomerIdAsync(PharmacyDbContext db)
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

static async Task<string> GeneratePaymentIdAsync(PharmacyDbContext db)
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

static string BuildOfflineChatbotReply(string message, string guide)
{
    var normalized = NormalizeVietnameseSearchText(message);
    if (normalized.Contains("ban la ai") || normalized.Contains("chatbot") || normalized.Contains("tro ly"))
    {
        return "Tôi là Trợ lý PharmaCare, nhiệm vụ của tôi là hướng dẫn bạn sử dụng hệ thống quản lý nhà thuốc PharmaCare.";
    }

    if (normalized.Contains("dang nhap") || normalized.Contains("login") || normalized.Contains("sign in"))
    {
        return """
            Cách đăng nhập PharmaCare:

            1. Nếu bạn là Admin, vào `/admin-login`.
            2. Nếu bạn là nhân viên bán hàng hoặc quản lý sản phẩm, vào `/login`.
            3. Tài khoản mẫu:
               - Admin: `admin / admin123`
               - Bán hàng: `sales / sales123`
               - Quản lý sản phẩm: `product / product123`
            4. Nếu đăng nhập đúng nhưng không vào được, hãy kiểm tra backend Docker có đang chạy ở `http://127.0.0.1:8000` không.
            """;
    }

    if (normalized.Contains("hoa don") || normalized.Contains("ban hang") || normalized.Contains("gio hang"))
    {
        return """
            Cách tạo hóa đơn:

            1. Đăng nhập bằng tài khoản bán hàng.
            2. Vào `Hóa đơn` rồi chọn `Tạo hóa đơn`.
            3. Tìm thuốc, bấm `Chọn`, nhập số lượng và thêm vào giỏ hàng.
            4. Nhập thông tin khách hàng.
            5. Chọn phương thức thanh toán, trạng thái rồi bấm `TẠO HÓA ĐƠN`.
            6. Nếu lỗi, hãy kiểm tra giỏ hàng, tồn kho và thông tin khách hàng.
            """;
    }

    if (normalized.Contains("thuoc") || normalized.Contains("san pham") || normalized.Contains("kho"))
    {
        return """
            Cách quản lý thuốc:

            1. Vào menu `Thuốc`.
            2. Bấm `THÊM` để thêm thuốc mới.
            3. Nhập tên thuốc, thành phần, số lượng, giá nhập, đơn giá và hạn sử dụng.
            4. Chọn đơn vị tính, danh mục và xuất xứ.
            5. Bấm `Thêm mới` để lưu.
            """;
    }

    if (normalized.Contains("nhan vien") || normalized.Contains("tai khoan") || normalized.Contains("phan quyen"))
    {
        return """
            Chức năng nhân viên và tài khoản dành cho Admin:

            1. Vào `Nhân viên` để thêm, sửa, xóa thông tin nhân viên.
            2. Vào `Tài khoản` để tạo tài khoản đăng nhập.
            3. Gắn tài khoản với nhân viên và chọn vai trò: `Admin`, `Sales` hoặc `Product_manager`.
            4. Nếu tài khoản thấy sai menu, hãy kiểm tra lại vai trò và cổng đăng nhập.
            """;
    }

    if (normalized.Contains("khach hang"))
    {
        return "Vào trang `Khách hàng` để thêm, sửa, xóa và tìm kiếm khách hàng theo tên, số điện thoại hoặc mã khách hàng. Khi tạo hóa đơn, hệ thống cũng có thể tự tạo khách hàng mới theo số điện thoại.";
    }

    if (normalized.Contains("nha cung cap") || normalized.Contains("phieu nhap") || normalized.Contains("nhap hang"))
    {
        return """
            Với nhà cung cấp và phiếu nhập:

            1. Vào `Nhà cung cấp` để thêm, sửa, xóa hoặc tìm kiếm nhà cung cấp.
            2. Vào `Phiếu nhập` rồi chọn `Tạo phiếu nhập`.
            3. Chọn thuốc, nhập số lượng, đơn giá nhập, nhân viên và nhà cung cấp.
            4. Khi lưu phiếu nhập thành công, tồn kho thuốc sẽ tăng lên.
            """;
    }

    if (normalized.Contains("docker") || normalized.Contains("backend") || normalized.Contains("container") || normalized.Contains("localhost"))
    {
        return """
            Cách kiểm tra khi chạy Docker:

            1. Mở Docker Desktop và chờ Docker chạy ổn định.
            2. Chạy `docker compose up -d --build`.
            3. Mở frontend tại `http://localhost:3000`.
            4. Backend chạy tại `http://127.0.0.1:8000`.
            5. Nếu backend bật lên rồi tắt, chạy `docker compose logs backend` để xem lỗi.
            """;
    }

    var guideReply = BuildGuideSearchReply(message, guide);
    if (!string.IsNullOrWhiteSpace(guideReply))
    {
        return guideReply;
    }

    return "Chức năng của tôi là hướng dẫn sử dụng PharmaCare. Bạn có thể hỏi tôi về đăng nhập, dashboard, thuốc, hóa đơn, khách hàng, nhân viên, nhà cung cấp, phiếu nhập, báo cáo hoặc tài khoản.";
}

static string? BuildGuideSearchReply(string message, string guide)
{
    if (string.IsNullOrWhiteSpace(guide))
    {
        return null;
    }

    var queryTokens = NormalizeVietnameseSearchText(message)
        .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Where(token => token.Length >= 3)
        .Where(token => !IsChatbotStopWord(token))
        .Distinct()
        .ToArray();

    if (queryTokens.Length == 0)
    {
        return null;
    }

    var best = ExtractGuideSections(guide)
        .Select(section => new
        {
            Section = section,
            Score = queryTokens.Sum(token =>
                (section.NormalizedTitle.Contains(token) ? 3 : 0) +
                (section.NormalizedContent.Contains(token) ? 1 : 0))
        })
        .Where(result => result.Score >= 3)
        .OrderByDescending(result => result.Score)
        .ThenBy(result => result.Section.Order)
        .FirstOrDefault();

    if (best is null)
    {
        return null;
    }

    var lines = best.Section.Content
        .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(CleanupGuideLine)
        .Where(line => !string.IsNullOrWhiteSpace(line))
        .Take(8)
        .ToArray();

    if (lines.Length == 0)
    {
        return null;
    }

    return $"Mình tìm thấy hướng dẫn phù hợp trong mục \"{best.Section.Title}\":\n\n{string.Join("\n", lines)}";
}

static List<GuideSection> ExtractGuideSections(string guide)
{
    var sections = new List<GuideSection>();
    using var reader = new StringReader(guide);

    string? currentTitle = null;
    var currentContent = new StringBuilder();
    var order = 0;

    while (reader.ReadLine() is { } line)
    {
        if (line.StartsWith("## ", StringComparison.Ordinal))
        {
            AddCurrentSection();
            currentTitle = line[3..].Trim();
            currentContent.Clear();
            continue;
        }

        if (currentTitle is not null)
        {
            currentContent.AppendLine(line);
        }
    }

    AddCurrentSection();
    return sections;

    void AddCurrentSection()
    {
        if (string.IsNullOrWhiteSpace(currentTitle))
        {
            return;
        }

        var content = currentContent.ToString().Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return;
        }

        sections.Add(new GuideSection(
            currentTitle,
            content,
            NormalizeVietnameseSearchText(currentTitle),
            NormalizeVietnameseSearchText(content),
            order++));
    }
}

static string CleanupGuideLine(string line)
{
    var cleaned = line.Trim();
    cleaned = Regex.Replace(cleaned, @"^#{1,6}\s+", "");
    cleaned = Regex.Replace(cleaned, @"^[-*]\s+", "- ");
    cleaned = Regex.Replace(cleaned, @"^\d+\.\s+", match => match.Value);
    return cleaned;
}

static bool IsChatbotStopWord(string token) =>
    token is "cach" or "lam" or "the" or "nao" or "giup" or "minh" or "toi" or "can" or "hoi" or "huong" or "dan" or "dung" or "chuc" or "nang" or "trong" or "tren" or "cho" or "voi" or "nay" or "kia";

static string NormalizeVietnameseSearchText(string value)
{
    var normalized = value.ToLowerInvariant().Normalize(NormalizationForm.FormD);
    var builder = new StringBuilder(normalized.Length);

    foreach (var character in normalized)
    {
        var category = CharUnicodeInfo.GetUnicodeCategory(character);
        if (category != UnicodeCategory.NonSpacingMark)
        {
            builder.Append(character == 'đ' ? 'd' : character);
        }
    }

    return builder.ToString().Normalize(NormalizationForm.FormC);
}

static void NormalizeAccount(Account account)
{
    if (!string.IsNullOrWhiteSpace(account.Password))
    {
        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(account.Password);
    }
}

static class EndpointExtensions
{
    public static RouteHandlerBuilder RequireToken(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter((context, next) =>
        {
            var http = context.HttpContext;
            if (http.GetSession() is null) return ValueTask.FromResult<object?>(Results.Unauthorized());
            return next(context);
        });

    public static Session? GetSession(this HttpContext context) => context.Items["Session"] as Session;
}

sealed class TokenAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TokenStore tokens)
    {
        var header = context.Request.Headers.Authorization.ToString();
        if (header.StartsWith("Token ", StringComparison.OrdinalIgnoreCase) && tokens.TryGet(header[6..], out var session))
        {
            context.Items["Session"] = session;
        }
        await next(context);
    }
}

sealed class TokenStore
{
    private readonly ConcurrentDictionary<string, Session> _tokens = new();

    public string Create(int accountID, string username, string role)
    {
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        _tokens[token] = new Session(accountID, username, role);
        return token;
    }

    public bool TryGet(string token, out Session session) => _tokens.TryGetValue(token, out session!);
    public void Remove(string token) => _tokens.TryRemove(token, out _);
}

record GuideSection(string Title, string Content, string NormalizedTitle, string NormalizedContent, int Order);
record Session(int AccountID, string Username, string Role);
record LoginRequest(string username, string password);
record ResetPasswordRequest(string username, string new_password);
record CheckoutItem(string medicine, int quantity, decimal unitPrice);
record CheckoutRequest(
    string customerName,
    string phoneNumber,
    string address,
    string gender,
    string paymentMethod,
    string status,
    List<CheckoutItem> items);
record PaymentCheckoutItem(string medicine, int quantity, decimal unitPrice);
record PaymentCheckoutRequest(string employee, string supplier, string status, List<PaymentCheckoutItem> items);
record PaymentDetailListItem(int id, string payment, string medicine, string medicineName, int quantity, decimal unitPrice);
