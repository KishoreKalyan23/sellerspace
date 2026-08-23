using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class ShopUserConfiguration : IEntityTypeConfiguration<ShopUser>
{
    public void Configure(EntityTypeBuilder<ShopUser> builder)
    {
        builder.ToTable("ShopUsers");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("ShopUserId").ValueGeneratedOnAdd();
        builder.Property(s => s.VendorId).HasColumnName("VendorId").IsRequired();
        builder.Property(s => s.Name).HasColumnName("Name").HasMaxLength(100).IsRequired();
        builder.Property(s => s.LoginId).HasColumnName("LoginId").HasMaxLength(50).IsRequired();
        builder.Property(s => s.Email).HasColumnName("Email").HasMaxLength(150);
        builder.Property(s => s.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(256).IsRequired();
        builder.Property(s => s.CanAccessBilling).HasColumnName("CanAccessBilling").IsRequired();
        builder.Property(s => s.IsActive).HasColumnName("IsActive").IsRequired();
        builder.Property(s => s.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

        builder.HasIndex(s => s.LoginId).IsUnique().HasDatabaseName("IX_ShopUsers_LoginId");
        builder.HasIndex(s => s.Email).IsUnique().HasFilter("[Email] IS NOT NULL").HasDatabaseName("IX_ShopUsers_Email");

        builder.HasOne(s => s.Vendor)
            .WithMany()
            .HasForeignKey(s => s.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
