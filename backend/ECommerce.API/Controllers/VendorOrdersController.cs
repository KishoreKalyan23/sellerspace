using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/orders")]
[Authorize(Roles = "Vendor")]
public class VendorOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public VendorOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderSummaryDto>>> Checkout([FromBody] CheckoutRequestDto request)
    {
        if (!HasBillingAccess())
        {
            return Forbid();
        }

        var vendorId = GetVendorIdFromClaims();

        try
        {
            var result = await _orderService.CheckoutAsync(vendorId, request);
            return Ok(new ApiResponse<OrderSummaryDto>
            {
                Success = true,
                Data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<OrderSummaryDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }

    [HttpPost("{id:int}/return")]
    public async Task<ActionResult<ApiResponse<OrderSummaryDto>>> Return(int id)
    {
        if (!HasBillingAccess())
        {
            return Forbid();
        }

        var vendorId = GetVendorIdFromClaims();

        try
        {
            var result = await _orderService.ReturnOrderAsync(vendorId, id);
            return Ok(new ApiResponse<OrderSummaryDto>
            {
                Success = true,
                Data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<OrderSummaryDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
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

    private bool HasBillingAccess()
    {
        if (!User.IsInRole("ShopUser"))
        {
            return true;
        }

        return User.FindFirstValue("CanAccessBilling") == "true";
    }
}
