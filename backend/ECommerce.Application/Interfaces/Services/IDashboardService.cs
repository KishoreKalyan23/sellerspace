using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<VendorDashboardSummaryDto> GetSummaryAsync(int vendorId, CancellationToken cancellationToken = default);
}
