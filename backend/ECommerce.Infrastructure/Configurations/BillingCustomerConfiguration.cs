using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class BillingCustomerConfiguration : IEntityTypeConfiguration<BillingCustomer>
{
    public void Configure(EntityTypeBuilder<BillingCustomer> builder)
    {
        builder.ToTable("BillingCustomers");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("BillingCustomerId").ValueGeneratedOnAdd();
        builder.Property(c => c.VendorId).HasColumnName("VendorId").IsRequired();
        builder.Property(c => c.Name).HasColumnName("Name").HasMaxLength(150).IsRequired();
        builder.Property(c => c.Mobile).HasColumnName("Mobile").HasMaxLength(20).IsRequired();
        builder.Property(c => c.Email).HasColumnName("Email").HasMaxLength(150);
        builder.Property(c => c.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
        builder.Property(c => c.UpdatedAt).HasColumnName("UpdatedAt");

        builder.HasIndex(c => new { c.VendorId, c.Mobile }).IsUnique().HasDatabaseName("IX_BillingCustomers_VendorId_Mobile");

        builder.HasOne(c => c.Vendor)
            .WithMany()
            .HasForeignKey(c => c.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
