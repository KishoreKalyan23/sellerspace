using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class VendorRepository : IVendorRepository
{
    private readonly ECommerceDbContext _context;

    public VendorRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<Vendor?> GetByIdAsync(int id)
    {
        return await _context.Vendors
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Vendor?> GetByEmailAsync(string email)
    {
        return await _context.Vendors
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Email == email);
    }

    public async Task<IReadOnlyList<Vendor>> GetAllAsync()
    {
        return await _context.Vendors
            .AsNoTracking()
            .OrderBy(v => v.StoreName)
            .ToListAsync();
    }

    public async Task<Vendor> AddAsync(Vendor vendor)
    {
        if (vendor.CreatedAt == default)
        {
            vendor.CreatedAt = DateTime.UtcNow;
        }

        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return vendor;
    }
}
