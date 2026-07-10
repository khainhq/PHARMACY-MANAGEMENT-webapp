# Tổng quan kiểm thử Web Application

Dự án: PHARMACY-MANAGEMENT-WEB APP  
Ngày kiểm thử: 10/07/2026  
Phạm vi: frontend React, backend ASP.NET Core Web API, SQL Server, Docker Compose, tài liệu, hình ảnh demo và luồng nghiệp vụ nhà thuốc.

## Cơ sở tham khảo

Cấu trúc kiểm thử được tổ chức theo 8 nhóm trong bài viết: https://viblo.asia/p/huong-dan-8-buoc-de-kiem-thu-trang-web-web-application-testing-djeZ14PgKWz

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

## Kết quả kiểm thử tự động đã chạy

| Hạng mục | Lệnh kiểm thử | Kết quả |
|---|---|---|
| Backend build | `dotnet build backend\PharmacyManagement.Api.csproj` | Pass, 0 warnings, 0 errors |
| Frontend unit/component tests | `npm test -- --watchAll=false` trong thư mục `frontend` | Pass, 24/24 test suites, 133/133 tests, 9 snapshots |
| Test case lỗi Zalo cũ | Cập nhật `frontend/src/App.test.js` | Pass sau khi test được sửa theo yêu cầu hiện tại là không còn Zalo |
| Docker runtime | `docker compose ps` | Pass, 3 container `frontend`, `backend`, `sqlserver` đang chạy |

## Kiểm tra Docker runtime bổ sung

Sau khi Docker Desktop được khởi chạy lại, đã kiểm tra bổ sung:

- `docker compose ps`: Pass, 3 container `frontend`, `backend`, `sqlserver` đang chạy.
- `http://localhost:3000`: Pass, frontend trả `200 OK`.
- `POST http://127.0.0.1:8000/api/auth/login/` với `admin/admin123`: Pass, backend trả `username=admin`, `role=Admin`.

## Kết luận nhanh

Project đã có nền tảng kiểm thử tốt cho đồ án: test frontend khá nhiều, backend build ổn định, dữ liệu demo có seed, tài liệu và sơ đồ đầy đủ. Phần nên bổ sung thêm nếu còn thời gian là kiểm thử backend API tự động, kiểm thử E2E bằng Playwright/Cypress, kiểm thử hiệu năng có số liệu đo thật, và checklist bảo mật chi tiết hơn.
