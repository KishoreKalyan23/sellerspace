namespace ECommerce.Domain.Entities;

public class BillingCustomer
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public required string Name { get; set; }

    public required string Mobile { get; set; }

    public string? Email { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Vendor? Vendor { get; set; }
}
