# 07. Kiểm thử bảo mật

## Mục tiêu

Đánh giá các điểm bảo mật cơ bản của ứng dụng trước khi demo hoặc bàn giao đồ án.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| SEC-01 | Mật khẩu được hash bằng BCrypt | Pass |
| SEC-02 | Không lưu plaintext password trong database | Pass |
| SEC-03 | API quan trọng yêu cầu token | Pass theo middleware backend |
| SEC-04 | Tài khoản demo tự bật lại và reset mật khẩu khi backend khởi động | Pass |
| SEC-05 | Không push API key thật lên GitHub | Pass theo rà soát trước đó |
| SEC-06 | CORS cấu hình cho frontend | Pass |
| SEC-07 | Validate số điện thoại, số lượng, giá nhập | Pass theo backend/frontend |
| SEC-08 | SQL injection test thủ công | Chưa pass |
| SEC-09 | XSS test thủ công | Chưa pass |
| SEC-10 | Rate limiting chống dò mật khẩu | Chưa pass |
| SEC-11 | HTTPS production | Chưa pass |

## Nhận xét

Mức bảo mật phù hợp demo/local và đồ án: có backend riêng, SQL Server riêng, hash mật khẩu, token đăng nhập và không lưu password ở frontend. Nếu triển khai production cần nâng cấp thêm HTTPS, secret manager, rate limit, audit log và phân quyền API chi tiết.

## Khuyến nghị

- Thêm rate limit cho endpoint login.
- Không hard-code mật khẩu SQL Server khi deploy thật.
- Chuyển token sang JWT chuẩn hoặc cookie HttpOnly nếu đưa lên môi trường public.
