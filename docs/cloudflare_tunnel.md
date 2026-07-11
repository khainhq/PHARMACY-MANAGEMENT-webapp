# Hướng dẫn chạy public miễn phí bằng Cloudflare Tunnel

Tài liệu này hướng dẫn cách tạo link public miễn phí cho PharmaCare khi chưa có domain. Cách này phù hợp để demo đồ án, gửi link cho giảng viên hoặc cho thành viên nhóm kiểm tra nhanh.

## 1. Cloudflare Tunnel dùng để làm gì?

Cloudflare Tunnel tạo một đường kết nối từ máy local đang chạy Docker ra internet. Người khác có thể mở web bằng link dạng:

```text
https://ten-ngau-nhien.trycloudflare.com
```

Với cấu hình hiện tại, Cloudflare chỉ trỏ vào frontend. Nginx trong container frontend sẽ tự chuyển tiếp:

- `/api/...` sang backend ASP.NET Core Web API.
- `/chatbot/...` sang backend chatbot endpoint.
- Các đường còn lại sang React frontend.

Vì vậy người dùng bên ngoài chỉ cần mở một link duy nhất, không cần biết backend đang chạy ở port `8000`.

## 2. Yêu cầu trước khi chạy

- Đã cài Docker Desktop.
- Docker Desktop đang chạy.
- Máy có internet.
- Đang đứng tại thư mục gốc của project, nơi có file `docker-compose.yml`.

Kiểm tra Docker:

```powershell
docker compose ps
```

## 3. Chạy project local trước

```powershell
docker compose up -d --build
```

Mở thử:

```text
http://localhost:3000
```

Nếu local chạy ổn thì tiếp tục bật tunnel.

## 4. Bật Cloudflare Tunnel

```powershell
docker compose --profile tunnel up -d --build
```

Lệnh này sẽ chạy thêm container:

```text
cloudflare-tunnel
```

## 5. Lấy link public

```powershell
docker compose logs -f cloudflare-tunnel
```

Tìm dòng có dạng:

```text
Your quick Tunnel has been created! Visit it at:
https://ten-ngau-nhien.trycloudflare.com
```

Sao chép link `https://...trycloudflare.com` và gửi cho người khác.

## 6. Kiểm tra đăng nhập qua link public

Mở link Cloudflare trên trình duyệt, sau đó đăng nhập thử:

```text
Admin: admin / admin123
Sales: sales / sales123
Product manager: product / product123
```

Nếu đăng nhập được nghĩa là frontend, backend và database đều đang hoạt động qua tunnel.

## 7. Dừng tunnel

Chỉ dừng tunnel, vẫn giữ web local chạy:

```powershell
docker compose stop cloudflare-tunnel
```

Dừng toàn bộ project:

```powershell
docker compose down
```

## 8. Khi nào link bị đổi?

Với Cloudflare Quick Tunnel, link thường có thể đổi khi:

- Tắt container tunnel rồi bật lại.
- Restart Docker Desktop.
- Tắt laptop hoặc mất mạng.
- Cloudflare cấp lại quick tunnel mới.

Nếu link cũ không vào được, chạy lại:

```powershell
docker compose --profile tunnel up -d --build
docker compose logs -f cloudflare-tunnel
```

Sau đó lấy link mới.

## 9. Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| Không thấy link `trycloudflare.com` | Chạy `docker compose logs -f cloudflare-tunnel` và chờ thêm vài giây |
| Link public mở được nhưng không đăng nhập được | Chạy `docker compose ps` kiểm tra backend và sqlserver có đang `Up` không |
| Localhost chạy được nhưng link Cloudflare lỗi | Rebuild lại bằng `docker compose --profile tunnel up -d --build` |
| Backend bị tắt | Xem log bằng `docker compose logs backend` |
| SQL Server khởi động chậm lần đầu | Chờ thêm 1-3 phút rồi chạy `docker compose restart backend` |
| Muốn lấy link mới | Chạy `docker compose restart cloudflare-tunnel`, sau đó xem log tunnel |

## 10. Lưu ý bảo mật

Cloudflare Quick Tunnel phù hợp cho demo/test, không nên xem là triển khai production lâu dài.

Khi demo xong nên dừng tunnel:

```powershell
docker compose stop cloudflare-tunnel
```

Không đưa API key thật, mật khẩu cá nhân hoặc dữ liệu thật lên GitHub. Với môi trường production cần dùng domain riêng, HTTPS ổn định, secret riêng, mật khẩu SQL Server mạnh và chính sách backup database.
