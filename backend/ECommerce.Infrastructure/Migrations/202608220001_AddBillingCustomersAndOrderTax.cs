using ECommerce.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations;

[DbContext(typeof(ECommerceDbContext))]
[Migration("202608220001_AddBillingCustomersAndOrderTax")]
public partial class AddBillingCustomersAndOrderTax : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(name: "TaxAmount", table: "Orders", type: "decimal(10,2)", nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<string>(name: "CustomerMobile", table: "Orders", type: "nvarchar(20)", maxLength: 20, nullable: true);
        migrationBuilder.AddColumn<string>(name: "CustomerEmail", table: "Orders", type: "nvarchar(150)", maxLength: 150, nullable: true);
        migrationBuilder.AddColumn<decimal>(name: "AmountReceived", table: "Orders", type: "decimal(10,2)", nullable: true);
        migrationBuilder.AddColumn<decimal>(name: "BalanceReturned", table: "Orders", type: "decimal(10,2)", nullable: true);

        migrationBuilder.AddColumn<decimal>(name: "TaxPercent", table: "OrderItems", type: "decimal(5,2)", nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "TaxAmount", table: "OrderItems", type: "decimal(10,2)", nullable: false, defaultValue: 0m);

        migrationBuilder.CreateTable(
            name: "BillingCustomers",
            columns: table => new
            {
                BillingCustomerId = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                VendorId = table.Column<int>(type: "int", nullable: false),
                Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                Mobile = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_BillingCustomers", x => x.BillingCustomerId);
                table.ForeignKey(
                    name: "FK_BillingCustomers_Vendors_VendorId",
                    column: x => x.VendorId,
                    principalTable: "Vendors",
                    principalColumn: "VendorId",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_BillingCustomers_VendorId_Mobile",
            table: "BillingCustomers",
            columns: new[] { "VendorId", "Mobile" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "BillingCustomers");

        migrationBuilder.DropColumn(name: "TaxPercent", table: "OrderItems");
        migrationBuilder.DropColumn(name: "TaxAmount", table: "OrderItems");

        migrationBuilder.DropColumn(name: "TaxAmount", table: "Orders");
        migrationBuilder.DropColumn(name: "CustomerMobile", table: "Orders");
        migrationBuilder.DropColumn(name: "CustomerEmail", table: "Orders");
        migrationBuilder.DropColumn(name: "AmountReceived", table: "Orders");
        migrationBuilder.DropColumn(name: "BalanceReturned", table: "Orders");
    }
}
