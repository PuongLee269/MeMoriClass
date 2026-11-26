import os
from playwright.sync_api import sync_playwright
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","_ref")
B="http://localhost:8776/dangky.html"
with sync_playwright() as p:
    for name,kw in (("desk",dict(viewport={"width":1672,"height":941})),("phone",dict(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True))):
        br=p.chromium.launch(channel="msedge");c=br.new_context(**kw);pg=c.new_page()
        pg.goto(B,wait_until="commit");pg.wait_for_timeout(500);pg.screenshot(path=f"{OUT}/old-{name}-1-load.png")
        pg.wait_for_selector("body.go",timeout=25000);pg.wait_for_timeout(6000);pg.screenshot(path=f"{OUT}/old-{name}-2-main.png")
        pg.evaluate("document.querySelector('#zone').click()");pg.wait_for_timeout(2500);pg.screenshot(path=f"{OUT}/old-{name}-3-form.png")
        c.close();br.close()
