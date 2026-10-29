from playwright.sync_api import sync_playwright
from pathlib import Path
import os

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,args=['--no-sandbox'])
 for width,height in [(1440,900),(390,844),(320,568)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce',has_touch=width<700)
  page.set_default_timeout(10000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('https://**/*',lambda route:route.abort())
  page.goto(Path('preview/index.html').resolve().as_uri())
  page.locator('[data-journey="leaf"]').click()
  page.locator('#readyIntro').click()
  for spirit in page.locator('.spirit').all():spirit.dispatch_event('click')
  page.wait_for_selector('#s-fire.active')
  page.locator('#s-fire').click();page.locator('#s-cave').click()
  for _ in range(5):page.locator('#s-cosmos').click()
  page.locator('#introEnroll').click()
  expected=[]
  for i in range(4):
   card=page.locator('.float-card').nth(i)
   expected.append(card.locator('img').get_attribute('src'))
   if width<700:
    card.tap();page.locator('.drop-tile').nth(i).tap()
   else:
    card.focus();page.keyboard.press('Enter');page.locator('.drop-tile').nth(i).click()
   if i<3:assert not page.locator('#storyNext').evaluate('(e)=>e.classList.contains("active")')
  page.wait_for_selector('#storyNext.active')
  assert page.locator('[data-story-frame]').evaluate_all('(els)=>els.map(e=>e.getAttribute("src"))')==expected
  page.locator('#backToFrames').click()
  page.locator('.drop-tile').nth(0).click()
  page.locator('.float-card').nth(0).focus();page.keyboard.press('Enter');page.locator('.drop-tile').nth(0).click()
  page.wait_for_selector('#storyNext.active');page.locator('#meetGuide').click()
  for question in ['Học phí bao nhiêu?','Học mấy buổi?','Xem bài giảng mẫu','abcxyz không biết','<img src=x onerror=alert(1)>']:
   page.locator('#guideQuestion').fill(question);page.locator('#guideForm button').click()
  assert '2.400.000' in page.locator('#guideLog').inner_text()
  assert '4 buổi × 3 giờ' in page.locator('#guideLog').inner_text()
  assert 'chưa có thông tin đã xác nhận' in page.locator('#guideLog').inner_text()
  assert page.locator('#guideLog img').count()==0
  for id in ['classInfo','workshopFilm','exploreContent','journeyEnd']:
   page.locator('.journey-nav a[href="#'+id+'"]').click()
   assert page.locator('#'+id).is_visible()
  page.locator('#loadWorkshop').click();assert 'dzLtrYGiey8' in page.locator('#workshopPlayer iframe').get_attribute('src')
  page.locator('#cutOptions button').nth(1).click();assert page.locator('#cutPlayer iframe').count()==1
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),width
  page.screenshot(path=f'/tmp/journey-{width}.png',full_page=True)
  page.locator('#returnStory').click();page.locator('#backToFrames').click()
  assert page.locator('#top').is_visible()
  assert not errors,errors
  print(f'PASS {width}x{height}: opening, spirits, four photos, order, edit, chat, fallback, safe text, destinations, embeds, no overflow, return; no JS errors')
  page.close()
 browser.close()

