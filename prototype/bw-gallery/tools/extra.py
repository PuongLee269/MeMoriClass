"""Kiểm thêm: bàn phím chọn đá, ?freeze=1, resize qua lại hai bố cục."""
import os
from playwright.sync_api import sync_playwright
BASE="http://localhost:8774/prototype/bw-gallery/index.html"
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"shots")
log=[]
with sync_playwright() as p:
    br=p.chromium.launch(channel="msedge")
    pg=br.new_context(viewport={"width":1672,"height":941}).new_page()
    pg.on("console",lambda m:log.append(m.text) if m.type in("error","warning") else None)
    pg.on("response",lambda r:log.append("http%d %s"%(r.status,r.url)) if r.status>=400 else None)
    pg.goto(BASE+"?freeze=1");pg.wait_for_function("window.__loaderDone");pg.wait_for_timeout(800)
    print("freeze state",pg.evaluate("window.__gl.state"))
    pg.locator(".gem").nth(2).focus(); pg.keyboard.press("Enter")
    pg.locator(".gem").nth(5).focus(); pg.keyboard.press("Enter")
    pg.locator(".gem").nth(8).focus(); pg.keyboard.press("Space"); pg.wait_for_timeout(500)
    print("keyboard 2,5,8 ->",pg.evaluate("window.__gl.state"), "live:",pg.evaluate("document.getElementById('live').textContent"))
    pg.screenshot(path=OUT+"/desk-10-freeze-kbd.png")
    pg.set_viewport_size({"width":390,"height":844});pg.wait_for_timeout(500)
    print("resized to phone",pg.evaluate("window.__gl.state"),pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    pg.screenshot(path=OUT+"/phone-10-resized.png")
    pg.set_viewport_size({"width":1280,"height":720});pg.wait_for_timeout(500)
    pg.screenshot(path=OUT+"/desk-11-1280.png")
    # animation freeze: no running animations
    print("running anims",pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length"))
    # chọn bộ chưa có ảnh bằng bàn phím
    for i in (0,1,4): pg.locator(".gem").nth(i).focus(); pg.keyboard.press("Enter")
    pg.wait_for_timeout(300);print("live:",pg.evaluate("document.getElementById('live').textContent"))
    br.close()
print("LOG",log)
