using System;

namespace ECommerce.Domain.Entities;

public class UserSettings
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public required string UserType { get; set; }

    public bool UseProBilling { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
