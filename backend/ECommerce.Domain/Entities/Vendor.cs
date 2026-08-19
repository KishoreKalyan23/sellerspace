using System;
using System.Collections.Generic;

namespace ECommerce.Domain.Entities;

public class Vendor
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Email { get; set; }

    public required string StoreName { get; set; }

    public string? Mobile { get; set; }

    public string? AlternateMobile { get; set; }

    public string? GstNumber { get; set; }

    public string? BuildingNumber { get; set; }

    public string? StreetName { get; set; }

    public string? District { get; set; }

    public string? State { get; set; }

    public string? Country { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public required string PasswordHash { get; set; }

    public bool IsApproved { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
