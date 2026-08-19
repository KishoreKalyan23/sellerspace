using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor")]
[Authorize(Roles = "Vendor")]
public class VendorDashboardController : ControllerBase
{
    [HttpGet("dashboard-summary")]
    public ActionResult<ApiResponse<VendorDashboardSummaryDto>> GetDashboardSummary()
    {
        var summary = new VendorDashboardSummaryDto
        {
            TotalClients = 128,
            ActiveListings = 86,
            NetRevenue = 480000m,
            OrdersToday = 124,
            FulfillmentRate = 96.4,
            MostActiveClients = new[]
            {
                new VendorActivityDto { Name = "Northwind Living", OrderCount = 54, LastOrderDate = "2026-08-12" },
                new VendorActivityDto { Name = "Urban Cart", OrderCount = 41, LastOrderDate = "2026-08-10" },
                new VendorActivityDto { Name = "Aster & Co.", OrderCount = 29, LastOrderDate = "2026-08-08" }
            },
            BestSellers = new[]
            {
                new BestSellerDto { Name = "Aurora Desk Lamp", Units = 184, Revenue = "₹1.89L", Trend = "+12.4%" },
                new BestSellerDto { Name = "Terra Canvas Tote", Units = 146, Revenue = "₹1.47L", Trend = "+9.3%" },
                new BestSellerDto { Name = "Echo Wireless Speaker", Units = 121, Revenue = "₹2.61L", Trend = "+15.1%" }
            }
        };

        return Ok(new ApiResponse<VendorDashboardSummaryDto>
        {
            Success = true,
            Data = summary
        });
    }
}
