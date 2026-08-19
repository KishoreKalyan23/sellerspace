using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IProductService _productService;

    public CategoriesController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategoryDto>>>> GetCategories()
    {
        var result = await _productService.GetCategoriesAsync();
        return Ok(new ApiResponse<IReadOnlyList<CategoryDto>>
        {
            Success = true,
            Data = result
        });
    }

    [HttpGet("{id:int}/products")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductListItemDto>>>> GetCategoryProducts(int id)
    {
        var result = await _productService.GetProductsByCategoryAsync(id);
        return Ok(new ApiResponse<IReadOnlyList<ProductListItemDto>>
        {
            Success = true,
            Data = result
        });
    }
}
