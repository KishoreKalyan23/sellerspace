using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces.Repositories;

public interface IVendorRepository
{
    Task<Vendor?> GetByIdAsync(int id);

    Task<Vendor?> GetByEmailAsync(string email);

    Task<IReadOnlyList<Vendor>> GetAllAsync();

    Task<Vendor> AddAsync(Vendor vendor);
}
