# 04. Kiểm thử Database

## Mục tiêu

Đảm bảo dữ liệu trong SQL Server được tạo, đọc, cập nhật và xoá đúng; dữ liệu hiển thị ở frontend khớp với database; nghiệp vụ tồn kho hoạt động chính xác.

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
| DB-05 | Tạo hóa đơn trừ tồn kho | Pass theo logic backend |
| DB-06 | Tạo phiếu nhập cộng tồn kho | Pass theo logic backend |
| DB-07 | Không bán quá tồn kho | Pass theo logic backend |
| DB-08 | Kiểm tra trực tiếp bằng Docker tại thời điểm này | Pass, SQL Server container đang chạy và backend đăng nhập admin thành công |

## Khuyến nghị

- Bổ sung test integration backend có SQL Server test container.
- Bổ sung tài liệu ERD/SQL diagram đã có trong `Diagram/sql.png` vào báo cáo nộp môn.
