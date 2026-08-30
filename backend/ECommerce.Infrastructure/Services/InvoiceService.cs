using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ECommerceDbContext _context;

    public InvoiceService(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<InvoiceListItemDto>> GetAllAsync(int vendorId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.VendorId == vendorId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new InvoiceListItemDto
            {
                OrderId = o.Id,
                ClientName = o.ClientName,
                CustomerMobile = o.CustomerMobile,
                PaymentMethod = o.PaymentMethod,
                ItemCount = o.Items.Count,
                TotalAmount = o.TotalAmount,
                TaxAmount = o.TaxAmount,
                GrandTotal = o.TotalAmount + o.TaxAmount,
                Status = o.Status,
                WasCreatedOffline = o.IdempotencyKey != null,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<InvoiceDetailDto?> GetByIdAsync(int vendorId, int orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.VendorId == vendorId && o.Id == orderId, cancellationToken);

        if (order is null)
        {
            return null;
        }

        return new InvoiceDetailDto
        {
            OrderId = order.Id,
            ClientName = order.ClientName,
            CustomerMobile = order.CustomerMobile,
            CustomerEmail = order.CustomerEmail,
            PaymentMethod = order.PaymentMethod,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            TaxAmount = order.TaxAmount,
            GrandTotal = order.TotalAmount + order.TaxAmount,
            AmountReceived = order.AmountReceived,
            BalanceReturned = order.BalanceReturned,
            WasCreatedOffline = order.IdempotencyKey != null,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(item => new InvoiceLineItemDto
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TaxPercent = item.TaxPercent,
                TaxAmount = item.TaxAmount,
                LineTotal = (item.UnitPrice * item.Quantity) + item.TaxAmount
            }).ToList()
        };
    }
}
