using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("OrderId").ValueGeneratedOnAdd();
        builder.Property(o => o.VendorId).HasColumnName("VendorId").IsRequired();
        builder.Property(o => o.ClientName).HasColumnName("ClientName").HasMaxLength(150).IsRequired();
        builder.Property(o => o.Status).HasColumnName("Status").HasMaxLength(30).HasDefaultValue("Fulfilled").IsRequired();
        builder.Property(o => o.TotalAmount).HasColumnName("TotalAmount").HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(o => o.TaxAmount).HasColumnName("TaxAmount").HasColumnType("decimal(10,2)").HasDefaultValue(0m).IsRequired();
        builder.Property(o => o.CustomerMobile).HasColumnName("CustomerMobile").HasMaxLength(20);
        builder.Property(o => o.CustomerEmail).HasColumnName("CustomerEmail").HasMaxLength(150);
        builder.Property(o => o.AmountReceived).HasColumnName("AmountReceived").HasColumnType("decimal(10,2)");
        builder.Property(o => o.BalanceReturned).HasColumnName("BalanceReturned").HasColumnType("decimal(10,2)");
        builder.Property(o => o.PaymentMethod).HasColumnName("PaymentMethod").HasMaxLength(20).HasDefaultValue("Cash").IsRequired();
        builder.Property(o => o.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

        builder.HasIndex(o => o.VendorId).HasDatabaseName("IX_Orders_VendorId");
        builder.HasIndex(o => new { o.VendorId, o.CreatedAt }).HasDatabaseName("IX_Orders_VendorId_CreatedAt");

        builder.HasOne(o => o.Vendor)
            .WithMany()
            .HasForeignKey(o => o.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
