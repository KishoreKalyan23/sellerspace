using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ISuperAdminRepository _superAdminRepository;
    private readonly IVendorRepository _vendorRepository;
    private readonly IShopUserRepository _shopUserRepository;
    private readonly IConfiguration _configuration;

    public AuthService(
        ISuperAdminRepository superAdminRepository,
        IVendorRepository vendorRepository,
        IShopUserRepository shopUserRepository,
        IConfiguration configuration)
    {
        _superAdminRepository = superAdminRepository;
        _vendorRepository = vendorRepository;
        _shopUserRepository = shopUserRepository;
        _configuration = configuration;
    }

    public async Task<VendorAuthResultDto> LoginAsync(VendorLoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var superAdmin = await _superAdminRepository.GetByEmailAsync(request.Email);
        if (superAdmin is not null && BCrypt.Net.BCrypt.Verify(request.Password, superAdmin.PasswordHash))
        {
            return CreateSuperAdminToken(superAdmin);
        }

        var vendor = await _vendorRepository.GetByEmailAsync(request.Email);
        if (vendor is not null && BCrypt.Net.BCrypt.Verify(request.Password, vendor.PasswordHash))
        {
            return CreateShopAdminToken(vendor);
        }

        var shopUser = await _shopUserRepository.GetByLoginIdAsync(request.Email)
            ?? await _shopUserRepository.GetByEmailAsync(request.Email);
        if (shopUser is not null && shopUser.IsActive && BCrypt.Net.BCrypt.Verify(request.Password, shopUser.PasswordHash))
        {
            var shop = await _vendorRepository.GetByIdAsync(shopUser.VendorId);
            return CreateShopUserToken(shopUser, shop);
        }

        throw new UnauthorizedAccessException("Invalid email or password.");
    }

    private VendorAuthResultDto CreateSuperAdminToken(SuperAdmin superAdmin)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, superAdmin.Id.ToString()),
            new(ClaimTypes.Role, "SuperAdmin")
        };

        return new VendorAuthResultDto
        {
            VendorId = 0,
            Name = superAdmin.Name,
            StoreName = string.Empty,
            Role = "SuperAdmin",
            Token = BuildToken(claims)
        };
    }

    private VendorAuthResultDto CreateShopAdminToken(Vendor vendor)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, vendor.Id.ToString()),
            new("VendorId", vendor.Id.ToString()),
            new(ClaimTypes.Role, "Vendor"),
            new(ClaimTypes.Role, "ShopAdmin")
        };

        return new VendorAuthResultDto
        {
            VendorId = vendor.Id,
            Name = vendor.Name,
            StoreName = vendor.StoreName,
            Mobile = vendor.Mobile,
            AlternateMobile = vendor.AlternateMobile,
            GstNumber = vendor.GstNumber,
            BuildingNumber = vendor.BuildingNumber,
            StreetName = vendor.StreetName,
            District = vendor.District,
            State = vendor.State,
            Country = vendor.Country,
            Latitude = vendor.Latitude,
            Longitude = vendor.Longitude,
            Role = "ShopAdmin",
            Token = BuildToken(claims)
        };
    }

    private VendorAuthResultDto CreateShopUserToken(ShopUser shopUser, Vendor? shop)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, shopUser.Id.ToString()),
            new("VendorId", shopUser.VendorId.ToString()),
            new("ShopUserId", shopUser.Id.ToString()),
            new("CanAccessBilling", shopUser.CanAccessBilling ? "true" : "false"),
            new(ClaimTypes.Role, "Vendor"),
            new(ClaimTypes.Role, "ShopUser")
        };

        return new VendorAuthResultDto
        {
            VendorId = shopUser.VendorId,
            Name = shopUser.Name,
            StoreName = shop?.StoreName ?? string.Empty,
            Role = "ShopUser",
            CanAccessBilling = shopUser.CanAccessBilling,
            Token = BuildToken(claims)
        };
    }

    private string BuildToken(List<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
