# Đặc tả trang mẫu đen trắng: `prototype/bw-bo/`

Chủ dự án đã duyệt: trang = phương án B (`phuong-an/pa-15b.png`, điện thoại `phuong-an/pa-B-phone.png`), nhân vật = Bọ 1 (`bo/bo-1.png`, `bo1-camxuc.png`, `bo1-trangthai.png`, `bo1-canh.png`).
Trang mẫu độc lập, CHƯA ghép vào web thật. Không sửa file ngoài `prototype/bw-bo/`.

## 1. Tài nguyên
- `img/bg-phone.png`, `img/bg-desktop.png`: cảnh rừng không có giao diện, không có Bọ (đã có sẵn).
- `img/bo/<trạng thái>.png`: Bọ nền trong suốt, cùng cỡ, chân chạm đáy ảnh: `idle, wave, talk, listen, think, point, happy, surprised, confused, sleep, takeoff, fly` (đã có sẵn).
- Phông: dùng lại `../../assets/fonts/` (Be Vietnam Pro 400/500 cho chữ chat; Oooh Baby cho logo; Mali Italic cho nhãn "Bọ").
- Ảnh bản đồ nhỏ trong khung thoại: dùng ảnh bản đồ đang có của trang thật, thêm `filter: grayscale(1) contrast(1.15)`.

## 2. Hệ màu và chữ (token)
```
--ink: #111111        nét, chữ, viền
--paper: #fbfbfa      nền khung thoại, ô hỏi (trắng trung tính, KHÔNG ngả vàng)
--tone: #d8d8d8       xám tram nhạt (vùng phụ)
--line: 2px           viền khung thoại và ô hỏi (máy tính 2.5px)
--radius-bubble: 22px
--text: Be Vietnam Pro 400, 17px/1.45 điện thoại, 18px máy tính
--label: Mali Italic 400, 20px
--logo: Oooh Baby, 38px điện thoại, 44px máy tính
```
Không dùng màu nào khác. Không bóng đổ mềm kiểu giao diện; nếu cần nổi khối dùng bóng cứng lệch 3px màu --ink.
Viền khung thoại và ô hỏi có cảm giác vẽ tay: một lớp viền riêng (pseudo-element) đi qua bộ lọc SVG `feTurbulence` + `feDisplacementMap` (scale 1.2–1.8), chữ bên trong KHÔNG bị lọc.

## 3. Bố cục
Mọi vị trí đặt bằng biến CSS để dễ tinh chỉnh theo ảnh nền:
- Điện thoại (≤ 640px, dọc): nền `bg-phone` phủ kín (`object-fit: cover`, neo giữa-dưới). Logo trên-trái, nút bản đồ trên-phải. Khung thoại rộng (lề 16px), đỉnh ~29% chiều cao, đuôi phải-dưới chỉ xuống Bọ. Bọ giữa màn, chân đặt trên mặt khúc gỗ (~72% chiều cao), rộng ~44vw. Ô hỏi dạng viên thuốc trắng viền mực, cách đáy ~92px. Hai nút tròn dưới-phải.
- Máy tính: nền `bg-desktop` phủ kín. Khung thoại trái-giữa (trái ~19%, đỉnh ~30%, rộng ~43%), ô hỏi ngay dưới, Bọ trên khúc gỗ bên phải (~73% ngang, chân ~75% dọc), rộng ~16vw.
- Không cuộn ngang ở mọi cỡ. Dùng `100svh`. Nội dung nằm trong vùng an toàn (`env(safe-area-inset-*)`).
- Thứ tự mắt: khung thoại → Bọ → ô hỏi → logo/nút. Không có chữ hướng dẫn ("Chạm…", "Kéo…"); nhãn aria giữ.

