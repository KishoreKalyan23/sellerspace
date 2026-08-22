using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/customers")]
[Authorize(Roles = "Vendor")]
public class VendorCustomersController : ControllerBase
{
    private readonly IBillingCustomerService _billingCustomerService;

    public VendorCustomersController(IBillingCustomerService billingCustomerService)
    {
        _billingCustomerService = billingCustomerService;
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BillingCustomerDto>>>> Search([FromQuery] string q)
    {
        var vendorId = GetVendorIdFromClaims();
        var results = await _billingCustomerService.SearchAsync(vendorId, q ?? string.Empty);
        return Ok(new ApiResponse<IReadOnlyList<BillingCustomerDto>>
        {
            Success = true,
            Data = results
        });
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BillingCustomerDto>>>> GetAll()
    {
        var vendorId = GetVendorIdFromClaims();
        var results = await _billingCustomerService.GetAllAsync(vendorId);
        return Ok(new ApiResponse<IReadOnlyList<BillingCustomerDto>>
        {
            Success = true,
            Data = results
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BillingCustomerDto>>> Create([FromBody] CreateBillingCustomerRequestDto request)
    {
        var vendorId = GetVendorIdFromClaims();

        try
        {
            var created = await _billingCustomerService.CreateAsync(vendorId, request);
            return Ok(new ApiResponse<BillingCustomerDto>
            {
                Success = true,
                Data = created
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<BillingCustomerDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }

    private int GetVendorIdFromClaims()
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("VendorId");
        if (int.TryParse(claimValue, out var vendorId))
        {
            return vendorId;
        }

        throw new InvalidOperationException("VendorId claim not found.");
    }
}
