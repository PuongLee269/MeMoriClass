# Đặc tả trang mẫu Đăng ký đen trắng: `prototype/bw-dangky/`

Nguồn: `dangky.html` (ảnh đối chiếu `prototype/bw-dangky/_ref/old-*.png`). Trang mẫu độc lập, không sửa trang thật hay `assets/`.

## Giữ nguyên từ trang cũ
- Chữ/dữ liệu: `MemoriContent.load('dangky'|'site'|'journey')` (remap fetch `assets/content/` -> `../../`). Tiêu đề = `srTitle`; giá và ghi chú tách từ `srText` (trang cũ vẽ thành ảnh): 1.500.000đ (ưu đãi), 2.400.000đ (gốc, gạch), "Số lượng có hạn".
- Số chỗ: `registration.js` (`MemoriRegistration.loadRemaining`, cập nhật mỗi 60s), hiển thị `đã xác nhận / sức chứa` bằng chữ số lăn, nhãn "Còn:" như trang cũ (lưu ý: số là số chỗ đã xác nhận, nhãn cũ vốn vậy).
- Form (mở sau khi đóng dấu): trường `ten`, `sdt`, `email`, `lop` (F2, chỉ đọc), bẫy `website`; kiểm tra, thông báo lỗi, gửi qua `MemoriRegistration.submit` tới đúng endpoint Apps Script trong `assets/content/registration.json`; màn cảm ơn; Esc, khoá Tab, trả focus. `window.MemoriRegister` giữ nguyên.
- Con dấu: chuột = con trỏ là con dấu (cursor ẩn khi ở trên liên kết/form); chạm = con dấu hạ xuống. Nút `#zone` bàn phím được.

## Phong cách
- Nền `img/bg-desk-bw.webp` / `bg-phone-bw.webp` (Codex vẽ, xem `PROMPT_BW_DANGKY_ART.md`), blur 1.3px, giảm tương phản, phủ giấy 40-74%.
- Tờ giấy: CSS (viền mực 3px bộ lọc `#hand`, bóng cứng 8px, viền đứt trong). Giá ưu đãi là thẻ xám viền mực. Con dấu và dấu in là SVG mực. Bọ sprite đen trắng (idle, wave, point khi đóng dấu, listen khi form mở, happy, think ngẫu nhiên, sleep sau 25s).
- Thanh gợi ý và nút bản đồ như bw-roadmap; liên kết `../bw-<id>/` (xem `PAGE_MAP` trong `app.js`). Chữ nút >=16px máy tính, >=14px điện thoại; `?freeze=1` dừng chuyển động.
- Bố cục điện thoại khi rộng/cao < 0.9: xếp dọc.
