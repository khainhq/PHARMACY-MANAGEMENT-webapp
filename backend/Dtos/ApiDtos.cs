public sealed record GuideSection(string Title, string Content, string NormalizedTitle, string NormalizedContent, int Order);
public sealed record LoginRequest(string username, string password);
public sealed record ResetPasswordRequest(string username, string new_password);
public sealed record CheckoutItem(string medicine, int quantity, decimal unitPrice);
public sealed record CheckoutRequest(
    string customerName,
    string phoneNumber,
    string address,
    string gender,
    string paymentMethod,
    string status,
    List<CheckoutItem> items);
public sealed record PaymentCheckoutItem(string medicine, int quantity, decimal unitPrice);
public sealed record PaymentCheckoutRequest(string employee, string supplier, string status, List<PaymentCheckoutItem> items);
public sealed record PaymentDetailListItem(int id, string payment, string medicine, string medicineName, int quantity, decimal unitPrice);
