using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<CategoryDto> CreateAsync(CreateCategoryRequestDto request, CancellationToken cancellationToken = default);

    Task<CategoryDto?> UpdateAsync(int categoryId, UpdateCategoryRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int categoryId, CancellationToken cancellationToken = default);
}
