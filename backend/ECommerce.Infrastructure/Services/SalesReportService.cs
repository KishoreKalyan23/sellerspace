using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class SalesReportService : ISalesReportService
{
    private readonly ECommerceDbContext _context;

    public SalesReportService(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<SalesReportDto> GetReportAsync(int vendorId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        // Npgsql only accepts UTC DateTimes against timestamptz columns; query-string dates arrive as Unspecified.
        var rangeStart = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
        var rangeEndExclusive = rangeStart.AddDays((endDate.Date - startDate.Date).Days + 1);

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.VendorId == vendorId && o.CreatedAt >= rangeStart && o.CreatedAt < rangeEndExclusive)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        var fulfilled = orders.Where(o => o.Status == "Fulfilled").ToList();
        var returned = orders.Where(o => o.Status == "Returned").ToList();

        var breakdown = fulfilled
            .GroupBy(o => o.PaymentMethod)
            .Select(g => new PaymentMethodBreakdownDto
            {
                PaymentMethod = g.Key,
                Amount = g.Sum(o => o.TotalAmount + o.TaxAmount),
                OrderCount = g.Count()
            })
            .OrderBy(b => b.PaymentMethod)
            .ToList();

        return new SalesReportDto
        {
            StartDate = startDate.Date,
            EndDate = endDate.Date,
            TotalSales = fulfilled.Sum(o => o.TotalAmount + o.TaxAmount),
            TotalOrders = fulfilled.Count,
            ReturnedAmount = returned.Sum(o => o.TotalAmount + o.TaxAmount),
            ReturnedOrders = returned.Count,
            PaymentMethodBreakdown = breakdown,
            Lines = orders.Select(o => new SalesReportLineDto
            {
                OrderId = o.Id,
                CreatedAt = o.CreatedAt,
                ClientName = o.ClientName,
                PaymentMethod = o.PaymentMethod,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                TaxAmount = o.TaxAmount,
                GrandTotal = o.TotalAmount + o.TaxAmount
            }).ToList()
        };
    }
}
