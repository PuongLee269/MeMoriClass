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
LEGACY = '--legacy-fixes' in sys.argv   # patches for defects of layer set v6 (fixed in v7 art)
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
    # only branch tips high in the canopy may sway; below y~380 everything belongs to the still part,
    # so a plant is never split into a still half and a moving half
    ys = np.arange(H, dtype=np.float32)[:, None]
    canopy = np.clip((420 - ys) / 80, 0, 1)            # 1 above y=340, 0 below y=420
    t = 1 - (1 - t) * canopy
    trunk, twigs = im.copy(), im.copy()
    trunk[..., 3] = np.clip(a * t * 255, 0, 255).astype(np.uint8)
    tw = np.clip(a * (1 - t) * 255, 0, 255).astype(np.uint8); tw[tw < 14] = 0
    twigs[..., 3] = tw
    return trunk, twigs
def dof(img, sigma_map):
    # depth of field: blend between a few blur levels by a per-pixel sigma map (premultiplied for RGBA)
    rgba = img.shape[2] == 4
    f = img.astype(np.float32)
    if rgba: f[..., :3] *= f[..., 3:4] / 255
    levels = [0, .8, 1.6, 2.6]
    stack = [f if s == 0 else cv2.GaussianBlur(f, (0, 0), s) for s in levels]
    out = np.zeros_like(f)
    sm = np.clip(sigma_map, 0, levels[-1])
    for i in range(len(levels) - 1):
        lo, hi = levels[i], levels[i + 1]
        w = np.clip((sm - lo) / (hi - lo), 0, 1)[..., None]
        inside = ((sm >= lo) & (sm <= hi))[..., None]
        out = np.where(inside, stack[i] * (1 - w) + stack[i + 1] * w, out)
    if rgba:
        a = np.clip(out[..., 3:4], 1e-3, 255)
        out[..., :3] = np.where(out[..., 3:4] > .5, out[..., :3] * 255 / a, 0)
    return np.clip(out, 0, 255).astype(np.uint8)

# far zone behind the river: one consistent lens blur (focus is on the beetle)
_ys, _xs = np.mgrid[0:H, 0:W].astype(np.float32)
_far = np.clip(1 - ((_xs - 720) / 420) ** 2 - ((_ys - 650) / 95) ** 2, 0, 1) ** .6     # soft ellipse around the far bank
SIGMA_FAR = _far * 0.0     # match the forest's own focus: no extra lens blur
# the far bright bank strip was repainted too soft; sharpen just that strip up to the forest's crispness
_bank = (np.clip(1 - np.abs(_xs - 695) / 120, 0, 1) * np.clip(1 - np.abs(_ys - 680) / 28, 0, 1)) ** .7
_rocks = np.clip(1 - np.abs(_xs - 715) / 360, 0, 1) ** .5 * np.clip(1 - np.abs(_ys - 680) / 48, 0, 1) ** .6
def sharpen_bank(img):
    f = img.astype(np.float32)
    rgb = f[..., :3]
    blur = cv2.GaussianBlur(rgb, (0, 0), 2.2)
    amount = (_rocks * 1.1 + _bank * 1.4)[..., None]     # rocks a bit, the soft bank strip more
    f[..., :3] = np.clip(rgb + (rgb - blur) * amount, 0, 255)
    return f.astype(np.uint8)

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
m = np.ones((H, W), np.float32)
if LEGACY: m[:27, 1148:] = 0; m = cv2.GaussianBlur(m, (0, 0), 2)
l08[..., 3] = (soften(l08[..., 3]).astype(np.float32) * m).astype(np.uint8)
l01c = load('01c-rear-tree-right')
if LEGACY:
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
else:
    l01c[..., 3] = soften(l01c[..., 3])
t02, w02 = split(load('02-trees-left'))
t03, w03 = split(load('03-trees-right'))
# rear trees are far away: keep them whole and still (their split-off twigs looked like loose fragments)
save(sharpen_bank(np.array(over(load('01-background'), load('01b-rear-tree-left'), l01c))), 'back', opaque=True)
save(over(t02, t03), 'front-trunks')
save(w02, '02-trees-left-twigs'); save(w03, '03-trees-right-twigs')
# lake: only the water ripples; rocks and reeds stay still on top of it
lake = load('04-lake')
hsv = cv2.cvtColor(lake[..., :3], cv2.COLOR_RGB2HSV)
ys = np.arange(H)[:, None]
water = ((ys >= 705) & (hsv[..., 2] > 45) & (lake[..., 3] > 0)).astype(np.uint8)
water = cv2.morphologyEx(water, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
water = cv2.erode(water, np.ones((5, 5), np.uint8)).astype(np.float32)
water = cv2.GaussianBlur(water, (0, 0), 3)
wl, sl = lake.copy(), lake.copy()
wl[..., 3] = (lake[..., 3] * water).astype(np.uint8)
sl[..., 3] = (lake[..., 3] * (1 - water)).astype(np.uint8)
water_full = lake.copy(); water_full[..., 3] = np.where(water > 0.02, lake[..., 3], 0)   # opaque water under the still parts
# soften the hard top edge of the far bright bank strip (x 600-790, y~660)
band = np.clip(1 - np.abs(_ys - 664) / 14, 0, 1) * np.clip(1 - np.abs(_xs - 695) / 115, 0, 1) ** .4
sl[..., 3] = (sl[..., 3].astype(np.float32) * (1 - .8 * band)).astype(np.uint8)
save(water_full, 'lake-water'); save(sharpen_bank(sl), 'lake-still')
save(over(load('05-main-bank'), load('07-beetle-body')), 'bank-beetle')
save(load('06-beetle-head'), '06-beetle-head')
# Foreground shade: the blurred foreground leaves (09-11) repaint plants that also exist sharp in the
# layers behind them, so the sharp copy shows through. Under the foreground, cover that area with a
# darkened, out-of-focus copy of the scene (reads as the shadow / bokeh of leaves near the lens).
fg = [load(n) for n in ['09-foreground-left', '10-foreground-bottom', '11-foreground-right']]
a_fg = np.max(np.stack([f[..., 3] for f in fg]), 0).astype(np.float32) / 255
reach = cv2.dilate((a_fg > .25).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))).astype(np.float32)
SHADE = 1.0 if LEGACY else 0.8                      # v7 art has far fewer duplicates: lighter cover
cover = np.clip(cv2.GaussianBlur(np.maximum(reach * .7, a_fg), (0, 0), 7), 0, 1) * SHADE
below = np.array(over(load('01-background'), load('01b-rear-tree-left'), l01c, t02, w02, t03, w03, load('04-lake'),
                      load('05-main-bank'), load('07-beetle-body')).convert('RGB')).astype(np.float32)
soft = cv2.GaussianBlur(below, (0, 0), 14) * (.5 if LEGACY else .62)
shade = np.dstack([np.clip(soft, 0, 255), cover * 255]).astype(np.uint8)
save(shade, 'fg-shade')
save(l08, '08-overhead-leaves')
for n in ['09-foreground-left', '10-foreground-bottom', '11-foreground-right']:
    f = load(n)
    a = f[..., 3].astype(np.float32)
    f[..., 3] = np.clip(np.minimum(a, cv2.GaussianBlur(a, (0, 0), 3.5) * 1.15), 0, 255).astype(np.uint8)   # feathered rim, no hard cut
    save(f, n)
print(json.dumps(meta, indent=1))
