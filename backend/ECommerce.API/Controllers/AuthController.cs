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
    private readonly IAuthService _authService;

    public AuthController(IVendorService vendorService, IAuthService authService)
    {
        _vendorService = vendorService;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<VendorAuthResultDto>>> Login([FromBody] VendorLoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
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
