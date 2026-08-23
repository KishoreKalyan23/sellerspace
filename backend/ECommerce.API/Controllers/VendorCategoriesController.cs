using ECommerce.API.Models;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/vendor/categories")]
[Authorize(Roles = "ShopAdmin")]
public class VendorCategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public VendorCategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryRequestDto request)
    {
        try
        {
            var created = await _categoryService.CreateAsync(request);
            return Ok(new ApiResponse<CategoryDto>
            {
                Success = true,
                Data = created
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<CategoryDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(int id, [FromBody] UpdateCategoryRequestDto request)
    {
        try
        {
            var updated = await _categoryService.UpdateAsync(id, request);
            if (updated is null)
            {
                return NotFound(new ApiResponse<CategoryDto>
                {
                    Success = false,
                    Errors = ["Category not found."]
                });
            }

            return Ok(new ApiResponse<CategoryDto>
            {
                Success = true,
                Data = updated
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<CategoryDto>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        try
        {
            var deleted = await _categoryService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Errors = ["Category not found."]
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = null
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Errors = [ex.Message]
            });
        }
    }
}
