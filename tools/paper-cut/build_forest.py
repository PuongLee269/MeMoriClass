"""Build the web layer set for me-mori-intro.html from the hand-separated PNG layers.

    python -I build_forest.py <animation-layers folder> <out folder>

- trees: split into still trunk/limbs and gently swaying twigs
- 08 / 01c: remove a smeared block and soften stair-stepped alpha edges
- consecutive still layers are merged; moving layers are cropped to their content
  (x, y kept, so they still sit exactly on the 1672x941 canvas)
- WebP with lossless alpha (lossy alpha shows jagged edges on phones)
Prints the layer list (src, x, y, w, h) as JSON.
"""
import sys, json, numpy as np, cv2
from PIL import Image
SRC, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2].rstrip('/') + '/'
W, H = 1672, 941
def load(n): return np.array(Image.open(SRC + n + '.png').convert('RGBA'))
def soften(a):
    af = a.astype(np.float32) / 255
    b = cv2.GaussianBlur(af, (0, 0), 0.9)
    edge = (cv2.dilate((af > .02).astype(np.uint8), np.ones((3, 3))) - cv2.erode((af > .98).astype(np.uint8), np.ones((3, 3)))) > 0
    af[edge] = b[edge]
    return (af * 255).astype(np.uint8)
def split(im):
    a = im[..., 3].astype(np.float32) / 255
    thick = cv2.morphologyEx((a > .5).astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    t = cv2.GaussianBlur(cv2.dilate(thick, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))).astype(np.float32), (0, 0), 3)
    trunk, twigs = im.copy(), im.copy()
    trunk[..., 3] = np.clip(a * t * 255, 0, 255).astype(np.uint8)
    tw = np.clip(a * (1 - t) * 255, 0, 255).astype(np.uint8); tw[tw < 14] = 0
    twigs[..., 3] = tw
    return trunk, twigs
def over(*ims):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for im in ims: c.alpha_composite(Image.fromarray(im) if isinstance(im, np.ndarray) else im)
    return c
meta = {}
def save(im, name, opaque=False):
    im = Image.fromarray(im) if isinstance(im, np.ndarray) else im
    bb = (0, 0, W, H) if opaque else im.getbbox()
    crop = im.crop(bb)
    if opaque: crop.convert('RGB').save(OUT + name + '.webp', quality=84, method=6)
    else: crop.save(OUT + name + '.webp', quality=84, alpha_quality=100, exact=False, method=6)
    meta[name] = dict(x=bb[0], y=bb[1], w=bb[2] - bb[0], h=bb[3] - bb[1])

l08 = load('08-overhead-leaves')
m = np.ones((H, W), np.float32); m[:27, 1148:] = 0; m = cv2.GaussianBlur(m, (0, 0), 2)
l08[..., 3] = (soften(l08[..., 3]).astype(np.float32) * m).astype(np.uint8)
l01c = load('01c-rear-tree-right')
# the dark leaf clump above the moon ends in a straight cut (y~75): fade only that clump, keep the branch below
fade = np.ones((H, W), np.float32)
x0, x1 = 1040, 1165
ys = np.arange(H, dtype=np.float32)
ramp = 1 - np.clip((ys - 52) / 26, 0, 1)            # 1 above y=52 ... 0 at y=78
dark = l01c[..., :3].astype(int).sum(2) < 210
for y in range(52, 83):
    row = dark[y, x0:x1]
    fade[y, x0:x1][row] = ramp[y]
fade = cv2.GaussianBlur(fade, (0, 0), 2.5)
a01c = soften(l01c[..., 3]).astype(np.float32)
a01c = cv2.GaussianBlur(a01c, (0, 0), 1.2) * 0.6 + a01c * 0.4   # extra smoothing for stair-stepped edges
l01c[..., 3] = np.clip(a01c * fade, 0, 255).astype(np.uint8)
t02, w02 = split(load('02-trees-left'))
t03, w03 = split(load('03-trees-right'))
# rear trees are far away: keep them whole and still (their split-off twigs looked like loose fragments)
save(over(load('01-background'), load('01b-rear-tree-left'), l01c), 'back', opaque=True)
save(over(t02, t03), 'front-trunks')
save(w02, '02-trees-left-twigs'); save(w03, '03-trees-right-twigs')
save(load('04-lake'), 'lake')
save(over(load('05-main-bank'), load('07-beetle-body')), 'bank-beetle')
save(load('06-beetle-head'), '06-beetle-head')
# Foreground shade: the blurred foreground leaves (09-11) repaint plants that also exist sharp in the
# layers behind them, so the sharp copy shows through. Under the foreground, cover that area with a
# darkened, out-of-focus copy of the scene (reads as the shadow / bokeh of leaves near the lens).
fg = [load(n) for n in ['09-foreground-left', '10-foreground-bottom', '11-foreground-right']]
a_fg = np.max(np.stack([f[..., 3] for f in fg]), 0).astype(np.float32) / 255
reach = cv2.dilate((a_fg > .08).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))).astype(np.float32)
cover = np.clip(cv2.GaussianBlur(np.maximum(reach * .85, a_fg), (0, 0), 9) * 1.15, 0, 1)
below = np.array(over(load('01-background'), load('01b-rear-tree-left'), l01c, t02, w02, t03, w03, load('04-lake'),
                      load('05-main-bank'), load('07-beetle-body')).convert('RGB')).astype(np.float32)
soft = cv2.GaussianBlur(below, (0, 0), 14) * .5
shade = np.dstack([np.clip(soft, 0, 255), cover * 255]).astype(np.uint8)
save(shade, 'fg-shade')
save(l08, '08-overhead-leaves')
for n in ['09-foreground-left', '10-foreground-bottom', '11-foreground-right']: save(load(n), n)
print(json.dumps(meta, indent=1))
