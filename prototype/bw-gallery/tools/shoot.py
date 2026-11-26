"""Chụp ảnh kiểm trang Workshop. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8774 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8774")
BASE = f"http://localhost:{PORT}/prototype/bw-gallery/index.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)
which = sys.argv[1] if len(sys.argv) > 1 else "all"
CTX = {
    "phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desk": dict(viewport={"width": 1672, "height": 941}, device_scale_factor=1),
}
log = []


def center(pg, sel_js):
    return pg.evaluate("(()=>{const r=%s.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()" % sel_js)


def run(p, name):
    br = p.chromium.launch(channel="msedge")
    ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
    pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
    pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
    pg.on("response", lambda r: log.append((name, "http%d" % r.status, r.url)) if r.status >= 400 else None)
    shot = lambda tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(350); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(2600); shot("2-open")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), pg.evaluate("window.__gl.state"))
    gem = lambda i: center(pg, "document.querySelectorAll('.gem')[%d]" % i) if False else pg.evaluate("(()=>{const r=[...document.querySelectorAll('.gem')].filter(e=>e.offsetParent)[%d].getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()" % i)
    # chọn 3 viên đá bằng cách kéo (0 -> 3 -> 6 = kh3)
    pts = [gem(0), gem(3), gem(6)]
    pg.mouse.move(*pts[0]); pg.mouse.down(); pg.mouse.move(*pts[1], steps=6); pg.wait_for_timeout(120)
    shot("3-drag-mid")
    pg.mouse.move(*pts[2], steps=6); pg.mouse.up(); pg.wait_for_timeout(450); shot("4-photo-wipe"); pg.wait_for_timeout(1300); shot("5-photo2")
    print(name, "after drag", pg.evaluate("window.__gl.state"))
    # bộ chưa có ảnh -> nhiễu (0,1,3)
    for i in (0, 1, 4):
        pg.keyboard.press("Tab") if False else None
    pg.evaluate("window.__gl.toggle(0)"); pg.evaluate("window.__gl.toggle(1)"); pg.evaluate("window.__gl.toggle(3)"); pg.wait_for_timeout(260); shot("6-glitch"); pg.wait_for_timeout(1600)
    # lightbox
    pg.locator(".view-btn:visible").click(); pg.wait_for_timeout(700); shot("7-lightbox")
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(500); shot("8-lightbox-next")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    print(name, "lb closed", pg.evaluate("window.__gl.state.lb"))
    print(name, "fonts", pg.evaluate("""[...document.querySelectorAll('.np a,.hint,.lb-cap p')].map(e=>(e.className||e.tagName)+':'+getComputedStyle(e).fontSize).join(' | ')"""))
    print(name, "np sizes", pg.evaluate("[...document.querySelectorAll('.np a,.map-btn,.view-btn .vb-ic')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}).join(' ')"))
    print(name, "gem sizes", pg.evaluate("[...document.querySelectorAll('.gem')].filter(e=>e.offsetParent).slice(0,1).map(e=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)})"))
    pg.wait_for_timeout(26000); shot("9-sleep")
    print(name, "bo after idle", pg.evaluate("window.__gl.state.bo"))
    ctx.close(); br.close()


with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]): run(p, n)
print("LOG:", *log, sep="\n  ")
