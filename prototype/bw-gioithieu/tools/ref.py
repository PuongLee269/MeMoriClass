from playwright.sync_api import sync_playwright
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","_ref")
with sync_playwright() as p:
    for n,c in (("desk",dict(viewport={"width":1672,"height":941})),("phone",dict(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True))):
        b=p.chromium.launch(channel="msedge");ctx=b.new_context(**c);pg=ctx.new_page()
        pg.goto("http://localhost:8771/gioithieu.html");pg.wait_for_timeout(6000);pg.wait_for_timeout(2500)
        pg.screenshot(path=f"{OUT}/{n}.png");b.close()
