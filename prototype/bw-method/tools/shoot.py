"""Chụp ảnh kiểm trang Phương pháp. Chạy: python shoot.py [phone|desk|all]  (server: python -m http.server 8772 --directory D:/MeMoriClass/_bw_images)"""
import os, sys
from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "8772")
BASE = f"http://localhost:{PORT}/prototype/bw-method/index.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)
which = sys.argv[1] if len(sys.argv) > 1 else "all"
CTX = {
    "phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desk": dict(viewport={"width": 1672, "height": 941}, device_scale_factor=1),
}
log = []

INFO = """(()=>{const m=window.__method,L=m.layout();return {s:L.s,land:L.land,dcx:L.dcx,dcy:L.dcy,W:L.W,H:L.H,cx:L.cx,k:L.k,kY:L.kY,ty:L.ty,surfCY:L.surfCY,pileY:L.pileY,c:L.c,
 cubes:m.cubes().map(c=>({id:c.id,sym:c.sym,state:c.state,x:c.x,y:c.y,covered:c.el.classList.contains('covered')}))}})()"""


def drag(pg, a, b, steps=10, hold=False):
    pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 20, steps=steps); pg.mouse.move(*b, steps=steps)
    if not hold:
        pg.mouse.up(); pg.wait_for_timeout(700)


def run(p, name):
    br = p.chromium.launch(channel="msedge")
    ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
    pg.on("console", lambda m: log.append((name, "console." + m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: log.append((name, "pageerror", str(e))))
    pg.on("requestfailed", lambda r: log.append((name, "requestfailed", r.url)))
    pg.on("response", lambda r: log.append((name, "http%d" % r.status, r.url)) if r.status >= 400 else None)
    shot = lambda tag: pg.screenshot(path=os.path.join(OUT, f"{name}-{tag}.png"))
    pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(350); shot("1-load")
    pg.wait_for_function("window.__loaderDone", timeout=20000); pg.wait_for_timeout(1900); shot("2-table")
    print(name, "hscroll ok:", pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"))
    I = pg.evaluate(INFO); s = I["s"]
    # nhấc một khối (đang kéo giữa chừng)
    top = [c for c in I["cubes"] if c["state"] == "pile" and not c["covered"]][0]
    drag(pg, (top["x"] * s, top["y"] * s), ((top["x"] + I["dcx"]) / 2 * s, (top["y"] + I["dcy"]) / 2 * s - 40), hold=True)
    pg.wait_for_timeout(300); shot("3-dragging"); print(name, "bo while drag:", pg.evaluate("window.__method.bo()"))
    pg.mouse.move(I["dcx"] * s, I["dcy"] * s, steps=6); pg.mouse.up(); pg.wait_for_timeout(900)
    # trả khối về (khác ký hiệu sẽ bị trả lại sau)
    # đưa 3 khối cùng ký hiệu vào đĩa (đá bị che thì tạm đặt lên bàn)
    I = pg.evaluate(INFO)
    # khối đầu tiên đã ở đĩa (hoặc đã quay về); xếp lại cho gọn
    pg.click("#reset"); pg.wait_for_timeout(1500)
    sym = "spiral"; done = 0
    if I["land"]:
        park = (I["cx"] + (560 - 700) * I["k"], I["ty"] + 120 * I["kY"])
    else:
        park = (I["c"] * .9 + 10, I["H"] - 50)
    for _ in range(14):
        I = pg.evaluate(INFO)
        if done >= 3: break
        inDish = [c for c in I["cubes"] if c["state"] == "dish"]
        pick = [c for c in I["cubes"] if c["sym"] == sym and c["state"] == "pile" and not c["covered"]]
        if pick:
            c = pick[0]; drag(pg, (c["x"] * s, c["y"] * s), (I["dcx"] * s, I["dcy"] * s)); done += 1
            if done == 2: shot("4-two-on-dish")
            continue
        blockers = [c for c in I["cubes"] if c["sym"] != sym and c["state"] == "pile" and not c["covered"]]
        if not blockers: break
        c = blockers[0]; px, py = park; drag(pg, (c["x"] * s, c["y"] * s), (px * s, py * s)); park = (park[0] + (I["c"] * .3), park[1])
    pg.wait_for_timeout(500); shot("5-merge"); pg.wait_for_timeout(2200); shot("6-panel")
    print(name, "panelOpen", pg.evaluate("window.__method.S.panelOpen"), "bo", pg.evaluate("window.__method.bo()"))
    print(name, "fonts", pg.evaluate("""['#pageTitle','#pTitle','#ptext','.np a','.pill','#hint'].map(q=>{const e=document.querySelector(q);return e?q+':'+getComputedStyle(e).fontSize:q+':-'}).join(' | ')"""))
    print(name, "touch sizes", pg.evaluate("""[...document.querySelectorAll('.np a,.pill,.pclose,.map-btn')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}).join(' ')"""))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(700); shot("7-closed")
    print(name, "panel after Esc", pg.evaluate("window.__method.S.panelOpen"))
    # sai ký hiệu: thả khối khác loại vào đĩa đã có khối
    I = pg.evaluate(INFO); s = I["s"]
    a = [c for c in I["cubes"] if c["state"] == "pile" and not c["covered"]]
    if len(a) >= 2:
        x0 = a[0]; drag(pg, (x0["x"] * s, x0["y"] * s), (I["dcx"] * s, I["dcy"] * s))
        I = pg.evaluate(INFO); other = [c for c in I["cubes"] if c["state"] == "pile" and not c["covered"] and c["sym"] != x0["sym"]]
        if other:
            o = other[0]; drag(pg, (o["x"] * s, o["y"] * s), (I["dcx"] * s, I["dcy"] * s), hold=False); pg.wait_for_timeout(120); shot("8-wrong")
    # bàn phím: Tab tới khối đá, Enter nhấc, mũi tên, Enter thả
    pg.click("#reset"); pg.wait_for_timeout(1600)
    pg.evaluate("document.activeElement&&document.activeElement.blur()")
    pg.keyboard.press("Tab")
    for _ in range(12):
        t = pg.evaluate("document.activeElement.className||document.activeElement.tagName")
        if "cube" in t: break
        pg.keyboard.press("Tab")
    pg.keyboard.press("Enter"); pg.wait_for_timeout(200); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(700)
    print(name, "kb held:", pg.evaluate("!!window.__method.S.held"), "dishD ok")
    pg.keyboard.press("Enter"); pg.wait_for_timeout(900); print(name, "kb dish count", pg.evaluate("window.__method.S.dish.length")); shot("9-keyboard")
    pg.wait_for_timeout(26000); shot("10-sleep"); print(name, "bo after idle", pg.evaluate("window.__method.bo()"))
    ctx.close(); br.close()


with sync_playwright() as p:
    for n in (["desk", "phone"] if which == "all" else [which]): run(p, n)
print("LOG:", *log, sep="\n  ")
