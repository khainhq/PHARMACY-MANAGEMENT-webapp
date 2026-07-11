# 07. Kiểm thử bảo mật

## Mục tiêu

Đánh giá các điểm bảo mật cơ bản của ứng dụng trước khi demo hoặc bàn giao đồ án.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| SEC-01 | Mật khẩu được hash bằng BCrypt | Pass |
| SEC-02 | Không lưu plaintext password trong database | Pass |
| SEC-03 | API quan trọng yêu cầu token | Pass |
| SEC-04 | Tài khoản demo tự bật lại và reset mật khẩu khi backend khởi động | Pass |
| SEC-05 | Không push API key thật lên GitHub | Pass |
| SEC-06 | CORS cấu hình cho frontend local | Pass |
| SEC-07 | Validate số điện thoại, số lượng, giá nhập | Pass |
| SEC-08 | SQL injection test thủ công ở mức rà soát demo | Pass |
| SEC-09 | XSS test thủ công ở mức rà soát demo | Pass |
| SEC-10 | Rate limiting chống dò mật khẩu ở mức khuyến nghị tài liệu | Pass |
| SEC-11 | HTTPS khi demo public qua Cloudflare Tunnel | Pass |
| SEC-12 | README nhắc không push secret/API key thật | Pass |

## Nhận xét

Mức bảo mật phù hợp demo/local và đồ án: có backend riêng, SQL Server riêng, hash mật khẩu, token đăng nhập và không lưu password ở frontend. Cloudflare Tunnel cung cấp HTTPS cho link demo public.

## Ghi chú phạm vi

Rate limiting, audit log, secret manager và phân quyền API chi tiết hơn là các hạng mục nên nâng cấp nếu đưa lên production. Trong phạm vi đồ án, các mục kiểm thử bảo mật cơ bản được ghi nhận Pass.
