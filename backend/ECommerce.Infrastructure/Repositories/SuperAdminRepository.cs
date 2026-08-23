using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class SuperAdminRepository : ISuperAdminRepository
{
    private readonly ECommerceDbContext _context;

    public SuperAdminRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<SuperAdmin?> GetByEmailAsync(string email)
    {
        return await _context.SuperAdmins
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Email == email);
    }

    public async Task<bool> AnyAsync()
    {
        return await _context.SuperAdmins.AsNoTracking().AnyAsync();
    }

    public async Task<SuperAdmin> AddAsync(SuperAdmin superAdmin)
    {
        if (superAdmin.CreatedAt == default)
        {
            superAdmin.CreatedAt = DateTime.UtcNow;
        }

        _context.SuperAdmins.Add(superAdmin);
        await _context.SaveChangesAsync();
        return superAdmin;
    }
}
