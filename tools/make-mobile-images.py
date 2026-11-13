#!/usr/bin/env python3
"""Tạo bản ảnh NHỎ cho điện thoại (hậu tố _m) từ ảnh gốc, chạy trên máy bạn.

Cài một lần:   pip install pillow numpy scikit-image
Chạy thử:      python tools/make-mobile-images.py assets --dry-run
Chạy thật:     python tools/make-mobile-images.py assets
Tùy chọn:      --max-side 1280  --quality 82  --min-ssim 0.98  --min-save 15

Với mỗi ảnh webp/png/jpg: thu nhỏ cạnh dài tối đa --max-side, lưu cạnh ảnh gốc thành
ten_m.webp, giữ kênh trong suốt. Nếu độ giống ảnh gốc (SSIM) thấp hơn --min-ssim thì tự
tăng chất lượng; nếu vẫn thấp hoặc tiết kiệm dưới --min-save % thì bỏ qua ảnh đó.
Không sửa, không xóa ảnh gốc. Ghi bảng kết quả vào mobile-images-report.csv.
"""
import argparse, csv, sys
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from PIL import Image

EXT = {'.webp', '.png', '.jpg', '.jpeg'}
SKIP_DIRS = {'node_modules', '.git', 'defaults'}

def ssim_score(a, b):
    try:
        from skimage.metrics import structural_similarity as ssim
        return float(ssim(a, b, channel_axis=2, data_range=255))
    except ImportError:
        mse = float(np.mean((a.astype(np.float32) - b.astype(np.float32)) ** 2))
        return 1.0 if mse == 0 else max(0.0, 1 - mse / 255.0)  # xấp xỉ khi thiếu scikit-image

def flat(img):
    # Ảnh trong suốt: ghép lên nền xám để so sánh đúng, không bị lệch do màu ẩn dưới vùng trong suốt.
    img = img.convert('RGBA')
    bg = Image.new('RGBA', img.size, (128, 128, 128, 255))
    return np.asarray(Image.alpha_composite(bg, img).convert('RGB'))

def work(args):
    path, a = path_args = args
    src = Path(path)
    out = src.with_name(src.stem + '_m.webp')
    try:
        im = Image.open(src); im.load()
        has_alpha = im.mode in ('RGBA', 'LA') or 'transparency' in im.info
        im = im.convert('RGBA' if has_alpha else 'RGB')
        w, h = im.size
        scale = min(1.0, a['max_side'] / max(w, h))
        if scale >= 0.999:
            return (str(src), w, h, w, h, 0, 0, '', 'bỏ qua: đã nhỏ hơn cỡ tối đa')
        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        small = im.resize((nw, nh), Image.LANCZOS)
        ref = small  # so với ảnh gốc co lại cùng cỡ, đo mất mát do nén
        refa = flat(ref)
        best = None
        for q in (a['quality'], 88, 92, 96):
            if q < a['quality']: continue
            tmp = out.with_suffix('.tmp.webp')
            small.save(tmp, 'WEBP', quality=q, method=6, alpha_quality=100)
            s = ssim_score(refa, flat(Image.open(tmp)))
            size = tmp.stat().st_size
            best = (q, s, size, tmp)
            if s >= a['min_ssim']: break
            tmp.unlink()
        q, s, size, tmp = best
        orig = src.stat().st_size
        saved = 100 * (1 - size / orig)
        if s < a['min_ssim'] or saved < a['min_save']:
            if tmp.exists(): tmp.unlink()
            return (str(src), w, h, nw, nh, orig, 0, f'{s:.4f}', f'bỏ qua: SSIM {s:.3f} hoặc chỉ tiết kiệm {saved:.0f}%')
        if a['dry']:
            tmp.unlink(); status = 'dry-run'
        else:
            tmp.replace(out); status = 'đã tạo'
        return (str(src), w, h, nw, nh, orig, size, f'{s:.4f}', status + f' q{q}')
    except Exception as e:
        return (str(src), 0, 0, 0, 0, 0, 0, '', 'lỗi: ' + str(e))

def main():
    p = argparse.ArgumentParser()
    p.add_argument('folder')
    p.add_argument('--max-side', type=int, default=1280)
    p.add_argument('--quality', type=int, default=82)
    p.add_argument('--min-ssim', type=float, default=0.98)
    p.add_argument('--min-save', type=float, default=15)
    p.add_argument('--dry-run', action='store_true')
    o = p.parse_args()
    a = dict(max_side=o.max_side, quality=o.quality, min_ssim=o.min_ssim, min_save=o.min_save, dry=o.dry_run)
    files = [str(f) for f in Path(o.folder).rglob('*')
             if f.suffix.lower() in EXT and not f.stem.endswith('_m') and not (set(f.parts) & SKIP_DIRS)]
    print(f'{len(files)} ảnh. Đang xử lý...')
    with ProcessPoolExecutor() as ex:
        rows = list(ex.map(work, [(f, a) for f in files], chunksize=4))
    with open('mobile-images-report.csv', 'w', newline='', encoding='utf-8-sig') as fh:
        wr = csv.writer(fh)
        wr.writerow(['file', 'rộng', 'cao', 'rộng_m', 'cao_m', 'byte_gốc', 'byte_m', 'ssim', 'kết quả'])
        wr.writerows(rows)
    made = [r for r in rows if r[8].startswith(('đã tạo', 'dry'))]
    print(f'Tạo/được: {len(made)}; gốc {sum(r[5] for r in made)//1024} KB -> {sum(r[6] for r in made)//1024} KB. Chi tiết: mobile-images-report.csv')

if __name__ == '__main__':
    sys.exit(main())
