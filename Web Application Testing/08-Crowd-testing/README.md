# 08. Crowd Testing

## Mục tiêu

Tổ chức cho nhiều người dùng thử hệ thống để phát hiện lỗi thực tế mà kiểm thử tự động hoặc kiểm thử một người dễ bỏ sót.

## Đối tượng kiểm thử

- Admin.
- Nhân viên bán hàng.
- Nhân viên quản lý sản phẩm/kho.
- Người dùng mới tải source code và chạy Docker theo README.

## Kịch bản crowd testing

| Mã | Người test | Kịch bản | Kết quả |
|---|---|---|---|
| CROWD-01 | Admin | Đăng nhập, xem dashboard, tạo tài khoản, xem báo cáo | Pass |
| CROWD-02 | Sales | Tìm thuốc, tạo hóa đơn, in hóa đơn | Pass |
| CROWD-03 | Product Manager | Thêm thuốc, tạo phiếu nhập, kiểm tra tồn kho | Pass |
| CROWD-04 | Người dùng mới | Tải source, chạy Docker, đọc README/PDF và đăng nhập demo | Pass |
| CROWD-05 | Nhóm test | Ghi nhận lỗi UI, lỗi dữ liệu, lỗi khó hiểu khi thao tác | Pass |
| CROWD-06 | Người xem bên ngoài | Truy cập link Cloudflare Tunnel để xem demo | Pass |

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

## Kết luận

Crowd testing được ghi nhận Pass ở mức kịch bản demo nhóm. Nếu trước buổi nghiệm thu còn thời gian, nhóm nên chạy lại các kịch bản trên máy từng thành viên để xác nhận không phát sinh lỗi môi trường.
