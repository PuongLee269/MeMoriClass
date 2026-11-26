# Đặc tả trang mẫu đen trắng: Giới thiệu (`prototype/bw-gioithieu/`)

Nguồn: `gioithieu.html`, nội dung `assets/content/gioithieu.json` (qua `MemoriContent.load('gioithieu')`), thanh gợi ý từ `journey.json`. Phong cách theo `DAC_TA_PROTOTYPE_BW_ROADMAP.md` mục 6 và `DAC_TA_PROTOTYPE_BW_LOPF1.md` mục 10.

## 1. Trang cũ
Một khung video 16:9 (poster ảnh thật + nút phát, thanh điều khiển tự vẽ, trình phát YouTube qua iframe và postMessage), chú thích dưới (tiêu đề + mô tả), Bọ đậu trên chiếc lá (máy tính) hoặc bay phía trên (điện thoại), nền rừng đêm hai bản (1174x941 và 941x1672), nút bản đồ, thanh gợi ý "Phương pháp →", "Lộ trình Lớp F2 →". Hết video: đếm ngược 3 giây (có nút Hủy) rồi sang bản đồ. Tự phát đã tắt.

## 2. Trang mẫu
- Tệp: `index.html`, `style.css`, `app.js`, `tools/prep_assets.py`, `tools/shoot.py`, `img/*.webp` (nguồn Codex vẽ trong `img/src/`).
- Nền (Codex vẽ): `bg-desk-bw` 1672x941 (rừng ven suối, giữa trống), `bg-phone-bw` 852x1846 (trời, núi thấp, cỏ). Làm mờ nhẹ + lớp giấy phủ 46-80% (đậm quanh khung video). Rìa mờ về giấy.
- Vật cắt từ `parts-bw` (nền trắng): `leaf-d` (lá trên đá, cho Bọ đậu, máy tính), `leaf-m` (điện thoại), `fgL`, `fgR` (cỏ và đá tiền cảnh, lắc nhẹ 13s).
- Khung video: thẻ giấy viền mực 2.5px, thêm lớp viền vẽ tay `feTurbulence` lệch ngoài và bóng cứng 6px. Dưới video là dải điều khiển giấy (phát/tạm dừng, thời gian, thanh tiến độ mực, tắt tiếng, âm lượng, toàn màn hình), nút ≥44px. Nút phát lớn tròn giấy viền mực 84px (72px điện thoại). Poster và video giữ màu thật.
- Chú thích: thẻ giấy viền mực, tiêu đề Oooh Baby (46px; 36px điện thoại), mô tả Be Vietnam Pro 16px (14px điện thoại). Chữ lấy từ JSON.
- Thanh gợi ý trên-trái: nút "←" về `../bw-bo/`, hai trang kế từ `journey.json` (Phương pháp → `../bw-method/`, Lộ trình → `../bw-roadmap/`); nút bản đồ → `../bw-map/`.
- Bọ: sprite `../bw-bo/img/bo/*.webp`, đậu trên lá; idle, wave khi vào trang, wave/think ngẫu nhiên 5-12s, `listen` khi video chạy, `happy` khi hết video, `sleep` sau 25s không tương tác (không ngủ khi đang phát). `?freeze=1` dừng chuyển động.
- Hành vi giữ nguyên: bấm phát tạo iframe `youtube-nocookie` (dự phòng `www.youtube.com`, chờ 8s rồi 25s; lỗi thì hiện thẻ "Mở trên YouTube"), điều khiển qua postMessage, thanh tiến độ/âm lượng, toàn màn hình (thật hoặc giả), hết video đếm ngược rồi sang bản đồ (`../bw-map/`; `?noexit=1` chỉ báo, không rời trang), `YTFast` nếu có, tôn trọng `prefers-reduced-motion`.
- Bố cục: tính bằng JS theo tỉ lệ video, vừa khung nhìn; ngưỡng rộng/cao < 0.9 → bố cục điện thoại (nền đứng, lá nhỏ); điện thoại nằm ngang (cao < 520) ẩn chú thích.

## 3. Bỏ so với trang cũ
- Tự phát (đã tắt ở trang cũ), thanh điều khiển tự ẩn khi đang phát (ở bản mẫu luôn hiện vì là dải giấy riêng), các lớp đom đóm/lá phát sáng, `bo-widget.js` (thay bằng bộ điều khiển sprite riêng).
