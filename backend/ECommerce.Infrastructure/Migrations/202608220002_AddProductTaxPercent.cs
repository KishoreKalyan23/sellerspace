using ECommerce.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations;

[DbContext(typeof(ECommerceDbContext))]
[Migration("202608220002_AddProductTaxPercent")]
public partial class AddProductTaxPercent : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(name: "TaxPercent", table: "Products", type: "decimal(5,2)", nullable: false, defaultValue: 0m);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "TaxPercent", table: "Products");
    }
}
