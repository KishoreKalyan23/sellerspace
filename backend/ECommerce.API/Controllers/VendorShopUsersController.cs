using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/shop-users")]
[Authorize(Roles = "ShopAdmin")]
public class VendorShopUsersController : ControllerBase
{
    private readonly IShopUserService _shopUserService;

    public VendorShopUsersController(IShopUserService shopUserService)
    {
        _shopUserService = shopUserService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ShopUserDto>>>> GetAll()
    {
        var vendorId = GetVendorIdFromClaims();
        var results = await _shopUserService.GetByVendorIdAsync(vendorId);
        return Ok(new ApiResponse<IReadOnlyList<ShopUserDto>>
        {
            Success = true,
            Data = results
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ShopUserDto>>> Create([FromBody] CreateShopUserRequestDto request)
    {
        var vendorId = GetVendorIdFromClaims();

        try
        {
            var created = await _shopUserService.CreateAsync(vendorId, request);
            return Ok(new ApiResponse<ShopUserDto>
            {
                Success = true,
                Data = created
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ShopUserDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ShopUserDto>>> Update(int id, [FromBody] UpdateShopUserRequestDto request)
    {
        var vendorId = GetVendorIdFromClaims();
        var updated = await _shopUserService.UpdateAsync(vendorId, id, request);
        if (updated is null)
        {
            return NotFound(new ApiResponse<ShopUserDto>
            {
                Success = false,
                Errors = ["Shop user not found."]
            });
        }

        return Ok(new ApiResponse<ShopUserDto>
        {
            Success = true,
            Data = updated
        });
    }

    [HttpPut("{id:int}/reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword(int id, [FromBody] ResetShopUserPasswordRequestDto request)
    {
        var vendorId = GetVendorIdFromClaims();
        var success = await _shopUserService.ResetPasswordAsync(vendorId, id, request);
        if (!success)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Errors = ["Shop user not found."]
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = null
        });
    }

    private int GetVendorIdFromClaims()
    {
        var claimValue = User.FindFirstValue("VendorId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(claimValue, out var vendorId))
        {
            return vendorId;
        }

        throw new InvalidOperationException("VendorId claim not found.");
    }
}
