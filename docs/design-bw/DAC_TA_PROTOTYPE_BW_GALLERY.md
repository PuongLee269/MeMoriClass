# Đặc tả trang mẫu Workshop đen trắng: `prototype/bw-gallery/`

Trang cũ: `gallery.html` ("Workshop"). Chuyển sang phong cách đen trắng manga của `bw-bo`, `bw-map`, `bw-roadmap`, `bw-lopf1`. Trang mẫu độc lập, không sửa `gallery.html` hay `assets/`. Ảnh chụp trang cũ: `prototype/bw-gallery/_ref/old-*.png`.

## 1. Trang cũ là gì
Cảnh đêm trên vách đá nhìn xuống thung lũng. Trên mặt đá: một máy chiếu bằng đá (có viên đá xanh ở miệng), Bọ rùa bên trái, khay 3x3 chín viên đá màu bên phải. Kéo qua ba viên đá (hoặc chọn ba viên bằng bàn phím) thì máy chiếu phát chùm sáng và đổi ảnh workshop trong khung phía trên; bộ ba chưa gán ảnh thì máy chiếu nhiễu. Bấm khung ảnh mở khung xem ảnh lớn (lightbox) có chú thích, mũi tên, vuốt. Không cuộn trang.

## 2. Nguồn dữ liệu
- `MemoriContent.load('gallery', …, {replace:['photos']})` và `('site')` qua `../../assets/content-loader.js` (remap fetch như bw-lopf1). Giá trị mặc định nhúng trong `app.js` là bản sao `assets/content/gallery.json` (`tools/build.py` ghép từ `app.src.js` + JSON).
- Khoá dùng: `pageTitle`, `hint` (rỗng thì ẩn), `photos[]` {id, src, full, fullm, fw, fh, title, desc, caption, alt}, `assignments[]` {gems[3], photo}. Chọn ảnh: khoá bộ ba đá sắp xếp, tra `assignments`; ảnh đầu tiên hiện sẵn khi mở trang.
- Chữ không viết mới, trừ `aria-label` và thông báo `aria-live` chép nguyên từ code trang cũ ("Viên đá <màu>, số n", "Đã đổi ảnh: …", "Bộ ba viên đá này chưa có ảnh. Máy chiếu bị nhiễu, hãy thử bộ khác.", "Xem ảnh lớn: …"). Màn tải chỉ có Bọ, logo, thanh tiến trình (không câu chữ).
- Ảnh workshop (`assets/workshop/*-p|d|m.webp`) là ảnh thật: KHÔNG vẽ lại, giữ màu thật trong khung đang chiếu và trong lightbox.

## 3. Ảnh đen trắng Codex vẽ (`PROMPT_BW_GALLERY_ART.md`, `prototype/bw-gallery/img/src/`)
- `bg-desk-bw.png` 1672x941: thung lũng đêm, thông hai bên, sông, lâu đài xa, trăng, bệ đá phẳng ở đáy; giữa nhẹ để khung ảnh nổi.
- `bg-phone-bw.png` 852x1846: bản dọc, mặt bệ đá lớn dưới 50%.
- `parts-bw.png` 1642x958: máy chiếu đá (miệng để trống), cụm cỏ+đá tiền cảnh trái/phải.
- `tools/prep_assets.py` xuất `bg-desk-bw.webp`, `bg-phone-bw.webp` (q82) và cắt nền trắng ra `projector.webp`, `fgL.webp`, `fgR.webp`.
- Làm bằng CSS/SVG: khung ảnh, khay + chín viên đá, sợi nối, chùm sáng, nhiễu, nút, lightbox, màn tải. Chín viên đá phân biệt bằng chín mẫu tram (đặc, trắng, xám, chấm, gạch chéo hai chiều, ô vuông, gạch ngang, chấm dày) vì không còn màu; `aria-label` vẫn nêu tên màu như trang cũ.

## 4. Bố cục
- Máy tính (tỉ lệ rộng/cao >= 0.9): canvas 1672x941 neo đáy, vừa khung; khung ảnh (405,98) 856x436; máy chiếu giữa (lens 808,659); khay đá (962,640) 310x274, ô 90x78; Bọ (500,630) 132px.
- Điện thoại (<0.9): canvas 852x1844 theo chiều rộng; khung ảnh (44,292) 764x389; máy chiếu giữa; khay (92,1210) 668x548, ô 200x160 (viên đá ~77x62 px màn hình); Bọ (30,972) 200px.
- Dải thừa: phủ giấy, nền mờ dần ra rìa (như bw-lopf1).

