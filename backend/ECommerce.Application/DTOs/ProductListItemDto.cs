namespace ECommerce.Application.DTOs;

public class ProductListItemDto
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public int CategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal TaxPercent { get; set; }

    public int Stock { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; }

    public string? VendorName { get; set; }

    public string? CategoryName { get; set; }
}
