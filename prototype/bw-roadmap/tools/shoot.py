"""Chụp ảnh kiểm trang lộ trình. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8766 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8766")
BASE = f"http://localhost:{PORT}/prototype/bw-roadmap/index.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)
which = sys.argv[1] if len(sys.argv) > 1 else "all"
CTX = {
    "phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desk": dict(viewport={"width": 1672, "height": 941}, device_scale_factor=1),
}
log = []

def run(p, name):
    br = p.chromium.launch(channel="msedge")
    def new(url=BASE):
        ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
        pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
        pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
        pg.on("response", lambda r: log.append((name, "http%d" % r.status, r.url)) if r.status >= 400 else None)
        pg.goto(url, wait_until="commit"); return pg
    shot = lambda pg, tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    def click(pg, sel):
        if name == "phone":
            b = pg.locator(sel).bounding_box(); pg.touchscreen.tap(b["x"] + b["width"] / 2, b["y"] + 10)
        else: pg.locator(sel).click()
    pg = new(); pg.wait_for_timeout(350); shot(pg, "1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(4200); shot(pg, "2-intro")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"))
    print(name, "initial chapter:", pg.evaluate("window.__rm.state.SELECTED"))
    click(pg, ".ch[data-i='2']"); pg.wait_for_timeout(500); shot(pg, "3-buoi3-point"); pg.wait_for_timeout(1500)
    click(pg, ".ch[data-i='3']"); pg.wait_for_timeout(1800); shot(pg, "4-buoi4")
    pg.locator("#bigplay").click() if name == "desk" else pg.touchscreen.tap(*[v for v in (lambda b: (b["x"] + b["width"] / 2, b["y"] + b["height"] / 2))(pg.locator("#bigplay").bounding_box())])
    try:
        pg.wait_for_selector("#vwrap iframe.emb", timeout=8000); print(name, "iframe:", pg.evaluate("document.querySelector('#vwrap iframe.emb').src.split('?')[0]"))
    except Exception as e: print(name, "NO IFRAME", e)
    pg.wait_for_timeout(2500); shot(pg, "5-play")
    pg.context.close()
    pg = new(BASE + "?state=sleep"); pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(4200); shot(pg, "6-sleep")
    pg.context.close(); br.close()

with sync_playwright() as p:
    for n in (["phone", "desk"] if which == "all" else [which]): run(p, n)
print("--- logs ---")
for l in log: print(l)
