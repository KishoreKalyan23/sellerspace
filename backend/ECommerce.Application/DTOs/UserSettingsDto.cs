namespace ECommerce.Application.DTOs;

public class UserSettingsDto
{
    public bool UseProBilling { get; set; }
}

public class UpdateUserSettingsRequestDto
{
    public bool UseProBilling { get; set; }
}
