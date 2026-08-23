using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;

namespace ECommerce.Infrastructure.Services;

public class ShopUserService : IShopUserService
{
    private readonly IShopUserRepository _shopUserRepository;
    private readonly IVendorRepository _vendorRepository;
    private readonly ISuperAdminRepository _superAdminRepository;

    public ShopUserService(
        IShopUserRepository shopUserRepository,
        IVendorRepository vendorRepository,
        ISuperAdminRepository superAdminRepository)
    {
        _shopUserRepository = shopUserRepository;
        _vendorRepository = vendorRepository;
        _superAdminRepository = superAdminRepository;
    }

    public async Task<IReadOnlyList<ShopUserDto>> GetByVendorIdAsync(int vendorId)
    {
        var shopUsers = await _shopUserRepository.GetByVendorIdAsync(vendorId);
        return shopUsers.Select(ToDto).ToList();
    }

    public async Task<ShopUserDto> CreateAsync(int vendorId, CreateShopUserRequestDto request)
    {
        var loginId = request.LoginId.Trim();
        if (string.IsNullOrEmpty(loginId))
        {
            throw new InvalidOperationException("A login ID is required.");
        }

        if (await _shopUserRepository.GetByLoginIdAsync(loginId) is not null)
        {
            throw new InvalidOperationException("That login ID is already taken.");
        }

        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (email is not null
            && (await _vendorRepository.GetByEmailAsync(email) is not null
                || await _superAdminRepository.GetByEmailAsync(email) is not null
                || await _shopUserRepository.GetByEmailAsync(email) is not null))
        {
            throw new InvalidOperationException("An account with that email already exists.");
        }

        var shopUser = new ShopUser
        {
            VendorId = vendorId,
            Name = request.Name,
            LoginId = loginId,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CanAccessBilling = request.CanAccessBilling,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _shopUserRepository.AddAsync(shopUser);
        return ToDto(created);
    }

    public async Task<ShopUserDto?> UpdateAsync(int vendorId, int shopUserId, UpdateShopUserRequestDto request)
    {
        var shopUser = await _shopUserRepository.GetByIdAsync(shopUserId);
        if (shopUser is null || shopUser.VendorId != vendorId)
        {
            return null;
        }

        shopUser.Name = request.Name;
        shopUser.CanAccessBilling = request.CanAccessBilling;
        shopUser.IsActive = request.IsActive;

        await _shopUserRepository.UpdateAsync(shopUser);
        return ToDto(shopUser);
    }

    public async Task<bool> ResetPasswordAsync(int vendorId, int shopUserId, ResetShopUserPasswordRequestDto request)
    {
        var shopUser = await _shopUserRepository.GetByIdAsync(shopUserId);
        if (shopUser is null || shopUser.VendorId != vendorId)
        {
            return false;
        }

        shopUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _shopUserRepository.UpdateAsync(shopUser);
        return true;
    }

    private static ShopUserDto ToDto(ShopUser shopUser)
    {
        return new ShopUserDto
        {
            Id = shopUser.Id,
            Name = shopUser.Name,
            LoginId = shopUser.LoginId,
            Email = shopUser.Email,
            CanAccessBilling = shopUser.CanAccessBilling,
            IsActive = shopUser.IsActive,
            CreatedAt = shopUser.CreatedAt.ToString("O")
        };
    }
}
