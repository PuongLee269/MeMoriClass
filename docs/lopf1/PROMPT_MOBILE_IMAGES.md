# PROMPT tạo ảnh bản ĐIỆN THOẠI – trang "Lớp F1"

Cách dùng: gửi kèm ảnh tham chiếu desktop (`00_reference` trong thư mục Drive Lớp F1) cho AI để giữ cùng phong cách. Làm theo thứ tự: Prompt 0 (ảnh phẳng duyệt bố cục) → khi bạn duyệt, gửi lại ảnh đó kèm các prompt lớp 1–7. Nếu AI không xuất được nền trong suốt, yêu cầu nền phẳng một màu xanh lá #00FF00 cho các lớp 3–7 để tách sau.

Quy tắc chung (dán vào đầu MỌI prompt):
> Cùng phong cách với ảnh tham chiếu: tranh minh hoạ cổ tích mềm, ban ngày sương mù xanh nhạt, đồng cỏ xanh, đá phủ rêu, ánh vàng ấm ở vật phát sáng. Khổ dọc 1170x2532 (tỉ lệ 9:19.5). Tuyệt đối KHÔNG có chữ, số, logo, nút bấm, mũi tên, khung viền vàng thêm vào, thanh trạng thái điện thoại. Không có nhân vật, không có bọ rùa.

## Prompt 0 – Ảnh phẳng duyệt bố cục (làm trước)
```
Vertical mobile illustration 1170x2532, fairytale storybook style, misty pale-blue daytime, green meadow, mossy stones, warm golden glow on magical objects. Top 8%: only soft sky and mist (empty). At 10–30% height: a small mossy stone with a glowing golden spiral rune on a little hill, a soft light beam falling from it down onto a curved three-panel picture frame. The frame: three curved panels side by side, center panel larger (about 600x520 px), two smaller side panels slightly perspective-bent, frame top edge at about 38% of height, frame spans almost full width, ornate carved stone/wood frame, the panels show a simple soft placeholder landscape. At 60–72% height: a round mossy stone pedestal holding an open magical book with a faint golden glow, book center at 65% of height, about 700 px wide including glow, with empty space left and right. Below: green meadow, small stones and flowers. Bottom 12% only plain grass. No text, no characters, no UI.
```

## Prompt 1 – Nền (trời, núi, sương xa)
```
[Quy tắc chung] Vertical 1170x2532 background only: misty pale-blue sky, soft distant mountains and trees fading into mist, empty and calm, no frame, no pedestal, no foreground grass, no objects. Opaque image.
```

## Prompt 2 – Tiền cảnh cỏ, đá, hoa
```
[Quy tắc chung] Foreground only, transparent background (or flat #00FF00): lower 28% of a vertical 1170x2532 canvas, green grass tufts, small mossy stones and a few small flowers along the bottom, leave the center area above y=2000 empty. Overscan beyond the canvas edges, soft edges, no cut lines.
```

## Prompt 3 – Bệ đá + sách mở
```
[Quy tắc chung] Single object on transparent (or flat #00FF00) background: a round mossy stone pedestal seen from slightly above, holding an open ancient book with cream pages and faint golden glow at the spine. Object about 700 px wide, centered at 65% of the vertical canvas 1170x2532. Clean sharp edges, soft shadow under the pedestal only, no halo spread beyond the book, no text on the pages (only abstract soft lines).
```

## Prompt 4 – Bệ đá KHÔNG có sách
```
[Quy tắc chung] Same pedestal and same position/size as the previous image but with NO book and no glow: just the bare mossy stone top, so a page-flip animation can be placed on it. Transparent (or flat #00FF00) background.
```

## Prompt 5 – Đá chiếu có xoắn ốc
```
[Quy tắc chung] Single object on transparent (or flat #00FF00) background: a small tilted mossy standing stone with a glowing golden spiral rune carved on top, standing on a tiny grassy mound, placed at about 20% of the height, centered. Sharp clean edges. The golden glow of the spiral must be a plain carved line WITHOUT painted halo (the glow will be a separate layer).
```

## Prompt 6 – Chùm sáng
```
[Quy tắc chung] Transparent (or black background for screen blend) soft warm golden light beam falling from a point at 24% height down to the top of a wide curved frame at 38%–58% height, widening downwards, very soft edges, subtle floating dust sparkles, no objects.
```

## Prompt 7 – Khung ba ô cong (quan trọng nhất)
```
[Quy tắc chung] Single object on transparent (or flat #00FF00) background: a curved three-panel picture frame, ornate carved frame, spans x 20–1150, top edge y≈960, height ≈520 px on a 1170x2532 canvas. Center panel larger (~600x520), two side panels smaller with gentle perspective bending toward the screen edges. ALL panel interiors fully empty/transparent (no picture inside), frame lines on top, crisp edges, no gold border added, no text, no arrows. Also provide the panel interiors as separate pure-white-on-black mask images (left, center, right).
```

## Prompt 8 – 3 ảnh mẫu phẳng (tạm cho mục tranh)
```
Same style: three flat landscape pictures (not bent, no frame): left 400x520, center 600x520, right 400x520, at 2x resolution: (1) green hills at sunset, (2) white clouds over a lake, (3) moonlit forest clearing. No text.
```

## Gửi lại cho mình
Các lớp 1–7 + ảnh mẫu + (nếu AI đưa được) toạ độ 4 góc mỗi ô khung. Mình ghép, căn lại và làm trang bản điện thoại. Hiệu ứng sách vẫn dùng bộ lật trang hiện có (co nhỏ cho vừa), hoặc giao thêm theo `ORDER_BOOK_FX.md`.
