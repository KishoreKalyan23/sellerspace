using ECommerce.Application.DTOs;
using ECommerce.Application.Queries;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetAllAsync();

    Task<Product?> GetByIdAsync(int id);

    Task<IReadOnlyList<Product>> GetByCategoryAsync(int categoryId);

    Task<PagedResult<Product>> SearchAsync(ProductSearchQuery query);

    Task<IReadOnlyList<Product>> GetByVendorAsync(int vendorId);

    Task<Product> AddAsync(Product product);

    Task<Product?> UpdateAsync(Product product);

    Task<Product?> AddImagesAsync(int productId, IReadOnlyList<string> imageUrls);

    Task<bool> SoftDeleteAsync(int productId, int vendorId);
}
