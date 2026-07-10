# 03. Kiểm thử giao diện

## Mục tiêu

Kiểm tra giao diện hiển thị đúng dữ liệu, không vỡ bố cục, các thành phần UI nhất quán và ảnh/logo hiển thị đúng.

## Phạm vi

- Trang chủ.
- Đăng nhập Admin và nhân viên.
- Dashboard.
- Thuốc, khách hàng, nhân viên, tài khoản, nhà cung cấp.
- Tạo hóa đơn, danh sách hóa đơn, phiếu nhập, báo cáo.
- Chatbot và nút liên hệ.

## Checklist

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| UI-01 | Logo PharmaCare hiển thị trên trang chủ và README | Pass |
| UI-02 | Trang chủ có hero, ảnh, nút điều hướng và chatbot | Pass |
| UI-03 | Bảng dữ liệu có header rõ ràng | Pass |
| UI-04 | Nút thao tác có màu sắc nhất quán | Pass |
| UI-05 | Giao diện hóa đơn có thể xem/in | Pass |
| UI-06 | Zalo không còn hiển thị sau yêu cầu xoá | Pass |
| UI-07 | Screenshot demo đã cập nhật trong `screenshots` | Pass |
| UI-08 | Kiểm tra trình duyệt khác ngoài Chrome | Chưa pass |

## Kết quả kiểm thử liên quan

- `App.test.js` đã được cập nhật để kiểm tra trạng thái không còn link Zalo.
- `FloatingContact.test.js` xác nhận không hiển thị liên kết Zalo.

## Khuyến nghị

- Kiểm tra thêm Edge/Firefox ở kích thước laptop và mobile.
- Nếu có thời gian, dùng Playwright để chụp ảnh regression cho các trang chính.
