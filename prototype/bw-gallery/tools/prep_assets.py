"""Xuất ảnh cho trang Workshop đen trắng: 2 nền (WebP q82) + 3 vật cắt từ bảng nền trắng (parts-bw.png): projector, fgL, fgR."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SRC = os.path.join(IMG, "src")
WHITE = 244

for name, size in (("bg-desk-bw", (1672, 941)), ("bg-phone-bw", (852, 1844))):
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    if im.size != size:
        # phone: 852x1846 -> 852x1844 (cắt 2px dưới)
        im = im.crop((0, 0, size[0], size[1])) if im.size[0] == size[0] else im.resize(size, Image.LANCZOS)
    im.save(os.path.join(IMG, name + ".webp"), "WEBP", quality=82, method=6)

parts = Image.open(os.path.join(SRC, "parts-bw.png")).convert("RGB")
pw, ph = parts.size
CUTS = [
    ("projector", (0, 0, 860, 520), "fill"),
    ("fgL", (0, 520, 880, ph), "none"),
    ("fgR", (880, 520, pw, ph), "none"),
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
    alpha = np.clip(ndi.gaussian_filter(fg.astype(np.float32), 0.8) * 1.15 - 0.05, 0, 1)
    ys, xs = np.nonzero(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(out, "RGBA")
    im.save(os.path.join(IMG, name + ".webp"), "WEBP", quality=88, method=6, alpha_quality=95)
    print(name, im.size)

for n, b, m in CUTS:
    cut(n, b, m)
print("ok")
