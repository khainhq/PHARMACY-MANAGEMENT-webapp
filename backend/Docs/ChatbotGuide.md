# Hướng dẫn sử dụng PharmaCare cho chatbot

Tài liệu này là nguồn kiến thức nội bộ để Trợ lý PharmaCare hướng dẫn người dùng thao tác trong hệ thống quản lý nhà thuốc. Khi trả lời, chatbot chỉ dựa vào nội dung trong tài liệu này và các câu hỏi liên quan đến cách sử dụng ứng dụng, phân quyền, quy trình thao tác, lỗi thường gặp và cách chạy dự án.

## Quy tắc trả lời của chatbot

- Tên hiển thị: Trợ lý PharmaCare.
- Vai trò: hỗ trợ người dùng sử dụng hệ thống quản lý nhà thuốc PharmaCare.
- Luôn trả lời bằng tiếng Việt tự nhiên, rõ ràng, ngắn gọn nhưng đủ bước.
- Không tự nhận là bất kỳ mô hình AI hoặc dịch vụ bên ngoài nào.
- Khi được hỏi "bạn là ai", hãy trả lời: "Tôi là Trợ lý PharmaCare, nhiệm vụ của tôi là hướng dẫn bạn sử dụng hệ thống quản lý nhà thuốc PharmaCare."
- Nếu người dùng hỏi ngoài phạm vi hệ thống, hãy trả lời: "Chức năng của tôi là hướng dẫn sử dụng PharmaCare. Bạn có thể hỏi tôi về đăng nhập, dashboard, thuốc, hóa đơn, khách hàng, nhân viên, nhà cung cấp, phiếu nhập, báo cáo hoặc tài khoản."
- Nếu câu hỏi chưa rõ, hãy hỏi lại một câu ngắn để xác định người dùng đang gặp lỗi ở frontend, backend, Docker, đăng nhập hay thao tác nghiệp vụ.
- Không bịa dữ liệu doanh thu, khách hàng, hóa đơn hoặc tài khoản nếu tài liệu không nêu rõ.
- Khi hướng dẫn thao tác, ưu tiên viết theo từng bước đánh số.

## Cách chạy dự án bằng Docker

Người dùng có thể chạy toàn bộ hệ thống bằng Docker Desktop:

1. Mở Docker Desktop và chờ Docker chạy ổn định.
2. Mở terminal tại thư mục dự án.
3. Chạy lệnh `docker compose up -d --build`.
4. Mở frontend tại `http://localhost:3000`.
5. Backend chạy tại `http://127.0.0.1:8000`.
6. SQL Server chạy trong container và được backend tự kết nối.

Chatbot chạy bằng tài liệu hướng dẫn nội bộ trong file này, không cần cấu hình API bên ngoài. Vì vậy Docker vẫn chạy được cho máy khác mà không phải tạo khóa riêng.

## Đăng nhập và phân quyền

Hệ thống có hai cổng đăng nhập:

- Cổng nhân viên: `/login`, dùng cho nhân viên bán hàng và quản lý sản phẩm.
- Cổng Admin: `/admin-login`, dùng riêng cho quản trị viên.

Tài khoản mẫu:

- Admin: `admin / admin123`, vào dashboard quản trị.
- Bán hàng: `sales / sales123`, vào dashboard bán hàng.
- Quản lý sản phẩm: `product / product123`, vào dashboard quản lý sản phẩm.

Nếu đăng nhập sai cổng, hệ thống sẽ nhắc người dùng dùng đúng cổng theo vai trò. Nếu nhập đúng tài khoản nhưng không vào được, hãy kiểm tra backend có đang chạy không, URL API có dùng `http://127.0.0.1:8000` không và container backend có bị tắt không.

## Dashboard quản trị

Dashboard quản trị dành cho Admin. Trang này hiển thị tổng quan tình hình nhà thuốc:

- Doanh thu và số liệu tổng hợp.
- Số hóa đơn gần đây.
- Số lượng nhân viên.
- Số loại thuốc đang quản lý.
- Thuốc hết hạn hoặc sắp hết hạn.
- Các chỉ số giúp quản lý kiểm tra nhanh hoạt động kinh doanh.

Admin có thể dùng các thẻ thống kê hoặc menu bên trái để đi tới nhân viên, tài khoản, thuốc, hóa đơn, nhà cung cấp, phiếu nhập và báo cáo.

## Dashboard bán hàng

Dashboard bán hàng dành cho vai trò Sales. Người dùng nhóm này tập trung vào quy trình bán thuốc và chăm sóc khách hàng.

Các mục thường dùng:

- Hóa đơn: tạo hóa đơn mới, xem danh sách hóa đơn, in hóa đơn.
- Khách hàng: thêm, sửa, xóa và tìm kiếm khách hàng.
- Thuốc: xem danh sách thuốc để kiểm tra tên thuốc, giá bán và số lượng tồn.

Nhân viên bán hàng không nên thấy các chức năng quản trị nhạy cảm như quản lý tài khoản hoặc phân quyền.

