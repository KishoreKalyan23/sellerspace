namespace ECommerce.Application.DTOs;

public class InvoiceListItemDto
{
    public int OrderId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public string? CustomerMobile { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public int ItemCount { get; set; }

    public decimal TotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal GrandTotal { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool WasCreatedOffline { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class InvoiceDetailDto
{
    public int OrderId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public string? CustomerMobile { get; set; }

    public string? CustomerEmail { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal GrandTotal { get; set; }

    public decimal? AmountReceived { get; set; }

    public decimal? BalanceReturned { get; set; }

    public bool WasCreatedOffline { get; set; }

    public DateTime CreatedAt { get; set; }

    public IReadOnlyList<InvoiceLineItemDto> Items { get; set; } = Array.Empty<InvoiceLineItemDto>();
}

public class InvoiceLineItemDto
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TaxPercent { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal LineTotal { get; set; }
}
