"""Chụp ảnh kiểm trang Lớp F1. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8767 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8767")
BASE = f"http://localhost:{PORT}/prototype/bw-lopf1/index.html"
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
    pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(350); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(1800); shot("2-item1")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), pg.evaluate("window.__lf.state"))
    # lật giữa chừng
    pg.evaluate("window.__lf.go(1)"); pg.wait_for_timeout(230); shot("3-flip-mid"); pg.wait_for_timeout(1400); shot("4-item2")
    pg.evaluate("window.__lf.go(1)"); pg.wait_for_timeout(700); pg.evaluate("window.__lf.go(1)"); pg.wait_for_timeout(1500); shot("5-video-poster")
    print(name, "idx", pg.evaluate("window.__lf.idx"))
    b = pg.locator(".vplay").bounding_box()
    if name == "phone": pg.touchscreen.tap(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2)
    else: pg.locator(".vplay").click()
    try:
        pg.wait_for_selector(".slot iframe", timeout=8000); print(name, "iframe:", pg.evaluate("document.querySelector('.slot iframe').src.split('?')[0]"))
    except Exception as e: print(name, "NO IFRAME", e)
    pg.wait_for_timeout(2500); shot("6-play")
    # nút / bàn phím
    pg.keyboard.press("ArrowLeft"); pg.wait_for_timeout(900); print(name, "after ArrowLeft idx", pg.evaluate("window.__lf.idx"))
    # cỡ chữ
    print(name, "fonts", pg.evaluate("""[...document.querySelectorAll('#cap,.np a,#ttl h1')].map(e=>e.id||e.className||e.tagName).map((n,i)=>n+':'+getComputedStyle([...document.querySelectorAll('#cap,.np a,#ttl h1')][i]).fontSize).join(' | ')"""))
    pg.wait_for_timeout(26000); shot("7-sleep")
    print(name, "bo after idle", pg.evaluate("window.__lf.state.bo"))
    ctx.close(); br.close()

with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]): run(p, n)
print("LOG:", *log, sep="\n  ")
