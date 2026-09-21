"""Split the hand-painted PNG sheets into transparent, independently reusable sprites."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "source"
OUT = ROOT / "assets" / "sprites"
OUT.mkdir(parents=True, exist_ok=True)

def trim(image, padding=18):
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))

def grid(name, cols, rows, prefix, padding=24):
    image = Image.open(SOURCE / f"{name}.png").convert("RGBA")
    for row in range(rows):
        for col in range(cols):
            left = round(col * image.width / cols)
            top = round(row * image.height / rows)
            right = round((col + 1) * image.width / cols)
            bottom = round((row + 1) * image.height / rows)
            sprite = trim(image.crop((left, top, right, bottom)), padding)
            sprite.save(OUT / f"{prefix}-{row * cols + col + 1}.png")

# The fire sheets share a 3 x 2 layout: each index is one animation pose.
for layer in ("Fire1", "Fire2", "Fire3"):
    grid(layer, 3, 2, layer.lower(), 30)

# Six curated ember clusters and painted orbit/ring variants.
grid("Fire4", 3, 2, "ember-cluster", 20)
for stroke in ("Cur1", "Cur2", "Cur3"):
    grid(stroke, 4, 2, stroke.lower(), 24)
grid("Loi1", 3, 2, "core", 24)

# These regions isolate the large, characterful elements from the particle sheet.
ele = Image.open(SOURCE / "Ele.png").convert("RGBA")
regions = {
    "starburst": (70, 40, 250, 250), "diamond-small": (290, 45, 470, 245),
    "star-four": (880, 35, 1120, 260), "star-wide": (620, 300, 1000, 700),
    "star-tall": (1080, 280, 1430, 730), "ring": (1810, 300, 2180, 760),
    "ellipse": (2240, 300, 2670, 760), "spark": (360, 1250, 610, 1570),
    "cross": (1900, 1250, 2120, 1530),
}
for name, box in regions.items():
    trim(ele.crop(box), 18).save(OUT / f"ele-{name}.png")

print(f"Wrote {len(list(OUT.glob('*.png')))} sprites to {OUT}")
