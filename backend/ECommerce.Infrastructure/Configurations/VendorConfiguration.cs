using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("Vendors");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("VendorId").ValueGeneratedOnAdd();
        builder.Property(v => v.Name).HasColumnName("Name").HasMaxLength(100).IsRequired();
        builder.Property(v => v.Email).HasColumnName("Email").HasMaxLength(150).IsRequired();
        builder.Property(v => v.StoreName).HasColumnName("StoreName").HasMaxLength(150).IsRequired();
        builder.Property(v => v.Mobile).HasColumnName("Mobile").HasMaxLength(20);
        builder.Property(v => v.AlternateMobile).HasColumnName("AlternateMobile").HasMaxLength(20);
        builder.Property(v => v.GstNumber).HasColumnName("GstNumber").HasMaxLength(20);
        builder.Property(v => v.BuildingNumber).HasColumnName("BuildingNumber").HasMaxLength(100);
        builder.Property(v => v.StreetName).HasColumnName("StreetName").HasMaxLength(200);
        builder.Property(v => v.District).HasColumnName("District").HasMaxLength(100);
        builder.Property(v => v.State).HasColumnName("State").HasMaxLength(100);
        builder.Property(v => v.Country).HasColumnName("Country").HasMaxLength(100);
        builder.Property(v => v.Latitude).HasColumnName("Latitude").HasColumnType("decimal(9,6)");
        builder.Property(v => v.Longitude).HasColumnName("Longitude").HasColumnType("decimal(9,6)");
        builder.Property(v => v.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(256).IsRequired();
        builder.Property(v => v.IsApproved).HasColumnName("IsApproved").IsRequired();
        builder.Property(v => v.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

        builder.HasMany(v => v.Products)
            .WithOne(p => p.Vendor)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
