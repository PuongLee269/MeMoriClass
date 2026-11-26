# Đặc tả trang mẫu lộ trình đen trắng: `prototype/bw-roadmap/`

Chủ dự án yêu cầu (2026-11-26): làm tiếp trang lộ trình (`roadmap.html`) theo phong cách đen trắng manga của `prototype/bw-bo/` và `prototype/bw-map/`.
Trang mẫu độc lập, KHÔNG sửa `roadmap.html` hay `assets/` dùng chung.

## 1. Nguồn
- Bố cục, tọa độ, hành vi: chép từ `roadmap.html` (canvas 1670×942; LAYERS, NODES, LABELS, BOX, WAVE, LADY_FEET; hai bố cục PORT = rộng/cao < 0.8 và ngang; intro hiện dần; select(i); video poster → iframe YouTube khi bấm, đếm ngược chuyển chương; phím tắt).
- Chữ: `MemoriContent.load('roadmap')` và `('site')` qua `../../assets/content-loader.js` (remap đường dẫn như bw-bo). Không viết chữ mới.
- Ảnh đen trắng mới (Codex vẽ, đặt trong `img/`):
  - `bg-bw.webp`: hang động/khu rừng có dòng sông, cùng bố cục `bg.webp` 1670×942, không giao diện, không Bọ.
  - `scroll-bw.webp`, `mound-bw.webp`, `leafL-bw.webp`, `leafR-bw.webp`: cắt từ một bảng chi tiết nền trắng, cùng kích thước tỉ lệ với bản gốc (scroll 1614×477, moundL 900×268, leafL1 417×356, leafR1 396×313).
- Poster 4 buổi: dùng `../../assets/roadmap/poster1..4.webp` với `filter: grayscale(1) contrast(1.25)` + lớp tram chấm mờ phủ lên. Khi video đang phát thì video giữ màu thật.
- Bọ: sprite đen trắng `../bw-bo/img/bo/*.webp`.

## 2. Thay đổi phong cách
- Toàn trang chỉ đen/trắng/xám (token `--ink #111111`, `--paper #fbfbfa`, `--tone #d8d8d8`), trừ video khi đang phát.
- Khung video: viền mực 2.5px qua bộ lọc vẽ tay (feTurbulence + feDisplacementMap), bóng cứng lệch 4px màu mực, không viền năng lượng/ray sáng. Thanh điều khiển: biểu tượng nét mực trên dải giấy trắng; giữ đủ chức năng của trang cũ.
- Cuộn giấy: `scroll-bw` (giấy trắng, mép rách vẽ mực). Chữ mực `#111`. Nhãn "VO (Lời kể):" nền xám tram thay nền vàng. Con dấu sáp đổi thành con dấu tròn nét mực (SVG), không màu đỏ. Hình phác + mũi tên (máy tính) giữ, nét mực.
- Dòng lộ trình: đường lượn nét mực vẽ tay; 4 nút tròn nền giấy viền mực; nút đang chọn tô đen đặc + vòng elip nét mực vẽ tay quanh nhãn (thay ánh sáng). Nhãn chữ mực.
- Thay hiệu ứng ánh sáng/glint/hạt bằng vài nét tốc độ manga quanh nút vừa chọn (hiện 300ms rồi tắt). Không hạt sáng.
- Phông: Be Vietnam Pro cho chữ giao diện; chữ cuộn giấy giữ Oooh Baby nhưng phải đọc rõ dấu tiếng Việt (nếu Oooh Baby làm dấu khó đọc ở điện thoại, đổi sang Mali Italic).
- Màn tải: nền giấy trắng, Bọ `idle` nhỏ + chữ loaderText màu mực.

## 3. Bọ
Đứng trên gò trái như cũ. Tư thế: nghỉ `idle`; chọn buổi khác → `point` (lật `scaleX(-1)` khi buổi ở bên trái) 1.2s; đang phát video → `listen`; video hết/đếm ngược → `happy`; bấm vào Bọ → `happy`; 25s không tương tác → `sleep`; vào trang → `wave` 1.5s. Bấm Bọ mở chat như trang cũ nếu dễ ghép (bo-widget.js); nếu không, bỏ, ghi lại.

## 4. Liên kết
- Nút bản đồ góc trên phải → `../bw-map/`. "← Về trang Bọ" → `../bw-bo/`. Thanh "Lớp F1 → Đăng ký →" → trang thật `../../<trang>.html`.
- Sửa `prototype/bw-map/`: viên đá "Lộ trình" dẫn sang `../bw-roadmap/` thay vì `../../roadmap.html`.

## 5. Kiểm tra bắt buộc
Playwright (Edge): máy tính 1672×941 và điện thoại 390×844 DPR 2 touch. Ảnh: màn tải, sau intro (4s), chọn Buổi 01 và 04, bấm phát (iframe hiện), ngủ. Kiểm: không cuộn ngang, không lỗi console/404, chữ tiếng Việt đúng dấu, chữ cuộn giấy đọc rõ trên điện thoại, không chữ hướng dẫn kiểu "Chạm…", "Nhấn…".
