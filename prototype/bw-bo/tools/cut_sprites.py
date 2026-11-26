"""Cắt lưới 4x3 Bọ thành 12 sprite nền trong suốt cùng khung 512x512, và xuất ảnh nền WebP."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "img"))
OUT = os.path.join(IMG, "bo")
NAMES = ["idle", "wave", "talk", "listen", "think", "point", "happy", "surprised",
         "confused", "sleep", "takeoff", "fly"]
FRAME = 512
IDLE_W = 340          # bề rộng sprite idle trong khung -> hệ số thu phóng chung
FLY_GAP = 0.08        # takeoff/fly: đáy cách đáy khung 8%
WHITE = 235
MAIN_AREA = 6000      # thành phần >= ngưỡng coi là thân Bọ
ATTACH_PX = 18        # mảnh nhỏ cách thân <= ngưỡng thì giữ (râu, giọt mồ hôi)


def extract():
    im = Image.open(os.path.join(IMG, "bo-poses.png")).convert("RGB")
    a = np.asarray(im)
    white = a.min(axis=2) >= WHITE
    lab, n = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1) | ndi.binary_dilation(fg & False)  # bỏ hạt li ti
    comp, k = ndi.label(fg, structure=np.ones((3, 3)))
    areas = ndi.sum(fg, comp, range(1, k + 1))
    cents = ndi.center_of_mass(fg, comp, range(1, k + 1))
    mains = [i + 1 for i in range(k) if areas[i] >= MAIN_AREA]
    assert len(mains) == 12, f"tìm thấy {len(mains)} thân, cần 12"
    h, w = fg.shape
    # sắp xếp theo hàng (3) rồi cột (4)
    mains.sort(key=lambda i: cents[i - 1][0])
    ordered = []
    for r in range(3):
        row = sorted(mains[r * 4:(r + 1) * 4], key=lambda i: cents[i - 1][1])
        ordered += row
    sprites = {}
    for name, cid in zip(NAMES, ordered):
        body = comp == cid
        near = ndi.binary_dilation(body, iterations=ATTACH_PX)
        keep_ids = [j for j in np.unique(comp[near]) if j != 0]
        mask = np.isin(comp, keep_ids)
        # gộp lỗ trắng bên trong (mai, mắt) vào Bọ: mọi thứ không phải nền nối biên đã là fg
        ys, xs = np.where(mask)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        pad = 6
        y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
        y1, x1 = min(h, y1 + pad), min(w, x1 + pad)
        rgb = a[y0:y1, x0:x1]
        m = mask[y0:y1, x0:x1]
        dark = (rgb.min(axis=2) < 110) & m
        cx = np.where(dark)[1].mean() if dark.any() else (m.shape[1] / 2)
        sprites[name] = (rgb, m, cx)
    return sprites


def soft_alpha(mask):
    m = ndi.binary_erosion(mask, iterations=1) | (mask & False)
    m = m | ndi.binary_erosion(mask, iterations=1)
    f = ndi.gaussian_filter(m.astype(np.float32), 0.8)
    return np.clip(f * 1.15 - 0.05, 0, 1)


def build():
    os.makedirs(OUT, exist_ok=True)
    sprites = extract()
    idle_w = np.where(sprites["idle"][1].any(axis=0))[0]
    scale = IDLE_W / float(idle_w.max() - idle_w.min() + 1)
    print("scale", round(scale, 3))
    for name, (rgb, m, cx) in sprites.items():
        alpha = soft_alpha(m)
        rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
        # đáy thật của mặt nạ (không tính phần đệm)
        ys = np.where(m.any(axis=1))[0]
        img = Image.fromarray(rgba, "RGBA")
        nw, nh = max(1, round(img.width * scale)), max(1, round(img.height * scale))
        img = img.resize((nw, nh), Image.LANCZOS)
        bottom = (ys.max() + 1) * scale
        fcx = cx * scale
        gap = round(FRAME * FLY_GAP) if name in ("takeoff", "fly") else 0
        ox = round(FRAME / 2 - fcx)
        oy = round(FRAME - gap - bottom)
        canvas = Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))
        canvas.alpha_composite(img, (max(ox, 0), max(oy, 0))) if ox >= 0 and oy >= 0 else canvas.paste(img, (ox, oy), img)
        canvas.save(os.path.join(OUT, name + ".png"))
        canvas.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=88, method=6, alpha_quality=100)
    for bg, q in (("bg-phone", 82), ("bg-desktop", 82)):
        Image.open(os.path.join(IMG, bg + ".png")).convert("RGB").save(
            os.path.join(IMG, bg + ".webp"), "WEBP", quality=q, method=6)
    # ảnh kiểm
    sheet = Image.new("RGB", (4 * 256, 3 * 256), (136, 136, 136))
    for i, name in enumerate(NAMES):
        s = Image.open(os.path.join(OUT, name + ".png")).resize((256, 256), Image.LANCZOS)
        sheet.paste(s, ((i % 4) * 256, (i // 4) * 256), s)
    sheet.save(os.path.join(HERE, "_check_sprites.png"))


if __name__ == "__main__":
    build()
