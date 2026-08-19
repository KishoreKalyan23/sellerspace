namespace ECommerce.Application.DTOs;

public class VendorDashboardSummaryDto
{
    public int TotalClients { get; set; }

    public int ActiveListings { get; set; }

    public decimal NetRevenue { get; set; }

    public int OrdersToday { get; set; }

    public double FulfillmentRate { get; set; }

    public IReadOnlyList<VendorActivityDto> MostActiveClients { get; set; } = Array.Empty<VendorActivityDto>();

    public IReadOnlyList<BestSellerDto> BestSellers { get; set; } = Array.Empty<BestSellerDto>();
}

public class VendorActivityDto
{
    public string Name { get; set; } = string.Empty;

    public int OrderCount { get; set; }

    public string LastOrderDate { get; set; } = string.Empty;
}

public class BestSellerDto
{
    public string Name { get; set; } = string.Empty;

    public int Units { get; set; }

    public string Revenue { get; set; } = string.Empty;

    public string Trend { get; set; } = string.Empty;
}
