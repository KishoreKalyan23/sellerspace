using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/invoices")]
[Authorize(Roles = "ShopAdmin")]
public class VendorInvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public VendorInvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<InvoiceListItemDto>>>> GetAll()
    {
        var vendorId = GetVendorIdFromClaims();
        var results = await _invoiceService.GetAllAsync(vendorId);
        return Ok(new ApiResponse<IReadOnlyList<InvoiceListItemDto>>
        {
            Success = true,
            Data = results
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<InvoiceDetailDto>>> GetById(int id)
    {
        var vendorId = GetVendorIdFromClaims();
        var invoice = await _invoiceService.GetByIdAsync(vendorId, id);
        if (invoice is null)
        {
            return NotFound(new ApiResponse<InvoiceDetailDto>
            {
                Success = false,
                Errors = ["Invoice not found."]
            });
        }

        return Ok(new ApiResponse<InvoiceDetailDto>
        {
            Success = true,
            Data = invoice
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
