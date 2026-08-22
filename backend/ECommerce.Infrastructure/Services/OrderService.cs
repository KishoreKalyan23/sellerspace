using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class OrderService : IOrderService
{
    private static readonly string[] AllowedPaymentMethods = ["Cash", "Card", "UPI"];

    private readonly ECommerceDbContext _context;

    public OrderService(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<OrderSummaryDto> CheckoutAsync(int vendorId, CheckoutRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.ClientName))
        {
            throw new InvalidOperationException("A client name is required to check out.");
        }

        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one product is required to check out.");
        }

        var productIds = request.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => p.VendorId == vendorId && productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        var clientName = request.ClientName.Trim();
        var customerMobile = string.IsNullOrWhiteSpace(request.CustomerMobile) ? null : request.CustomerMobile.Trim();
        var customerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail) ? null : request.CustomerEmail.Trim();
        var paymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "Cash" : request.PaymentMethod.Trim();

        if (!AllowedPaymentMethods.Contains(paymentMethod, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Unsupported payment method \"{paymentMethod}\".");
        }

        var order = new Order
        {
            VendorId = vendorId,
            ClientName = clientName,
            CustomerMobile = customerMobile,
            CustomerEmail = customerEmail,
            PaymentMethod = paymentMethod,
            Status = "Fulfilled",
            CreatedAt = DateTime.UtcNow
        };

        var subtotal = 0m;
        var taxTotal = 0m;
        foreach (var requestedItem in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == requestedItem.ProductId)
                ?? throw new InvalidOperationException($"Product {requestedItem.ProductId} was not found in your catalog.");

            var quantity = Math.Max(1, requestedItem.Quantity);
            if (product.Stock < quantity)
            {
                throw new InvalidOperationException($"Only {product.Stock} unit(s) of \"{product.Name}\" are left in stock.");
            }

            product.Stock -= quantity;
            product.UpdatedAt = DateTime.UtcNow;

            var taxPercent = Math.Clamp(product.TaxPercent, 0m, 100m);
            var lineSubtotal = product.Price * quantity;
            var lineTax = Math.Round(lineSubtotal * taxPercent / 100m, 2);

            subtotal += lineSubtotal;
            taxTotal += lineTax;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = quantity,
                UnitPrice = product.Price,
                TaxPercent = taxPercent,
                TaxAmount = lineTax
            });
        }

        order.TotalAmount = subtotal;
        order.TaxAmount = taxTotal;

        var grandTotal = subtotal + taxTotal;
        if (request.AmountReceived.HasValue)
        {
            if (request.AmountReceived.Value < grandTotal)
            {
                throw new InvalidOperationException(
                    $"Amount received ({request.AmountReceived.Value:0.##}) is less than the total due ({grandTotal:0.##}).");
            }

            order.AmountReceived = request.AmountReceived.Value;
            order.BalanceReturned = Math.Round(request.AmountReceived.Value - grandTotal, 2);
        }

        _context.Orders.Add(order);

        if (customerMobile is not null)
        {
            await UpsertBillingCustomerAsync(vendorId, clientName, customerMobile, customerEmail, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new OrderSummaryDto
        {
            OrderId = order.Id,
            ClientName = order.ClientName,
            TotalAmount = order.TotalAmount,
            TaxAmount = order.TaxAmount,
            GrandTotal = grandTotal,
            AmountReceived = order.AmountReceived,
            BalanceReturned = order.BalanceReturned,
            PaymentMethod = order.PaymentMethod,
            Status = order.Status,
            ItemCount = order.Items.Count,
            CreatedAt = order.CreatedAt
        };
    }

    public async Task<OrderSummaryDto> ReturnOrderAsync(int vendorId, int orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.VendorId == vendorId && o.Id == orderId, cancellationToken)
            ?? throw new InvalidOperationException("Invoice not found.");

        if (order.Status == "Returned")
        {
            throw new InvalidOperationException("This invoice has already been returned.");
        }

        var productIds = order.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        foreach (var item in order.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product is not null)
            {
                product.Stock += item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
            }
        }

        order.Status = "Returned";
        await _context.SaveChangesAsync(cancellationToken);

        return new OrderSummaryDto
        {
            OrderId = order.Id,
            ClientName = order.ClientName,
            TotalAmount = order.TotalAmount,
            TaxAmount = order.TaxAmount,
            GrandTotal = order.TotalAmount + order.TaxAmount,
            AmountReceived = order.AmountReceived,
            BalanceReturned = order.BalanceReturned,
            PaymentMethod = order.PaymentMethod,
            Status = order.Status,
            ItemCount = order.Items.Count,
            CreatedAt = order.CreatedAt
        };
    }

    private async Task UpsertBillingCustomerAsync(
        int vendorId,
        string name,
        string mobile,
        string? email,
        CancellationToken cancellationToken)
    {
        var existingCustomer = await _context.BillingCustomers
            .FirstOrDefaultAsync(c => c.VendorId == vendorId && c.Mobile == mobile, cancellationToken);

        if (existingCustomer is null)
        {
            _context.BillingCustomers.Add(new BillingCustomer
            {
                VendorId = vendorId,
                Name = name,
                Mobile = mobile,
                Email = email,
                CreatedAt = DateTime.UtcNow
            });
            return;
        }

        existingCustomer.Name = name;
        if (email is not null)
        {
            existingCustomer.Email = email;
        }
        existingCustomer.UpdatedAt = DateTime.UtcNow;
    }
}
