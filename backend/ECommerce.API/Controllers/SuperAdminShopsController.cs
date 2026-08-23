using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/superadmin/shops")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminShopsController : ControllerBase
{
    private readonly ISuperAdminService _superAdminService;
    private readonly IDashboardService _dashboardService;

    public SuperAdminShopsController(ISuperAdminService superAdminService, IDashboardService dashboardService)
    {
        _superAdminService = superAdminService;
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ShopSummaryDto>>>> GetAll()
    {
        var shops = await _superAdminService.GetAllShopsAsync();
        return Ok(new ApiResponse<IReadOnlyList<ShopSummaryDto>>
        {
            Success = true,
            Data = shops
        });
    }

    [HttpGet("{vendorId:int}")]
    public async Task<ActionResult<ApiResponse<VendorDashboardSummaryDto>>> GetShopDetail(int vendorId)
    {
        var summary = await _dashboardService.GetSummaryAsync(vendorId);
        return Ok(new ApiResponse<VendorDashboardSummaryDto>
        {
            Success = true,
            Data = summary
        });
    }
}
