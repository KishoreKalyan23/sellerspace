namespace ECommerce.Application.DTOs;

public class BillingCustomerDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Mobile { get; set; } = string.Empty;

    public string? Email { get; set; }
}

public class CreateBillingCustomerRequestDto
{
    public string Name { get; set; } = string.Empty;

    public string Mobile { get; set; } = string.Empty;

    public string? Email { get; set; }
}
