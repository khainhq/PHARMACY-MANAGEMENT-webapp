# Huong dan su dung PharmaCare cho chatbot

Tai lieu nay la nguon kien thuc noi bo de tro ly PharmaCare huong dan nguoi dung thao tac trong he thong quan ly nha thuoc. Chatbot chi tra loi cac cau hoi lien quan den cach su dung ung dung, phan quyen, quy trinh thao tac va cac loi thuong gap trong PharmaCare.

## Vai tro cua chatbot

- Ten hien thi: Tro ly PharmaCare.
- Nhiem vu: huong dan nguoi dung su dung cac phan he cua he thong nha thuoc PharmaCare.
- Khong tu nhan la Gemini, Google, OpenAI hay mot mo hinh AI ben ngoai.
- Khi duoc hoi "ban la ai", hay tra loi: "Toi la Tro ly PharmaCare, nhiem vu cua toi la huong dan ban su dung he thong quan ly nha thuoc PharmaCare."
- Neu cau hoi nam ngoai pham vi su dung he thong, hay tu choi ngan gon va noi ro: "Chuc nang cua toi la huong dan su dung PharmaCare. Ban co the hoi toi ve dang nhap, dashboard, thuoc, hoa don, khach hang, nhan vien, nha cung cap, phieu nhap, bao cao hoac tai khoan."

## Dang nhap va phan quyen

He thong co hai cong dang nhap:

- Cong nhan vien: duong dan `/login`, dung cho nhan vien ban hang va quan ly san pham.
- Cong Admin: duong dan `/admin-login`, dung rieng cho quan tri vien.

Tai khoan mau:

- Admin: `admin / admin123`, vao dashboard quan tri.
- Ban hang: `sales / sales123`, vao dashboard ban hang.
- Quan ly san pham: `product / product123`, vao dashboard quan ly san pham.

Neu dang nhap sai cong, he thong se nhac dung cong phu hop voi vai tro.

## Dashboard quan tri

Dashboard quan tri giup xem tong quan doanh thu, hoa don gan day, so nhan vien, so loai thuoc, thuoc het han va thuoc sap het han. Tu cac the thong ke, nguoi dung co the bam de di nhanh den trang lien quan.

## Dashboard ban hang

Dashboard ban hang tap trung vao quy trinh ban hang. Nguoi dung co the vao:

- Hoa Don: tao hoa don moi hoac xem danh sach hoa don.
- Khach Hang: them, sua, xoa va tim kiem khach hang.

## Dashboard quan ly san pham

Dashboard quan ly san pham tap trung vao kho va nhap hang. Nguoi dung co the vao:

- Thuoc: them, sua, xoa, tim kiem va tai danh sach thuoc.
- Nha Cung Cap: quan ly thong tin nha cung cap.
- Phieu Nhap: tao phieu nhap va xem danh sach phieu nhap.

## Quan ly thuoc

Tai trang Thuoc, nguoi dung co the:

1. Bam `THEM` de mo form them thuoc.
2. Nhap ten thuoc, thanh phan, so luong, gia nhap, don gia, han su dung.
3. Chon don vi tinh, danh muc va xuat xu.
4. Bam `Them moi` de luu.
5. Bam `Sua` tren tung dong de cap nhat thuoc.
6. Bam `Xoa` de xoa neu thuoc chua bi lien ket voi hoa don hoac phieu nhap.
7. Bam `Tai xuong` de xuat danh sach thuoc ra Excel.

Danh muc thuoc hien co:

- Thuoc giam dau.
- Tieu hoa.
- Thuoc khang sinh.
- Vitamin - Khoang chat.
- Cam cum - Ho.
- Tim mach - Huyet ap.
- Da lieu.

## Tao hoa don

Quy trinh tao hoa don:

1. Vao `Hoa Don` > `Tao Hoa Don`.
2. Tim thuoc theo ma hoac ten.
3. Bam `Chon` tai thuoc can ban.
4. Nhap so luong, sau do bam `Them vao gio hang`.
5. Nhap thong tin khach hang: ten, so dien thoai, gioi tinh, dia chi.
6. Chon phuong thuc thanh toan va trang thai.
7. Bam `TAO HOA DON`.
8. Neu thanh cong, he thong hien hoa don thanh toan va co nut in.

Luu y:

- Khong the tao hoa don khi gio hang rong.
- So luong ban khong duoc vuot ton kho.
- Khi tao hoa don thanh cong, ton kho se tu dong giam.
- He thong tao khach hang moi neu chua co so dien thoai trong danh sach khach hang.

## Danh sach hoa don

Tai trang danh sach hoa don, nguoi dung co the xem cac hoa don da tao, tim kiem hoa don, xem chi tiet va xoa hoa don neu can.

## Quan ly khach hang

Tai trang Khach Hang, nguoi dung co the them, sua, xoa va tim kiem khach hang theo ten, so dien thoai hoac ma khach hang.

## Quan ly nhan vien

Tai trang Nhan Vien, Admin co the:

1. Bam `Them nhan vien`.
2. Nhap ho ten, so dien thoai, gioi tinh, nam sinh va ngay vao lam.
3. Bam `Them nhan vien` de luu.
4. Bam `Sua` de cap nhat thong tin.
5. Bam `Xoa` de xoa neu nhan vien khong bi rang buoc voi tai khoan hoac chung tu.

Neu them nhan vien loi, hay kiem tra so dien thoai co trung hay khong va cac truong bat buoc da duoc nhap day du chua.

## Quan ly tai khoan

Tai trang Tai Khoan, Admin co the tao tai khoan, gan nhan vien voi vai tro, kich hoat hoac vo hieu hoa tai khoan. Vai tro backend gom: Admin, Sales va Product_manager.

## Quan ly nha cung cap

Tai trang Nha Cung Cap, nguoi dung co the them, sua, xoa, tim kiem va xuat Excel danh sach nha cung cap.

## Tao phieu nhap

Quy trinh tao phieu nhap:

1. Vao `Phieu Nhap` > `Tao Phieu Nhap`.
2. Chon thuoc can nhap.
3. Nhap so luong va don gia nhap.
4. Chon nhan vien va nha cung cap.
5. Luu phieu nhap.
6. Khi phieu nhap thanh cong, ton kho thuoc tang len.

## Bao cao

Trang Bao Cao dung de xem cac thong tin tong hop phuc vu quan ly, nhu doanh thu, hoa don, san pham va tinh hinh kho.

## Loi thuong gap

- Khong vao duoc backend: kiem tra Docker Desktop dang chay va container backend co trang thai running.
- Trang frontend khong tai du lieu: kiem tra backend o `http://127.0.0.1:8000`.
- Dang nhap dung mat khau nhung sai dashboard: kiem tra dang dung cong nhap Admin hay Nhan vien.
- Tao hoa don khong duoc: kiem tra gio hang, thong tin khach hang, so luong ton kho va backend.
- Them thuoc khong duoc: kiem tra danh muc, don vi, xuat xu, gia va so luong da nhap hop le.
