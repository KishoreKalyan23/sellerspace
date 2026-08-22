using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IInvoiceService
{
    Task<IReadOnlyList<InvoiceListItemDto>> GetAllAsync(int vendorId, CancellationToken cancellationToken = default);

    Task<InvoiceDetailDto?> GetByIdAsync(int vendorId, int orderId, CancellationToken cancellationToken = default);
}
