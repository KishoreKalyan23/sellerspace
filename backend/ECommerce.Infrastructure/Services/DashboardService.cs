using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ECommerceDbContext _context;

    public DashboardService(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<VendorDashboardSummaryDto> GetSummaryAsync(int vendorId, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);

        var products = await _context.Products
            .AsNoTracking()
            .Where(p => p.VendorId == vendorId)
            .ToListAsync(cancellationToken);

        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.VendorId == vendorId && o.Status != "Returned")
            .ToListAsync(cancellationToken);

        var activeListings = products.Count(p => p.IsActive);
        var lowStockListings = products.Count(p => p.IsActive && p.Stock > 0 && p.Stock < 10);
        var outOfStockListings = products.Count(p => p.IsActive && p.Stock == 0);

        var netRevenue = orders.Sum(o => o.TotalAmount);
        var ordersToday = orders.Count(o => o.CreatedAt.Date == today);
        var ordersThisWeek = orders.Count(o => o.CreatedAt.Date >= weekStart);
        var fulfillmentRate = orders.Count == 0
            ? 0d
            : Math.Round(orders.Count(o => o.Status == "Fulfilled") * 100d / orders.Count, 1);
        var averageOrderValue = orders.Count == 0 ? 0m : Math.Round(netRevenue / orders.Count, 2);

        var thisWeekRevenue = orders.Where(o => o.CreatedAt.Date >= weekStart).Sum(o => o.TotalAmount);
        var lastWeekStart = weekStart.AddDays(-7);
        var lastWeekRevenue = orders
            .Where(o => o.CreatedAt.Date >= lastWeekStart && o.CreatedAt.Date < weekStart)
            .Sum(o => o.TotalAmount);
        var weekOverWeekChange = lastWeekRevenue == 0m
            ? (thisWeekRevenue > 0m ? 100d : 0d)
            : Math.Round((double)((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100d, 1);

        var revenueTrend = Enumerable.Range(0, 12)
            .Select(weekIndex =>
            {
                var bucketStart = weekStart.AddDays(-7 * (11 - weekIndex));
                var bucketEnd = bucketStart.AddDays(7);
                return orders.Where(o => o.CreatedAt.Date >= bucketStart && o.CreatedAt.Date < bucketEnd).Sum(o => o.TotalAmount);
            })
            .ToList();

        var totalClients = orders.Select(o => o.ClientName).Distinct(StringComparer.OrdinalIgnoreCase).Count();

        var mostActiveClients = orders
            .GroupBy(o => o.ClientName, StringComparer.OrdinalIgnoreCase)
            .Select(group => new VendorActivityDto
            {
                Name = group.Key,
                OrderCount = group.Count(),
                LastOrderDate = group.Max(o => o.CreatedAt).ToString("yyyy-MM-dd")
            })
            .OrderByDescending(activity => activity.OrderCount)
            .Take(3)
            .ToList();

        var bestSellerGroups = orders
            .SelectMany(o => o.Items)
            .GroupBy(item => item.ProductName)
            .Select(group => new
            {
                Name = group.Key,
                Units = group.Sum(item => item.Quantity),
                Revenue = group.Sum(item => item.Quantity * item.UnitPrice)
            })
            .OrderByDescending(entry => entry.Revenue)
            .Take(3)
            .ToList();

        var totalBestSellerRevenue = bestSellerGroups.Sum(entry => entry.Revenue);
        var bestSellers = bestSellerGroups
            .Select(entry => new BestSellerDto
            {
                Name = entry.Name,
                Units = entry.Units,
                Revenue = entry.Revenue,
                RevenueSharePercent = totalBestSellerRevenue == 0m
                    ? 0d
                    : Math.Round((double)(entry.Revenue / totalBestSellerRevenue) * 100d, 1)
            })
            .ToList();

        return new VendorDashboardSummaryDto
        {
            TotalClients = totalClients,
            ActiveListings = activeListings,
            LowStockListings = lowStockListings,
            OutOfStockListings = outOfStockListings,
            NetRevenue = netRevenue,
            OrdersToday = ordersToday,
            OrdersThisWeek = ordersThisWeek,
            FulfillmentRate = fulfillmentRate,
            AverageOrderValue = averageOrderValue,
            NetRevenueWeekOverWeekChange = weekOverWeekChange,
            RevenueTrend = revenueTrend,
            MostActiveClients = mostActiveClients,
            BestSellers = bestSellers
        };
    }
}
