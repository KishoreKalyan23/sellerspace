using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShopUserLoginId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShopUsers_Email",
                table: "ShopUsers");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "ShopUsers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AddColumn<string>(
                name: "LoginId",
                table: "ShopUsers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ShopUsers_Email",
                table: "ShopUsers",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ShopUsers_LoginId",
                table: "ShopUsers",
                column: "LoginId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShopUsers_Email",
                table: "ShopUsers");

            migrationBuilder.DropIndex(
                name: "IX_ShopUsers_LoginId",
                table: "ShopUsers");

            migrationBuilder.DropColumn(
                name: "LoginId",
                table: "ShopUsers");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "ShopUsers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopUsers_Email",
                table: "ShopUsers",
                column: "Email",
                unique: true);
        }
    }
}
