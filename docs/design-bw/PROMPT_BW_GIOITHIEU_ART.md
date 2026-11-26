# Codex: vẽ ảnh đen trắng cho trang mẫu Giới thiệu

Làm trong `D:\MeMoriClass\_bw_images`. Chỉ ghi vào `prototype/bw-gioithieu/img/src/` (đã có). Không sửa file khác, không commit.
Ảnh tham chiếu phong cách: `docs/design-bw/phuong-an/pa-15b.jpg` (trang đã duyệt), `prototype/bw-roadmap/img/bg-bw.webp` (nền lộ trình đã làm).
Nguyên tắc chung: manga Nhật đen trắng, giấy trắng trung tính (không ngả vàng), nét mực vẽ tay tự tin, tram chấm và gạch chéo nhẹ; NỀN phải giảm chi tiết, ít đường, tương phản vừa để khung video ở giữa nổi bật; ưu tiên đường thẳng gọn thay vì trang trí cong rối. Không màu, không chữ, không giao diện, không nhân vật, không bọ rùa, không đom đóm.
Không vẽ lại ảnh poster video (ảnh thật). Khung video, nút, chữ: làm bằng CSS/SVG.

## Ảnh 1: `bg-desk-bw.png` (1672x941, ngang)
Ảnh bố cục: `assets/gioithieu/desktop/bg.webp` (1174x941, cần dàn rộng ra 1672x941).
```
Redraw the first image (a quiet forest stream background for a website) as a 1672x941 widescreen picture in the exact style of the reference images: black-and-white Japanese manga ink on neutral white paper (no yellow), loose confident hand-drawn lines, light screentone and hatching, 3-layer depth with atmospheric perspective (far layers paler). Composition: a leafy tree branch with a few simple leaves hanging in from the top-left corner, a few pale trunks and soft foliage masses along the top edge and at the far left and far right edges, then a calm wide band across the middle (from about 18 to 70 percent of the height, across the middle 70 percent of the width) that is light, plain and almost empty, with only a few faint distant tree-trunk lines, because a video frame will sit there. The lower 28 percent shows a gentle shallow stream with a few simple ripple lines and several rounded mossy rocks drawn with clean contours and light screentone, the right-bottom corner slightly more crowded with rocks. No characters, text or colour.
```

## Ảnh 2: `bg-phone-bw.png` (852x1846, dọc; nếu tool ra tỉ lệ khác thì giữ tỉ lệ 0.4615 rồi chúng tôi cắt/co)
Ảnh bố cục: `assets/gioithieu/mobile/bg.webp`.
```
Redraw the first image (a portrait night-sky forest-edge background for a phone website, 852x1846) as a black-and-white manga ink picture in the exact style of the reference images: neutral white paper (no yellow), loose confident hand-drawn lines, light screentone and hatching, atmospheric perspective. Keep the composition: a slim tree trunk with a few branches and leaves along the left edge, a few simple cumulus clouds at the right edge, a calm pale open sky in the centre (the upper 55 percent) drawn with only a handful of tiny star marks and very few lines, because a video frame and a title sit there, then low distant mountains and a pale hazy valley around 60 to 70 percent height, and tall grass blades with a few wildflowers rising from the bottom edge, kept light and sparse in the lower 30 percent. No characters, text or colour.
```

## Ảnh 3: `parts-bw.png` (bảng chi tiết, nền trắng tinh, vật tách rời, cách xa nhau, ngang khoảng 2400x1100)
Ảnh bố cục: `assets/gioithieu/desktop/leaf.webp` (lá), `assets/gioithieu/mobile/leaf.webp` (cỏ tiền cảnh).
```
On a plain pure white background, draw four separate isolated objects in the same black-and-white manga ink style (confident hand-drawn contour lines, light screentone and hatching, neutral white paper, no colour), spaced far apart with a wide white margin around each, nothing touching, no shadow on the background, no text, no characters: (1) one large broad leaf lying on a small mossy rock, seen from slightly above, the leaf curving up at its tip, a flat smooth area on the leaf big enough for a tiny character to stand on, aspect about 2.4:1; (2) the same idea smaller and taller, a leaf on a rock, aspect about 1.6:1; (3) a foreground cluster for the left edge: two or three rounded rocks with grass blades and wildflowers growing around them, leaning right, bold black fills in the shadows and clean white highlights, aspect about 2:1; (4) a similar foreground cluster for the right edge with a different arrangement, leaning left. Every object fully visible.
```

Sau khi có ảnh: lưu đúng tên trên vào `prototype/bw-gioithieu/img/src/`, báo cáo ≤6 dòng (đường dẫn, kích thước, lỗi nếu có).
