using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface ISuperAdminService
{
    Task<bool> IsSetupCompleteAsync();

    Task<VendorAuthResultDto> SetupAsync(SuperAdminSetupRequestDto request);

    Task<IReadOnlyList<ShopSummaryDto>> GetAllShopsAsync();
}
