using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IVendorService
{
    Task<VendorAuthResultDto> RegisterAsync(VendorRegistrationRequestDto request, CancellationToken cancellationToken = default);
}
