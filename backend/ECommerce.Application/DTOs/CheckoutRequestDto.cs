namespace ECommerce.Application.DTOs;

public class CheckoutRequestDto
{
    public string? IdempotencyKey { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public string? CustomerMobile { get; set; }

    public string? CustomerEmail { get; set; }

    public decimal? AmountReceived { get; set; }

    public string? PaymentMethod { get; set; }

    public IReadOnlyList<CheckoutItemRequestDto> Items { get; set; } = Array.Empty<CheckoutItemRequestDto>();
}

public class CheckoutItemRequestDto
{
    public int ProductId { get; set; }

    public int Quantity { get; set; }
}

public class OrderSummaryDto
{
    public int OrderId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal GrandTotal { get; set; }

    public decimal? AmountReceived { get; set; }

    public decimal? BalanceReturned { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int ItemCount { get; set; }

    public DateTime CreatedAt { get; set; }
}
