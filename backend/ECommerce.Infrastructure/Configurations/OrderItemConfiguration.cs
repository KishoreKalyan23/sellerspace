using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).HasColumnName("OrderItemId").ValueGeneratedOnAdd();
        builder.Property(item => item.OrderId).HasColumnName("OrderId").IsRequired();
        builder.Property(item => item.ProductId).HasColumnName("ProductId").IsRequired();
        builder.Property(item => item.ProductName).HasColumnName("ProductName").HasMaxLength(200).IsRequired();
        builder.Property(item => item.Quantity).HasColumnName("Quantity").IsRequired();
        builder.Property(item => item.UnitPrice).HasColumnName("UnitPrice").HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(item => item.TaxPercent).HasColumnName("TaxPercent").HasColumnType("decimal(5,2)").HasDefaultValue(0m).IsRequired();
        builder.Property(item => item.TaxAmount).HasColumnName("TaxAmount").HasColumnType("decimal(10,2)").HasDefaultValue(0m).IsRequired();

        builder.HasIndex(item => item.OrderId).HasDatabaseName("IX_OrderItems_OrderId");
        builder.HasIndex(item => item.ProductId).HasDatabaseName("IX_OrderItems_ProductId");

        builder.HasOne(item => item.Order)
            .WithMany(order => order.Items)
            .HasForeignKey(item => item.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(item => item.Product)
            .WithMany()
            .HasForeignKey(item => item.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
