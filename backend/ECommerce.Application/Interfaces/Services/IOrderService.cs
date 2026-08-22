using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IOrderService
{
    Task<OrderSummaryDto> CheckoutAsync(int vendorId, CheckoutRequestDto request, CancellationToken cancellationToken = default);

    Task<OrderSummaryDto> ReturnOrderAsync(int vendorId, int orderId, CancellationToken cancellationToken = default);
}
