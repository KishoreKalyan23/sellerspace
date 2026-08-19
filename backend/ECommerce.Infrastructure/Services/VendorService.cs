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

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepository;
    private readonly IConfiguration _configuration;

    public VendorService(IVendorRepository vendorRepository, IConfiguration configuration)
    {
        _vendorRepository = vendorRepository;
        _configuration = configuration;
    }

    public async Task<VendorAuthResultDto> RegisterAsync(VendorRegistrationRequestDto request, CancellationToken cancellationToken = default)
    {
        var existingVendor = await _vendorRepository.GetByEmailAsync(request.Email);
        if (existingVendor is not null)
        {
            throw new InvalidOperationException("A vendor with that email already exists.");
        }

        var vendor = new Vendor
        {
            Name = request.Name,
            Email = request.Email,
            StoreName = request.StoreName,
            Mobile = request.Mobile,
            AlternateMobile = request.AlternateMobile,
            GstNumber = request.GstNumber,
            BuildingNumber = request.BuildingNumber,
            StreetName = request.StreetName,
            District = request.District,
            State = request.State,
            Country = request.Country,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _vendorRepository.AddAsync(vendor);
        return CreateTokenResponse(created);
    }

    public async Task<VendorAuthResultDto> LoginAsync(VendorLoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var vendor = await _vendorRepository.GetByEmailAsync(request.Email);
        if (vendor is null || !BCrypt.Net.BCrypt.Verify(request.Password, vendor.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return CreateTokenResponse(vendor);
    }

    private VendorAuthResultDto CreateTokenResponse(Vendor vendor)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, vendor.Id.ToString()),
            new("VendorId", vendor.Id.ToString()),
            new(ClaimTypes.Role, "Vendor")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

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
            Token = new JwtSecurityTokenHandler().WriteToken(token)
        };
    }
}
