# 📌 **Tài liệu API - Ứng dụng Authentication**

## 1️⃣ **Xác thực và bảo mật**

Tất cả API yêu cầu **đăng nhập trước** và **phải có quyền Admin**. Token xác thực JWT sẽ được gửi qua **Authorization Header** như sau:

```http
Authorization: Bearer <access_token>
```

```http
Nếu test bằng postman Authorization: Token <access_token>
```

## 2️⃣ **Đăng nhập và Đăng xuất**

### Đăng nhập

- **Endpoint**: `/api/auth/login/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "username": "admin",
      "password": "password123"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "token": "your_jwt_token",
      "username": "admin",
      "role": "Admin"
  }
  ```

### Đăng xuất

- **Endpoint**: `/api/auth/logout/`
- **Phương thức**: `POST`
- **Phản hồi**:
  ```json
  {
      "message": "Đăng xuất thành công"
  }
  ```

## 3️⃣ **Quản lý Nhân viên**

### Lấy danh sách tất cả nhân viên

- **Endpoint**: `/api/auth/employees/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "employeeID": 1,
          "fullName": "Nguyen Van A",
          "phoneNumber": "0123456789",
          "gender": "Male",
          "yearOfBirth": 1990,
          "hireDate": "2025-01-01",
          "is_active": true
      },
      ...
  ]
  ```

### Lấy thông tin chi tiết một nhân viên

- **Endpoint**: `/api/auth/employees/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "employeeID": 1,
      "fullName": "Nguyen Van A",
      "phoneNumber": "0123456789",
      "gender": "Male",
      "yearOfBirth": 1990,
      "hireDate": "2025-01-01",
      "is_active": true
  }
  ```

### Thêm mới một nhân viên

- **Endpoint**: `/api/auth/employees/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "fullName": "Nguyen Van B",
      "phoneNumber": "0987654321",
      "gender": "Female",
      "yearOfBirth": 1992,
      "hireDate": "2025-02-01"
  }
  ```
- **Phản hồi**:
  ```json
  {
      "employeeID": 2,
      "fullName": "Nguyen Van B",
      "phoneNumber": "0987654321",
      "gender": "Female",
      "yearOfBirth": 1992,
      "hireDate": "2025-02-01",
      "is_active": true
  }
  ```

### Cập nhật thông tin nhân viên

- **Endpoint**: `/api/auth/employees/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "fullName": "Nguyen Van C",
      "phoneNumber": "0123456789",
      "gender": "Male",
      "yearOfBirth": 1990,
      "hireDate": "2025-01-01",
      "is_active": false
  }
  ```
- **Phản hồi**:
  ```json
  {
      "employeeID": 1,
      "fullName": "Nguyen Van C",
      "phoneNumber": "0123456789",
      "gender": "Male",
      "yearOfBirth": 1990,
      "hireDate": "2025-01-01",
      "is_active": false
  }
  ```

### Xóa nhân viên

- **Endpoint**: `/api/auth/employees/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa nhân viên thành công"
  }
  ```

## 4️⃣ **Quản lý Tài khoản Nhân viên**

### Lấy danh sách tài khoản nhân viên

- **Endpoint**: `/api/auth/accounts/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {
          "accountID": 1,
          "username": "admin",
          "employee": 1,
          "role": 1,
          "is_staff": true,
          "is_active": true
      },
      ...
  ]
  ```

### Lấy chi tiết tài khoản

- **Endpoint**: `/api/auth/accounts/{id}/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "accountID": 1,
      "username": "admin",
      "employee": 1,
      "role": 1,
      "is_staff": true,
      "is_active": true
  }
  ```

### Tạo tài khoản mới

- **Endpoint**: `/api/auth/accounts/`
- **Phương thức**: `POST`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "username": "user1",
      "password": "password123",
      "employee": 2,
      "role": 2
  }
  ```
- **Phản hồi**:
  ```json
  {
      "accountID": 2,
      "username": "user1",
      "employee": 2,
      "role": 2,
      "is_staff": false,
      "is_active": true
  }
  ```

### Cập nhật tài khoản

- **Endpoint**: `/api/auth/accounts/{id}/`
- **Phương thức**: `PUT`
- **Dữ liệu yêu cầu**:
  ```json
  {
      "password": "newpassword123",
      "role": 3
  }
  ```
- **Phản hồi**:
  ```json
  {
      "accountID": 1,
      "username": "admin",
      "employee": 1,
      "role": 3,
      "is_staff": true,
      "is_active": true
  }
  ```

### Xóa tài khoản

- **Endpoint**: `/api/auth/accounts/{id}/`
- **Phương thức**: `DELETE`
- **Phản hồi**:
  ```json
  {
      "message": "Xóa tài khoản thành công"
  }
  ```

## 5️⃣ **Thống kê Doanh thu - Chi phí - Lợi nhuận**

### Lấy tổng doanh thu, chi phí, lợi nhuận

- **Endpoint**: `/api/auth/statistics/finace/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  {
      "total_revenue": 1000000,
      "total_cost": 500000,
      "profit": 500000
  }
  ```

## 6️⃣ **Thống kê Nhân viên theo quyền**

### Lấy số lượng nhân viên theo từng role

- **Endpoint**: `/api/auth/statistics/employee/`
- **Phương thức**: `GET`
- **Phản hồi**:
  ```json
  [
      {"roleName": "Sales", "total": 10},
      {"roleName": "Product Manager", "total": 5}
  ]
  ```

---

## 🔑 **Xác thực và bảo mật**

Tất cả API trên yêu cầu **đăng nhập trước** và **phải có quyền Admin**. Token xác thực JWT sẽ được gửi qua **Authorization Header** như sau:

```http
Authorization: Bearer (or Token) <access_token>

```