## 4. Trạng thái Bọ (máy trạng thái)
| Sự kiện | Trạng thái | Ghi chú |
|---|---|---|
| Vừa tải xong | `wave` 2.2s → `talk` khi hiện câu chào → `idle` | câu chào lấy từ BO_TEXT.greeting như trang thật, kèm thẻ "Tham quan bản đồ" |
| Chạm/focus ô hỏi, đang gõ | `listen` | rời ô mà không gõ → `idle` |
| Gửi câu hỏi | `think` (trong khung thoại: ba chấm nhấp nháy) | |
| Có câu trả lời | `talk` trong `clamp(1.6s, số ký tự × 45ms, 4.5s)` → `idle` | câu dự phòng (không hiểu) → `confused` 2s → `idle` |
| Câu cảm ơn / chào | `happy` 1.6s | dựa vào id câu trả lời nhóm xã giao nếu có, không thì bỏ qua |
| Bấm vào Bọ | `happy` 1.2s rồi về trạng thái trước | vùng bấm ≥ 44px |
| Không tương tác 25s | `sleep` | có tương tác lại → `surprised` 0.6s → `idle` |
| Bấm "Tham quan bản đồ" hoặc nút bản đồ | `point` 0.5s → `takeoff` 0.35s → `fly` bay lên-trái ra khỏi màn 0.9s → chuyển trang | chuyển sang `../../sitemap.html` |

Đổi trạng thái: hai thẻ `<img>` chồng nhau, chuyển mờ 160ms (không nháy trắng). Tải trước toàn bộ 12 ảnh.

## 5. Chuyển động
- Vào trang: nền hiện từ trắng (opacity 0→1, 700ms, ease-out); Bọ bật nhẹ từ dưới lên đặt chân xuống khúc gỗ (translateY 12px→0, scaleY 0.94→1, 420ms, cubic-bezier(.2,.9,.3,1.3)); khung thoại bung ra sau 500ms.
- Khung thoại bung: `clip-path: circle()` mở từ điểm đuôi (0% → 150%, 420ms, ease-out), chữ hiện cả câu ngay khi mở xong (không gõ từng chữ).
- Thở khi `idle`/`listen`: scaleY 1 → 1.022, gốc ở chân, 3.2s, ease-in-out, lặp.
- Nói (`talk`): nhún nhẹ translateY 0 → -2px, 0.32s, lặp.
- Ngủ: thở chậm 4.5s, biên độ lớn hơn (1.035).
- Bay: đường cong lên-trái (translate + rotate -8°), scale 1 → 0.6, 900ms; cùng lúc toàn trang phủ dần một lớp giấy trắng (opacity 0→1, 500ms, bắt đầu ở 400ms) rồi chuyển trang.
- Máy tính: rê chuột lệch lớp nhẹ: nền ±6px ngược chiều, Bọ ±3px cùng chiều, có làm mượt. Điện thoại: tắt.
- `prefers-reduced-motion: reduce`: tắt thở/nhún/lệch lớp/bay; đổi trạng thái tức thì; khung thoại chỉ đổi mờ 120ms; chuyển trang ngay.

## 6. Trả lời câu hỏi
Dùng lại đúng đường trả lời của `index.html` (dòng ~1140–1205): `../../assets/content-loader.js`, `bo-matcher.js`, `bo-ai.js`, `bo-replies.js`; `BO_READY`, `BoMatcher.buildAll`, `BoAI.route`, `BO_FALLBACK`, `BO_TEXT`. Kiểm content-loader có tìm đúng đường dẫn nội dung khi trang nằm ở `prototype/bw-bo/`; nếu không, cấu hình đường dẫn gốc mà không sửa file dùng chung.
Khung thoại chỉ hiện câu mới nhất của Bọ; câu hỏi của người dùng hiện một dòng nhỏ màu --ink 60% phía trên câu trả lời. Liên kết trong câu trả lời: chữ gạch chân mực.

## 7. Kiểm tra bắt buộc
Chụp Playwright: điện thoại 390×844 DPR 2 có touch, máy tính 1672×941. Các khoảnh khắc: vừa tải (0.3s), đã chào (3s), đang gõ, đang chờ trả lời, đang trả lời, ngủ, đang bay. Không lỗi console, không cuộn ngang, chữ tiếng Việt đúng.
