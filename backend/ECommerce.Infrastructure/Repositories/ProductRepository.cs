using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Queries;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ECommerceDbContext _context;

    public ProductRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Vendor)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
    }

    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(int categoryId)
    {
        var categoryIds = await GetDescendantCategoryIdsAsync(categoryId);

        return await _context.Products
            .AsNoTracking()
            .Where(p => p.IsActive && categoryIds.Contains(p.CategoryId))
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<PagedResult<Product>> SearchAsync(ProductSearchQuery query)
    {
        var pageNumber = Math.Max(1, query.PageNumber);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var productsQuery = _context.Products
            .AsNoTracking()
            .Where(p => p.IsActive);

        if (query.CategoryId.HasValue)
        {
            var categoryIds = await GetDescendantCategoryIdsAsync(query.CategoryId.Value);
            productsQuery = productsQuery.Where(p => categoryIds.Contains(p.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim();
            productsQuery = productsQuery.Where(p => p.Name.Contains(term) || (p.Description != null && p.Description.Contains(term)));
        }

        if (query.MinPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.Price <= query.MaxPrice.Value);
        }

        var totalCount = await productsQuery.CountAsync();

        var orderedQuery = query.SortBy?.ToLowerInvariant() switch
        {
            "price_desc" => productsQuery.OrderByDescending(p => p.Price),
            "price_asc" => productsQuery.OrderBy(p => p.Price),
            _ => productsQuery.OrderByDescending(p => p.CreatedAt)
        };

        var items = await orderedQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Product>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<IReadOnlyList<Product>> GetByVendorAsync(int vendorId)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Vendor)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.VendorId == vendorId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Product> AddAsync(Product product)
    {
        if (product.CreatedAt == default)
        {
            product.CreatedAt = DateTime.UtcNow;
        }

        if (product.UpdatedAt == default)
        {
            product.UpdatedAt = null;
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product?> UpdateAsync(Product product)
    {
        var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == product.Id);
        if (existingProduct is null)
        {
            return null;
        }

        if (existingProduct.VendorId != product.VendorId)
        {
            return null;
        }

        existingProduct.CategoryId = product.CategoryId;
        existingProduct.Name = product.Name;
        existingProduct.Description = product.Description;
        existingProduct.Price = product.Price;
        existingProduct.Stock = product.Stock;
        existingProduct.ImageUrl = product.ImageUrl;
        existingProduct.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existingProduct;
    }

    public async Task<Product?> AddImagesAsync(int productId, IReadOnlyList<string> imageUrls)
    {
        var product = await _context.Products
            .Include(item => item.Images)
            .FirstOrDefaultAsync(item => item.Id == productId);
        if (product is null)
        {
            return null;
        }

        var nextSortOrder = product.Images.Count;
        foreach (var imageUrl in imageUrls)
        {
            product.Images.Add(new ProductImage
            {
                ImageUrl = imageUrl,
                SortOrder = nextSortOrder++,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (string.IsNullOrEmpty(product.ImageUrl) && imageUrls.Count > 0)
        {
            product.ImageUrl = imageUrls[0];
        }

        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<bool> SoftDeleteAsync(int productId, int vendorId)
    {
        var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && p.VendorId == vendorId);
        if (existingProduct is null)
        {
            return false;
        }

        existingProduct.IsActive = false;
        existingProduct.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<IReadOnlyList<int>> GetDescendantCategoryIdsAsync(int categoryId)
    {
        var ids = new List<int> { categoryId };
        var pending = new Queue<int>(new[] { categoryId });

        while (pending.Count > 0)
        {
            var current = pending.Dequeue();
            var children = await _context.Categories
                .AsNoTracking()
                .Where(c => c.ParentCategoryId == current)
                .Select(c => c.Id)
                .ToListAsync();

            foreach (var childId in children)
            {
                if (!ids.Contains(childId))
                {
                    ids.Add(childId);
                    pending.Enqueue(childId);
                }
            }
        }

        return ids;
    }
}
