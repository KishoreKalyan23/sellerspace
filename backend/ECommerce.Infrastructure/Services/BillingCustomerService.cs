using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces.Services;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class BillingCustomerService : IBillingCustomerService
{
    private readonly ECommerceDbContext _context;

    public BillingCustomerService(ECommerceDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<BillingCustomerDto>> GetAllAsync(int vendorId, CancellationToken cancellationToken = default)
    {
        return await _context.BillingCustomers
            .AsNoTracking()
            .Where(c => c.VendorId == vendorId)
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .Select(c => new BillingCustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Mobile = c.Mobile,
                Email = c.Email
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<BillingCustomerDto> CreateAsync(int vendorId, CreateBillingCustomerRequestDto request, CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();
        var mobile = request.Mobile.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Customer name is required.");
        }

        if (string.IsNullOrWhiteSpace(mobile))
        {
            throw new InvalidOperationException("Mobile number is required.");
        }

        var alreadyExists = await _context.BillingCustomers
            .AnyAsync(c => c.VendorId == vendorId && c.Mobile == mobile, cancellationToken);
        if (alreadyExists)
        {
            throw new InvalidOperationException($"A customer with mobile number {mobile} already exists.");
        }

        var customer = new BillingCustomer
        {
            VendorId = vendorId,
            Name = name,
            Mobile = mobile,
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.BillingCustomers.Add(customer);
        await _context.SaveChangesAsync(cancellationToken);

        return new BillingCustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Mobile = customer.Mobile,
            Email = customer.Email
        };
    }

    public async Task<IReadOnlyList<BillingCustomerDto>> SearchAsync(int vendorId, string query, CancellationToken cancellationToken = default)
    {
        var term = query.Trim();
        if (term.Length < 2)
        {
            return Array.Empty<BillingCustomerDto>();
        }

        return await _context.BillingCustomers
            .AsNoTracking()
            .Where(c => c.VendorId == vendorId
                && (c.Mobile.Contains(term) || c.Name.Contains(term) || (c.Email != null && c.Email.Contains(term))))
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .Take(5)
            .Select(c => new BillingCustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Mobile = c.Mobile,
                Email = c.Email
            })
            .ToListAsync(cancellationToken);
    }
}
