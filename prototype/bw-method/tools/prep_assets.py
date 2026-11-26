"""Xuất ảnh cho trang Phương pháp đen trắng: nền (WebP q82) + bàn, đĩa, cành (kèm đèn) + 9 khối đá cắt nền trắng.
Nguồn: img/src/{bg-bw,parts-bw,table-bw,cubes-bw}.png. Chạy: python prep_assets.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SRC = os.path.join(IMG, "src")
WHITE = 246


def cut_rgba(rgb, fill=True):
    """Cắt nền trắng nối với mép; trả về ảnh RGBA đã cắt sát."""
    rgb = np.asarray(rgb).astype(np.float32)
    near_white = rgb.min(axis=2) >= WHITE
    lab, _ = ndi.label(near_white)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    outside = np.isin(lab, edge[edge > 0])
    fg = ndi.binary_erosion(~outside, iterations=1)
    fg = ndi.binary_opening(fg, iterations=1)
    # chỉ giữ thành phần lớn nhất (bỏ bụi)
    lab2, n = ndi.label(ndi.binary_dilation(fg, iterations=6))
    if n > 1:
        sizes = ndi.sum(fg, lab2, range(1, n + 1))
        fg = fg & (lab2 == (1 + int(np.argmax(sizes))))
    if fill:
        fg = ndi.binary_fill_holes(fg)
    alpha = np.clip(ndi.gaussian_filter(fg.astype(np.float32), 0.8) * 1.15 - 0.05, 0, 1)
    ys, xs = np.nonzero(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    return Image.fromarray(out, "RGBA")


def save(im, name, width=None, q=88):
    if width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(IMG, name + ".webp"), "WEBP", quality=q, method=6, alpha_quality=95)
    print(name, im.size)


# nền
Image.open(os.path.join(SRC, "bg-bw.png")).convert("RGB").resize((1672, 941), Image.LANCZOS).save(
    os.path.join(IMG, "bg-bw.webp"), "WEBP", quality=82, method=6)

# bảng chi tiết: cành (kèm đèn treo), đĩa (và bàn nếu chưa có table-bw)
parts = Image.open(os.path.join(SRC, "parts-bw.png")).convert("RGB")
pw, ph = parts.size
save(cut_rgba(parts.crop((0, 0, 900, 880))), "branch", width=760)
save(cut_rgba(parts.crop((1380, 0, pw, 800))), "dish", width=900)
tb = os.path.join(SRC, "table-bw.png")
table_src = Image.open(tb).convert("RGB") if os.path.exists(tb) else parts.crop((150, 780, pw - 150, ph - 60))
save(cut_rgba(table_src), "table", width=1400)

# 9 khối đá: lưới 3x3 (hàng: spiral, eye, mountain; cột A B C), mỗi khối rộng 265
cubes = Image.open(os.path.join(SRC, "cubes-bw.png")).convert("RGB")
cw, ch = cubes.size[0] // 3, cubes.size[1] // 3
for r, sym in enumerate(["spiral", "eye", "mountain"]):
    for c, v in enumerate("ABC"):
        save(cut_rgba(cubes.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))), f"cube-{sym}-{v}", width=265)
print("ok")
