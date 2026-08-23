using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/settings")]
[Authorize(Roles = "Vendor")]
public class VendorUserSettingsController : ControllerBase
{
    private readonly IUserSettingsService _userSettingsService;

    public VendorUserSettingsController(IUserSettingsService userSettingsService)
    {
        _userSettingsService = userSettingsService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<UserSettingsDto>>> Get()
    {
        var (userId, userType) = GetCurrentUser();
        var settings = await _userSettingsService.GetAsync(userId, userType);
        return Ok(new ApiResponse<UserSettingsDto>
        {
            Success = true,
            Data = settings
        });
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<UserSettingsDto>>> Update([FromBody] UpdateUserSettingsRequestDto request)
    {
        var (userId, userType) = GetCurrentUser();
        var settings = await _userSettingsService.UpdateAsync(userId, userType, request);
        return Ok(new ApiResponse<UserSettingsDto>
        {
            Success = true,
            Data = settings
        });
    }

    private (int UserId, string UserType) GetCurrentUser()
    {
        if (User.IsInRole("ShopUser"))
        {
            var shopUserId = User.FindFirstValue("ShopUserId");
            if (int.TryParse(shopUserId, out var id))
            {
                return (id, "ShopUser");
            }

            throw new InvalidOperationException("ShopUserId claim not found.");
        }

        var vendorId = User.FindFirstValue("VendorId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(vendorId, out var vid))
        {
            return (vid, "ShopAdmin");
        }

        throw new InvalidOperationException("VendorId claim not found.");
    }
}
