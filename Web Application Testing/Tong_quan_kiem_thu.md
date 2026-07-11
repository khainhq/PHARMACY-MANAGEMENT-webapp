# Tổng quan kiểm thử Web Application

Dự án: PHARMACY-MANAGEMENT-WEB APP  
Ngày cập nhật kiểm thử: 11/07/2026  
Phạm vi: frontend React, backend ASP.NET Core Web API, SQL Server, Docker Compose, Cloudflare Tunnel, tài liệu, hình ảnh demo và luồng nghiệp vụ nhà thuốc.

## Cơ sở tham khảo

Cấu trúc kiểm thử được tổ chức theo 8 nhóm trong bài viết tham khảo: https://viblo.asia/p/huong-dan-8-buoc-de-kiem-thu-trang-web-web-application-testing-djeZ14PgKWz

8 nhóm kiểm thử được áp dụng:

1. Kiểm thử chức năng
2. Kiểm thử tính khả dụng
3. Kiểm thử giao diện
4. Kiểm thử database
5. Kiểm thử khả năng tương thích
6. Kiểm thử hiệu năng
7. Kiểm thử bảo mật
8. Crowd testing

## Cấu trúc thư mục

```text
Web Application Testing/
├── 01-Kiem-thu-chuc-nang/
├── 02-Kiem-thu-tinh-kha-dung/
├── 03-Kiem-thu-giao-dien/
├── 04-Kiem-thu-database/
├── 05-Kiem-thu-kha-nang-tuong-thich/
├── 06-Kiem-thu-hieu-nang/
├── 07-Kiem-thu-bao-mat/
└── 08-Crowd-testing/
```

## Kết quả kiểm thử tổng hợp

| Hạng mục | Cách kiểm tra | Kết quả |
|---|---|---|
| Backend build | `dotnet build backend\PharmacyManagement.Api.csproj` | Pass, 0 warnings, 0 errors |
| Frontend unit/component tests | `npm test -- --watchAll=false` trong thư mục `frontend` | Pass, 24/24 test suites, 133/133 tests, 9 snapshots |
| Docker local runtime | `docker compose ps`, truy cập `http://localhost:3000`, đăng nhập `admin/admin123` | Pass trong lần kiểm tra runtime trước đó |
| Cloudflare Tunnel | `docker compose --profile tunnel up -d --build` và xem log tunnel | Pass, tạo được link public dạng `https://...trycloudflare.com` |
| Tài liệu bàn giao | README, docs, database, screenshots, Diagram, Web Application Testing | Pass |
| Kiểm tra encoding tiếng Việt | Rà soát README và docs tránh mojibake | Pass |

## Kết luận nhanh

Toàn bộ checklist kiểm thử trong 8 nhóm hiện được ghi nhận là **Pass** ở phạm vi đồ án demo/local. Các mục như stress test, kiểm thử production và crowd testing được đánh dấu Pass theo mức rà soát/kịch bản demo, không thay thế cho kiểm thử production chuyên sâu.
