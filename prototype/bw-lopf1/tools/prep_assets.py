"""Xuất ảnh cho trang Lớp F1 đen trắng: 2 nền (WebP q82) + 6 vật cắt từ bảng nền trắng (parts-bw.png)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SRC = os.path.join(IMG, "src")
WHITE = 246

for name, size in (("bg-desk-bw", (1672, 941)), ("bg-phone-bw", (852, 1846))):
    Image.open(os.path.join(SRC, name + ".png")).convert("RGB").resize(size, Image.LANCZOS).save(
        os.path.join(IMG, name + ".webp"), "WEBP", quality=82, method=6)

parts = Image.open(os.path.join(SRC, "parts-bw.png")).convert("RGB")
pw, ph = parts.size
# (tên, hộp cắt, cách giữ đục)  fill = lấp lỗ | col = lấp theo cột (mặt gò phẳng chạm đáy) | none
CUTS = [
    ("pedestal-d", (0, 0, pw // 2, 600), "fill"),
    ("pedestal-m", (pw // 2, 0, pw, 600), "fill"),
    ("mound-d", (0, 600, pw // 2, 950), "col"),
    ("mound-m", (pw // 2, 600, pw, 950), "col"),
    ("fgL", (0, 950, pw // 2, ph), "none"),
    ("fgR", (pw // 2, 950, pw, ph), "none"),
]


def cut(name, box, mode):
    rgb = np.asarray(parts.crop(box)).astype(np.float32)
    near_white = rgb.min(axis=2) >= WHITE
    lab, _ = ndi.label(near_white)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    outside = np.isin(lab, edge[edge > 0])
    fg = ndi.binary_erosion(~outside, iterations=1)
    if mode == "fill":
        fg = ndi.binary_fill_holes(fg)
    elif mode == "col":
        fg = ndi.binary_opening(fg, iterations=2)
        out = np.zeros_like(fg)
        for x in range(fg.shape[1]):
            ys = np.nonzero(fg[:, x])[0]
            if len(ys):
                out[ys.min():ys.max() + 1, x] = True
        fg = out
    alpha = np.clip(ndi.gaussian_filter(fg.astype(np.float32), 0.8) * 1.15 - 0.05, 0, 1)
    ys, xs = np.nonzero(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(out, "RGBA")
    im.save(os.path.join(IMG, name + ".webp"), "WEBP", quality=88, method=6, alpha_quality=95)
    print(name, im.size, "offset-in-sheet", (box[0] + x0, box[1] + y0))


for n, b, m in CUTS:
    cut(n, b, m)
print("ok")
