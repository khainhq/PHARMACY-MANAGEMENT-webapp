# Tài liệu API thuốc, nhà cung cấp và phiếu nhập

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

## 1. Nhóm thuốc

```http
GET    /api/medicines/catalogs/
GET    /api/medicines/catalogs/{id}/
POST   /api/medicines/catalogs/
PUT    /api/medicines/catalogs/{id}/
PATCH  /api/medicines/catalogs/{id}/
DELETE /api/medicines/catalogs/{id}/
```

Dùng để quản lý nhóm/danh mục thuốc.

## 2. Đơn vị tính

```http
GET    /api/medicines/units/
GET    /api/medicines/units/{id}/
POST   /api/medicines/units/
PUT    /api/medicines/units/{id}/
PATCH  /api/medicines/units/{id}/
DELETE /api/medicines/units/{id}/
```

Ví dụ đơn vị: `Hộp`, `Viên`, `Tuýp`, `Chai`.

## 3. Xuất xứ

```http
GET    /api/medicines/origins/
GET    /api/medicines/origins/{id}/
POST   /api/medicines/origins/
PUT    /api/medicines/origins/{id}/
PATCH  /api/medicines/origins/{id}/
DELETE /api/medicines/origins/{id}/
```

## 4. Thuốc

```http
GET    /api/medicines/medicines/
GET    /api/medicines/medicines/{id}/
POST   /api/medicines/medicines/
PUT    /api/medicines/medicines/{id}/
PATCH  /api/medicines/medicines/{id}/
DELETE /api/medicines/medicines/{id}/
```

Body thuốc mẫu:

```json
{
  "medicineID": "MED001",
  "medicineName": "Panadol Extra",
  "ingredients": "Paracetamol, caffeine",
  "unit": "Hộp",
  "stockQuantity": 100,
  "price": 35000,
  "catalog": "Thuốc giảm đau",
  "origin": "Việt Nam",
  "imageUrl": "/images/medicines/panadol-extra.png"
}
```

## 5. Nhà cung cấp

```http
GET    /api/medicines/suppliers/
GET    /api/medicines/suppliers/{id}/
POST   /api/medicines/suppliers/
PUT    /api/medicines/suppliers/{id}/
PATCH  /api/medicines/suppliers/{id}/
DELETE /api/medicines/suppliers/{id}/
```

Body nhà cung cấp mẫu:

```json
{
  "supplierID": "SUP001",
  "supplierName": "Cong ty Duoc A",
  "phoneNumber": "0900000000",
  "address": "Thanh pho Ho Chi Minh"
}
```

## 6. Phiếu nhập

```http
GET    /api/medicines/payments/
GET    /api/medicines/payments/{id}/
POST   /api/medicines/payments/
PUT    /api/medicines/payments/{id}/
PATCH  /api/medicines/payments/{id}/
DELETE /api/medicines/payments/{id}/
```

## 7. Chi tiết phiếu nhập

```http
GET    /api/medicines/payment-details/
GET    /api/medicines/payment-details/{id}/
POST   /api/medicines/payment-details/
PUT    /api/medicines/payment-details/{id}/
PATCH  /api/medicines/payment-details/{id}/
DELETE /api/medicines/payment-details/{id}/
```

## 8. Tạo phiếu nhập và cộng tồn kho

```http
POST /api/medicines/payment-checkout/
```

Endpoint này dùng cho màn hình tạo phiếu nhập. Backend sẽ tạo phiếu nhập, tạo chi tiết phiếu nhập và cộng số lượng thuốc vào tồn kho.

## 9. Thống kê phiếu nhập

```http
GET /api/medicines/payment-statistics/
```

Dùng cho dashboard/báo cáo nhập hàng.

## 10. Lưu ý nghiệp vụ

- Không nhập số lượng âm hoặc đơn giá âm.
- Khi tạo phiếu nhập thành công, tồn kho thuốc được cập nhật tự động.
- Dữ liệu thuốc demo được seed từ `backend/SeedData/medicine-products.json`.
- Hình ảnh thuốc được lưu trong frontend assets, không phụ thuộc link ngoài.
