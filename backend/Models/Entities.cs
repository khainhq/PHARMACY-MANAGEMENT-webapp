using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public sealed class Role
{
    public int RoleID { get; set; }
    [MaxLength(50)] public string RoleName { get; set; } = "";
}

public sealed class Employee
{
    [Key, MaxLength(50)] public string EmployeeID { get; set; } = "";
    [MaxLength(255)] public string FullName { get; set; } = "";
    [MaxLength(15)] public string PhoneNumber { get; set; } = "";
    [MaxLength(10)] public string Gender { get; set; } = "";
    public DateTime? BirthDate { get; set; }
    public int YearOfBirth { get; set; }
    public DateTime HireDate { get; set; }
    public DateTime? ResignationDate { get; set; }
    [JsonPropertyName("is_active")] public bool IsActive { get; set; } = true;
}

public sealed class Customer
{
    [Key, MaxLength(50)] public string CustomerID { get; set; } = "";
    [MaxLength(100)] public string FullName { get; set; } = "";
    [MaxLength(15)] public string PhoneNumber { get; set; } = "";
    [MaxLength(10)] public string Gender { get; set; } = "";
    public DateTime JoinDate { get; set; } = DateTime.UtcNow;
}

public sealed class Account
{
    public int AccountID { get; set; }
    [MaxLength(150)] public string Username { get; set; } = "";
    [JsonPropertyName("password"), NotMapped] public string? Password { get; set; }
    [JsonIgnore] public string PasswordHash { get; set; } = "";
    [JsonPropertyName("employee")]
    public string? EmployeeID { get; set; }
    [JsonIgnore]
    public Employee? Employee { get; set; }
    [JsonPropertyName("role")]
    public int RoleID { get; set; }
    [JsonIgnore]
    public Role Role { get; set; } = null!;
    [JsonPropertyName("is_staff")] public bool IsStaff { get; set; }
    [JsonPropertyName("is_active")] public bool IsActive { get; set; } = true;
}

public sealed class Catalog
{
    [Key, MaxLength(50)] public string CatalogID { get; set; } = "";
    [MaxLength(100)] public string CatalogName { get; set; } = "";
}

public sealed class Unit
{
    [Key, MaxLength(50)] public string UnitID { get; set; } = "";
    [MaxLength(50)] public string UnitName { get; set; } = "";
}

public sealed class Origin
{
    [Key, MaxLength(50)] public string OriginID { get; set; } = "";
    [MaxLength(100)] public string OriginName { get; set; } = "";
}

public sealed class Medicine
{
    [Key, MaxLength(50)] public string MedicineID { get; set; } = "";
    [MaxLength(255)] public string MedicineName { get; set; } = "";
    public string? Image { get; set; }
    public string Ingredients { get; set; } = "";
    [JsonPropertyName("unit")]
    public string UnitID { get; set; } = "";
    [JsonPropertyName("catalog")]
    public string CatalogID { get; set; } = "";
    [JsonPropertyName("origin")]
    public string OriginID { get; set; } = "";
    public int StockQuantity { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal ImportPrice { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal UnitPrice { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public sealed class Supplier
{
    [Key, MaxLength(50)] public string SupplierID { get; set; } = "";
    [MaxLength(255)] public string SupplierName { get; set; } = "";
    [MaxLength(15)] public string PhoneNumber { get; set; } = "";
    public string Address { get; set; } = "";
}

public sealed class Order
{
    [Key, MaxLength(50)] public string OrderID { get; set; } = "";
    public DateTime OrderTime { get; set; } = DateTime.UtcNow;
    [JsonPropertyName("employee")]
    public string EmployeeID { get; set; } = "";
    [JsonPropertyName("customer")]
    public string CustomerID { get; set; } = "";
    [Column(TypeName = "decimal(10,2)")] public decimal TotalAmount { get; set; }
}

public sealed class OrderDetail
{
    public int Id { get; set; }
    [JsonPropertyName("order")] public string OrderID { get; set; } = "";
    [JsonPropertyName("medicine")] public string MedicineID { get; set; } = "";
    public int Quantity { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal UnitPrice { get; set; }
}

public sealed class Invoice
{
    public int InvoiceID { get; set; }
    public DateTime InvoiceTime { get; set; } = DateTime.UtcNow;
    [JsonPropertyName("customer")] public string CustomerID { get; set; } = "";
    public string Address { get; set; } = "";
    [MaxLength(50)] public string PaymentMethod { get; set; } = "Cash";
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    public string ReceiptImage { get; set; } = "";
    [MaxLength(255)] public string ReceiptFileName { get; set; } = "";
}

public sealed class InvoiceDetail
{
    public int Id { get; set; }
    [JsonPropertyName("invoice")] public int InvoiceID { get; set; }
    [JsonPropertyName("medicine")] public string MedicineID { get; set; } = "";
    public int Quantity { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal UnitPrice { get; set; }
}

public sealed class Payment
{
    [Key, MaxLength(50)] public string PaymentID { get; set; } = "";
    public DateTime PaymentTime { get; set; } = DateTime.UtcNow;
    [JsonPropertyName("employee")] public string EmployeeID { get; set; } = "";
    [JsonPropertyName("supplier")] public string SupplierID { get; set; } = "";
    [Column(TypeName = "decimal(10,2)")] public decimal TotalAmount { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Pending";
}

public sealed class PaymentDetail
{
    public int Id { get; set; }
    [JsonPropertyName("payment")] public string PaymentID { get; set; } = "";
    [JsonPropertyName("medicine")] public string MedicineID { get; set; } = "";
    public int Quantity { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal UnitPrice { get; set; }
}
