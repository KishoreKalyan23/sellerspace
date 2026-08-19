using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");

        builder.HasKey(image => image.Id);
        builder.Property(image => image.Id).HasColumnName("ProductImageId").ValueGeneratedOnAdd();
        builder.Property(image => image.ProductId).IsRequired();
        builder.Property(image => image.ImageUrl).HasMaxLength(500).IsRequired();
        builder.Property(image => image.SortOrder).IsRequired();
        builder.Property(image => image.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

        builder.HasIndex(image => new { image.ProductId, image.SortOrder });
        builder.HasOne(image => image.Product)
            .WithMany(product => product.Images)
            .HasForeignKey(image => image.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
