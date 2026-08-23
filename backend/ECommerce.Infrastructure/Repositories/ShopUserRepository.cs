using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class ShopUserRepository : IShopUserRepository
{
    private readonly ECommerceDbContext _context;

    public ShopUserRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<ShopUser?> GetByIdAsync(int id)
    {
        return await _context.ShopUsers
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<ShopUser?> GetByEmailAsync(string email)
    {
        return await _context.ShopUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Email == email);
    }

    public async Task<ShopUser?> GetByLoginIdAsync(string loginId)
    {
        return await _context.ShopUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.LoginId == loginId);
    }

    public async Task<IReadOnlyList<ShopUser>> GetByVendorIdAsync(int vendorId)
    {
        return await _context.ShopUsers
            .AsNoTracking()
            .Where(s => s.VendorId == vendorId)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<ShopUser> AddAsync(ShopUser shopUser)
    {
        if (shopUser.CreatedAt == default)
        {
            shopUser.CreatedAt = DateTime.UtcNow;
        }

        _context.ShopUsers.Add(shopUser);
        await _context.SaveChangesAsync();
        return shopUser;
    }

    public async Task UpdateAsync(ShopUser shopUser)
    {
        _context.ShopUsers.Update(shopUser);
        await _context.SaveChangesAsync();
    }
}
