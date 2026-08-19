using ECommerce.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations;

[DbContext(typeof(ECommerceDbContext))]
[Migration("202608160002_AddVendorStoreAndLocationDetails")]
public partial class AddVendorStoreAndLocationDetails : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "Mobile", table: "Vendors", type: "nvarchar(20)", maxLength: 20, nullable: true);
        migrationBuilder.AddColumn<string>(name: "AlternateMobile", table: "Vendors", type: "nvarchar(20)", maxLength: 20, nullable: true);
        migrationBuilder.AddColumn<string>(name: "GstNumber", table: "Vendors", type: "nvarchar(20)", maxLength: 20, nullable: true);
        migrationBuilder.AddColumn<string>(name: "BuildingNumber", table: "Vendors", type: "nvarchar(100)", maxLength: 100, nullable: true);
        migrationBuilder.AddColumn<string>(name: "StreetName", table: "Vendors", type: "nvarchar(200)", maxLength: 200, nullable: true);
        migrationBuilder.AddColumn<string>(name: "District", table: "Vendors", type: "nvarchar(100)", maxLength: 100, nullable: true);
        migrationBuilder.AddColumn<string>(name: "State", table: "Vendors", type: "nvarchar(100)", maxLength: 100, nullable: true);
        migrationBuilder.AddColumn<string>(name: "Country", table: "Vendors", type: "nvarchar(100)", maxLength: 100, nullable: true);
        migrationBuilder.AddColumn<decimal>(name: "Latitude", table: "Vendors", type: "decimal(9,6)", nullable: true);
        migrationBuilder.AddColumn<decimal>(name: "Longitude", table: "Vendors", type: "decimal(9,6)", nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "Mobile", table: "Vendors");
        migrationBuilder.DropColumn(name: "AlternateMobile", table: "Vendors");
        migrationBuilder.DropColumn(name: "GstNumber", table: "Vendors");
        migrationBuilder.DropColumn(name: "BuildingNumber", table: "Vendors");
        migrationBuilder.DropColumn(name: "StreetName", table: "Vendors");
        migrationBuilder.DropColumn(name: "District", table: "Vendors");
        migrationBuilder.DropColumn(name: "State", table: "Vendors");
        migrationBuilder.DropColumn(name: "Country", table: "Vendors");
        migrationBuilder.DropColumn(name: "Latitude", table: "Vendors");
        migrationBuilder.DropColumn(name: "Longitude", table: "Vendors");
    }
}
