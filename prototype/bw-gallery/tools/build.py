"""Ghép style.css (phông + css riêng) và app.js (app.src.js + nội dung mặc định từ assets/content/gallery.json)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
REPO = os.path.normpath(os.path.join(ROOT, "..", ".."))
lopf = open(os.path.join(ROOT, "..", "bw-lopf1", "style.css"), encoding="utf8").read().split("\n")
fonts = "\n".join(l for l in lopf if l.startswith("@font-face"))
own = open(os.path.join(ROOT, "_own.css"), encoding="utf8").read()
open(os.path.join(ROOT, "style.css"), "w", encoding="utf8").write(fonts + "\n" + own)
j = json.load(open(os.path.join(REPO, "assets", "content", "gallery.json"), encoding="utf8"))
d = json.dumps(j, ensure_ascii=False, separators=(",", ":"))
s = open(os.path.join(ROOT, "app.src.js"), encoding="utf8").read().replace("__DEFAULTS__", d)
open(os.path.join(ROOT, "app.js"), "w", encoding="utf8").write(s)
print("built", len(s))
