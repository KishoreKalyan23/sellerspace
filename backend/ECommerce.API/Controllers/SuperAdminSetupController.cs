using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/superadmin/setup")]
public class SuperAdminSetupController : ControllerBase
{
    private readonly ISuperAdminService _superAdminService;

    public SuperAdminSetupController(ISuperAdminService superAdminService)
    {
        _superAdminService = superAdminService;
    }

    [HttpGet("status")]
    public async Task<ActionResult<ApiResponse<SuperAdminSetupStatusDto>>> GetStatus()
    {
        var isSetupComplete = await _superAdminService.IsSetupCompleteAsync();
        return Ok(new ApiResponse<SuperAdminSetupStatusDto>
        {
            Success = true,
            Data = new SuperAdminSetupStatusDto { IsSetupComplete = isSetupComplete }
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<VendorAuthResultDto>>> Setup([FromBody] SuperAdminSetupRequestDto request)
    {
        try
        {
            var result = await _superAdminService.SetupAsync(request);
            return Ok(new ApiResponse<VendorAuthResultDto>
            {
                Success = true,
                Data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<VendorAuthResultDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }
}
