"""Chụp trang cũ method.html vào _ref/. Cổng 8772."""
import os, sys
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_ref")
BASE = "http://localhost:8772/method.html"
CTX = {"desk": dict(viewport={"width":1672,"height":941}),
       "phone": dict(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)}
def drag(pg, a, b, touch):
    pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move((a[0]+b[0])/2,(a[1]+b[1])/2-30, steps=6); pg.mouse.move(*b, steps=8); pg.mouse.up(); pg.wait_for_timeout(600)
with sync_playwright() as p:
    for name in ("desk","phone"):
        br = p.chromium.launch(channel="msedge"); ctx = br.new_context(**CTX[name]); pg = ctx.new_page()
        pg.goto(BASE, wait_until="commit"); pg.wait_for_timeout(300)
        pg.screenshot(path=f"{OUT}/old-{name}-1-loader.png")
        pg.wait_for_function("window.__method", timeout=20000); pg.wait_for_timeout(1800)
        pg.screenshot(path=f"{OUT}/old-{name}-2-table.png")
        info = pg.evaluate("(()=>{const m=window.__method,L=m.layout();return {s:L.s,dcx:L.dcx,dcy:L.dcy,cubes:m.cubes().map(c=>({id:c.id,sym:c.sym,x:c.x,y:c.y,slot:c.slot}))}})()")
        print(name, info["s"], info["dcx"], info["dcy"])
        # chọn 3 đá cùng ký hiệu (dùng API để mở khoá đá bị che: lấy ba đá, kéo lần lượt)
        pickd = 0
        for sym in ("spiral",):
            for _ in range(3):
                st = pg.evaluate("(()=>{const m=window.__method;return m.cubes().filter(c=>c.sym==='%s'&&c.state==='pile'&&!c.el.classList.contains('covered')).map(c=>({id:c.id,x:c.x,y:c.y}))})()" % sym)
                if not st:
                    # đá bị che: kéo đá phía trên ra bàn trước
                    top = pg.evaluate("(()=>{const m=window.__method;const c=m.cubes().filter(c=>c.state==='pile'&&!c.el.classList.contains('covered')&&c.sym!=='%s')[0];return {x:c.x,y:c.y}})()" % sym)
                    s = info["s"]; drag(pg,(top["x"]*s,top["y"]*s),((top["x"]+60)*s,(top["y"]-150)*s),False); continue
                s=info["s"]; c=st[0]
                drag(pg,(c["x"]*s,c["y"]*s),(info["dcx"]*s,info["dcy"]*s),False)
                if pickd==0: pg.screenshot(path=f"{OUT}/old-{name}-3-onedish.png")
                pickd+=1
        pg.wait_for_timeout(2600); pg.screenshot(path=f"{OUT}/old-{name}-4-reveal.png")
        print(name,"panel", pg.evaluate("window.__method.S.panelOpen"))
        ctx.close(); br.close()
