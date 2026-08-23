using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IAuthService
{
    Task<VendorAuthResultDto> LoginAsync(VendorLoginRequestDto request, CancellationToken cancellationToken = default);
}
