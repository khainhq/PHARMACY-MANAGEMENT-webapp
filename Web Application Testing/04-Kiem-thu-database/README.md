# 04. Kiểm thử Database

## Mục tiêu

Đảm bảo dữ liệu trong SQL Server được tạo, đọc, cập nhật và xóa đúng; dữ liệu hiển thị ở frontend khớp với database; nghiệp vụ tồn kho hoạt động chính xác.

## Thành phần database

- SQL Server chạy trong Docker.
- EF Core migrations trong `backend/Migrations`.
- Seed data trong `backend/DataSeeder.cs`.
- Dữ liệu thuốc mẫu trong `backend/SeedData/medicine-products.json`.
- Script bàn giao trong `database/PharmacyManagement.sql`.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| DB-01 | Có migration tạo schema SQL Server | Pass |
| DB-02 | Có seed tài khoản demo | Pass |
| DB-03 | Có seed thuốc/sản phẩm mẫu | Pass |
| DB-04 | Admin/Sales/Product Manager luôn được bật lại khi backend khởi động | Pass |
| DB-05 | Tạo hóa đơn trừ tồn kho | Pass |
| DB-06 | Tạo phiếu nhập cộng tồn kho | Pass |
| DB-07 | Không bán quá tồn kho | Pass |
| DB-08 | SQL Server container chạy bằng image chính thức Microsoft | Pass |
| DB-09 | Có folder `database` riêng để bàn giao script và dữ liệu mẫu | Pass |
| DB-10 | Dữ liệu tài khoản demo không lưu plaintext password | Pass |

## Kết luận

Database đạt yêu cầu demo đồ án. Hệ thống có migration, seed data, dữ liệu mẫu và script bàn giao riêng. Các nghiệp vụ cập nhật tồn kho được xử lý ở backend.
