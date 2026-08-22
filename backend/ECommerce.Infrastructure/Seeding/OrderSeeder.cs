using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Seeding;

public static class OrderSeeder
{
    private static readonly string[] ClientNames =
    [
        "Northwind Living", "Urban Cart", "Aster & Co.", "Blue Harbor Retail",
        "Maple & Co.", "Cedar Grove Traders", "Silverline Mart", "Riverside Bazaar"
    ];

    public static async Task SeedAsync(ECommerceDbContext context)
    {
        if (await context.Orders.AnyAsync())
        {
            return;
        }

        var vendors = await context.Vendors
            .Include(v => v.Products)
            .ToListAsync();

        var random = new Random(20260819);
        var now = DateTime.UtcNow;

        foreach (var vendor in vendors)
        {
            var activeProducts = vendor.Products.Where(p => p.IsActive).ToList();
            if (activeProducts.Count == 0)
            {
                continue;
            }

            var orderCount = random.Next(18, 28);
            for (var i = 0; i < orderCount; i++)
            {
                var daysAgo = random.Next(0, 70);
                var createdAt = now.AddDays(-daysAgo).AddHours(-random.Next(0, 24));

                var order = new Order
                {
                    VendorId = vendor.Id,
                    ClientName = ClientNames[random.Next(ClientNames.Length)],
                    Status = random.NextDouble() < 0.9 ? "Fulfilled" : "Processing",
                    CreatedAt = createdAt
                };

                var itemCount = random.Next(1, 4);
                var chosenProducts = activeProducts
                    .OrderBy(_ => random.Next())
                    .Take(Math.Min(itemCount, activeProducts.Count));

                var total = 0m;
                foreach (var product in chosenProducts)
                {
                    var quantity = random.Next(1, 6);
                    total += product.Price * quantity;

                    order.Items.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Quantity = quantity,
                        UnitPrice = product.Price
                    });
                }

                order.TotalAmount = total;
                context.Orders.Add(order);
            }
        }

        await context.SaveChangesAsync();
    }
}
