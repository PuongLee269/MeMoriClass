"""Chụp ảnh kiểm trang Khám phá tác tác phẩm. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8773 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8773")
BASE = f"http://localhost:{PORT}/prototype/bw-khampha/index.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)
which = sys.argv[1] if len(sys.argv) > 1 else "all"
CTX = {
    "phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desk": dict(viewport={"width": 1672, "height": 941}, device_scale_factor=1),
}
log = []

def center(pg, id_):
    return pg.evaluate("""id=>{const s=window.__kp.state.get(id);const r=s.hs.getBoundingClientRect();
      const it=s.it,k=window.__kp.scale;const b=it.bb;return [r.left+r.width/2,r.top+r.height/2]}""", id_)

def run(p, name):
    br = p.chromium.launch(channel="msedge")
    ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
    pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
    pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
    pg.on("response", lambda r: log.append((name, "http%d" % r.status, r.url)) if r.status >= 400 else None)
    shot = lambda tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(350); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(1800); shot("2-main")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), "items", pg.evaluate("window.__kp.items.length"))
    if name == "desk":
        x, y = center(pg, "stage"); pg.mouse.move(x, y); pg.wait_for_timeout(700); shot("3-hover-stage")
        x, y = center(pg, "kiln"); pg.mouse.move(x, y); pg.wait_for_timeout(700); shot("3b-hover-kiln")
        x, y = center(pg, "class"); pg.mouse.click(x, y); pg.wait_for_timeout(800); shot("4-card-class")
        print("card on:", pg.evaluate("document.getElementById('wc').classList.contains('on')"))
        pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
        for _ in range(4): pg.keyboard.press("Tab")
        pg.wait_for_timeout(600); shot("5-tab-focus")
    else:
        x, y = center(pg, "stage"); pg.touchscreen.tap(x, y); pg.wait_for_timeout(800); shot("3-tap-stage")
        pg.evaluate("document.getElementById('view').scrollLeft=0"); pg.wait_for_timeout(300)
        pg.evaluate("document.getElementById('view').scrollLeft=document.getElementById('view').scrollWidth"); pg.wait_for_timeout(300)
        x, y = center(pg, "class")
        pg.evaluate("document.getElementById('view').scrollLeft=600"); pg.wait_for_timeout(300)
        x, y = center(pg, "class"); pg.touchscreen.tap(x, y); pg.wait_for_timeout(900); shot("4-card-class")
        print("card on:", pg.evaluate("document.getElementById('wc').classList.contains('on')"))
        pg.evaluate("document.getElementById('view').scrollLeft=0"); pg.wait_for_timeout(300); shot("5-left")
    print(name, "fonts", pg.evaluate("""[...document.querySelectorAll('.np a,.np-n,#ttl h1,.tip b,.tip span,.tip em,.wc h2,.wc p,.wc-go,.wc-k')].map(e=>(e.className||e.tagName)+':'+getComputedStyle(e).fontSize).join(' | ')"""))
    print(name, "tap sizes", pg.evaluate("""[...document.querySelectorAll('.np a,.map-btn,.wc-x,.wc-go')].map(e=>{const r=e.getBoundingClientRect();return (e.className||e.tagName)+':'+Math.round(r.width)+'x'+Math.round(r.height)}).join(' | ')"""))
    pg.wait_for_timeout(26000); shot("6-sleep")
    print(name, "bo after idle", pg.evaluate("window.__kp.bo"))
    ctx.close(); br.close()

with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]): run(p, n)
print("LOG:", *log, sep="\n  ")
