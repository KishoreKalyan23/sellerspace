using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync();

    Task<Category> AddAsync(Category category);

    Task<Category?> UpdateAsync(Category category);

    Task<bool> DeleteAsync(int id);
}
