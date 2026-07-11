# 01. Kiểm thử chức năng

## Mục tiêu

Xác minh các chức năng chính của PharmaCare hoạt động đúng theo nghiệp vụ nhà thuốc: đăng nhập, phân quyền, quản lý dữ liệu, tạo hóa đơn, tạo phiếu nhập, cập nhật tồn kho, báo cáo và chatbot.

## Phạm vi kiểm thử

- Link nội bộ và điều hướng.
- Form đăng nhập, form thêm/sửa dữ liệu.
- Workflow bán thuốc và nhập thuốc.
- CRUD thuốc, khách hàng, nhân viên, nhà cung cấp, tài khoản.
- Kiểm tra dữ liệu bắt buộc, số điện thoại, số lượng, giá nhập.
- Kiểm tra chatbot hướng dẫn sử dụng.

## Test cases

| Mã | Nội dung kiểm thử | Kết quả |
|---|---|---|
| FUNC-01 | Mở trang chủ `http://localhost:3000` | Pass |
| FUNC-02 | Đăng nhập Admin bằng `admin/admin123` | Pass |
| FUNC-03 | Đăng nhập Sales bằng `sales/sales123` | Pass |
| FUNC-04 | Đăng nhập Product Manager bằng `product/product123` | Pass |
| FUNC-05 | Không hiển thị Zalo sau khi đã bỏ chức năng Zalo | Pass |
| FUNC-06 | Tạo hóa đơn và thêm thuốc vào giỏ hàng | Pass |
| FUNC-07 | Tạo phiếu nhập | Pass |
| FUNC-08 | Quản lý thuốc | Pass |
| FUNC-09 | Quản lý khách hàng | Pass |
| FUNC-10 | Quản lý nhà cung cấp | Pass |
| FUNC-11 | Quản lý tài khoản | Pass |
| FUNC-12 | Báo cáo/thống kê | Pass |
| FUNC-13 | Chatbot trả lời hướng dẫn từ tài liệu nội bộ | Pass |
| FUNC-14 | Frontend gọi API bằng đường dẫn tương đối `/api/...` khi chạy tunnel | Pass |

## Kết quả tự động

- Frontend: Pass, 24/24 test suites, 133/133 tests, 9 snapshots.
- Backend: Pass, build 0 warning, 0 error.

## Ghi chú

Các lỗi phát hiện trong quá trình phát triển đã được xử lý trước khi cập nhật tài liệu kiểm thử. Trạng thái hiện tại của nhóm chức năng là Pass trong phạm vi demo/local.
