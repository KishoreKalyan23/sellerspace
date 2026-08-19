using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("ProductId").ValueGeneratedOnAdd();
        builder.Property(p => p.VendorId).HasColumnName("VendorId").IsRequired();
        builder.Property(p => p.CategoryId).HasColumnName("CategoryId").IsRequired();
        builder.Property(p => p.Name).HasColumnName("Name").HasMaxLength(200).IsRequired();
        builder.Property(p => p.Description).HasColumnName("Description").HasMaxLength(1000);
        builder.Property(p => p.Price).HasColumnName("Price").HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(p => p.Stock).HasColumnName("Stock").HasDefaultValue(0).IsRequired();
        builder.Property(p => p.ImageUrl).HasColumnName("ImageUrl").HasMaxLength(500);
        builder.Property(p => p.IsActive).HasColumnName("IsActive").HasDefaultValue(true).IsRequired();
        builder.Property(p => p.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("UpdatedAt");

        builder.HasIndex(p => p.CategoryId).HasDatabaseName("IX_Products_CategoryId");
        builder.HasIndex(p => p.VendorId).HasDatabaseName("IX_Products_VendorId");

        builder.HasOne(p => p.Vendor)
            .WithMany(v => v.Products)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
