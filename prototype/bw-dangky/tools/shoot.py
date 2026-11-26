"""Chụp ảnh kiểm trang Đăng ký. KHÔNG gửi form. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8776 --directory <gốc repo>)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8776")
BASE = f"http://localhost:{PORT}/prototype/bw-dangky/index.html"
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
    # chặn mọi POST (an toàn: tuyệt đối không gửi form thật)
    posts = []
    pg.route("**/*", lambda route: (posts.append(route.request.url), route.abort()) if route.request.method == "POST" else route.continue_())
    shot = lambda tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(350); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(2500); shot("2-main")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), pg.evaluate("window.__dk.state"))
    # đóng dấu -> mở form (không gửi)
    if name == "phone": pg.touchscreen.tap(*[v for v in (lambda b: (b["x"] + b["width"] / 2, b["y"] + b["height"] / 2))(pg.locator("#zone").bounding_box())])
    else:
        b = pg.locator("#zone").bounding_box(); pg.mouse.move(b["x"] + b["width"] / 2 - 60, b["y"] + b["height"] / 2 - 40); pg.wait_for_timeout(500); shot("3-hover"); pg.mouse.click(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2)
    pg.wait_for_timeout(350); shot("4-stamping"); pg.wait_for_timeout(2200); shot("5-form")
    print(name, "state", pg.evaluate("window.__dk.state"))
    # lỗi xác thực (bấm gửi với ô trống: bị chặn ở bước kiểm trước khi gửi; POST vẫn bị chặn)
    pg.evaluate("document.querySelector('.mf').dispatchEvent(new Event('submit',{cancelable:true}))"); pg.wait_for_timeout(300); shot("6-valid")
    print(name, "errors:", pg.evaluate("[...document.querySelectorAll('.mf .err')].map(e=>e.textContent)"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(600)
    print(name, "closed", pg.evaluate("window.__dk.state.mopen"), "POST blocked:", posts)
    print(name, "fonts", pg.evaluate("""[...document.querySelectorAll('.np a,.price,.limited,.count .lbl,#ttl,.mf label,.mf input,.go')].map(e=>(e.id||e.className||e.tagName)+':'+getComputedStyle(e).fontSize).join(' | ')"""))
    print(name, "np", pg.evaluate("[...document.querySelectorAll('.np a')].map(a=>a.textContent.trim()+' -> '+a.getAttribute('href')+' '+Math.round(a.getBoundingClientRect().height)).join(' | ')"))
    pg.wait_for_timeout(26000); shot("7-sleep")
    print(name, "bo after idle", pg.evaluate("window.__dk.state.bo"))
    ctx.close(); br.close()

with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]): run(p, n)
print("LOG:", *log, sep="\n  ")
