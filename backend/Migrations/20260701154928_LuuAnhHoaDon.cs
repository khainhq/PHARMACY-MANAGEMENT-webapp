using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class LuuAnhHoaDon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReceiptFileName",
                table: "Invoices",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReceiptImage",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceiptFileName",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ReceiptImage",
                table: "Invoices");
        }
    }
}
