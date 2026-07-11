# 06. Kiểm thử hiệu năng

## Mục tiêu

Đánh giá khả năng phản hồi của frontend, backend và database khi thao tác ở mức demo/local.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| PERF-01 | Backend build không lỗi | Pass |
| PERF-02 | Frontend test suite chạy hoàn tất | Pass |
| PERF-03 | Docker Compose chạy đủ frontend/backend/sqlserver | Pass |
| PERF-04 | Kiểm tra API login `admin/admin123` | Pass |
| PERF-05 | Kiểm thử tải nhiều người dùng đồng thời ở mức demo nhóm nhỏ | Pass |
| PERF-06 | Kiểm thử stress test ở mức rà soát giới hạn demo | Pass |
| PERF-07 | Kiểm tra nén/static serving qua Nginx frontend | Pass |
| PERF-08 | Build production frontend thành công | Pass |
| PERF-09 | Cloudflare Tunnel phục vụ link demo public | Pass |

## Kết quả hiện tại

- `dotnet build`: Pass, 0 warning, 0 error.
- `npm test -- --watchAll=false`: Pass, 24/24 test suites, 133/133 tests, 9 snapshots.
- Docker Compose đã từng được kiểm tra chạy đủ frontend, backend, sqlserver và cloudflare-tunnel.

## Ghi chú phạm vi

Trạng thái Pass áp dụng cho mức demo đồ án. Đây không phải stress test production với số liệu 50/100/1000 người dùng đồng thời. Nếu cần triển khai thật, nên dùng k6, JMeter hoặc Artillery để đo response time trung bình, p95 và error rate.
