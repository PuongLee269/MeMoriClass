# ĐƠN ĐẶT HÀNG: bản ĐIỆN THOẠI (dọc) của trang "Lớp F1"

## 1. Canvas và bố cục
- Canvas dọc **1170 x 2532 px** (iPhone 14/15; nếu hoạ sĩ quen 1080x2340 thì dùng 1080x2340 và nhân đúng tỉ lệ các số bên dưới). Mọi lớp CÙNG canvas, CÙNG đăng ký (cùng điểm gốc, không crop khác nhau).
- Cùng phong cách, cùng ánh sáng, cùng bảng màu với bản desktop (ngày sương mù xanh nhạt, đồng cỏ xanh, đá rêu, ánh vàng ấm ở các vật phát sáng). Phối hợp lại bố cục cho màn hình dọc, KHÔNG chỉ cắt/co bản ngang.
- Ảnh tham chiếu bố cục dọc (bắt buộc kèm bản phác 1 ảnh phẳng 1170x2532 để duyệt trước, không dùng làm lớp): từ trên xuống
  - 0-8% (0-200 px): vùng an toàn thanh trạng thái/thanh địa chỉ trình duyệt: chỉ trời/sương, KHÔNG đặt vật quan trọng.
  - 10-30%: đá chiếu có xoắn ốc (rune) trên đỉnh đồi nhỏ, hơi nghiêng, chùm sáng toả xuống khung (bọ rùa của trang sẽ do code đặt lên đỉnh đá).
  - **Khung ba ô tranh cong: mép trên khung ≈ 38% chiều cao (y ≈ 960), cao khoảng 520 px (tới y ≈ 1480)**; rộng tràn gần hết ngang (x 20-1150). Ô giữa lớn (khoảng 600x520), hai ô bên nhỏ hơn, bẻ phối cảnh nhẹ, hơi lấp ló mép màn hình. Xin giao hình học chính xác (xem mục 3).
  - Khoảng 60-72%: bệ đá tròn + cuốn sách mở, **tâm cuốn sách ≈ 65% chiều cao (y ≈ 1650)**, rộng khoảng 700 px kể cả vòng sáng, ngay tầm ngón cái (vùng kéo thoải mái 55-85% chiều cao). Có đủ chỗ hai bên để vuốt ngang.
  - 72-88%: đồng cỏ, đá, hoa; 88-100% (dưới 300 px): vùng an toàn thanh điều hướng/home indicator, chỉ cỏ, không vật quan trọng (chữ chú thích do code vẽ ở đây).
- Lề an toàn ngang 40 px; không vật quan trọng chạm mép.

## 2. Danh sách lớp cần giao (PNG/WebP trong suốt trừ nền)
| Tên file | Nội dung |
|---|---|
| `m01_background.png` | nền trời, núi, sương (RGB, không trong suốt), KHÔNG chứa khung/bệ/cỏ gần |
| `m01b_mist_far.png`, `m01c_mist_near.png` | (nên có) 2 lớp sương trong suốt để trôi nhẹ |
| `m02_foreground_grass.png` | cỏ, đá, hoa tiền cảnh |
| `m02b_grass_over_pedestal.png` | cỏ chồng lên mép dưới bệ đá |
| `m03_pedestal_book.png` | bệ đá + sách mở (+ vòng sáng) ở vị trí đã nêu |
| `m03b_pedestal_nobook.png` | bệ đá KHÔNG có sách, không vòng sáng (để thay bằng hiệu ứng lật; phần dưới sách vẽ bổ sung mặt đá) |
| `m03c_ring_glow.png` | vòng sáng + hạt quanh sách riêng (trong suốt) |
| `m04_projector_stone.png` | đá chiếu có xoắn ốc (xoắn ốc có thể dập dờn) KHÔNG quầng sáng vẽ liền |
| `m04b_rune_glow.png` | quầng sáng xoắn ốc riêng |
| `m06_beam.png` | chùm sáng từ đá chiếu xuống khung |
| `m07_frame.png` | khung cong ba ô, NÉT KHUNG nằm trên cùng, phần trong ô trong suốt hoàn toàn, không ảnh bên trong, không phối cảnh méo ngoài ý muốn |
| `m07_mask_left.png`, `m07_mask_center.png`, `m07_mask_right.png` | mặt nạ từng ô (trắng = nhìn thấy ảnh, đen = không), mở rộng 2-3 px dưới nét khung, mép mềm 1 px |
| `m07_panels.json` | 4 góc (x,y) của mỗi ô (trái-trên, phải-trên, phải-dưới, trái-dưới) để code bẻ phối cảnh ảnh phẳng cho khớp |
| `m08_sample_left/center/right.png` | ảnh mẫu PHẲNG (chưa bẻ cong), đúng tỉ lệ từng ô, độ phân giải >= 2x kích thước ô |
| `m09_light_dust.png` | (tuỳ chọn) bụi sáng/hạt lơ lửng |
| `mobile_reference_flat_1170x2532.png` | ảnh phẳng tham chiếu để duyệt (KHÔNG dùng làm lớp) |
Bọ rùa: KHÔNG cần giao (trang dùng sprite Bọ riêng). Nếu vẫn vẽ thì: sắc nét, không quầng sáng vẽ liền, lớp riêng, cùng kích thước ~100 px chiều cao trên canvas.
Hiệu ứng lật sách bản điện thoại: dùng lại chuỗi ảnh của ORDER_BOOK_FX.md nhưng cần khung hình thích ứng cuốn sách ở kích thước ~700 px ngang (hãy báo hộp bao (x,y,w,h) của sách trong canvas dọc để đặt hàng chuỗi riêng, hoặc cho phép code co chuỗi desktop).

## 3. Quy tắc cho mọi lớp
- Cùng canvas, cùng đăng ký; tên file theo bảng; PNG/WebP có kênh alpha 8 bit sạch.
- KHÔNG chữ, số, mũi tên, nút bấm, UI vẽ liền (code tự vẽ mọi chữ). Hai mũi tên trái/phải ở mép bản desktop do code vẽ, không đưa vào ảnh.
- Không quầng sáng (halo) vẽ liền vào vật thể cần nhấp nháy; quầng ở lớp riêng.
- Mép mờ mềm, không cạnh cắt thẳng, không viền trắng/đen; vật thể bị crop bởi mép canvas thì cho tràn ra ngoài mép (over-scan) chứ không dừng bằng đường thẳng giữa chừng trừ khi chạm mép canvas.
- Kích thước: mỗi lớp <= 3 MB (WebP) hoặc để code nén; tổng gửi dưới 40 MB.
- Gửi kèm `layers.json` liệt kê bbox (x,y,w,h) của từng lớp trên canvas 1170x2532.

## 4. Gợi ý tương tác (để hoạ sĩ hiểu)
Ngón cái đặt lên cuốn sách rồi kéo ngang; ba ô tranh phía trên đổi ảnh theo; khung KHÔNG đổi, chỉ ảnh bên trong đổi. Vì vậy cuốn sách phải đủ lớn (>= 56 px mỗi chiều vùng chạm sau khi co) và nằm ở nửa dưới, dễ với tay.
