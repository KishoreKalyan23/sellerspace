using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations;

public class SuperAdminConfiguration : IEntityTypeConfiguration<SuperAdmin>
{
    public void Configure(EntityTypeBuilder<SuperAdmin> builder)
    {
        builder.ToTable("SuperAdmins");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("SuperAdminId").ValueGeneratedOnAdd();
        builder.Property(s => s.Name).HasColumnName("Name").HasMaxLength(100).IsRequired();
        builder.Property(s => s.Email).HasColumnName("Email").HasMaxLength(150).IsRequired();
        builder.Property(s => s.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(256).IsRequired();
        builder.Property(s => s.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

        builder.HasIndex(s => s.Email).IsUnique().HasDatabaseName("IX_SuperAdmins_Email");
    }
}
