using System;
using System.Collections.Generic;

namespace ECommerce.Domain.Entities;

public class Order
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public string? IdempotencyKey { get; set; }

    public required string ClientName { get; set; }

    public string Status { get; set; } = "Fulfilled";

    public decimal TotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public string? CustomerMobile { get; set; }

    public string? CustomerEmail { get; set; }

    public decimal? AmountReceived { get; set; }

    public decimal? BalanceReturned { get; set; }

    public string PaymentMethod { get; set; } = "Cash";

    public DateTime CreatedAt { get; set; }

    public Vendor? Vendor { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
