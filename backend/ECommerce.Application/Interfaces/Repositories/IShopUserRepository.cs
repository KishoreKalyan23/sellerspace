using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces.Repositories;

public interface IShopUserRepository
{
    Task<ShopUser?> GetByIdAsync(int id);

    Task<ShopUser?> GetByEmailAsync(string email);

    Task<ShopUser?> GetByLoginIdAsync(string loginId);

    Task<IReadOnlyList<ShopUser>> GetByVendorIdAsync(int vendorId);

    Task<ShopUser> AddAsync(ShopUser shopUser);

    Task UpdateAsync(ShopUser shopUser);
}