## Dashboard quản lý sản phẩm

Dashboard quản lý sản phẩm dành cho vai trò Product_manager. Người dùng nhóm này phụ trách kho, thuốc, nhà cung cấp và nhập hàng.

Các mục thường dùng:

- Thuốc: thêm, sửa, xóa, tìm kiếm, tải danh sách thuốc.
- Nhà cung cấp: quản lý thông tin nhà cung cấp.
- Phiếu nhập: tạo phiếu nhập, xem danh sách phiếu nhập.
- Báo cáo hoặc thống kê kho nếu tài khoản được cấp quyền xem.

## Quản lý thuốc

Tại trang Thuốc, người dùng có thể quản lý danh mục thuốc trong nhà thuốc.

Quy trình thêm thuốc:

1. Vào menu `Thuốc`.
2. Bấm nút `THÊM`.
3. Nhập tên thuốc, thành phần, số lượng, giá nhập, đơn giá và hạn sử dụng.
4. Chọn đơn vị tính, danh mục và xuất xứ.
5. Kiểm tra lại dữ liệu bắt buộc.
6. Bấm `Thêm mới` để lưu.

Quy trình sửa thuốc:

1. Tìm thuốc cần sửa trong danh sách.
2. Bấm `Sửa`.
3. Cập nhật thông tin cần thay đổi.
4. Bấm lưu để hoàn tất.

Quy trình xóa thuốc:

1. Tìm thuốc cần xóa.
2. Bấm `Xóa`.
3. Xác nhận thao tác nếu hệ thống yêu cầu.
4. Nếu thuốc đã liên kết với hóa đơn hoặc phiếu nhập, hệ thống có thể không cho xóa để bảo toàn dữ liệu.

Danh mục thuốc hiện có:

- Thuốc giảm đau.
- Tiêu hóa.
- Thuốc kháng sinh.
- Vitamin - Khoáng chất.
- Cảm cúm - Ho.
- Tim mạch - Huyết áp.
- Da liễu.

Lỗi thường gặp khi thêm hoặc sửa thuốc:

- Thiếu tên thuốc, số lượng, giá hoặc hạn sử dụng.
- Chưa chọn danh mục, đơn vị tính hoặc xuất xứ.
- Giá hoặc số lượng nhập không hợp lệ.
- Backend chưa chạy hoặc mất kết nối SQL Server.

## Tạo hóa đơn

Quy trình tạo hóa đơn bán hàng:

1. Vào `Hóa đơn`.
2. Chọn `Tạo hóa đơn`.
3. Tìm thuốc theo mã hoặc tên thuốc.
4. Bấm `Chọn` tại thuốc cần bán.
5. Nhập số lượng.
6. Bấm `Thêm vào giỏ hàng`.
7. Nhập thông tin khách hàng: họ tên, số điện thoại, giới tính và địa chỉ.
8. Chọn phương thức thanh toán và trạng thái.
9. Bấm `TẠO HÓA ĐƠN`.
10. Nếu thành công, hệ thống hiển thị hóa đơn và có thể in hóa đơn.

Lưu ý nghiệp vụ:

- Không thể tạo hóa đơn khi giỏ hàng rỗng.
- Số lượng bán không được vượt quá số lượng tồn kho.
- Khi hóa đơn tạo thành công, tồn kho tự động giảm.
- Nếu số điện thoại khách hàng chưa tồn tại, hệ thống tạo khách hàng mới.
- Nếu số điện thoại đã tồn tại, hóa đơn được gắn với khách hàng cũ.

## Danh sách hóa đơn

Tại trang danh sách hóa đơn, người dùng có thể:

- Xem các hóa đơn đã tạo.
- Tìm kiếm hóa đơn.
- Xem chi tiết hóa đơn.
- Kiểm tra tổng tiền, ngày tạo, khách hàng và trạng thái.
- Xóa hóa đơn nếu chức năng và quyền hiện tại cho phép.

Nếu danh sách hóa đơn không tải, hãy kiểm tra backend, token đăng nhập và kết nối từ frontend tới `http://127.0.0.1:8000`.

## Quản lý khách hàng

Tại trang Khách hàng, người dùng có thể:

- Thêm khách hàng mới.
- Sửa thông tin khách hàng.
- Xóa khách hàng nếu không bị ràng buộc dữ liệu.
- Tìm kiếm theo tên, số điện thoại hoặc mã khách hàng.

Thông tin khách hàng thường gồm họ tên, số điện thoại, giới tính và địa chỉ. Khi tạo hóa đơn, hệ thống có thể tự tạo khách hàng mới dựa trên số điện thoại.

## Quản lý nhân viên

Tại trang Nhân viên, Admin có thể:

1. Bấm `Thêm nhân viên`.
2. Nhập họ tên, số điện thoại, giới tính, năm sinh và ngày vào làm.
3. Bấm `Thêm nhân viên` để lưu.
4. Bấm `Sửa` để cập nhật thông tin.
5. Bấm `Xóa` để xóa nếu nhân viên không bị ràng buộc với tài khoản, hóa đơn hoặc chứng từ.

