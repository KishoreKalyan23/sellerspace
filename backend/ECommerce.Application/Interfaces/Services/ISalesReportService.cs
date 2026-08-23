using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface ISalesReportService
{
    Task<SalesReportDto> GetReportAsync(int vendorId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
