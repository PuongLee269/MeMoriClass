# Giao Codex: tạo 5 phương án đen trắng cho trang Bọ

## Prompt dán cho Codex
```
Repo PuongLee269/MeMoriClass. Ảnh gốc: docs/design-bw/goc-bo-desktop.jpg (trang Bọ, desktop 1672x941).
Dùng công cụ tạo ảnh của bạn ở chế độ chỉnh sửa ảnh (đưa ảnh gốc làm ảnh tham chiếu), tạo 5 ảnh, mỗi ảnh là một phương án dưới đây.
Mỗi ảnh = PHẦN CHUNG + PHẦN RIÊNG của phương án đó. Tỉ lệ 16:9, độ phân giải cao nhất có thể.
Lưu vào docs/design-bw/phuong-an/pa-1.png ... pa-5.png. Không sửa file khác. Không commit/push.
Kiểm từng ảnh: chữ tiếng Việt đúng dấu, đủ chữ, đúng vị trí; nếu sai chữ thì tạo lại tối đa 2 lần.
Báo cáo tối đa 8 dòng: tên file, phương án, lỗi còn lại (nếu có).
```

## PHẦN CHUNG (dán cho cả 5 ảnh)
```
Redesign this website screenshot as a finished black-and-white web page design. Keep the SAME layout and the same UI elements in the same places: logo "Me.Mori CLASS" top-left, small map icon top-right, the speech bubble near the top-centre containing the label "Bọ", the text "Chào bạn, chào mừng bạn đến với Mori Class. Bạn có muốn tham quan một vòng không?", a small map thumbnail and the link "Tham quan bản đồ"; directly below it a thin input line "Hỏi Me.Mori…" with a paper-plane icon; the cute round ladybug mascot "Bọ" (big round eyes, two antennae with ball tips) sitting on a mossy log at the right; two small round buttons bottom-right. Copy all Vietnamese text exactly, with correct diacritics. No other text.
Strict monochrome: only black, white and greys on warm paper. No colour.
Drawing: hand-made pen-and-ink / etching illustration (hatching, stippling), like a classic engraved storybook, inspired by retro black-and-white space illustrations with organic ink blobs.
MOST IMPORTANT – tonal control and hierarchy so it is calm and beautiful, never busy:
- Use a strict value plan of only 3–4 tone levels with large simple shapes; keep detailed hatching only near the focal points and let it fade to simple flat tones at the edges.
- Highest contrast (pure black against pure white) ONLY at the two focal points: the speech bubble and Bọ. Everything else is lower contrast.
- Leave generous empty space around the speech bubble and the input line so the text is perfectly readable.
- Lead the eye in this order: speech bubble → Bọ → input line → logo/icons.
Flat 16:9 web screenshot, crisp, high detail, no device mockup, no frame.
```

## Phương án 1: Mực loang trên giấy (gần video nhất)
```
Direction: "Ink blobs on paper" (closest to the reference). Light warm-grey paper background dominates (about 60% of the area). Two or three large smooth black ink blobs frame the scene: one behind the moon top-right, one bottom-left behind the river stones, one behind Bọ. Trees and foliage drawn as fine mid-grey line art on the paper, not filled. Bọ is white line art on the black blob. Speech bubble is a white card with a thick black outline on the paper area.
```

## Phương án 2: Đêm khắc gỗ (nền đen, nét trắng, vệt trăng dẫn mắt)
```
Direction: "Night woodcut". Inverted: the scene is mostly black (night), drawn with white engraved lines like a woodcut print. A soft pool of moonlight (light grey) falls from the moon down through the centre, creating a clear light path from the moon to the speech bubble to Bọ. The speech bubble is the brightest white shape on the page with black text. Edges of the page fade to solid black with almost no detail.
```

## Phương án 3: Sách tranh tĩnh lặng (nhiều khoảng trắng, chỉ Bọ đậm)
```
Direction: "Quiet picture book". Mostly white/off-white page with lots of negative space. Very sparse, delicate black line drawing: tree trunks only at the far left and right edges as a vignette, a simple outline moon, a few leaves. Only Bọ is drawn with solid black fills, making it the single strongest dark shape. The speech bubble is a simple thin-outlined card. Minimal, elegant, calm.
```

## Phương án 4: Cửa sổ tròn (một vòng đen lớn chứa cảnh)
```
Direction: "Round window". A large solid black circle (like a moon portal) sits right-of-centre; inside it the night forest and Bọ on the log are drawn in white line art. The rest of the page is pale grey paper with only a few small ink leaves. The speech bubble and input line sit on the paper on the left, overlapping the edge of the circle slightly. Very strong, graphic single focal shape.
```

## Phương án 5: Giấy cắt nhiều lớp (4 sắc độ phẳng)
```
Direction: "Layered paper cut". The scene is built from 4 flat layers of cut paper in exactly 4 tones: white (closest foreground leaves), light grey (river and hills), mid grey (middle trees), black (far forest and sky), with subtle drop shadows between layers. Fine etched texture only on Bọ and the log. Bọ is a black silhouette with white eyes and spots. Speech bubble is a white paper card.
```

## Tiêu chí chấm (để chọn)
- Nhìn 2 giây biết ngay đọc chỗ nào trước: khung thoại → Bọ → ô hỏi.
- Không quá 3–4 sắc độ lớn; chi tiết khắc chỉ dày ở điểm nhấn, mép trang đơn giản.
- Chữ trong khung thoại đọc rõ ở cỡ điện thoại.
- Bọ vẫn dễ thương, nhận ra ngay.
