namespace ECommerce.Application.DTOs;

public class VendorAuthResultDto
{
    public int VendorId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string StoreName { get; set; } = string.Empty;

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

    public string Token { get; set; } = string.Empty;
}
