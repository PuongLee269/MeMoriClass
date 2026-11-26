"""Xuất ảnh cho trang Khám phá tác phẩm đen trắng: nền WebP q82 + 5 công trình cắt từ buildings-bw.png
(tách theo thành phần liên thông, nền trắng ngoài rìa thành trong suốt) + img/layout.json (hộp và đa giác bấm theo hình mới)."""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SRC = os.path.join(IMG, "src")
WHITE = 244
# tâm hộp cũ (litBox) để gán thành phần -> id
OLD = {"kiln": (557, 196), "studio": (1353, 234), "house": (301, 512), "stage": (911, 399), "class": (925, 699)}

Image.open(os.path.join(SRC, "bg-bw.png")).convert("RGB").resize((1672, 941), Image.LANCZOS).save(
    os.path.join(IMG, "bg-bw.webp"), "WEBP", quality=82, method=6)

sheet = Image.open(os.path.join(SRC, "buildings-bw.png")).convert("RGB").resize((1672, 941), Image.LANCZOS)
rgb = np.asarray(sheet).astype(np.float32)
ink = rgb.min(axis=2) < WHITE
blob = ndi.binary_dilation(ink, iterations=14)
lab, n = ndi.label(blob)
areas = ndi.sum(ink, lab, range(1, n + 1))
keep = [i + 1 for i in np.argsort(areas)[::-1][:5]]
assert len(keep) == 5, "cần 5 công trình"
comps = {}
for k in keep:
    ys, xs = np.nonzero((lab == k) & ink)
    comps[k] = (xs.mean(), ys.mean())
layout = {}
used = set()
for name, (cx, cy) in OLD.items():
    best = min((k for k in keep if k not in used), key=lambda k: (comps[k][0] - cx) ** 2 + (comps[k][1] - cy) ** 2)
    used.add(best)
    region = (lab == best)
    ys, xs = np.nonzero(region)
    pad = 6
    x0, x1 = max(0, xs.min() - pad), min(1672, xs.max() + 1 + pad)
    y0, y1 = max(0, ys.min() - pad), min(941, ys.max() + 1 + pad)
    sub = rgb[y0:y1, x0:x1]
    near_white = sub.min(axis=2) >= WHITE
    l2, _ = ndi.label(near_white)
    edge = np.unique(np.concatenate([l2[0], l2[-1], l2[:, 0], l2[:, -1]]))
    outside = np.isin(l2, edge[edge > 0])
    fg = ndi.binary_fill_holes(ndi.binary_erosion(~outside, iterations=1))
    # chỉ giữ phần thuộc thành phần này (không dính công trình khác)
    fg &= ndi.binary_dilation(region[y0:y1, x0:x1], iterations=2)
    alpha = np.clip(ndi.gaussian_filter(fg.astype(np.float32), 0.8) * 1.15 - 0.05, 0, 1)
    out = np.dstack([sub, alpha * 255]).astype(np.uint8)
    ay, ax = np.nonzero(alpha > 0.02)
    bx0, bx1, by0, by1 = ax.min(), ax.max() + 1, ay.min(), ay.max() + 1
    out = out[by0:by1, bx0:bx1]
    Image.fromarray(out, "RGBA").save(os.path.join(IMG, "b-%s.webp" % name), "WEBP", quality=88, method=6, alpha_quality=95)
    ox, oy = x0 + bx0, y0 + by0
    h, w = out.shape[:2]
    pts = np.argwhere(ndi.binary_dilation(alpha[by0:by1, bx0:bx1] > 0.3, iterations=6))[:, ::-1]
    hull = ConvexHull(pts)
    poly = [[int(ox + pts[i][0]), int(oy + pts[i][1])] for i in hull.vertices]
    layout[name] = {"box": [int(ox), int(oy), int(w), int(h)], "poly": poly}
    print(name, layout[name]["box"], len(poly))
json.dump(layout, open(os.path.join(IMG, "layout.json"), "w"), separators=(",", ":"))
print("ok")
