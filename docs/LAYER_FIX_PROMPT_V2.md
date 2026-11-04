# Prompt sửa bộ lớp ảnh — bản 7 (lỗi chồng hình + lỗi mép)

Dán toàn bộ khối tiếng Anh bên dưới cho AI sửa ảnh, đính kèm **toàn bộ 13 file PNG** của bản hiện tại (`animation-layers`, bản 6) và `composite.jpg`.
Mọi tọa độ tính bằng pixel trên canvas 1672 × 941, gốc (0,0) ở **góc trên bên trái**, x tăng sang phải, y tăng xuống dưới.

```text
You are editing a set of 13 transparent PNG layers that are stacked to form one animated illustration for a website.
Canvas: 1672 x 941 px for EVERY file. Origin (0,0) = top-left corner, x to the right, y downward. All coordinates below are in these pixels.
Stack order, back to front:
 01-background.png, 01b-rear-tree-left.png, 01c-rear-tree-right.png, 02-trees-left.png, 03-trees-right.png,
 04-lake.png, 05-main-bank.png, 06-beetle-head.png, 07-beetle-body.png, 08-overhead-leaves.png,
 09-foreground-left.png, 10-foreground-bottom.png, 11-foreground-right.png
On the website, layers 08, 09, 10 and 11 sway a few pixels in the wind, so whatever is painted BEHIND them becomes visible around their edges and through their semi-transparent blur.

HARD RULES
- Do not move, scale, crop, re-centre or re-frame anything. Keep every file at 1672x941 with the same transparent areas, except where a task below says to change them.
- Keep the exact painterly anime style, colours, moonlight direction and level of detail.
- Edit ONLY the files and the rectangles named below. Every pixel outside them must stay identical.
- Output straight (un-premultiplied) alpha, 8-bit RGBA PNG, same file names, plus a fresh composite.jpg made by stacking 01 -> 11 in the order above.

PROBLEM A — "double image" behind the blurred foreground leaves (most important)
Layers 09, 10 and 11 are out-of-focus (blurred) foreground leaves. The SAME plants are ALSO painted sharp in the layers behind them, so the viewer sees one plant twice: a blurred copy and a sharp copy slightly offset.
Fix: in the layers listed, repaint the sharp plants that sit behind the blurred foreground. Replace them with darker, lower-contrast, shadowed ground/undergrowth that clearly has DIFFERENT shapes from the foreground leaves (no yellow-green leaves of the same shape and position). Think "the dark shadow under leaves that are very close to the camera".
 A1. Behind 09-foreground-left (its leaves cover x 0–588, y 332–941):
     - 02-trees-left.png: sharp yellow-green plants in x 0–563, y 339–941  -> repaint as dark shadowed undergrowth.
     - 05-main-bank.png:  sharp plants in x 0–563, y 634–941               -> repaint as dark, shadowed ground/moss.
     - 01b-rear-tree-left.png: sharp leaves in x 52–475, y 363–941          -> darken and simplify (distant, in shadow).
 A2. Behind 10-foreground-bottom (its leaves cover x 578–1282, y 726–941):
     - 03-trees-right.png: sharp plants in x 800–1266, y 769–941            -> repaint as dark shadowed ground.
     - 05-main-bank.png:   sharp plants in x 635–1271, y 774–941            -> repaint as dark shadowed ground; keep the river bank line.
 A3. Behind 11-foreground-right (its leaves cover x 1217–1672, y 728–941):
     - 03-trees-right.png: sharp plants in x 1225–1672, y 731–941           -> repaint as dark shadowed undergrowth.
     - 05-main-bank.png:   sharp plants in x 1243–1672, y 731–941           -> repaint as dark moss/soil; keep the mossy mound shape above y≈730.
     - 01c-rear-tree-right.png: sharp leaves in x 1353–1586, y 732–889      -> remove or darken strongly.
 In all of A: the repainted areas must still look natural if a foreground leaf slides 15 px in any direction (no hard edges, no empty holes, no copies of the foreground leaf shapes).
 Check: hide layers 09, 10, 11 — you should see NO plant that has the same silhouette as a leaf in 09/10/11.

PROBLEM B — 08-overhead-leaves.png, top-right corner of the leaf layer
 B1. A rectangular smeared block of flat grey-beige pixels at x 1148–1197, y 0–27. Delete it (make it transparent) or repaint it as real leaves matching the neighbours.
 B2. The leaf silhouettes in this layer have stair-stepped, pixelated edges (blocky alpha). Re-matte the whole layer with smooth anti-aliased edges (1–2 px soft edge), no halo.

PROBLEM C — 01c-rear-tree-right.png, around the moon
 C1. The dark leaf clump above the moon ends in a STRAIGHT horizontal cut: x 1040–1165, cut line at y ≈ 75 (visible band y 52–80). Repaint the bottom of this clump as a natural, irregular leaf edge (leaves with varied outlines) fading into sky; no straight line.
 C2. The lower edge of the branch that crosses in front of the moon (x 1000–1300, y 80–125) is stair-stepped/jagged. Repaint that edge smooth and organic like the rest of the bark, anti-aliased against the sky and the moon.
 C3. Do not move the branch or change the moon (01-background.png) in any way.

PROBLEM D — beetle (only verify, change only if needed)
 06-beetle-head.png must overlap 07-beetle-body.png at the neck so that rotating the head ±2° around pivot (1221, 602) never shows a gap. Keep the current fix; do not change the face, eyes or antennae.

DELIVERABLE
- The 13 PNGs (unchanged files may be returned as they are), composite.jpg, and a short list of which files you changed.
- Self-check before delivering: stack all layers -> it must look like the original composite except for the fixes; then hide 08–11 and confirm there is no second copy of any of their leaves underneath.
```

## Ghi chú cho bạn

- Lỗi A là lỗi "chồng hình" bạn chụp: lá mờ tiền cảnh (09, 10, 11) có bản sao nét căng ở lớp 01b, 01c, 02, 03, 05 phía sau. Tọa độ trên được đo tự động từ chính bộ ảnh bản 6.
- Trên web hiện tôi đang che tạm lỗi A bằng một lớp bóng tối (`fg-shade`). Có bộ ảnh đã sửa thì lớp này không cần nữa, ảnh sẽ sáng và rõ hơn.
- Lỗi B và C tôi cũng đang sửa tạm bằng code khi dựng ảnh cho web (`tools/paper-cut/build_forest.py`). Sửa ở ảnh gốc sẽ đẹp hơn.
- Có bộ mới: gửi lên Drive như lần trước, tôi chạy lại script dựng lớp và cập nhật web.
