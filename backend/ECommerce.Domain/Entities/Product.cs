using System;

namespace ECommerce.Domain.Entities;

public class Product
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public int CategoryId { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Vendor? Vendor { get; set; }

    public Category? Category { get; set; }

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}
