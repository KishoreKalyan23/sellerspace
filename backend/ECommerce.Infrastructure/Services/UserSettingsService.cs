using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;

namespace ECommerce.Infrastructure.Services;

public class UserSettingsService : IUserSettingsService
{
    private readonly IUserSettingsRepository _userSettingsRepository;

    public UserSettingsService(IUserSettingsRepository userSettingsRepository)
    {
        _userSettingsRepository = userSettingsRepository;
    }

    public async Task<UserSettingsDto> GetAsync(int userId, string userType)
    {
        var settings = await _userSettingsRepository.GetAsync(userId, userType);
        return new UserSettingsDto
        {
            UseProBilling = settings?.UseProBilling ?? false
        };
    }

    public async Task<UserSettingsDto> UpdateAsync(int userId, string userType, UpdateUserSettingsRequestDto request)
    {
        var settings = await _userSettingsRepository.GetAsync(userId, userType);
        if (settings is null)
        {
            settings = new UserSettings
            {
                UserId = userId,
                UserType = userType,
                UseProBilling = request.UseProBilling,
                CreatedAt = DateTime.UtcNow
            };
            await _userSettingsRepository.AddAsync(settings);
        }
        else
        {
            settings.UseProBilling = request.UseProBilling;
            await _userSettingsRepository.UpdateAsync(settings);
        }

        return new UserSettingsDto { UseProBilling = settings.UseProBilling };
    }
}
