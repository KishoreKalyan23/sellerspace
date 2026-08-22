using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ECommerceDbContext _context;

    public CategoryService(ICategoryRepository categoryRepository, ECommerceDbContext context)
    {
        _categoryRepository = categoryRepository;
        _context = context;
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Category name is required.");
        }

        await EnsureParentExistsAsync(request.ParentCategoryId, cancellationToken);

        var category = await _categoryRepository.AddAsync(new Category
        {
            Name = name,
            ParentCategoryId = request.ParentCategoryId
        });

        return ToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(int categoryId, UpdateCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Category name is required.");
        }

        if (request.ParentCategoryId == categoryId)
        {
            throw new InvalidOperationException("A category cannot be its own parent.");
        }

        await EnsureParentExistsAsync(request.ParentCategoryId, cancellationToken);

        var updated = await _categoryRepository.UpdateAsync(new Category
        {
            Id = categoryId,
            Name = name,
            ParentCategoryId = request.ParentCategoryId
        });

        return updated is null ? null : ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == categoryId, cancellationToken);
        if (hasProducts)
        {
            throw new InvalidOperationException("Reassign or remove the products in this category before deleting it.");
        }

        var hasChildren = await _context.Categories.AnyAsync(c => c.ParentCategoryId == categoryId, cancellationToken);
        if (hasChildren)
        {
            throw new InvalidOperationException("Remove or move the subcategories under this category before deleting it.");
        }

        return await _categoryRepository.DeleteAsync(categoryId);
    }

    private async Task EnsureParentExistsAsync(int? parentCategoryId, CancellationToken cancellationToken)
    {
        if (!parentCategoryId.HasValue)
        {
            return;
        }

        var parentExists = await _context.Categories.AnyAsync(c => c.Id == parentCategoryId.Value, cancellationToken);
        if (!parentExists)
        {
            throw new InvalidOperationException("Selected parent category was not found.");
        }
    }

    private static CategoryDto ToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        ParentCategoryId = category.ParentCategoryId
    };
}
