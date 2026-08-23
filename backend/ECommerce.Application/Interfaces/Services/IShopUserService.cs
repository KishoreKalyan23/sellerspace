using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IShopUserService
{
    Task<IReadOnlyList<ShopUserDto>> GetByVendorIdAsync(int vendorId);

    Task<ShopUserDto> CreateAsync(int vendorId, CreateShopUserRequestDto request);

    Task<ShopUserDto?> UpdateAsync(int vendorId, int shopUserId, UpdateShopUserRequestDto request);

    Task<bool> ResetPasswordAsync(int vendorId, int shopUserId, ResetShopUserPasswordRequestDto request);
}
