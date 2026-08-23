using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class UserSettingsConfiguration : IEntityTypeConfiguration<UserSettings>
{
    public void Configure(EntityTypeBuilder<UserSettings> builder)
    {
        builder.ToTable("UserSettings");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("UserSettingsId").ValueGeneratedOnAdd();
        builder.Property(s => s.UserId).HasColumnName("UserId").IsRequired();
        builder.Property(s => s.UserType).HasColumnName("UserType").HasMaxLength(20).IsRequired();
        builder.Property(s => s.UseProBilling).HasColumnName("UseProBilling").IsRequired().HasDefaultValue(false);
        builder.Property(s => s.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
        builder.Property(s => s.UpdatedAt).HasColumnName("UpdatedAt");

        // No FK to Vendors/ShopUsers: UserId is polymorphic (a Vendor or a ShopUser id,
        // disambiguated by UserType), and SQL Server rejects a real FK+cascade here because
        // Vendor -> ShopUser -> UserSettings and Vendor -> UserSettings would both be full
        // cascade paths ("multiple cascade paths" error). Rows are cleaned up best-effort;
        // an orphaned row after a manual DB-level delete is harmless (just a stale preference).
        builder.HasIndex(s => new { s.UserId, s.UserType }).IsUnique().HasDatabaseName("IX_UserSettings_UserId_UserType");
    }
}
