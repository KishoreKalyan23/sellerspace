using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;

namespace ECommerce.Infrastructure.Services;

public class SuperAdminService : ISuperAdminService
{
    private readonly ISuperAdminRepository _superAdminRepository;
    private readonly IVendorRepository _vendorRepository;
    private readonly IAuthService _authService;

    public SuperAdminService(
        ISuperAdminRepository superAdminRepository,
        IVendorRepository vendorRepository,
        IAuthService authService)
    {
        _superAdminRepository = superAdminRepository;
        _vendorRepository = vendorRepository;
        _authService = authService;
    }

    public async Task<bool> IsSetupCompleteAsync()
    {
        return await _superAdminRepository.AnyAsync();
    }

    public async Task<VendorAuthResultDto> SetupAsync(SuperAdminSetupRequestDto request)
    {
        if (await _superAdminRepository.AnyAsync())
        {
            throw new InvalidOperationException("A super admin account already exists.");
        }

        var superAdmin = new SuperAdmin
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _superAdminRepository.AddAsync(superAdmin);

        return await _authService.LoginAsync(new VendorLoginRequestDto
        {
            Email = request.Email,
            Password = request.Password
        });
    }

    public async Task<IReadOnlyList<ShopSummaryDto>> GetAllShopsAsync()
    {
        var vendors = await _vendorRepository.GetAllAsync();
        return vendors
            .Select(v => new ShopSummaryDto
            {
                VendorId = v.Id,
                Name = v.Name,
                StoreName = v.StoreName,
                Email = v.Email,
                IsApproved = v.IsApproved,
                CreatedAt = v.CreatedAt.ToString("O")
            })
            .ToList();
    }
}
