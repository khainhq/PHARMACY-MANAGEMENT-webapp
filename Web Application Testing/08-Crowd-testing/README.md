# 08. Crowd Testing

## Mục tiêu

Tổ chức cho nhiều người dùng thử hệ thống để phát hiện lỗi thực tế mà kiểm thử tự động hoặc kiểm thử một người dễ bỏ sót.

## Đối tượng đề xuất

- 1 người đóng vai Admin.
- 1 người đóng vai nhân viên bán hàng.
- 1 người đóng vai quản lý sản phẩm/kho.
- 1 người chưa biết hệ thống để đánh giá độ dễ dùng.

## Kịch bản crowd testing

| Mã | Người test | Kịch bản | Kết quả |
|---|---|---|---|
| CROWD-01 | Admin | Đăng nhập, xem dashboard, tạo tài khoản, xem báo cáo | Chưa thực hiện |
| CROWD-02 | Sales | Tìm thuốc, tạo hóa đơn, in hóa đơn | Chưa thực hiện |
| CROWD-03 | Product Manager | Thêm thuốc, tạo phiếu nhập, kiểm tra tồn kho | Chưa thực hiện |
| CROWD-04 | Người dùng mới | Tải source, chạy Docker, đọc README/PDF và đăng nhập demo | Chưa thực hiện |
| CROWD-05 | Nhóm test | Ghi nhận lỗi UI, lỗi dữ liệu, lỗi khó hiểu khi thao tác | Chưa thực hiện |

## Mẫu ghi nhận lỗi

```text
Tiêu đề lỗi:
Người phát hiện:
Vai trò:
Màn hình:
Bước tái hiện:
Kết quả thực tế:
Kết quả mong muốn:
Ảnh minh họa:
Mức độ nghiêm trọng:
Ghi chú:
```

## Khuyến nghị

Nên chạy crowd testing trước buổi nghiệm thu 1-2 ngày để có thời gian sửa các lỗi thao tác, nội dung và giao diện.
