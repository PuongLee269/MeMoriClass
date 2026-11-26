# Codex: vẽ ảnh đen trắng cho trang mẫu Cộng đồng

Làm trong `D:\MeMoriClass\_bw_images`. Chỉ ghi vào `prototype/bw-community/img/src/`. Không sửa file khác, không commit.
Ảnh tham chiếu phong cách: `docs/design-bw/phuong-an/pa-15b.jpg` (trang đã duyệt), `prototype/bw-roadmap/img/bg-bw.webp` (nền lộ trình đã làm).
Nguyên tắc chung: giấy trắng trung tính (không ngả vàng), nét mực vẽ tay tự tin, tram chấm và gạch chéo nhẹ; NỀN giảm chi tiết, ít đường, tương phản thấp để sáu quả cầu và sợi dây nổi bật; ưu tiên đường gọn. Không màu, không chữ, không giao diện, không nhân vật, không bọ rùa.
Không vẽ lại: `assets/community/avatar.webp` (ảnh nội dung). Sợi dây, nút, thẻ, thơ: làm bằng CSS/SVG.

## Ảnh 1: `bg-desk-bw.png` (1672×941, ngang). Ảnh bố cục: `assets/community/bg.webp`
```
Redraw the first image (a dark night-sky background with flowing painted ribbons and a few four-point star sparkles, 1672x941) as black-and-white Japanese manga ink on neutral white paper (no yellow), in the exact style of the reference images: loose confident hand-drawn lines, light screentone dots and fine hatching. Keep the composition: several long flowing ribbon-like swirls of wind entering from the left and right edges and the lower corners, drawn as pairs of thin ink contour lines with light grey screentone between them; ribbons wider and darker near the edges, thin and pale toward the centre. Scatter 14 small four-point star sparkles and a few tiny dots. Keep the whole central band (the middle 70 percent of the width and 15 to 85 percent of the height) calm, light and almost empty, with only two or three faint thin ribbon lines passing through it, because six orbs and a rope will sit there. Low contrast overall, mostly white paper. No orbs, no text, no characters, no colour.
```

## Ảnh 2: `bg-phone-bw.png` (852×1846, dọc; nếu tool chỉ ra tỉ lệ khác thì giữ tỉ lệ 0.4615 rồi chúng tôi sẽ cắt/co)
```
Same black-and-white manga ink style as the previous background, but a portrait 852x1846 composition for a phone: long flowing ribbon-like swirls of wind drawn as pairs of thin ink contour lines with light grey screentone between them, entering from the left and right edges and sweeping down the sides, wider near the edges and thin and pale toward the centre; about 12 small four-point star sparkles and a few dots. Keep the central column (the middle 60 percent of the width, 8 to 80 percent of the height) calm, light and almost empty with only two faint thin ribbon lines, because six orbs and a rope sit there; keep the bottom 18 percent very light because a short poem card sits there. Low contrast, mostly neutral white paper (no yellow). No orbs, text, characters or colour.
```

## Ảnh 3: `orbs-bw.png` (bảng chi tiết nền trắng tinh, nằm ngang khoảng 2400×1400)
Ảnh bố cục: `assets/community/orb_1.webp` (quả cầu vẽ tay màu cam; chỉ lấy ý hình tròn, nét cọ).
```
On a plain pure white background, draw six separate isolated spheres in a 3 by 2 grid, widely spaced, nothing touching, each about 520 px in diameter with at least 200 px of white margin around it, in black-and-white Japanese manga ink style (confident hand-drawn contour, a slightly irregular round outline drawn with a thick brush line plus a thin second echo line, light screentone dots and hatching for shading on the lower right, a clean white highlight crescent on the upper left, plus a small different swirl or spiral or star or leaf or crescent or flower motif drawn inside each sphere so the six are different). Neutral white paper, no colour, no shadow on the background, no text, no characters, nothing else.
```

Sau khi có ảnh: lưu đúng tên trên vào `prototype/bw-community/img/src/`, báo cáo ≤6 dòng (đường dẫn, kích thước, lỗi nếu có).
