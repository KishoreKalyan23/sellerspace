using ECommerce.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations;

[DbContext(typeof(ECommerceDbContext))]
[Migration("202608200001_AddOrders")]
public partial class AddOrders : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Orders",
            columns: table => new
            {
                OrderId = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                VendorId = table.Column<int>(type: "int", nullable: false),
                ClientName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Fulfilled"),
                TotalAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Orders", x => x.OrderId);
                table.ForeignKey(
                    name: "FK_Orders_Vendors_VendorId",
                    column: x => x.VendorId,
                    principalTable: "Vendors",
                    principalColumn: "VendorId",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Orders_VendorId",
            table: "Orders",
            column: "VendorId");

        migrationBuilder.CreateIndex(
            name: "IX_Orders_VendorId_CreatedAt",
            table: "Orders",
            columns: new[] { "VendorId", "CreatedAt" });

        migrationBuilder.CreateTable(
            name: "OrderItems",
            columns: table => new
            {
                OrderItemId = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                OrderId = table.Column<int>(type: "int", nullable: false),
                ProductId = table.Column<int>(type: "int", nullable: false),
                ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Quantity = table.Column<int>(type: "int", nullable: false),
                UnitPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_OrderItems", x => x.OrderItemId);
                table.ForeignKey(
                    name: "FK_OrderItems_Orders_OrderId",
                    column: x => x.OrderId,
                    principalTable: "Orders",
                    principalColumn: "OrderId",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_OrderItems_Products_ProductId",
                    column: x => x.ProductId,
                    principalTable: "Products",
                    principalColumn: "ProductId",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_OrderItems_OrderId",
            table: "OrderItems",
            column: "OrderId");

        migrationBuilder.CreateIndex(
            name: "IX_OrderItems_ProductId",
            table: "OrderItems",
            column: "ProductId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "OrderItems");
        migrationBuilder.DropTable(name: "Orders");
    }
}
