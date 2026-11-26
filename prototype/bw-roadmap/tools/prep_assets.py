"""Xuất ảnh cho trang lộ trình đen trắng: nền 1670x942 và 4 vật cắt từ bảng nền trắng (cuộn giấy, gò, lá trái, lá phải)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SRC = os.path.join(IMG, "src")
W, H = 1670, 942
WHITE = 246

Image.open(os.path.join(SRC, "bg-bw.png")).convert("RGB").resize((W, H), Image.LANCZOS).save(
    os.path.join(IMG, "bg-bw.webp"), "WEBP", quality=82, method=6)

parts = Image.open(os.path.join(SRC, "parts-bw.png")).convert("RGB")
pw, ph = parts.size
QUAD = {"scroll": (0, 0, pw // 2, ph // 2), "mound": (pw // 2, 0, pw, ph // 2),
        "leafL": (0, ph // 2, pw // 2, ph), "leafR": (pw // 2, ph // 2, pw, ph)}


def cut(name, box):
    rgb = np.asarray(parts.crop(box)).astype(np.float32)
    near_white = rgb.min(axis=2) >= WHITE
    lab, _ = ndi.label(near_white)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    outside = np.isin(lab, edge[edge > 0])
    fg = ndi.binary_erosion(~outside, iterations=1)      # bỏ viền trắng 1px
    fg = ndi.binary_fill_holes(fg) if name == "scroll" else fg   # cuộn giấy: giấy trắng bên trong luôn đục
    alpha = np.clip(ndi.gaussian_filter(fg.astype(np.float32), 0.8) * 1.15 - 0.05, 0, 1)
    ys, xs = np.nonzero(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(out, "RGBA")
    im.save(os.path.join(IMG, name + "-bw.webp"), "WEBP", quality=88, method=6, alpha_quality=95)
    print(name, im.size, "ratio %.3f" % (im.size[0] / im.size[1]))


for k, b in QUAD.items():
    cut(k, b)
print("ok")
