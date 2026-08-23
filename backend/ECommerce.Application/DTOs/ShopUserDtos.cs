namespace ECommerce.Application.DTOs;

public class ShopUserDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string LoginId { get; set; } = string.Empty;

    public string? Email { get; set; }

    public bool CanAccessBilling { get; set; }

    public bool IsActive { get; set; }

    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateShopUserRequestDto
{
    public string Name { get; set; } = string.Empty;

    public string LoginId { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string Password { get; set; } = string.Empty;

    public bool CanAccessBilling { get; set; }
}

public class UpdateShopUserRequestDto
{
    public string Name { get; set; } = string.Empty;

    public bool CanAccessBilling { get; set; }

    public bool IsActive { get; set; }
}

public class ResetShopUserPasswordRequestDto
{
    public string NewPassword { get; set; } = string.Empty;
}
