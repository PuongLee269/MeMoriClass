"""Chụp ảnh kiểm trang Cộng đồng. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8775 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8775")
BASE = f"http://localhost:{PORT}/prototype/bw-community/index.html"
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
    ctx = br.new_context(**CTX[name])
    pg = ctx.new_page()
    pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
    pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
    pg.on("response", lambda r: log.append((name, "http%d" % r.status, r.url)) if r.status >= 400 else None)
    shot = lambda tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(300); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(1300); shot("2-intro-mid")
    pg.wait_for_timeout(2800); shot("3-done")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), pg.evaluate("window.__cm.state"))
    # mở thẻ hồ sơ qua chạm / bấm
    orb = pg.locator(".orb").nth(2)
    if name == "phone":
        b = orb.bounding_box(); pg.touchscreen.tap(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2)
    else:
        orb.hover(); pg.wait_for_timeout(300); shot("4-hover"); orb.click()
    pg.wait_for_timeout(900); shot("5-open"); print(name, "open idx", pg.evaluate("window.__cm.state.open"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400); print(name, "after Esc", pg.evaluate("window.__cm.state.open"))
    # bàn phím: Tab tới quả cầu, Enter
    pg.evaluate("document.querySelectorAll('.orb')[4].focus()"); pg.keyboard.press("Enter"); pg.wait_for_timeout(700)
    print(name, "kbd open", pg.evaluate("window.__cm.state.open"), "avatar after orb in DOM:", pg.evaluate("document.querySelectorAll('.orb')[4].nextElementSibling.className"))
    shot("6-kbd")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    pg.locator("#replay").click(); pg.wait_for_timeout(500); shot("7-replay")
    print(name, "fonts", pg.evaluate("""['#np a','#replay','#poemBox div','.loader-text'].map(s=>{const e=document.querySelector(s);return s+':'+(e?getComputedStyle(e).fontSize:'-')}).join(' | ')"""))
    print(name, "tap sizes", pg.evaluate("""['#np a','#replay','#mapBtn','.orb'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return s+':'+Math.round(r.width)+'x'+Math.round(r.height)}).join(' | ')"""))
    print(name, "links", pg.evaluate("[...document.querySelectorAll('#np a,#mapBtn')].map(a=>a.getAttribute('href'))"))
    pg.wait_for_timeout(26500); shot("8-sleep"); print(name, "bo", pg.evaluate("window.__cm.state.bo"))
    ctx.close(); br.close()


with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]):
        run(p, n)
print("LOG:", *log, sep="\n  ")
