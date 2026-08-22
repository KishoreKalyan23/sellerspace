using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IBillingCustomerService
{
    Task<IReadOnlyList<BillingCustomerDto>> SearchAsync(int vendorId, string query, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BillingCustomerDto>> GetAllAsync(int vendorId, CancellationToken cancellationToken = default);

    Task<BillingCustomerDto> CreateAsync(int vendorId, CreateBillingCustomerRequestDto request, CancellationToken cancellationToken = default);
}
