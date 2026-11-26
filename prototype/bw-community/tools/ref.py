"""Chụp trang cũ community.html để đối chiếu (server: python -m http.server 8775 --directory <gốc repo>)."""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_ref")
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    br = p.chromium.launch(channel="msedge")
    for name, ctxa in (("desk", dict(viewport={"width": 1672, "height": 941})),
                       ("phone", dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True))):
        c = br.new_context(**ctxa)
        pg = c.new_page()
        pg.goto("http://localhost:8775/community.html")
        pg.wait_for_timeout(6500)
        pg.screenshot(path=f"{OUT}/old-{name}-1.png")
        pg.locator(".orb").nth(2).evaluate("e=>e.click()")
        pg.wait_for_timeout(900)
        pg.screenshot(path=f"{OUT}/old-{name}-2-open.png")
        c.close()
    br.close()
