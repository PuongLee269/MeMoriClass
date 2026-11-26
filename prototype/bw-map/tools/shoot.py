"""Chụp ảnh kiểm trang bản đồ. Chạy: python shoot.py [phone|desktop|all]"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8765/prototype/bw-map/index.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)
which = sys.argv[1] if len(sys.argv) > 1 else "all"
CTX = {
    "phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desk": dict(viewport={"width": 1672, "height": 941}, device_scale_factor=1),
}
log = []

def center(pg, sid):
    return pg.evaluate("""(sid)=>{const B=window.BWMAP;const d=B.D.find(x=>x.id===sid);const r=B.stage.getBoundingClientRect();
      return [r.left+d.cenS[0], r.top+d.cenS[1]]}""", sid)

def run(p, name):
    br = p.chromium.launch(channel="msedge")
    def new(url=BASE):
        ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
        pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
        pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
        pg.goto(url); return pg
    shot = lambda pg, tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg = new(); pg.wait_for_timeout(3600); shot(pg, "load")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    if name == "desk":
        for tag, sid in (("hover-a", 1), ("hover-b", 4), ("hover-c", 6)):
            pg.mouse.move(5, 5); pg.wait_for_timeout(500)
            x, y = center(pg, sid); pg.mouse.move(x, y, steps=4); pg.wait_for_timeout(900); shot(pg, tag)
        pg.mouse.move(5, 5); pg.wait_for_timeout(600)
        x, y = center(pg, 4); pg.mouse.move(x, y); pg.wait_for_timeout(150); shot(pg, "hover-mid")
        pg.mouse.move(5, 5); pg.wait_for_timeout(500)
        x, y = center(pg, 3); pg.mouse.move(x, y); pg.wait_for_timeout(700)
        pg.mouse.down(); pg.mouse.up(); pg.wait_for_timeout(700); shot(pg, "fly")
        pg.wait_for_timeout(800); print(name, "after click url:", pg.url)
    else:
        x, y = center(pg, 4)
        pg.touchscreen.tap(x, y); pg.wait_for_timeout(500); shot(pg, "tap")
        pg.wait_for_timeout(600); shot(pg, "fly")
        pg.wait_for_timeout(1200); print(name, "after 1 tap url:", pg.url)
    pg.context.close(); br.close()

with sync_playwright() as p:
    for n in (["phone", "desk"] if which == "all" else [which]): run(p, n)
print("--- logs ---")
for l in log: print(l)
