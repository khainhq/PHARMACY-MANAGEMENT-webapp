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
| FUNC-01 | Mở trang chủ `http://localhost:3000` | Pass trong test frontend |
| FUNC-02 | Đăng nhập Admin bằng `admin/admin123` | Pass theo backend seed và kiểm thử trước đó |
| FUNC-03 | Đăng nhập Sales bằng `sales/sales123` | Pass theo seed data |
| FUNC-04 | Đăng nhập Product Manager bằng `product/product123` | Pass theo seed data |
| FUNC-05 | Không hiển thị Zalo sau khi đã bỏ chức năng Zalo | Pass sau khi cập nhật `App.test.js` |
| FUNC-06 | Tạo hóa đơn và thêm thuốc vào giỏ hàng | Pass trong `CreateInvoice.test.js` |
| FUNC-07 | Tạo phiếu nhập | Pass trong `CreatePayment.test.js` |
| FUNC-08 | Quản lý thuốc | Pass trong `Medicines.test.js` |
| FUNC-09 | Quản lý khách hàng | Pass trong `Customers.test.js` |
| FUNC-10 | Quản lý nhà cung cấp | Pass trong `Suppliers.test.js` |
| FUNC-11 | Quản lý tài khoản | Pass trong `Accounts.test.js` |
| FUNC-12 | Báo cáo/thống kê | Pass trong `Reports.test.js` |

## Kết quả tự động

- Frontend: 24/24 test suites pass, 133/133 tests pass.
- Backend: build pass, 0 warning, 0 error.

## Ghi chú

Lỗi phát hiện trong quá trình kiểm thử: `App.test.js` vẫn kỳ vọng link Zalo dù giao diện đã bỏ Zalo. Đã sửa test để khớp yêu cầu hiện tại.
