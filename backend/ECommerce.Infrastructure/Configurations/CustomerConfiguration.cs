using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("CustomerId").ValueGeneratedOnAdd();
        builder.Property(c => c.Name).HasColumnName("Name").HasMaxLength(100).IsRequired();
        builder.Property(c => c.Email).HasColumnName("Email").HasMaxLength(150).IsRequired();
        builder.Property(c => c.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(256).IsRequired();
        builder.Property(c => c.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
    }
}
