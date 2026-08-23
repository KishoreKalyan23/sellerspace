using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces.Repositories;

public interface IUserSettingsRepository
{
    Task<UserSettings?> GetAsync(int userId, string userType);

    Task<UserSettings> AddAsync(UserSettings settings);

    Task UpdateAsync(UserSettings settings);
}
