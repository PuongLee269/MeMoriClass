# Bộ tư thế TĨNH của Bọ (assets/bo/pose-*.webp)

Quy tắc của người dùng: trạng thái tĩnh của Bọ KHÔNG dùng mặt ngang (profile). Nghỉ = chính diện; nhìn về một phía = quay 3/4; thỉnh thoảng có biểu cảm.

Nguồn: `Ladybug_Extra_Website_Sprites.zip` (40 PNG 384x384). Xuất bằng script Python (không còn trong repo) từ bản tách sạch.
Tất cả cùng canvas 232x276, cùng tỉ lệ 0,8 so với nguồn, chân (tâm thân, đáy bàn chân) tại (116, 266). Danh sách máy đọc: `assets/bo/poses.json`.

| tên | loại | nguồn | xử lý | ~KB |
|---|---|---|---|---|
| rest | rest | 02_01_front_neutral | nguồn bị cắt thẳng mép phải (vài chục px vỏ cánh) -> giữ nửa trái, lấy đối xứng làm nửa phải (trục x=202,5 đo từ mắt, mũi, râu) | 12 |
| turnR | turn | 01_08_three_quarter_right | mép trái vỏ cánh hơi cắt thẳng -> làm tròn đường viền (làm mượt) | 12 |
| turnL | turn | lật ngang turnR | nguồn 01_02 bị cắt nặng (mất vỏ cánh bên phải) nên KHÔNG dùng; dùng bản lật của turnR | 12 |
| back | back | 01_05_back | sạch, giữ nguyên (chỉ để nhìn ảnh chiếu ở Gallery / xem video ở Roadmap) | 12 |
| blink | expression | 02_02_blink | sạch | 11 |
| surprised | expression | 02_04_surprised | sạch | 12 |
| laugh | expression | 02_03_laugh | sạch (dùng làm "vui" khi bấm Bọ / xong câu trả lời) | 12 |
| lookup | expression | 02_05_look_up | sạch (ngước mắt nhìn lên) | 12 |

Loại khỏi bộ (và lý do): `01_01_front`, `01_02_three_quarter_left` (cắt thẳng nặng, không sửa an toàn được); `02_06_eyes_closed`, `02_07_happy`, `02_08_wink` (mép trái bị cắt thẳng, mặt không đối xứng nên không dùng đối xứng sửa được; dùng blink/laugh thay); toàn bộ `side_*` (cấm cho trạng thái tĩnh); `back_three_quarter_*` (không cần); các khung bay/cất cánh/hạ cánh (có mảnh khung bên cạnh, mây, mép cắt; trang chủ vẫn dùng chuỗi bay cũ `bo-fly.webp`); writing/thinking/wave/point/hold_map/cheer/greet (cắt hoặc không cần).

Xử lý ảnh: bỏ vầng cam mờ quanh sprite (alpha < 10% = 0, kéo giãn phần còn lại), màu viền thay bằng màu lõi gần nhất (không viền sáng/tối trên nền rừng đêm), WebP chất lượng 54-78, alpha_quality 100, mỗi file < 12 KB, tổng ~95 KB.

Lưu ý phong cách: bộ này vẽ kiểu đất sét (mờ, mềm); chuỗi bay `bo-fly.webp` ở trang chủ và các sprite cũ trong `assets/gallery|roadmap|sitemap/ladybug_*.webp` (bóng, có phản quang) là bộ khác. Các sprite cũ không còn được trang nào gọi (có thể xoá khi muốn).

## Mô-đun `assets/bo-idle.js`
- `BoIdle.preload()` tải + giải mã cả bộ (gọi cùng bộ tải trang). Không có mạng sau đó.
- `BoIdle.create({every:[5,12], profile:'gentle'?, base:'turnL'?})` (profile 'gentle' = dùng ở trang chủ, xem mục index.html; mặc định giữ hành vi cũ cho các trang khác) -> `ctl.pose`, `ctl.look(-1|+1|0|'up')`, `ctl.react('laugh',1400)`, `ctl.pause()/resume()/destroy()`, `ctl.on(fn)`.
  - Mỗi 5-12 giây (ngẫu nhiên) có một biểu cảm rồi về `rest`: chớp mắt 66% (đôi khi chớp đôi), cười 14%, ngạc nhiên 12%, ngước lên 8%.
  - `look(-1/+1)` = quay 3/4 (turnL/turnR), `look('up')` = quay lưng, `look(0)` = nghỉ. Không có dáng ngang. Đang `look` thì không phát biểu cảm.
  - `prefers-reduced-motion`: chỉ `rest`.
- `BoIdle.mount(container, ctl)` xếp chồng các ảnh, đổi tư thế bằng opacity. Trang vẽ canvas dùng `ctl.pose` + ảnh riêng, anchor chân (116,266).

## Theo trang
- index.html (`BoIdle.create({every:[6,14],profile:'gentle'})`): KHÔNG BAO GIỜ chính diện. Nghỉ = turnL (3/4 hướng vào khung chat); tự phát mỗi 6-14 s chỉ liếc turnR (~72%) hoặc ngước lên (lookup, ~28%) 1,8-2,8 s rồi về turnL; blink/laugh/surprised không tự phát. Cười (laugh 1,4 s) chỉ sau khi người dùng bấm Bọ hoặc Bọ trả lời câu hỏi của chính họ (không cười khi trang mới tải hay lời chào hiện); surprised chỉ qua `ctl.react()` khi có kích thích. Con trỏ xa hai bên -> turnL/turnR. Hạ cánh xong mờ dần (0,3 s) sang turnL. Chuỗi bay vào/ra giữ nguyên.
- gallery.html: con trỏ phải/trái -> turnR/turnL, trên/khung ảnh/đổi ảnh -> back (nhìn ảnh chiếu), lên chính Bọ -> cười, ảnh nhiễu -> ngạc nhiên.
- roadmap.html: nghỉ chính diện; rê chuột theo 8 hướng (phải = turnR, trái = turnL, trên = ngước); chọn chương -> turnR 2,2 s về phía hàng chương; đang phát video -> back.
- sitemap.html: nghỉ chính diện; đá được rê/chạm -> turnL/turnR (đá ở phía trên -> ngước lên).
- community.html, method.html, home-backup.html: widget nổi (`assets/bo-widget.js`) dùng pose-rest, nạp bo-idle.js sau khi trang tải xong để chớp mắt/cười...
- dangky.html, gioithieu.html: Bọ nằm trong lớp ảnh nướng sẵn (art layer): KHÔNG đổi, vẫn là sprite cũ (có thể là dáng ngang).
