# Prompt sửa bộ lớp ảnh (animation-layers, bản 5)

Dán prompt dưới đây vào công cụ tạo/sửa ảnh, kèm các tệp được nhắc tên. Giữ canvas 1672 × 941, gốc trên trái, nền trong suốt.

```text
Edit the layered illustration set for an animated website (canvas 1672x941, every layer is a full-canvas transparent PNG, objects already positioned; do not move, resize or crop anything).

Problem: when the front leaf layers sway, almost identical leaf clusters painted in the layers behind them become visible, so the viewer sees the same leaves twice.

1. In 01b-rear-tree-left.png, 01c-rear-tree-right.png and 02-trees-left.png, repaint ONLY the areas that sit directly behind 08-overhead-leaves.png (top centre, x≈520–1175, y≈0–210) and behind 09-foreground-left.png (left side, x≈0–585, y≈350–941):
   - no bright yellow-green maple leaves there; replace them with darker, shadowed, smaller and more distant foliage, or sky and bark where it makes sense,
   - silhouettes must clearly differ from the leaves in 08 and 09 (different shapes, size and orientation), lower contrast, cooler and darker (in the shadow of the front leaves),
   - keep trunks, roots and big branches exactly as they are; same painterly anime style, same moonlight direction.
2. Under the same areas, extend each front layer's hidden edge: give 08-overhead-leaves.png and 09-foreground-left.png about 25 px of extra painted leaf/stem continuation beyond their current outer silhouettes where they attach to a branch or the canvas edge, so a small rotation never shows a gap.
3. Beetle: in 07-beetle-body.png paint a short dark-brown neck/collar under where the head sits (around x≈1195–1265, y≈575–615) that is hidden by 06-beetle-head.png at rest; in 06-beetle-head.png extend the head's lower edge about 8 px downward into that collar. The head rotates ±2° around (1221,602); there must be no gap between head and body at any angle.
4. Keep every other pixel unchanged. Export the same file names, same canvas, straight (un-premultiplied) alpha, plus a new composite.jpg.
```

Gợi ý kiểm tra: ghép lại theo thứ tự 01 → 11, so với composite.jpg; rồi ẩn 08 và 09 để chắc không còn chùm lá giống hệt phía sau.
