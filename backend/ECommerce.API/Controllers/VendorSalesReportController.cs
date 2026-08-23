using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/sales-report")]
[Authorize(Roles = "ShopAdmin")]
public class VendorSalesReportController : ControllerBase
{
    private readonly ISalesReportService _salesReportService;

    public VendorSalesReportController(ISalesReportService salesReportService)
    {
        _salesReportService = salesReportService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<SalesReportDto>>> Get([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        if (endDate.Date < startDate.Date)
        {
            return BadRequest(new ApiResponse<SalesReportDto>
            {
                Success = false,
                Errors = ["End date cannot be before start date."]
            });
        }

        var vendorId = GetVendorIdFromClaims();
        var report = await _salesReportService.GetReportAsync(vendorId, startDate, endDate);
        return Ok(new ApiResponse<SalesReportDto>
        {
            Success = true,
            Data = report
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
