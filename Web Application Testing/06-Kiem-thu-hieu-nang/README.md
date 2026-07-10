# 06. Kiểm thử hiệu năng

## Mục tiêu

Đánh giá khả năng phản hồi của frontend, backend và database khi thao tác ở mức demo/local.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| PERF-01 | Backend build không lỗi | Pass |
| PERF-02 | Frontend test suite chạy hoàn tất | Pass |
| PERF-03 | Docker Compose chạy đủ frontend/backend/sqlserver | Chưa pass tại thời điểm kiểm thử vì Docker Desktop không chạy |
| PERF-04 | Kiểm tra thời gian phản hồi API login | Chưa pass tại thời điểm kiểm thử vì Docker Desktop không chạy |
| PERF-05 | Kiểm thử tải nhiều người dùng đồng thời | Chưa pass |
| PERF-06 | Kiểm thử stress test vượt tải | Chưa pass |
| PERF-07 | Kiểm tra nén/static serving qua Nginx frontend | Pass theo cấu hình Docker frontend |

## Kết quả hiện tại

- `dotnet build`: pass trong khoảng vài giây.
- `npm test`: pass toàn bộ 133 tests trong khoảng dưới 1 phút trên máy local.

## Khuyến nghị

- Dùng k6, JMeter hoặc Artillery để đo API `/api/auth/login/`, `/api/medicines/medicines/`, `/api/sales/checkout/`.
- Ghi lại số liệu response time trung bình, p95 và lỗi khi có 10/50/100 users.