Nếu thêm nhân viên lỗi, hãy kiểm tra:

- Số điện thoại có bị trùng không.
- Các trường bắt buộc đã nhập đủ chưa.
- Năm sinh có hợp lệ không.
- Backend và SQL Server có đang chạy không.

## Quản lý tài khoản

Tại trang Tài khoản, Admin có thể:

- Tạo tài khoản đăng nhập.
- Gắn tài khoản với nhân viên.
- Chọn vai trò phù hợp.
- Kích hoạt hoặc vô hiệu hóa tài khoản.
- Kiểm tra trạng thái tài khoản.

Vai trò backend gồm:

- `Admin`: quản trị hệ thống.
- `Sales`: bán hàng, hóa đơn, khách hàng.
- `Product_manager`: thuốc, kho, nhà cung cấp, phiếu nhập.

Nếu tài khoản đăng nhập được nhưng thấy sai menu, hãy kiểm tra vai trò của tài khoản và cổng đăng nhập đang dùng.

## Quản lý nhà cung cấp

Tại trang Nhà cung cấp, người dùng có thể:

- Thêm nhà cung cấp.
- Sửa thông tin nhà cung cấp.
- Xóa nhà cung cấp nếu không bị ràng buộc với phiếu nhập.
- Tìm kiếm nhà cung cấp.
- Xuất danh sách ra Excel nếu giao diện có nút tải xuống.

Thông tin nhà cung cấp thường gồm tên, số điện thoại, email và địa chỉ.

## Tạo phiếu nhập

Quy trình tạo phiếu nhập:

1. Vào `Phiếu nhập`.
2. Chọn `Tạo phiếu nhập`.
3. Chọn thuốc cần nhập.
4. Nhập số lượng và đơn giá nhập.
5. Chọn nhân viên và nhà cung cấp.
6. Kiểm tra tổng tiền.
7. Lưu phiếu nhập.
8. Khi phiếu nhập thành công, tồn kho thuốc tăng lên.

Nếu tạo phiếu nhập lỗi, hãy kiểm tra thuốc, nhà cung cấp, nhân viên, số lượng, đơn giá và backend.

## Báo cáo

Trang Báo cáo dùng để xem thông tin tổng hợp phục vụ quản lý. Tùy quyền tài khoản, người dùng có thể xem:

- Doanh thu.
- Tình hình hóa đơn.
- Tình hình kho.
- Sản phẩm bán hoặc nhập.
- Dữ liệu hỗ trợ quản lý nhà thuốc.

Nếu báo cáo trống, hãy kiểm tra dữ liệu hóa đơn, phiếu nhập và khoảng thời gian lọc.

## Chatbot trên giao diện

Chatbot hiển thị ở góc dưới bên phải giao diện. Trên trang chính, chatbot nằm gần nút gọi điện và Zalo. Sau khi đăng nhập, chatbot vẫn hiển thị trong dashboard để hỗ trợ người dùng thao tác.

Người dùng có thể hỏi:

- "Cách đăng nhập Admin?"
- "Làm sao tạo hóa đơn?"
- "Tại sao không thêm thuốc được?"
- "Vai trò Sales dùng được chức năng nào?"
- "Docker chạy rồi nhưng backend tắt thì làm sao?"
- "Bạn là ai?"

Chatbot nên trả lời trực tiếp theo tài liệu, không mở rộng sang chủ đề không liên quan như thời tiết, học tập, giải trí hoặc tư vấn y khoa.

## Lỗi thường gặp

Backend bật lên rồi tắt:

1. Kiểm tra container SQL Server đã chạy chưa.
2. Kiểm tra mật khẩu SQL Server trong `docker-compose.yml`.
3. Chạy lại `docker compose up -d --build`.
4. Xem log bằng `docker compose logs backend`.

Frontend vào `localhost:3000` nhưng báo không có dữ liệu:

1. Kiểm tra container frontend có đang chạy không.
2. Kiểm tra backend tại `http://127.0.0.1:8000`.
3. Kiểm tra trình duyệt có đang gọi đúng API không.

Đăng nhập đúng mật khẩu nhưng vào sai dashboard:

1. Kiểm tra đang dùng `/login` hay `/admin-login`.
2. Kiểm tra vai trò tài khoản.
3. Đăng xuất rồi đăng nhập lại.

Tạo hóa đơn không được:

1. Kiểm tra giỏ hàng có thuốc chưa.
2. Kiểm tra số lượng bán có vượt tồn kho không.
3. Kiểm tra thông tin khách hàng đã nhập đủ chưa.
4. Kiểm tra backend có trả lỗi cụ thể không.

Chatbot không trả lời:

1. Kiểm tra backend có đang chạy tại `http://127.0.0.1:8000` không.
2. Kiểm tra container backend bằng `docker compose logs backend`.
3. Kiểm tra frontend có gọi đúng API `/chatbot/` không.
4. Kiểm tra file `backend/Docs/ChatbotGuide.md` có được copy vào container backend không.
