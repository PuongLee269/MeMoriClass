import os
from playwright.sync_api import sync_playwright
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","_ref")
B="http://localhost:8774/gallery.html"
with sync_playwright() as p:
    for name,kw in (("desk",dict(viewport={"width":1672,"height":941})),("phone",dict(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True))):
        br=p.chromium.launch(channel="msedge");c=br.new_context(**kw);pg=c.new_page()
        pg.goto(B);pg.wait_for_timeout(5000);pg.screenshot(path=f"{OUT}/old-{name}-1.png")
        # chọn 3 viên đá bằng phím: bấm nút gem
        for i in (0,1,2):
            pg.locator(".gem-btn").nth(i).dispatch_event("click");pg.wait_for_timeout(200)
        pg.wait_for_timeout(2500);pg.screenshot(path=f"{OUT}/old-{name}-2.png")
        pg.locator(".view-btn").click();pg.wait_for_timeout(1000);pg.screenshot(path=f"{OUT}/old-{name}-3-lightbox.png")
        br.close()
