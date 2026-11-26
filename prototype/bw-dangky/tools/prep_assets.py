"""Xuất WebP cho trang Đăng ký đen trắng từ img/src/*.png (nền q82)."""
import os
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img")
for name in ("bg-desk-bw", "bg-phone-bw"):
    im = Image.open(os.path.join(ROOT, "src", name + ".png")).convert("L").convert("RGB")
    im.save(os.path.join(ROOT, name + ".webp"), "WEBP", quality=82, method=6)
    print(name, im.size, os.path.getsize(os.path.join(ROOT, name + ".webp")) // 1024, "KB")
