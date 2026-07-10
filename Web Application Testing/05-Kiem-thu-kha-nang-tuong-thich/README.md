# 05. Kiểm thử khả năng tương thích

## Mục tiêu

Đảm bảo ứng dụng có thể chạy và hiển thị ổn định trên các môi trường phổ biến của người dùng đồ án.

## Phạm vi

- Trình duyệt desktop: Chrome, Edge, Firefox.
- Màn hình laptop.
- Docker Desktop trên Windows.
- In/xuất hóa đơn.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| COMP-01 | Chạy local bằng Docker Compose trên Windows | Pass, Docker Compose chạy đủ frontend/backend/sqlserver |
| COMP-02 | Frontend dùng React build qua Docker/Nginx | Pass theo cấu hình |
| COMP-03 | Backend ASP.NET Core chạy trong container Linux | Pass theo Dockerfile |
| COMP-04 | SQL Server chạy qua image chính thức Microsoft | Pass theo `docker-compose.yml` |
| COMP-05 | In hóa đơn có ảnh demo trong `screenshots` | Pass |
| COMP-06 | Kiểm tra Chrome | Pass theo quá trình sử dụng hiện tại |
| COMP-07 | Kiểm tra Edge/Firefox | Chưa pass |
| COMP-08 | Kiểm tra mobile/tablet | Chưa pass |

## Khuyến nghị

- Kiểm thử thêm trên Edge vì người dùng Windows thường có sẵn Edge.
- Kiểm thử thêm responsive mobile nếu demo yêu cầu mở bằng điện thoại.
