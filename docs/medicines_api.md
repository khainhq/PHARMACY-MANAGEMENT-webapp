# 📌 **Tài liệu API - Ứng dụng Medicines**

## 1️⃣ **Xác thực và bảo mật**

Tất cả API yêu cầu **đăng nhập trước** và **phải có quyền Product Manager**. Token xác thực JWT sẽ được gửi qua **Authorization Header** như sau:

```http
Authorization: Bearer <access_token>
```

## 2️⃣ **Lập hóa đơn phiếu thu**

### Tạo hóa đơn phiếu thu

- **Endpoint**: `/api/medicines/payments/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "employee": 1,
      "supplier": 1
  }
  ```
- **Phản hồi**:
  ```json
  {
      "paymentID": 1,
      "paymentTime": "2025-03-10T15:52:00Z",
      "employee": 1,
      "supplier": 1
  }
  ```

## 3️⃣ **Tìm kiếm, quản lý thuốc**

### Lấy danh sách thuốc

- **Endpoint**: `/api/medicines/medicines/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "medicineID": 1,
          "medicineName": "Paracetamol",
          "image": "http://example.com/media/medicines/paracetamol.jpg",
          "ingredients": "Paracetamol 500mg",
          "unit": 1,
          "catalog": 1,
          "origin": 1,
          "stockQuantity": 100,
          "importPrice": "5000.00",
          "unitPrice": "10000.00"
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một thuốc

- **Endpoint**: `/api/medicines/medicines/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "medicineID": 1,
      "medicineName": "Paracetamol",
      "image": "http://example.com/media/medicines/paracetamol.jpg",
      "ingredients": "Paracetamol 500mg",
      "unit": 1,
      "catalog": 1,
      "origin": 1,
      "stockQuantity": 100,
      "importPrice": "5000.00",
      "unitPrice": "10000.00"
  }
  ```

### Thêm mới một thuốc

- **Endpoint**: `/api/medicines/medicines/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "medicineName": "Ibuprofen",
      "ingredients": "Ibuprofen 200mg",
      "unit": 1,
      "catalog": 1,
      "origin": 1,
      "stockQuantity": 50,
      "importPrice": "3000.00",
      "unitPrice": "6000.00"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "medicineID": 2,
      "medicineName": "Ibuprofen",
      "ingredients": "Ibuprofen 200mg",
      "unit": 1,
      "catalog": 1,
      "origin": 1,
      "stockQuantity": 50,
      "importPrice": "3000.00",
      "unitPrice": "6000.00"
  }
  ```

### Cập nhật thông tin thuốc

- **Endpoint**: `/api/medicines/medicines/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "medicineName": "Ibuprofen",
      "ingredients": "Ibuprofen 400mg",
      "unit": 1,
      "catalog": 1,
      "origin": 1,
      "stockQuantity": 75,
      "importPrice": "3500.00",
      "unitPrice": "7000.00"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "medicineID": 2,
      "medicineName": "Ibuprofen",
      "ingredients": "Ibuprofen 400mg",
      "unit": 1,
      "catalog": 1,
      "origin": 1,
      "stockQuantity": 75,
      "importPrice": "3500.00",
      "unitPrice": "7000.00"
  }
  ```

### Xóa thuốc

- **Endpoint**: `/api/medicines/medicines/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa thuốc thành công"
  }
  ```

## 4️⃣ **Tìm kiếm, quản lý nhà cung cấp**

### Lấy danh sách nhà cung cấp

- **Endpoint**: `/api/medicines/suppliers/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "supplierID": 1,
          "supplierName": "ABC Pharma",
          "phoneNumber": "0123456789",
          "address": "123 Main St"
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một nhà cung cấp

- **Endpoint**: `/api/medicines/suppliers/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "supplierID": 1,
      "supplierName": "ABC Pharma",
      "phoneNumber": "0123456789",
      "address": "123 Main St"
  }
  ```

### Thêm mới một nhà cung cấp

- **Endpoint**: `/api/medicines/suppliers/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "supplierName": "XYZ Pharma",
      "phoneNumber": "0987654321",
      "address": "456 Elm St"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "supplierID": 2,
      "supplierName": "XYZ Pharma",
      "phoneNumber": "0987654321",
      "address": "456 Elm St"
  }
  ```

### Cập nhật thông tin nhà cung cấp

- **Endpoint**: `/api/medicines/suppliers/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "supplierName": "XYZ Pharma",
      "phoneNumber": "0987654321",
      "address": "789 Oak St"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "supplierID": 2,
      "supplierName": "XYZ Pharma",
      "phoneNumber": "0987654321",
      "address": "789 Oak St"
  }
  ```

### Xóa nhà cung cấp

- **Endpoint**: `/api/medicines/suppliers/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa nhà cung cấp thành công"
  }
  ```

## 5️⃣ **Tìm kiếm, quản lý phiếu thu**

### Lấy danh sách phiếu thu

- **Endpoint**: `/api/medicines/payment-details/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "id": 1,
          "payment": 1,
          "medicine": 1,
          "quantity": 100,
          "unitPrice": "5000.00"
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một phiếu thu

- **Endpoint**: `/api/medicines/payment-details/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "id": 1,
      "payment": 1,
      "medicine": 1,
      "quantity": 100,
      "unitPrice": "5000.00"
  }
  ```

### Thêm mới một phiếu thu

- **Endpoint**: `/api/medicines/payment-details/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "payment": 1,
      "medicine": 2,
      "quantity": 50,
      "unitPrice": "3000.00"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "id": 2,
      "payment": 1,
      "medicine": 2,
      "quantity": 50,
      "unitPrice": "3000.00"
  }
  ```

### Cập nhật thông tin phiếu thu

- **Endpoint**: `/api/medicines/payment-details/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "payment": 1,
      "medicine": 2,
      "quantity": 75,
      "unitPrice": "3500.00"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "id": 2,
      "payment": 1,
      "medicine": 2,
      "quantity": 75,
      "unitPrice": "3500.00"
  }
  ```

### Xóa phiếu thu

- **Endpoint**: `/api/medicines/payment-details/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa phiếu thu thành công"
  }
  ```

## 6️⃣ **Xem thống kê phiếu thu**

### Lấy thống kê số lượng phiếu thu và tổng chi phí

- **Endpoint**: `/api/medicines/statistics/payments/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "payment_count": 10,
      "total_payment": 500000
  }
  ```

---

## 🔑 **Xác thực và bảo mật**

Tất cả API trên yêu cầu **đăng nhập trước** và **phải có quyền Product Manager**. Token xác thực JWT sẽ được gửi qua **Authorization Header** như sau:

```http
Authorization: Bearer <access_token>
```