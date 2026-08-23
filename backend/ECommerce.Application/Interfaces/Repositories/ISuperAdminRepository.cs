using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces.Repositories;

public interface ISuperAdminRepository
{
    Task<SuperAdmin?> GetByEmailAsync(string email);

    Task<bool> AnyAsync();

    Task<SuperAdmin> AddAsync(SuperAdmin superAdmin);
}
