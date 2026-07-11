# Tài liệu API xác thực và tài khoản

Base URL khi chạy local:

```text
http://127.0.0.1:8000
```

Base URL khi chạy Cloudflare Tunnel:

```text
https://ten-ngau-nhien.trycloudflare.com
```

Các endpoint bên dưới dùng JSON. Với API yêu cầu đăng nhập, gửi token trong header:

```http
Authorization: Token <token>
```

## 1. Đăng nhập

```http
POST /api/auth/login/
```

Body mẫu:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response mẫu:

```json
{
  "token": "token_dang_nhap",
  "username": "admin",
  "role": "Admin"
}
```

Tài khoản demo:

```text
Admin: admin / admin123
Sales: sales / sales123
Product manager: product / product123
```

## 2. Đăng xuất

```http
POST /api/auth/logout/
```

Yêu cầu header token.

## 3. Kiểm tra tài khoản hiện tại

```http
GET /api/auth/me/
```

Response trả về tên đăng nhập, vai trò và nhân viên liên kết với tài khoản.

## 4. Đổi mật khẩu

```http
POST /api/auth/reset-password/
```

Body mẫu:

```json
{
  "username": "admin",
  "oldPassword": "admin123",
  "newPassword": "matkhauMoi123"
}
```

## 5. Quản lý vai trò

```http
GET    /api/auth/roles/
GET    /api/auth/roles/{id}/
POST   /api/auth/roles/
PUT    /api/auth/roles/{id}/
PATCH  /api/auth/roles/{id}/
DELETE /api/auth/roles/{id}/
```

Dùng để quản lý các vai trò như `Admin`, `Sales`, `Product_manager`.

## 6. Quản lý nhân viên

```http
GET    /api/auth/employees/
GET    /api/auth/employees/{id}/
POST   /api/auth/employees/
PUT    /api/auth/employees/{id}/
PATCH  /api/auth/employees/{id}/
DELETE /api/auth/employees/{id}/
```

Body tạo/cập nhật nhân viên mẫu:

```json
{
  "employeeID": "EMP001",
  "fullName": "Nguyen Ho Quang Khai",
  "phoneNumber": "0900000001",
  "gender": "Nam",
  "birthDate": "2000-03-10",
  "hireDate": "2026-07-10",
  "isActive": true
}
```

## 7. Quản lý tài khoản

```http
GET    /api/auth/accounts/
GET    /api/auth/accounts/{id}/
POST   /api/auth/accounts/
PUT    /api/auth/accounts/{id}/
PATCH  /api/auth/accounts/{id}/
DELETE /api/auth/accounts/{id}/
```

Body tạo tài khoản mẫu:

```json
{
  "username": "sales",
  "password": "sales123",
  "employeeID": "EMP002",
  "roleID": 2,
  "isActive": true
}
```

Mật khẩu được backend hash bằng BCrypt trước khi lưu database.

## 8. Lưu ý kiểm thử

- Đăng nhập trước để lấy token.
- Dùng header `Authorization: Token <token>` cho các API quản trị.
- Nếu đăng nhập admin không được, chạy `docker compose restart backend` để backend đảm bảo lại dữ liệu demo.
- Không lưu hoặc gửi mật khẩu thật trong tài liệu, ảnh chụp hoặc repository.
