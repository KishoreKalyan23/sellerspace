using ECommerce.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations;

[DbContext(typeof(ECommerceDbContext))]
[Migration("202608220003_AddOrderPaymentMethod")]
public partial class AddOrderPaymentMethod : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "PaymentMethod",
            table: "Orders",
            type: "nvarchar(20)",
            maxLength: 20,
            nullable: false,
            defaultValue: "Cash");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "PaymentMethod", table: "Orders");
    }
}
