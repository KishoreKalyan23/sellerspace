namespace ECommerce.Application.DTOs;

public class SalesReportDto
{
    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public decimal TotalSales { get; set; }

    public int TotalOrders { get; set; }

    public decimal ReturnedAmount { get; set; }

    public int ReturnedOrders { get; set; }

    public IReadOnlyList<PaymentMethodBreakdownDto> PaymentMethodBreakdown { get; set; } = Array.Empty<PaymentMethodBreakdownDto>();

    public IReadOnlyList<SalesReportLineDto> Lines { get; set; } = Array.Empty<SalesReportLineDto>();
}

public class PaymentMethodBreakdownDto
{
    public string PaymentMethod { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public int OrderCount { get; set; }
}

public class SalesReportLineDto
{
    public int OrderId { get; set; }

    public DateTime CreatedAt { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal GrandTotal { get; set; }
}
