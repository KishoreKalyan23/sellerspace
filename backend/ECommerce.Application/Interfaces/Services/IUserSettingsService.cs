using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces.Services;

public interface IUserSettingsService
{
    Task<UserSettingsDto> GetAsync(int userId, string userType);

    Task<UserSettingsDto> UpdateAsync(int userId, string userType, UpdateUserSettingsRequestDto request);
}
