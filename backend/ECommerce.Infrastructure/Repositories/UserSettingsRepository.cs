using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class UserSettingsRepository : IUserSettingsRepository
{
    private readonly ECommerceDbContext _context;

    public UserSettingsRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<UserSettings?> GetAsync(int userId, string userType)
    {
        return await _context.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId && s.UserType == userType);
    }

    public async Task<UserSettings> AddAsync(UserSettings settings)
    {
        if (settings.CreatedAt == default)
        {
            settings.CreatedAt = DateTime.UtcNow;
        }

        _context.UserSettings.Add(settings);
        await _context.SaveChangesAsync();
        return settings;
    }

    public async Task UpdateAsync(UserSettings settings)
    {
        settings.UpdatedAt = DateTime.UtcNow;
        _context.UserSettings.Update(settings);
        await _context.SaveChangesAsync();
    }
}
