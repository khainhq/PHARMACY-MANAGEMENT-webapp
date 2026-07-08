# 📌 **Tài liệu API - Ứng dụng Sales**

## 1️⃣ **Xác thực và bảo mật**

Tất cả API yêu cầu **đăng nhập trước** và **phải có quyền Sales**. Token xác thực JWT sẽ được gửi qua **Authorization Header** như sau:

```http
Authorization: Bearer <access_token>
```

## 2️⃣ **Lập hóa đơn bán hàng**

### Tạo hóa đơn bán hàng

- **Endpoint**: `/api/sales/invoices/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "customer": 1,
      "address": "123 Main St",
      "paymentMethod": "Cash",
      "status": "Paid"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "invoiceID": 1,
      "invoiceTime": "2025-03-10T15:52:00Z",
      "customer": 1,
      "address": "123 Main St",
      "paymentMethod": "Cash",
      "status": "Paid"
  }
  ```

## 3️⃣ **Tìm kiếm, quản lý hóa đơn**

### Lấy danh sách hóa đơn

- **Endpoint**: `/api/sales/invoices/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "invoiceID": 1,
          "invoiceTime": "2025-03-10T15:52:00Z",
          "customer": 1,
          "address": "123 Main St",
          "paymentMethod": "Cash",
          "status": "Paid"
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một hóa đơn

- **Endpoint**: `/api/sales/invoices/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "invoiceID": 1,
      "invoiceTime": "2025-03-10T15:52:00Z",
      "customer": 1,
      "address": "123 Main St",
      "paymentMethod": "Cash",
      "status": "Paid"
  }
  ```

### Cập nhật thông tin hóa đơn

- **Endpoint**: `/api/sales/invoices/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "address": "456 Elm St",
      "paymentMethod": "Card",
      "status": "Pending"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "invoiceID": 1,
      "invoiceTime": "2025-03-10T15:52:00Z",
      "customer": 1,
      "address": "456 Elm St",
      "paymentMethod": "Card",
      "status": "Pending"
  }
  ```

### Xóa hóa đơn

- **Endpoint**: `/api/sales/invoices/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa hóa đơn thành công"
  }
  ```

## 4️⃣ **Tìm kiếm, quản lý khách hàng**

### Lấy danh sách khách hàng

- **Endpoint**: `/api/sales/customers/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "customerID": 1,
          "fullName": "Nguyen Van A",
          "phoneNumber": "0123456789",
          "gender": "Male",
          "joinDate": "2025-01-01"
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một khách hàng

- **Endpoint**: `/api/sales/customers/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "customerID": 1,
      "fullName": "Nguyen Van A",
      "phoneNumber": "0123456789",
      "gender": "Male",
      "joinDate": "2025-01-01"
  }
  ```

### Thêm mới một khách hàng

- **Endpoint**: `/api/sales/customers/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "fullName": "Nguyen Van B",
      "phoneNumber": "0987654321",
      "gender": "Female"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "customerID": 2,
      "fullName": "Nguyen Van B",
      "phoneNumber": "0987654321",
      "gender": "Female",
      "joinDate": "2025-02-01"
  }
  ```

### Cập nhật thông tin khách hàng

- **Endpoint**: `/api/sales/customers/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "fullName": "Nguyen Van C",
      "phoneNumber": "0123456789",
      "gender": "Male"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "customerID": 1,
      "fullName": "Nguyen Van C",
      "phoneNumber": "0123456789",
      "gender": "Male",
      "joinDate": "2025-01-01"
  }
  ```

### Xóa khách hàng

- **Endpoint**: `/api/sales/customers/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa khách hàng thành công"
  }
  ```

## 5️⃣ **Tìm kiếm, quản lý đơn đặt hàng**

### Lấy danh sách đơn đặt hàng

- **Endpoint**: `/api/sales/orders/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "orderID": 1,
          "orderTime": "2025-03-10T15:52:00Z",
          "employee": 1,
          "customer": 1
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một đơn đặt hàng

- **Endpoint**: `/api/sales/orders/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "orderID": 1,
      "orderTime": "2025-03-10T15:52:00Z",
      "employee": 1,
      "customer": 1
  }
  ```

### Thêm mới một đơn đặt hàng

- **Endpoint**: `/api/sales/orders/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "employee": 1,
      "customer": 1
  }
  ```
- **Phản hồi**:
  ```json
  {
      "orderID": 2,
      "orderTime": "2025-03-11T10:00:00Z",
      "employee": 1,
      "customer": 1
  }
  ```

### Cập nhật thông tin đơn đặt hàng

- **Endpoint**: `/api/sales/orders/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "employee": 2,
      "customer": 2
  }
  ```
- **Phản hồi**:
  ```json
  {
      "orderID": 1,
      "orderTime": "2025-03-10T15:52:00Z",
      "employee": 2,
      "customer": 2
  }
  ```

### Xóa đơn đặt hàng

- **Endpoint**: `/api/sales/orders/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa đơn đặt hàng thành công"
  }
  ```

## 6️⃣ **Xem thống kê khách hàng**

### Lấy thống kê số lượng khách hàng

- **Endpoint**: `/api/sales/statistics/customers/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "customer": "Nguyen Van A",
          "total_orders": 5
      },
      ...
  ]
  ```

## 7️⃣ **Xem thống kê hóa đơn**

### Lấy thống kê số lượng hóa đơn và tổng doanh thu

- **Endpoint**: `/api/sales/statistics/invoices/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "invoice_count": 10,
      "total_revenue": 1000000
  }
  ```

---

## 🔑 **Xác thực và bảo mật**

Tất cả API trên yêu cầu **đăng nhập trước** và **phải có quyền Sales**. Token xác thực JWT sẽ được gửi qua **Authorization Header** như sau:

```http
Authorization: Bearer <access_token>
```