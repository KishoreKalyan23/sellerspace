using System;

namespace ECommerce.Domain.Entities;

public class SuperAdmin
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Email { get; set; }

    public required string PasswordHash { get; set; }

    public DateTime CreatedAt { get; set; }
}
