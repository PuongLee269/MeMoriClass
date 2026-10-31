"""Cut the Me.Mori forest painting into paper layers + an inpainted base."""
import sys, json, numpy as np, cv2, onnxruntime as ort
from PIL import Image
B = sys.argv[1]; SRC = sys.argv[2]; OUT = sys.argv[3]
img = np.array(Image.open(SRC).convert('RGB'))
H, W = img.shape[:2]

# ---- high-res depth (bright = near) ----
def depth_map():
    sess = ort.InferenceSession(f'{B}/models/depth/depth_anything_v2_vits_dynamic.onnx', providers=['CPUExecutionProvider'])
    w, h = 1288, 728
    x = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = sess.run(None, {sess.get_inputs()[0].name: x})[0].squeeze()
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    return (d - d.min()) / (d.max() - d.min()) * 255
import os
depth = cv2.imread(f"{OUT}/depth-hi.png", 0).astype(np.float32) if os.path.exists(f"{OUT}/depth-hi.png") else depth_map()
cv2.imwrite(f'{OUT}/depth-hi.png', depth.astype(np.uint8))

guide = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
def guided(p, r=7, eps=2e-4):
    box = lambda a: cv2.boxFilter(a, -1, (2 * r + 1, 2 * r + 1))
    mI, mp = box(guide), box(p)
    a = (box(guide * p) - mI * mp) / (box(guide * guide) - mI * mI + eps)
    b = mp - a * mI
    return np.clip(box(a) * guide + box(b), 0, 1)
def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)
def poly_mask(pts, feather=24):
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return cv2.GaussianBlur(m, (0, 0), feather / 2.5) if feather else m

# nearest first: a pixel belongs to the first layer that claims it
LAYERS = [
  dict(id='left-near',  poly=[(0,520),(300,520),(430,700),(470,941),(0,941)], d=(120,165), pivot=(120,960), depth=1.0,
       sway=dict(amp=1.1, period=7.5, bend=.45)),
  dict(id='bottom-right', poly=[(1220,780),(1672,700),(1672,941),(1160,941)], d=(86,104), pivot=(1460,960), depth=.9,
       sway=dict(amp=1.3, period=6.2, bend=.6)),
  dict(id='bottom-mid', poly=[(380,770),(1040,770),(1180,941),(400,941)], d=(25,38), pivot=(760,960), depth=.8,
       sway=dict(amp=1.0, period=5.4, bend=.7)),
  dict(id='left-top',   poly=[(30,330),(400,330),(400,640),(30,640)], d=(24,52), pivot=(200,660), depth=.65,
       sway=dict(amp=1.6, period=6.8, bend=.5)),
  dict(id='right-fern', poly=[(1352,315),(1525,315),(1552,430),(1538,560),(1600,598),(1356,598)], d=(17,30), pivot=(1470,650), depth=.55,
       sway=dict(amp=1.5, period=6.0, bend=.55)),
  dict(id='canopy',     poly=[(520,0),(1120,0),(1110,215),(520,215)], d=(15,26), pivot=(830,-30), depth=.45,
       sway=dict(amp=1.0, period=8.5, bend=.3)),
]
claimed = np.zeros((H, W), np.float32)
union = np.zeros((H, W), np.float32)
meta = []
for L in LAYERS:
    raw = smooth(depth, *L['d']) * poly_mask(L['poly'])
    a = guided(raw)
    a = guided(a, r=3, eps=1e-4)
    a = smooth(a, .18, .82) * (1 - claimed)
    a[a < .03] = 0
    claimed = np.maximum(claimed, a)
    union = np.maximum(union, a)
    ys, xs = np.where(a > 0)
    x0, y0 = max(0, xs.min() - 4), max(0, ys.min() - 4)
    x1, y1 = min(W, xs.max() + 5), min(H, ys.max() + 5)
    rgba = np.dstack([img, (a * 255).astype(np.uint8)])[y0:y1, x0:x1]
    Image.fromarray(rgba, 'RGBA').save(f"{OUT}/{L['id']}.webp", quality=88, method=6)
    Image.fromarray(rgba, 'RGBA').save(f"{OUT}/{L['id']}.png")
    meta.append(dict(id=L['id'], x=int(x0), y=int(y0), w=int(x1 - x0), h=int(y1 - y0), ox=L['pivot'][0], oy=L['pivot'][1], depth=L['depth'], sway=L['sway']))
    print(L['id'], x0, y0, x1 - x0, y1 - y0, 'cover %.1f%%' % (100 * (a > .5).mean()))

# ---- base: under each cut-out, a shadowed fill (paper shadow); at the cut edges keep the original ----
core = np.zeros((H, W), np.float32)
for L in LAYERS:
    pass
# m = where a layer fully covers the painting; only there is the base allowed to differ from the original
m = cv2.erode((claimed > .85).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32)
m = cv2.GaussianBlur(m, (0, 0), 1.5)
hole = (claimed > .05).astype(np.uint8)
bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
small = cv2.resize(bgr, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
hs = cv2.resize(cv2.dilate(hole, np.ones((9, 9), np.uint8)), (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)
fs = cv2.inpaint(small, hs, 9, cv2.INPAINT_TELEA)
fill = cv2.GaussianBlur(cv2.resize(fs, (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 3).astype(np.float32)
rng = np.random.default_rng(3)
grain = cv2.GaussianBlur(rng.normal(0, 5, (H, W)).astype(np.float32), (0, 0), 1.4)[..., None]
fill = np.clip(fill * .5 + grain, 0, 255)               # shadow cast by the sheet above
base = bgr.astype(np.float32) * (1 - m[..., None]) + fill * m[..., None]
base = cv2.cvtColor(base.astype(np.uint8), cv2.COLOR_BGR2RGB)
Image.fromarray(base).save(f'{OUT}/base.webp', quality=90, method=6)
Image.fromarray(base).save(f'{OUT}/base.png')
json.dump(meta, open(f'{OUT}/layers.json', 'w'), indent=1)