## 5. Phong cách
- Token `--ink #111`, `--paper #fbfbfa`, `--tone #d8d8d8`; viền mực vẽ tay qua bộ lọc `#hand` (và `#hand2` cho sợi nối vì bbox đường thẳng dọc bằng 0).
- Nền: `bg-*-bw` làm mờ nhẹ 1.2px, giảm tương phản + lớp giấy phủ 42-78%. Bỏ sương, hạt sáng, sao nhấp nháy, đom đóm, ánh sáng cam.
- Khung ảnh: thẻ giấy viền mực 3px + bóng cứng 8px; nút "xem ảnh lớn" (biểu tượng bốn góc, 48px máy tính, 104px canvas = 48px màn hình điện thoại) nằm góc trên phải khung, toàn khung cũng bấm được.
- Khay: thẻ giấy viền mực, bóng cứng 6px, chín ô xám tram. Rê/lấy nét: viên đá nhích lên + vòng mực đứt; chọn: vòng mực liền. Sợi nối: nét mực 5px có viền giấy, mờ dần 0.45s sau khi chọn đủ ba.
- Chùm sáng: 9 nét mực + hình thang mờ dần; nhịp đậm nhạt 5.6s; đổi ảnh: đậm lên 0.9s, viên đá ở miệng máy chiếu nhảy nhẹ; khi nhiễu: nhấp nháy.
- Đổi ảnh: ảnh mới quét lên từ dưới (clip-path 0.85s) kèm vạch mực chạy lên. Nhiễu (1.35s): ảnh xám tương phản cao, rung ngang, hạt nhiễu SVG `feTurbulence`, gạch quét, ba vạch mực ngẫu nhiên.
- Nút điều hướng (thanh gợi ý trên-trái, nút bản đồ trên-phải): thẻ giấy viền mực, Be Vietnam Pro 16px máy tính / 14px điện thoại, chạm >= 44px.
- Lightbox: nền giấy, ảnh viền mực + bóng cứng, tiêu đề Oooh Baby, mô tả 16/14px, nút đóng/trước/sau thẻ giấy 52/48px; Esc, mũi tên trái/phải, Tab giữ focus trong hộp, vuốt ngang đổi ảnh.
- Không có chữ hướng dẫn kiểu "Chạm…", "Kéo…".

## 6. Hành vi giữ nguyên
- Chọn bộ ba: kéo con trỏ/ngón tay qua ba viên (nhả sớm thì huỷ, giống trang cũ), hoặc dùng bàn phím (Tab tới viên đá, Enter/Space bật tắt; Esc bỏ chọn). Đủ ba thì tra ảnh; nạp ảnh lười (ảnh đầu nạp ngay, các ảnh khác nạp nền sau 2.5s hoặc khi chọn).
- Bàn phím trong lightbox, tab trap, trả focus về nút xem ảnh khi đóng.
- `aria-live` đọc thông báo đổi ảnh / nhiễu.
- `?freeze=1`: tắt mọi chuyển động (kiểm tra: 0 animation đang chạy); `prefers-reduced-motion` được tôn trọng.

## 7. Bọ
Sprite `../bw-bo/img/bo/*.webp` (idle, wave, point, happy, sleep, think, confused). Vào trang: wave 1.5s; đổi ảnh: happy 1.5s; nhiễu: confused 1.5s; con trỏ di chuyển: point về phía con trỏ (lật ngang theo hướng), về nghỉ sau 6s; mỗi 5-12s wave/think 1.4s; 25s không tương tác: sleep. Bọ không bấm được (trang cũ gắn Bọ vào khung chat `bo-widget.js`, bỏ qua giống các trang mẫu khác).

## 8. Liên kết
`index.html` → `../bw-bo/`, `sitemap.html` → `../bw-map/`, `roadmap.html` → `../bw-roadmap/`, `lopf1.html` → `../bw-lopf1/`, `gioithieu|method|khampha|gallery|community|dangky` → `../bw-<id>/`, nút bản đồ → `../bw-map/`. Thanh gợi ý nạp `journey.json`: gallery → "Cộng đồng", "Đăng ký".
Việc còn lại cho quản lý: các trang mẫu khác (bw-map, bw-roadmap, khampha...) cần thêm `gallery.html` → `../bw-gallery/` vào `fixHref` của chúng.

## 9. Kiểm tra đã làm (Playwright Edge)
Máy tính 1672x941, 1280x720 và điện thoại 390x844 DPR2 touch: màn tải, mở trang, kéo giữa chừng, quét ảnh, nhiễu, lightbox, ngủ. Không lỗi console/404, không cuộn ngang, kéo chuột và bàn phím đều đổi ảnh, đổi cỡ cửa sổ qua lại hai bố cục giữ nguyên ảnh và trạng thái. Ảnh chụp: `prototype/bw-gallery/tools/shots/`, tổng hợp `contact.jpg`.
