"""Xuất ảnh cho trang bản đồ đen trắng: cảnh 1670x942, bản không gò (điện thoại), lớp gò và lớp lá phía trước."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
SM = os.path.normpath(os.path.join(HERE, "..", "..", "..", "assets", "sitemap"))
W, H = 1670, 942

scene = Image.open(os.path.join(IMG, "scene-bw.png")).convert("RGB").resize((W, H), Image.LANCZOS)
scene.save(os.path.join(IMG, "scene-bw.webp"), "WEBP", quality=82, method=6)
rgb = np.asarray(scene).astype(np.float32)


def soft_mask(alpha, grow, feather):
    m = alpha > 8
    if grow:
        m = ndi.binary_dilation(m, structure=np.ones((3, 3)), iterations=grow)
    return np.clip(ndi.gaussian_filter(m.astype(np.float32), feather) * 1.2 - .1, 0, 1)


def rgba(mask):
    return Image.fromarray(np.dstack([rgb.astype(np.uint8), (mask * 255).astype(np.uint8)]), "RGBA")


mound_a = np.asarray(Image.open(os.path.join(SM, "mound.webp")).convert("RGBA"))[:, :, 3]
leaves_a = np.asarray(Image.open(os.path.join(SM, "leaves.webp")).convert("RGBA"))[:, :, 3]

rgba(soft_mask(mound_a, 6, 1.5)).save(os.path.join(IMG, "mound-bw.webp"), "WEBP", quality=88, method=6, alpha_quality=95)
rgba(soft_mask(leaves_a, 4, 1.5)).save(os.path.join(IMG, "leaves-bw.webp"), "WEBP", quality=88, method=6, alpha_quality=95)

# bản không gò: vùng gò tô trắng nhạt (nền quanh gò gần như trắng), mép mềm
hole = ndi.binary_dilation(mound_a > 8, structure=np.ones((3, 3)), iterations=5)
soft = np.clip(ndi.gaussian_filter(hole.astype(np.float32), 2.0) * 1.3, 0, 1)[..., None]
out = rgb * (1 - soft) + 249.0 * soft
Image.fromarray(out.astype(np.uint8)).save(os.path.join(IMG, "scene-bw-nomound.webp"), "WEBP", quality=82, method=6)
print("ok")
