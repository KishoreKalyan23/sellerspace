using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CascadeDeleteVendorRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillingCustomers_Vendors_VendorId",
                table: "BillingCustomers");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Vendors_VendorId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Vendor",
                table: "Products");

            migrationBuilder.AddForeignKey(
                name: "FK_BillingCustomers_Vendors_VendorId",
                table: "BillingCustomers",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Vendors_VendorId",
                table: "Orders",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Vendors_VendorId",
                table: "Products",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillingCustomers_Vendors_VendorId",
                table: "BillingCustomers");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Vendors_VendorId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Vendors_VendorId",
                table: "Products");

            migrationBuilder.AddForeignKey(
                name: "FK_BillingCustomers_Vendors_VendorId",
                table: "BillingCustomers",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Vendors_VendorId",
                table: "Orders",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Vendor",
                table: "Products",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
