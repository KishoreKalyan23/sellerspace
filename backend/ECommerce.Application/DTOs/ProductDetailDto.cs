namespace ECommerce.Application.DTOs;

public class ProductDetailDto
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public int CategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public decimal TaxPercent { get; set; }

    public int Stock { get; set; }

    public string? ImageUrl { get; set; }

    public IReadOnlyList<string> ImageUrls { get; set; } = [];

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string VendorName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;
}
