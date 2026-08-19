using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductListItemDto>>>> GetProducts([FromQuery] ProductSearchQuery query)
    {
        var result = await _productService.SearchProductsAsync(query);
        return Ok(new ApiResponse<PagedResult<ProductListItemDto>>
        {
            Success = true,
            Data = result
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> GetProduct(int id)
    {
        var result = await _productService.GetProductByIdAsync(id);
        if (result is null)
        {
            return NotFound(new ApiResponse<ProductDetailDto>
            {
                Success = false,
                Errors = new[] { "Product not found." }
            });
        }

        return Ok(new ApiResponse<ProductDetailDto>
        {
            Success = true,
            Data = result
        });
    }
}
