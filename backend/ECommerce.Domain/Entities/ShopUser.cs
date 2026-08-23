using System;

namespace ECommerce.Domain.Entities;

public class ShopUser
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public required string Name { get; set; }

    public required string LoginId { get; set; }

    public string? Email { get; set; }

    public required string PasswordHash { get; set; }

    public bool CanAccessBilling { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Vendor? Vendor { get; set; }
}
