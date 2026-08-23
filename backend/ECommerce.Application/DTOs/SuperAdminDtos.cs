namespace ECommerce.Application.DTOs;

public class SuperAdminSetupRequestDto
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class SuperAdminSetupStatusDto
{
    public bool IsSetupComplete { get; set; }
}

public class ShopSummaryDto
{
    public int VendorId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string StoreName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsApproved { get; set; }

    public string CreatedAt { get; set; } = string.Empty;
}
