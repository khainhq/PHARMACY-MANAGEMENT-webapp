# Tài liệu API bán hàng, khách hàng và hóa đơn

Base URL local:

```text
http://127.0.0.1:8000
```

Base URL qua Cloudflare Tunnel:

```text
https://ten-ngau-nhien.trycloudflare.com
```

Với các API yêu cầu đăng nhập, gửi token:

```http
Authorization: Token <token>
```

## 1. Khách hàng

```http
GET    /api/sales/customers/
GET    /api/sales/customers/{id}/
POST   /api/sales/customers/
PUT    /api/sales/customers/{id}/
PATCH  /api/sales/customers/{id}/
DELETE /api/sales/customers/{id}/
```

Body khách hàng mẫu:

```json
{
  "customerID": "CUS001",
  "customerName": "Nguyen Van A",
  "phoneNumber": "0816151762",
  "gender": "Nam",
  "address": "Thanh pho Ho Chi Minh"
}
```

## 2. Đơn đặt hàng

```http
GET    /api/sales/orders/
GET    /api/sales/orders/{id}/
POST   /api/sales/orders/
PUT    /api/sales/orders/{id}/
PATCH  /api/sales/orders/{id}/
DELETE /api/sales/orders/{id}/
```

## 3. Chi tiết đơn đặt hàng

```http
GET    /api/sales/order-details/
GET    /api/sales/order-details/{id}/
POST   /api/sales/order-details/
PUT    /api/sales/order-details/{id}/
PATCH  /api/sales/order-details/{id}/
DELETE /api/sales/order-details/{id}/
```

## 4. Hóa đơn

```http
GET    /api/sales/invoices/
GET    /api/sales/invoices/{id}/
POST   /api/sales/invoices/
PUT    /api/sales/invoices/{id}/
PATCH  /api/sales/invoices/{id}/
DELETE /api/sales/invoices/{id}/
```

Hóa đơn lưu thông tin khách hàng, thời gian lập hóa đơn, trạng thái thanh toán, phương thức thanh toán và tổng tiền.

## 5. Chi tiết hóa đơn

```http
GET    /api/sales/invoice-details/
GET    /api/sales/invoice-details/{id}/
POST   /api/sales/invoice-details/
PUT    /api/sales/invoice-details/{id}/
PATCH  /api/sales/invoice-details/{id}/
DELETE /api/sales/invoice-details/{id}/
```

Chi tiết hóa đơn lưu thuốc, số lượng, đơn giá và thành tiền.

## 6. Tạo hóa đơn và trừ tồn kho

```http
POST /api/sales/checkout/
```

Endpoint này dùng cho màn hình tạo hóa đơn. Backend sẽ:

1. Kiểm tra giỏ hàng.
2. Kiểm tra tồn kho.
3. Tạo hóa đơn.
4. Tạo chi tiết hóa đơn.
5. Trừ số lượng thuốc trong kho.
6. Trả thông tin hóa đơn để frontend hiển thị hoặc in.

Body checkout mẫu:

```json
{
  "customerName": "Nguyen Van A",
  "phoneNumber": "0816151762",
  "gender": "Nam",
  "address": "Thanh pho Ho Chi Minh",
  "paymentMethod": "Tiền mặt",
  "status": "Đã thanh toán",
  "items": [
    {
      "medicineID": "MED001",
      "quantity": 2,
      "unitPrice": 35000
    }
  ]
}
```

## 7. Thống kê hóa đơn

```http
GET /api/sales/invoice-statistics/
```

Dùng cho màn hình báo cáo doanh thu và dashboard.

## 8. Lưu ý nghiệp vụ

- Không cho phép tạo hóa đơn khi giỏ hàng trống.
- Không cho phép bán vượt tồn kho.
- Khi tạo hóa đơn thành công, tồn kho thuốc được trừ tự động.
- Hóa đơn có thể xem trước và in từ giao diện frontend.
- Nếu dữ liệu demo cần làm mới, chạy `docker compose down -v` rồi chạy lại `docker compose up -d --build`.
