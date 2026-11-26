"""Xuất ảnh cho trang Cộng đồng đen trắng: 2 nền (WebP q82) + 6 quả cầu cắt từ orbs-bw.png (nền trắng -> trong suốt, bên trong giữ đục)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SRC = os.path.join(IMG, "src")
WHITE = 244
OUT_SIZE = 320

for name, size in (("bg-desk-bw", (1672, 941)), ("bg-phone-bw", (852, 1846))):
    Image.open(os.path.join(SRC, name + ".png")).convert("RGB").resize(size, Image.LANCZOS).save(
        os.path.join(IMG, name + ".webp"), "WEBP", quality=82, method=6)

sheet = Image.open(os.path.join(SRC, "orbs-bw.png")).convert("RGB")
rgb = np.asarray(sheet).astype(np.float32)
dark = rgb.min(axis=2) < WHITE
dark = ndi.binary_closing(dark, iterations=3)
lab, n = ndi.label(dark)
sizes = ndi.sum(dark, lab, range(1, n + 1))
keep = [i + 1 for i in np.argsort(sizes)[::-1][:6]]
objs = []
for k in keep:
    ys, xs = np.nonzero(lab == k)
    objs.append((k, ys.min(), ys.max() + 1, xs.min(), xs.max() + 1))
# thứ tự hàng trước: hàng trên (y nhỏ) từ trái sang phải, rồi hàng dưới
objs.sort(key=lambda o: (int((o[1] + o[2]) / 2 // (sheet.height / 2)), o[3]))
for idx, (k, y0, y1, x0, x1) in enumerate(objs, 1):
    mask = ndi.binary_fill_holes(lab == k)
    mask = ndi.binary_erosion(mask, iterations=1)
    alpha = np.clip(ndi.gaussian_filter(mask.astype(np.float32), 0.8) * 1.2 - 0.1, 0, 1)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(out, "RGBA")
    side = max(im.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    canvas = canvas.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    canvas.save(os.path.join(IMG, f"orb-{idx}.webp"), "WEBP", quality=90, method=6, alpha_quality=95)
    print(f"orb-{idx}", im.size, (x0, y0))
print("ok")
