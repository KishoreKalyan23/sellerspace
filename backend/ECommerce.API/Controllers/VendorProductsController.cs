using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/products")]
[Authorize(Roles = "Vendor")]
public class VendorProductsController : ControllerBase
{
    private const long MaximumImageSizeBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    private readonly IProductService _productService;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public VendorProductsController(IProductService productService, IWebHostEnvironment webHostEnvironment)
    {
        _productService = productService;
        _webHostEnvironment = webHostEnvironment;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductListItemDto>>>> GetVendorProducts()
    {
        var vendorId = GetVendorIdFromClaims();
        var result = await _productService.GetVendorProductsAsync(vendorId);
        return Ok(new ApiResponse<IReadOnlyList<ProductListItemDto>>
        {
            Success = true,
            Data = result
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> CreateProduct([FromBody] CreateProductRequestDto request)
    {
        var vendorId = GetVendorIdFromClaims();
        var result = await _productService.CreateProductAsync(vendorId, request);
        return Ok(new ApiResponse<ProductDetailDto>
        {
            Success = true,
            Data = result
        });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> UpdateProduct(int id, [FromBody] UpdateProductRequestDto request)
    {
        var vendorId = GetVendorIdFromClaims();
        var result = await _productService.UpdateProductAsync(vendorId, id, request);
        if (result is null)
        {
            return Forbid();
        }

        return Ok(new ApiResponse<ProductDetailDto>
        {
            Success = true,
            Data = result
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteProduct(int id)
    {
        var vendorId = GetVendorIdFromClaims();
        var deleted = await _productService.DeleteProductAsync(vendorId, id);
        if (!deleted)
        {
            return Forbid();
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = null
        });
    }

    [HttpPost("{id:int}/image")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> UploadProductImages(int id, [FromForm] List<IFormFile> images)
    {
        if (images.Count == 0 || images.Count > 6 || images.Any(image => image.Length == 0 || image.Length > MaximumImageSizeBytes || !AllowedImageTypes.Contains(image.ContentType)))
        {
            return BadRequest(new ApiResponse<ProductDetailDto>
            {
                Success = false,
                Errors = ["Upload between one and six JPG, PNG, or WebP images smaller than 5 MB each."]
            });
        }

        var vendorId = GetVendorIdFromClaims();
        var uploadsDirectory = Path.Combine(_webHostEnvironment.WebRootPath ?? Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot"), "uploads", "products");
        Directory.CreateDirectory(uploadsDirectory);

        var uploadedFiles = new List<string>();
        foreach (var image in images)
        {
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsDirectory, fileName);

            await using var stream = System.IO.File.Create(filePath);
            await image.CopyToAsync(stream);
            uploadedFiles.Add(filePath);
        }

        var imageUrls = uploadedFiles
            .Select(filePath => $"/uploads/products/{Path.GetFileName(filePath)}")
            .ToList();
        var result = await _productService.UploadProductImagesAsync(vendorId, id, imageUrls);
        if (result is null)
        {
            foreach (var filePath in uploadedFiles)
            {
                System.IO.File.Delete(filePath);
            }
            return Forbid();
        }

        return Ok(new ApiResponse<ProductDetailDto>
        {
            Success = true,
            Data = result
        });
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
