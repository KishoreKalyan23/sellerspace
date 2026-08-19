using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public AuthController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<VendorAuthResultDto>>> Login([FromBody] VendorLoginRequestDto request)
    {
        var result = await _vendorService.LoginAsync(request);
        return Ok(new ApiResponse<VendorAuthResultDto>
        {
            Success = true,
            Data = result
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<VendorAuthResultDto>>> Register([FromBody] VendorRegistrationRequestDto request)
    {
        var result = await _vendorService.RegisterAsync(request);
        return Ok(new ApiResponse<VendorAuthResultDto>
        {
            Success = true,
            Data = result
        });
    }
}
