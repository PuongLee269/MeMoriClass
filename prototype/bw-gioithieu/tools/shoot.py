"""Chụp ảnh kiểm trang Giới thiệu. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8771 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8771")
BASE = f"http://localhost:{PORT}/prototype/bw-gioithieu/index.html"
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
    ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
    pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
    pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
    pg.on("response", lambda r: log.append((name, "http%d" % r.status, r.url)) if r.status >= 400 else None)
    shot = lambda tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg.goto(BASE + "?noexit=1", wait_until="commit"); pg.wait_for_timeout(350); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(1800); shot("2-start")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), "mobile", pg.evaluate("window.__gt.MOBILE"))
    # bấm phát: iframe hiện
    if name == "phone": pg.touchscreen.tap(*[(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2) for b in [pg.locator("#bigplay").bounding_box()]][0])
    else: pg.locator("#bigplay").click()
    try:
        pg.wait_for_selector("#vid iframe", timeout=8000); print(name, "iframe:", pg.evaluate("document.querySelector('#vid iframe').src.split('?')[0]"))
    except Exception as e: print(name, "NO IFRAME", e)
    pg.wait_for_timeout(3000); shot("3-play"); print(name, "bo while play", pg.evaluate("window.__gt.bo"), "started", pg.evaluate("window.__gt.PL.started"))
    # đếm ngược khi hết video (mô phỏng, không rời trang)
    pg.evaluate("window.__gt.onEnded()"); pg.wait_for_timeout(500); shot("4-ended")
    pg.locator("#nextX").click(); pg.wait_for_timeout(300)
    print(name, "countdown cancelled:", pg.evaluate("!document.getElementById('next').classList.contains('show')"))
    # cỡ chữ / vùng chạm
    print(name, "fonts", pg.evaluate("""[...document.querySelectorAll('#capT,#capP,.np a,#bar #time,#nextX')].map(e=>(e.id||e.className||e.tagName)+':'+getComputedStyle(e).fontSize).join(' | ')"""))
    print(name, "touch", pg.evaluate("""[...document.querySelectorAll('.np a,.cb,#bigplay,.map-btn')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}).join(' ')"""))
    pg.wait_for_timeout(500)
    ctx.close(); br.close()
    # trang sạch để chụp ngủ
    br = p.chromium.launch(channel="msedge"); ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
    pg.goto(BASE, wait_until="commit"); pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(27000); shot("5-sleep")
    print(name, "bo after idle", pg.evaluate("window.__gt.bo"))
    ctx.close(); br.close()

with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]): run(p, n)
print("LOG:", *log, sep="\n  ")
