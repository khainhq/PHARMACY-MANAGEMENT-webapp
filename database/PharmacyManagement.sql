IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Catalogs] (
        [CatalogID] nvarchar(50) NOT NULL,
        [CatalogName] nvarchar(100) NOT NULL,
        CONSTRAINT [PK_Catalogs] PRIMARY KEY ([CatalogID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Customers] (
        [CustomerID] nvarchar(50) NOT NULL,
        [FullName] nvarchar(100) NOT NULL,
        [PhoneNumber] nvarchar(15) NOT NULL,
        [Gender] nvarchar(10) NOT NULL,
        [JoinDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([CustomerID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Employees] (
        [EmployeeID] nvarchar(50) NOT NULL,
        [FullName] nvarchar(255) NOT NULL,
        [PhoneNumber] nvarchar(15) NOT NULL,
        [Gender] nvarchar(10) NOT NULL,
        [YearOfBirth] int NOT NULL,
        [HireDate] datetime2 NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Employees] PRIMARY KEY ([EmployeeID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [InvoiceDetails] (
        [Id] int NOT NULL IDENTITY,
        [InvoiceID] int NOT NULL,
        [MedicineID] nvarchar(450) NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_InvoiceDetails] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Invoices] (
        [InvoiceID] int NOT NULL IDENTITY,
        [InvoiceTime] datetime2 NOT NULL,
        [CustomerID] nvarchar(max) NOT NULL,
        [Address] nvarchar(max) NOT NULL,
        [PaymentMethod] nvarchar(50) NOT NULL,
        [Status] nvarchar(50) NOT NULL,
        CONSTRAINT [PK_Invoices] PRIMARY KEY ([InvoiceID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Medicines] (
        [MedicineID] nvarchar(50) NOT NULL,
        [MedicineName] nvarchar(255) NOT NULL,
        [Image] nvarchar(max) NULL,
        [Ingredients] nvarchar(max) NOT NULL,
        [UnitID] nvarchar(max) NOT NULL,
        [CatalogID] nvarchar(max) NOT NULL,
        [OriginID] nvarchar(max) NOT NULL,
        [StockQuantity] int NOT NULL,
        [ImportPrice] decimal(10,2) NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        [ExpiryDate] datetime2 NULL,
        CONSTRAINT [PK_Medicines] PRIMARY KEY ([MedicineID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [OrderDetails] (
        [Id] int NOT NULL IDENTITY,
        [OrderID] nvarchar(450) NOT NULL,
        [MedicineID] nvarchar(450) NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_OrderDetails] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Orders] (
        [OrderID] nvarchar(50) NOT NULL,
        [OrderTime] datetime2 NOT NULL,
        [EmployeeID] nvarchar(max) NOT NULL,
        [CustomerID] nvarchar(max) NOT NULL,
        [TotalAmount] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([OrderID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Origins] (
        [OriginID] nvarchar(50) NOT NULL,
        [OriginName] nvarchar(100) NOT NULL,
        CONSTRAINT [PK_Origins] PRIMARY KEY ([OriginID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [PaymentDetails] (
        [Id] int NOT NULL IDENTITY,
        [PaymentID] nvarchar(450) NOT NULL,
        [MedicineID] nvarchar(450) NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_PaymentDetails] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Payments] (
        [PaymentID] nvarchar(50) NOT NULL,
        [PaymentTime] datetime2 NOT NULL,
        [EmployeeID] nvarchar(max) NOT NULL,
        [SupplierID] nvarchar(max) NOT NULL,
        [TotalAmount] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Roles] (
        [RoleID] int NOT NULL IDENTITY,
        [RoleName] nvarchar(50) NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Suppliers] (
        [SupplierID] nvarchar(50) NOT NULL,
        [SupplierName] nvarchar(255) NOT NULL,
        [PhoneNumber] nvarchar(15) NOT NULL,
        [Address] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Suppliers] PRIMARY KEY ([SupplierID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Units] (
        [UnitID] nvarchar(50) NOT NULL,
        [UnitName] nvarchar(50) NOT NULL,
        CONSTRAINT [PK_Units] PRIMARY KEY ([UnitID])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE TABLE [Accounts] (
        [AccountID] int NOT NULL IDENTITY,
        [Username] nvarchar(150) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [EmployeeID] nvarchar(50) NULL,
        [RoleID] int NOT NULL,
        [IsStaff] bit NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Accounts] PRIMARY KEY ([AccountID]),
        CONSTRAINT [FK_Accounts_Employees_EmployeeID] FOREIGN KEY ([EmployeeID]) REFERENCES [Employees] ([EmployeeID]),
        CONSTRAINT [FK_Accounts_Roles_RoleID] FOREIGN KEY ([RoleID]) REFERENCES [Roles] ([RoleID]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Accounts_EmployeeID] ON [Accounts] ([EmployeeID]) WHERE [EmployeeID] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE INDEX [IX_Accounts_RoleID] ON [Accounts] ([RoleID]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Accounts_Username] ON [Accounts] ([Username]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Catalogs_CatalogName] ON [Catalogs] ([CatalogName]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Customers_PhoneNumber] ON [Customers] ([PhoneNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Employees_PhoneNumber] ON [Employees] ([PhoneNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_InvoiceDetails_InvoiceID_MedicineID] ON [InvoiceDetails] ([InvoiceID], [MedicineID]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_OrderDetails_OrderID_MedicineID] ON [OrderDetails] ([OrderID], [MedicineID]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Origins_OriginName] ON [Origins] ([OriginName]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PaymentDetails_PaymentID_MedicineID] ON [PaymentDetails] ([PaymentID], [MedicineID]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_RoleName] ON [Roles] ([RoleName]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Suppliers_PhoneNumber] ON [Suppliers] ([PhoneNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Suppliers_SupplierName] ON [Suppliers] ([SupplierName]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Units_UnitName] ON [Units] ([UnitName]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625083321_KhoiTaoSqlServer'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260625083321_KhoiTaoSqlServer', N'8.0.17');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260629160805_ThemTrangThaiThanhToanPhieuNhap'
)
BEGIN
    ALTER TABLE [Payments] ADD [Status] nvarchar(50) NOT NULL DEFAULT N'Paid';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260629160805_ThemTrangThaiThanhToanPhieuNhap'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260629160805_ThemTrangThaiThanhToanPhieuNhap', N'8.0.17');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260701154928_LuuAnhHoaDon'
)
BEGIN
    ALTER TABLE [Invoices] ADD [ReceiptFileName] nvarchar(255) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260701154928_LuuAnhHoaDon'
)
BEGIN
    ALTER TABLE [Invoices] ADD [ReceiptImage] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260701154928_LuuAnhHoaDon'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260701154928_LuuAnhHoaDon', N'8.0.17');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704145946_ThemNgaySinhVaNgayNghiViecNhanVien'
)
BEGIN
    ALTER TABLE [Employees] ADD [BirthDate] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704145946_ThemNgaySinhVaNgayNghiViecNhanVien'
)
BEGIN
    ALTER TABLE [Employees] ADD [ResignationDate] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704145946_ThemNgaySinhVaNgayNghiViecNhanVien'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260704145946_ThemNgaySinhVaNgayNghiViecNhanVien', N'8.0.17');
END;
GO

COMMIT;
GO

