public interface ISalesService
{
    Task<IResult> CheckoutAsync(CheckoutRequest request);
}
