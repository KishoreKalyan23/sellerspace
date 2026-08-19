using ECommerce.Application.DTOs;
using ECommerce.Application.Queries;

namespace ECommerce.Application.Interfaces.Services;

public interface IProductService
{
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);

    Task<PagedResult<ProductListItemDto>> SearchProductsAsync(ProductSearchQuery query, CancellationToken cancellationToken = default);

    Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProductListItemDto>> GetProductsByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProductListItemDto>> GetVendorProductsAsync(int vendorId, CancellationToken cancellationToken = default);

    Task<ProductDetailDto> CreateProductAsync(int vendorId, CreateProductRequestDto request, CancellationToken cancellationToken = default);

    Task<ProductDetailDto?> UpdateProductAsync(int vendorId, int productId, UpdateProductRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteProductAsync(int vendorId, int productId, CancellationToken cancellationToken = default);

    Task<ProductDetailDto?> UploadProductImagesAsync(int vendorId, int productId, IReadOnlyList<string> imageUrls, CancellationToken cancellationToken = default);
}
