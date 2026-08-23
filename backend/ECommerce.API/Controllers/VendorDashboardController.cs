using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor")]
[Authorize(Roles = "Vendor")]
public class VendorDashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public VendorDashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("dashboard-summary")]
    public async Task<ActionResult<ApiResponse<VendorDashboardSummaryDto>>> GetDashboardSummary()
    {
        var vendorId = GetVendorIdFromClaims();
        var summary = await _dashboardService.GetSummaryAsync(vendorId);
        return Ok(new ApiResponse<VendorDashboardSummaryDto>
        {
            Success = true,
            Data = summary
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
