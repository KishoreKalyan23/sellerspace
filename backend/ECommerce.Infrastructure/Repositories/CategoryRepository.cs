using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ECommerceDbContext _context;

    public CategoryRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync()
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category> AddAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category?> UpdateAsync(Category category)
    {
        var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Id == category.Id);
        if (existing is null)
        {
            return null;
        }

        existing.Name = category.Name;
        existing.ParentCategoryId = category.ParentCategoryId;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (existing is null)
        {
            return false;
        }

        _context.Categories.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}
