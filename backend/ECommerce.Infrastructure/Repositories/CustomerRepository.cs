using ECommerce.Application.Interfaces.Repositories;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly ECommerceDbContext _context;

    public CustomerRepository(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<Customer?> GetByEmailAsync(string email)
    {
        return await _context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<Customer> AddAsync(Customer customer)
    {
        if (customer.CreatedAt == default)
        {
            customer.CreatedAt = DateTime.UtcNow;
        }

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer;
    }
}
