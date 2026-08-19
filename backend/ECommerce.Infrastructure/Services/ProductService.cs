using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Application.Queries;
using ECommerce.Domain.Entities;

namespace ECommerce.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IVendorRepository _vendorRepository;

    public ProductService(IProductRepository productRepository, ICategoryRepository categoryRepository, IVendorRepository vendorRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _vendorRepository = vendorRepository;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetAllAsync();
        var lookup = categories.ToDictionary(c => c.Id);
        var roots = categories.Where(c => c.ParentCategoryId is null).ToList();

        return BuildCategoryTree(roots, lookup);
    }

    public async Task<PagedResult<ProductListItemDto>> SearchProductsAsync(ProductSearchQuery query, CancellationToken cancellationToken = default)
    {
        var result = await _productRepository.SearchAsync(query);
        return new PagedResult<ProductListItemDto>
        {
            Items = result.Items.Select(MapToListItem).ToList(),
            PageNumber = result.PageNumber,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        };
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id);
        return product is null ? null : MapToDetail(product);
    }

    public async Task<IReadOnlyList<ProductListItemDto>> GetProductsByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var products = await _productRepository.GetByCategoryAsync(categoryId);
        return products.Select(MapToListItem).ToList();
    }

    public async Task<IReadOnlyList<ProductListItemDto>> GetVendorProductsAsync(int vendorId, CancellationToken cancellationToken = default)
    {
        var products = await _productRepository.GetByVendorAsync(vendorId);
        return products.Select(MapToListItem).ToList();
    }

    public async Task<ProductDetailDto> CreateProductAsync(int vendorId, CreateProductRequestDto request, CancellationToken cancellationToken = default)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId);
        if (vendor is null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        var categoryExists = (await _categoryRepository.GetAllAsync())
            .Any(c => c.Id == request.CategoryId);

        if (!categoryExists)
        {
            throw new InvalidOperationException("Category not found.");
        }

        var product = new Product
        {
            VendorId = vendorId,
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            ImageUrl = request.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Vendor = null!,
            Category = null!
        };

        var created = await _productRepository.AddAsync(product);
        return MapToDetail(created);
    }

    public async Task<ProductDetailDto?> UpdateProductAsync(int vendorId, int productId, UpdateProductRequestDto request, CancellationToken cancellationToken = default)
    {
        var existingProduct = await _productRepository.GetByIdAsync(productId);
        if (existingProduct is null || existingProduct.VendorId != vendorId)
        {
            return null;
        }

        var categoryExists = (await _categoryRepository.GetAllAsync())
            .Any(c => c.Id == request.CategoryId);

        if (!categoryExists)
        {
            throw new InvalidOperationException("Category not found.");
        }

        var updated = await _productRepository.UpdateAsync(new Product
        {
            Id = productId,
            VendorId = vendorId,
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            ImageUrl = request.ImageUrl,
            IsActive = existingProduct.IsActive,
            CreatedAt = existingProduct.CreatedAt,
            UpdatedAt = DateTime.UtcNow,
            Vendor = null!,
            Category = null!
        });

        return updated is null ? null : MapToDetail(updated);
    }

    public async Task<bool> DeleteProductAsync(int vendorId, int productId, CancellationToken cancellationToken = default)
    {
        return await _productRepository.SoftDeleteAsync(productId, vendorId);
    }

    public async Task<ProductDetailDto?> UploadProductImagesAsync(int vendorId, int productId, IReadOnlyList<string> imageUrls, CancellationToken cancellationToken = default)
    {
        var existingProduct = await _productRepository.GetByIdAsync(productId);
        if (existingProduct is null || existingProduct.VendorId != vendorId)
        {
            return null;
        }

        var updated = await _productRepository.AddImagesAsync(productId, imageUrls);
        return updated is null ? null : MapToDetail(updated);
    }

    private IReadOnlyList<CategoryDto> BuildCategoryTree(IReadOnlyList<Category> categories, Dictionary<int, Category> lookup)
    {
        return categories.Select(category => new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ParentCategoryId = category.ParentCategoryId,
            Children = BuildCategoryTree(
                categories.Where(c => c.ParentCategoryId == category.Id).ToList(),
                lookup)
        }).ToList();
    }

    private ProductListItemDto MapToListItem(Product product)
    {
        return new ProductListItemDto
        {
            Id = product.Id,
            VendorId = product.VendorId,
            CategoryId = product.CategoryId,
            Name = product.Name,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            VendorName = product.Vendor?.StoreName ?? product.Vendor?.Name,
            CategoryName = product.Category?.Name
        };
    }

    private ProductDetailDto MapToDetail(Product product)
    {
        return new ProductDetailDto
        {
            Id = product.Id,
            VendorId = product.VendorId,
            CategoryId = product.CategoryId,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            ImageUrls = product.Images.OrderBy(image => image.SortOrder).Select(image => image.ImageUrl).ToList(),
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            VendorName = product.Vendor?.StoreName ?? product.Vendor?.Name ?? string.Empty,
            CategoryName = product.Category?.Name ?? string.Empty
        };
    }
}
