public interface IPurchaseService
{
    Task<IResult> CreatePaymentAsync(PaymentCheckoutRequest request);
}
