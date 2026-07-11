using Microsoft.EntityFrameworkCore;

public sealed class PharmacyDbContext(DbContextOptions<PharmacyDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Catalog> Catalogs => Set<Catalog>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Origin> Origins => Set<Origin>();
    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceDetail> InvoiceDetails => Set<InvoiceDetail>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentDetail> PaymentDetails => Set<PaymentDetail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasIndex(x => x.RoleName).IsUnique();
        modelBuilder.Entity<Employee>().HasIndex(x => x.PhoneNumber).IsUnique();
        modelBuilder.Entity<Customer>().HasIndex(x => x.PhoneNumber).IsUnique();
        modelBuilder.Entity<Account>().HasIndex(x => x.Username).IsUnique();
        modelBuilder.Entity<Account>().HasOne(x => x.Employee).WithOne().HasForeignKey<Account>(x => x.EmployeeID).IsRequired(false);
        modelBuilder.Entity<Catalog>().HasIndex(x => x.CatalogName).IsUnique();
        modelBuilder.Entity<Unit>().HasIndex(x => x.UnitName).IsUnique();
        modelBuilder.Entity<Origin>().HasIndex(x => x.OriginName).IsUnique();
        modelBuilder.Entity<Supplier>().HasIndex(x => x.SupplierName).IsUnique();
        modelBuilder.Entity<Supplier>().HasIndex(x => x.PhoneNumber).IsUnique();
        modelBuilder.Entity<OrderDetail>().HasIndex(x => new { x.OrderID, x.MedicineID }).IsUnique();
        modelBuilder.Entity<InvoiceDetail>().HasIndex(x => new { x.InvoiceID, x.MedicineID }).IsUnique();
        modelBuilder.Entity<PaymentDetail>().HasIndex(x => new { x.PaymentID, x.MedicineID }).IsUnique();
    }
}
