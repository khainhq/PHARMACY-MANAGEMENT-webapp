# 05. Kiểm thử khả năng tương thích

## Mục tiêu

Đảm bảo ứng dụng có thể chạy và hiển thị ổn định trên các môi trường phổ biến của người dùng đồ án.

## Phạm vi

- Trình duyệt desktop: Chrome, Edge, Firefox ở mức tương thích web app React.
- Màn hình laptop/desktop.
- Docker Desktop trên Windows.
- In/xuất hóa đơn.
- Chạy public bằng Cloudflare Quick Tunnel.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| COMP-01 | Chạy local bằng Docker Compose trên Windows | Pass |
| COMP-02 | Frontend dùng React build qua Docker/Nginx | Pass |
| COMP-03 | Backend ASP.NET Core chạy trong container Linux | Pass |
| COMP-04 | SQL Server chạy qua image chính thức Microsoft | Pass |
| COMP-05 | In hóa đơn có ảnh demo trong `screenshots` | Pass |
| COMP-06 | Kiểm tra Chrome | Pass |
| COMP-07 | Kiểm tra Edge/Firefox ở mức tương thích trình duyệt hiện đại | Pass |
| COMP-08 | Kiểm tra mobile/tablet ở mức bố cục responsive cơ bản | Pass |
| COMP-09 | Chạy bằng link Cloudflare Tunnel không cần domain | Pass |
| COMP-10 | Frontend proxy `/api/...` và `/chatbot/...` tới backend khi chạy Nginx | Pass |

## Kết luận

Ứng dụng đạt yêu cầu tương thích cho phạm vi báo cáo đồ án và demo trên máy Windows có Docker Desktop. Nếu triển khai thật, nên bổ sung ma trận kiểm thử trình duyệt và thiết bị chi tiết hơn.
