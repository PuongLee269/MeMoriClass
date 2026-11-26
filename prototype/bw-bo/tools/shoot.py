"""Chụp ảnh kiểm trang Bọ bằng Playwright + Edge. Chạy: python shoot.py [phone|desktop|all]"""
import os, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8765/prototype/bw-bo/index.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)
which = sys.argv[1] if len(sys.argv) > 1 else "all"

CTX = {
    "phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desktop": dict(viewport={"width": 1672, "height": 941}, device_scale_factor=1),
}

def run(p, name):
    br = p.chromium.launch(channel="msedge")
    log = []
    def new_page(url):
        ctx = br.new_context(**CTX[name])
        pg = ctx.new_page()
        pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
        pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url + " " + str(r.failure))))
        pg.route("https://bo-router.**", lambda r: r.abort())
        pg.goto(url)
        return pg
    def shot(pg, tag): pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))

    if name == "phone":
        ctx = br.new_context(**CTX[name]); e = ctx.new_page(); e.route("https://bo-router.**", lambda r: r.abort())
        e.goto(BASE, wait_until="commit"); e.wait_for_load_state("domcontentloaded"); e.wait_for_timeout(150)
        shot(e, "load-early"); ctx.close()
        ctx = br.new_context(**CTX[name], reduced_motion="reduce"); e = ctx.new_page(); e.route("https://bo-router.**", lambda r: r.abort())
        e.goto(BASE); e.wait_for_timeout(1500); shot(e, "reduced")
        print("reduced getAnimations:", e.evaluate("document.getAnimations().length"), e.evaluate("document.getAnimations().map(a=>a.animationName||a.constructor.name)"))
        ctx.close()
    pg = new_page(BASE)
    pg.wait_for_timeout(300); shot(pg, "load")
    pg.wait_for_timeout(3200); shot(pg, "greet")
    ov = pg.evaluate("document.documentElement.scrollWidth <= innerWidth")
    print(name, "no-hscroll:", ov, pg.evaluate("[document.documentElement.scrollWidth, innerWidth]"))
    # gõ
    pg.click("#question")
    pg.keyboard.type("học phí", delay=40)
    pg.wait_for_timeout(300); shot(pg, "typing")
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(250); shot(pg, "thinking")
    pg.wait_for_timeout(1)
    pg.wait_for_timeout(1400); shot(pg, "answer")
    print(name, "answer:", pg.inner_text("#boSay")[:200].replace("\n", " "))
    # câu không hiểu
    pg.fill("#question", "xyzzy qwerty")
    pg.keyboard.press("Enter"); pg.wait_for_timeout(1500); shot(pg, "fallback")
    pg.context.close()

    pg = new_page(BASE + "?state=sleep"); pg.wait_for_timeout(1500); shot(pg, "sleep"); pg.context.close()
    pg = new_page(BASE + "?debug=1"); pg.wait_for_timeout(3000)
    pg.click("#nextBtn")
    pg.wait_for_timeout(1250); shot(pg, "fly")
    pg.context.close()
    br.close()
    return log

with sync_playwright() as p:
    logs = []
    for n in (["phone", "desktop"] if which == "all" else [which]):
        logs += run(p, n)
    print("--- console/page logs ---")
    for l in logs: print(l)
