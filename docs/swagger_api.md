# Hướng dẫn truy cập tài liệu API bằng Swagger

## 1. Swagger UI

Khi backend đang chạy local, mở Swagger tại:

```text
http://127.0.0.1:8000/swagger
```

Hoặc:

```text
http://localhost:8000/swagger
```

## 2. Truy cập qua Cloudflare Tunnel

Nếu đang chạy Cloudflare Tunnel, Swagger có thể truy cập qua link public theo dạng:

```text
https://ten-ngau-nhien.trycloudflare.com/swagger
```

Trong đó `ten-ngau-nhien.trycloudflare.com` là link được in ra từ lệnh:

```powershell
docker compose logs -f cloudflare-tunnel
```

## 3. Cách sử dụng Swagger

1. Mở Swagger bằng một trong các URL trên.
2. Chọn endpoint muốn kiểm tra.
3. Bấm **Try it out**.
4. Nhập dữ liệu request nếu endpoint yêu cầu body.
5. Bấm **Execute** để gửi request.

## 4. Xác thực khi test API

Đăng nhập trước bằng endpoint:

```text
POST /api/auth/login/
```

Body mẫu:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Sau khi nhận token, gửi token trong header:

```http
Authorization: Token <token>
```

## 5. Lưu ý

- Backend hiện tại là ASP.NET Core Web API.
- Nếu Swagger không mở được, kiểm tra backend bằng `docker compose ps` và `docker compose logs backend`.
- Nếu chạy bằng Cloudflare Tunnel, chỉ gửi cho người khác link public khi Docker Desktop, frontend, backend, sqlserver và cloudflare-tunnel đều đang chạy.
