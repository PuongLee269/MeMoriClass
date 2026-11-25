# Thiết kế lại trang Bọ (index.html) theo phong cách đen trắng

Ảnh gốc gửi kèm: `goc-bo-desktop.jpg` (1672x941) và `goc-bo-phone.jpg` (390x844, chụp DPR 2).
Video tham khảo: mockup "Explore the Space" (đen trắng, khắc nét, mảng mực đen chuyển động).

## Phân tích video tham khảo
- Màu: chỉ đen, trắng, xám nhạt (nền giấy #EDEDED). Không màu khác.
- Hình vẽ: kiểu khắc gỗ/bút mực (etching, stipple, gạch chéo), chi tiết nét mảnh, đổ bóng bằng chấm và nét.
- Bố cục: các mảng mực đen hình hữu cơ (giọt mực, đốm loang) bo tròn mềm, lồng ghép với nền xám; nhân vật và đồ vật nằm trên và tràn ra ngoài mảng đen.
- Chữ tiêu đề: chữ khối kiểu retro, chữ trắng viền đen dày với bóng đổ nổi 3D màu đen.
- Chuyển động: vật thể trôi lơ lửng nhẹ, mảng mực co giãn/biến hình chậm, một vòng tròn nhỏ mở rộng thành mảng đen phủ màn hình để chuyển nội dung (lộ chữ mới bên trong), chữ hiện dần.

## Prompt tạo ảnh (dán kèm ảnh gốc, dùng chế độ chỉnh sửa ảnh/image-to-image)

### Desktop
```
Redesign this website screenshot into a black-and-white hand-drawn ink illustration, keeping the same layout and elements.
Style: monochrome only (pure black, white, light warm grey paper #EDEDED), vintage pen-and-ink etching with fine hatching and stippling, like a woodcut storybook illustration. No colour at all.
Scene: the same night forest — big old trees framing the left and right, a full moon top centre, distant hills, a small river with stones at the bottom left, mossy log at the bottom right. Draw everything as detailed engraved line art.
Composition: large organic black ink blobs (smooth, rounded, liquid shapes) behind the scene, overlapping the grey paper background, some objects (leaves, moon, the ladybug) breaking out of the blobs. Plenty of light grey negative space in the middle.
Main character: the cute round ladybug mascot "Bọ" sitting on the mossy log on the right, same pose and proportions (big round eyes, two antennae with ball tips), drawn in black ink with white shell spots; keep it friendly and clearly recognisable.
UI: keep the speech bubble top-centre as a white rounded card with a thick black outline and a small tail, text inside in black ("Bọ" label, "Chào bạn, chào mừng bạn đến với Mori Class. Bạn có muốn tham quan một vòng không?", a small map icon and "Tham quan bản đồ"). Keep the thin input line "Hỏi Me.Mori…" with a paper-plane icon below it. Logo "Me.Mori CLASS" top left in black script. Map icon top right, two small round buttons bottom right, all black line icons.
Typography: elegant serif/script for the logo, clean rounded sans-serif for the chat text.
Flat web UI screenshot, 16:9, sharp, high detail, no mockup frame, no extra text.
```

### Điện thoại
```
Same redesign for this mobile screenshot (portrait 9:19.5): black-and-white pen-and-ink etching style, organic black ink blobs on light grey paper, moon and tree branches at the top, speech bubble as a white card with thick black outline in the upper half, the ladybug mascot "Bọ" in black ink sitting on a mossy log in the lower half, the input bar "Hỏi Me.Mori…" near the bottom as a white pill with black outline, two small round black-line buttons under it. Keep all Vietnamese text exactly as in the screenshot. Monochrome only, no colour, no mockup frame.
```

### Phương án phụ (nếu muốn Bọ nổi bật)
Thêm vào cuối prompt: `The only exception to monochrome: the ladybug's shell is a single flat red (#D8382E); everything else stays black and white.`

## Chuyển động dự kiến cho giao diện mẫu (làm sau khi chốt ảnh)
1. Mở trang: mảng mực đen loang ra từ một chấm nhỏ, rồi cảnh vẽ hiện dần.
2. Mảng mực: biến hình chậm liên tục (SVG path morph, 8–12 giây một vòng).
3. Vật thể (lá, trăng, Bọ, đom đóm): trôi lơ lửng nhẹ, lệch nhịp nhau; chuột di chuyển thì lệch lớp nhẹ (parallax), điện thoại dùng nghiêng máy hoặc tắt.
4. Bọ trả lời: khung thoại bật lên bằng vòng tròn mở rộng (clip-path circle), chữ hiện cả câu.
5. Chuyển trang: vòng tròn đen mở rộng phủ màn hình rồi mở ra trang mới (như video).
6. Tôn trọng chế độ giảm chuyển động: tắt trôi/biến hình, chỉ đổi mờ.
