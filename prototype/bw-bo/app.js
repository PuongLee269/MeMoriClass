/* Trang Bọ đen trắng (prototype): máy trạng thái Bọ + khung thoại + trả lời câu hỏi. */
(function () {
  'use strict';

  var POSES = ['idle', 'wave', 'talk', 'listen', 'think', 'point', 'happy', 'surprised', 'confused', 'sleep', 'takeoff', 'fly'];
  var NEXT_PAGE = '../bw-map/';
  var IDLE_TO_SLEEP = 25000;
  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === '1';
  var FORCED = params.get('state');
  if (POSES.indexOf(FORCED) < 0) FORCED = null;
  var NOGREET = params.get('nogreet') === '1';
  var reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = function () { return reduceQuery.matches; };

  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), boFx = $('boFx'), boBody = $('boBody'), boHit = $('boHit');
  var imgs = [$('boA'), $('boB')];
  var bubble = $('bubble'), bubbleBody = $('bubbleBody'), boQ = $('boQ'), boSay = $('boSay');
  var form = $('ask'), field = $('question'), veil = $('veil');

  /* ---------- Tải trước 12 ảnh Bọ ---------- */
  var cache = {};
  POSES.forEach(function (p) { var i = new Image(); i.decoding = 'async'; i.src = 'img/bo/' + p + '.webp'; cache[p] = i; });

  /* ---------- Trạng thái Bọ ---------- */
  var current = null, front = 0, base = 'idle', transientTimer = 0, sleepTimer = 0, frozen = !!FORCED, flying = false;

  function show(pose) {
    if (pose === current) return;
    current = pose;
    var next = 1 - front, a = imgs[next], b = imgs[front];
    a.src = 'img/bo/' + pose + '.webp';
    a.classList.add('on'); b.classList.remove('on');
    front = next;
    boFx.parentNode.className = 'bo-pos s-' + pose;
    if (DEBUG) markDebug();
  }
  function settle() { show(base); }
  /* tạm đổi sang một tư thế rồi trả về nền (hoặc gọi then) */
  function flash(pose, ms, then) {
    window.clearTimeout(transientTimer);
    show(pose);
    transientTimer = window.setTimeout(function () { if (then) then(); else settle(); }, ms);
  }
  function setBase(pose) { base = pose; window.clearTimeout(transientTimer); show(pose); }

  /* ---------- Ngủ khi không tương tác ---------- */
  function armSleep() {
    window.clearTimeout(sleepTimer);
    if (frozen || flying) return;
    sleepTimer = window.setTimeout(function () { if (!frozen && !flying) setBase('sleep'); }, IDLE_TO_SLEEP);
  }
  function interact() {
    if (frozen || flying) return;
    if (base === 'sleep') {
      base = 'idle';
      flash('surprised', 600, function () { settle(); });
    }
    armSleep();
  }
  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function (t) { window.addEventListener(t, interact, { passive: true }); });
  window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') interact(); }, { passive: true });

  /* ---------- Khung thoại ---------- */
  var bubbleAnim = null;
  function openBubble() {
    bubble.classList.add('show');
    if (bubbleAnim) bubbleAnim.cancel();
    if (reduce()) { bubbleAnim = bubble.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'ease-out' }); return; }
    var w = bubble.offsetWidth, h = bubble.offsetHeight;
    var origin = (matchMedia('(min-width: 641px)').matches ? (w - 24) : (parseFloat(getComputedStyle(bubble).getPropertyValue('--tail-x')) / 100 * w + 8)) + 'px ' + (h + 28) + 'px';
    var big = Math.hypot(w, h + 40) + 'px';
    bubbleAnim = bubble.animate(
      [{ clipPath: 'circle(0px at ' + origin + ')' }, { clipPath: 'circle(' + big + ' at ' + origin + ')' }],
      { duration: 420, easing: 'ease-out' }
    );
  }
  /* nhận chuỗi chữ + (tùy chọn) phần tử liên kết; chỉ gán bằng textContent */
  function say(text, link, question) {
    boQ.textContent = question || '';
    boSay.replaceChildren();
    boSay.append(document.createTextNode(text || ''));
    if (link) { boSay.append(document.createTextNode(' ')); boSay.append(link); }
    bubbleBody.scrollTop = 0;
    openBubble();
  }
  function sayWait(question) {
    boQ.textContent = question || '';
    boSay.replaceChildren();
    var d = document.createElement('span'); d.className = 'dots'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i></i><i></i><i></i>';
    boSay.append(d);
    openBubble();
  }
  function talkFor(text) {
    var ms = Math.max(1600, Math.min(4500, String(text || '').length * 45));
    base = 'idle';
    flash('talk', ms, function () { settle(); });
  }

  /* ---------- Đường dẫn: nội dung dùng chung viết cho trang gốc, đổi sang đường dẫn của trang mẫu ---------- */
  function fixHref(h) {
    if (!h) return h;
    if (/^(https?:|mailto:|#|\.\.\/)/i.test(h)) return h;
    return '../../' + h;
  }
  function makeMapCard() {
    var a = document.createElement('a');
    a.href = NEXT_PAGE; a.className = 'map-card'; a.dataset.go = '1';
    var img = document.createElement('img');
    img.src = '../../assets/sitemap/map-card.webp'; img.width = 320; img.height = 196; img.alt = '';
    var s = document.createElement('span'); s.textContent = BO_TEXT.mapCardLabel;
    a.append(img, s);
    return a;
  }
  function makeLink(target, label) {
    var a = document.createElement('a');
    a.href = fixHref(target); a.textContent = label || '';
    return a;
  }

  /* ---------- Trả lời câu hỏi (đúng đường của trang gốc) ---------- */
  var SOCIAL = { thanks: 1, greeting: 1, compliment: 1, goodbye: 1 };
  var buildIndex = function () { return BoMatcher.buildAll(typeof BO_FAQ !== 'undefined' ? BO_FAQ : [], typeof BO_REPLIES !== 'undefined' ? BO_REPLIES : []); };
  var replyIndex = buildIndex();
  var isKnownId = function (k) { return (typeof BO_FAQ !== 'undefined' && BO_FAQ.some(function (e) { return e.id === k; })) || BO_REPLIES.some(function (e) { return e.id === k; }); };
  function entryById(id) {
    var f = typeof BO_FAQ !== 'undefined' && BO_FAQ.find(function (e) { return e.id === id; });
    if (f) return { id: id, reply: f.answer, target: f.link && f.link.href, label: f.link && f.link.label, card: false };
    var g = BO_REPLIES.find(function (e) { return e.id === id; });
    return g ? { id: id, reply: g.reply, target: g.link && g.link.href, label: g.link && g.link.label, card: !!g.card } : null;
  }
  document.addEventListener('bo:content', function () {
    replyIndex = buildIndex();
    if (BO_TEXT.placeholder) field.placeholder = BO_TEXT.placeholder;
  });
  function findReply(question) {
    var r = replyIndex.reply(question, (typeof BO_FALLBACK !== 'undefined' && BO_FALLBACK) || '');
    return { id: r.id || null, reply: r.reply, target: r.target, label: r.label, card: r.card, fallback: !r.id && !r.target && r.reply === BO_FALLBACK };
  }
  var replyTimer = 0, asking = 0;

  async function answer(question) {
    var ticket = ++asking, t0 = performance.now();
    base = 'idle';
    flash('think', 60000);
    sayWait(question);
    var found = null;
    if (typeof BoAI !== 'undefined') {
      BoAI.configure(typeof BO_AI !== 'undefined' ? BO_AI : null, MemoriContent.url);
      if (BoAI.canAsk(question)) {
        var res = await BoAI.route(question, isKnownId);
        if (res.ok) {
          found = (res.id && entryById(res.id)) ||
            (res.answer ? { reply: res.answer, target: null, label: null, card: false }
                        : { reply: (typeof BO_FALLBACK !== 'undefined' && BO_FALLBACK) || '', target: null, label: null, card: false, fallback: true });
        }
      }
    }
    if (ticket !== asking) return;
    var r = found || findReply(question);
    var link = null;
    if (r.card) link = makeMapCard();
    else if (r.target) link = makeLink(r.target, r.label);
    var delay = reduce() ? 0 : Math.max(0, 650 - (performance.now() - t0));
    window.clearTimeout(replyTimer);
    replyTimer = window.setTimeout(function () {
      if (ticket !== asking) return;
      say(r.reply, link, question);
      if (r.fallback) { base = 'idle'; flash('confused', 2000, function () { settle(); }); }
      else if (r.id && SOCIAL[r.id]) { base = 'idle'; flash('happy', 1600, function () { settle(); }); }
      else talkFor(r.reply);
      armSleep();
    }, delay);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = field.value.trim();
    if (!q) { say(BO_TEXT.emptyPrompt); field.focus(); return; }
    field.value = '';
    answer(q);
  });

  /* ---------- Nghe khi gõ ---------- */
  var typing = false;
  field.addEventListener('focus', function () { if (frozen || flying) return; interact(); if (current !== 'think') { base = 'listen'; show('listen'); } });
  field.addEventListener('input', function () { typing = true; if (!frozen && !flying && current !== 'think') { base = 'listen'; show('listen'); } });
  field.addEventListener('blur', function () {
    typing = false;
    if (frozen || flying) return;
    if (!field.value.trim() && base === 'listen') { base = 'idle'; if (current === 'listen') settle(); }
  });
  field.addEventListener('keydown', function (e) { if (e.key === 'Escape') field.blur(); });

  /* ---------- Bấm vào Bọ ---------- */
  boHit.addEventListener('click', function () {
    if (frozen || flying) return;
    var prev = base === 'sleep' ? 'idle' : base;
    base = prev;
    flash('happy', 1200, function () { settle(); });
    armSleep();
  });

  /* ---------- Bay sang trang bản đồ ---------- */
  function go() { location.href = NEXT_PAGE; }
  function flyAway(e) {
    if (e) e.preventDefault();
    if (flying) return;
    if (reduce()) { go(); return; }
    flying = true; frozen = true;
    document.body.classList.add('flying');
    window.clearTimeout(sleepTimer);
    window.clearTimeout(transientTimer);
    show('point');
    window.setTimeout(function () {
      show('takeoff');
      window.setTimeout(function () {
        show('fly');
        var vw = innerWidth, vh = innerHeight;
        boFx.getAnimations().forEach(function (a) { a.cancel(); });
        boFx.style.opacity = 1;
        boFx.animate([
          { transform: 'translate(0,0) rotate(0deg) scale(1)', offset: 0 },
          { transform: 'translate(' + (-.12 * vw) + 'px,' + (-.18 * vh) + 'px) rotate(-3deg) scale(.92)', offset: .35 },
          { transform: 'translate(' + (-.55 * vw) + 'px,' + (-.62 * vh) + 'px) rotate(-8deg) scale(.75)', offset: .7 },
          { transform: 'translate(' + (-1.05 * vw) + 'px,' + (-1.1 * vh) + 'px) rotate(-8deg) scale(.6)', offset: 1 }
        ], { duration: 900, easing: 'cubic-bezier(.45,.05,.75,.6)', fill: 'forwards' });
        veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 400, fill: 'forwards', easing: 'ease-in' });
        window.setTimeout(go, 920);
      }, 350);
    }, 500);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-go], #mapBtn, #nextBtn');
    if (a) flyAway(e);
  });
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    flying = false; frozen = !!FORCED; document.body.classList.remove('flying');
    veil.getAnimations().forEach(function (a) { a.cancel(); });
    boFx.getAnimations().forEach(function (a) { a.cancel(); });
    setBase('idle'); armSleep();
  });

  /* ---------- Nút tắt tiếng (chỉ giao diện) ---------- */
  var muteBtn = $('muteBtn');
  muteBtn.addEventListener('click', function () {
    var on = muteBtn.getAttribute('aria-pressed') === 'true';
    muteBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
    muteBtn.setAttribute('aria-label', on ? 'Bật âm thanh' : 'Tắt âm thanh');
  });

  /* ---------- Lệch lớp theo chuột (máy tính) ---------- */
  (function parallax() {
    var fine = matchMedia('(min-width: 641px) and (hover: hover) and (pointer: fine)');
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function tick() {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      var rs = document.documentElement.style; rs.setProperty('--px', cx.toFixed(3)); rs.setProperty('--py', cy.toFixed(3));
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > .002) ? requestAnimationFrame(tick) : 0;
    }
    window.addEventListener('pointermove', function (e) {
      if (!fine.matches || reduce() || e.pointerType !== 'mouse') return;
      tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  })();

  /* ---------- Thanh thử ?debug=1 ---------- */
  var dbgBtns = {};
  function markDebug() { POSES.forEach(function (p) { if (dbgBtns[p]) dbgBtns[p].classList.toggle('on', p === current); }); }
  if (DEBUG) {
    var bar = document.createElement('div'); bar.className = 'dbg';
    POSES.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = p;
      b.addEventListener('click', function () { frozen = true; window.clearTimeout(sleepTimer); setBase(p); });
      dbgBtns[p] = b; bar.append(b);
    });
    document.body.append(bar);
  }

  /* ---------- Khởi động ---------- */
  function readyText() { return Promise.race([BO_READY, new Promise(function (r) { setTimeout(r, 1500); })]); }
  function greetNow() { say(BO_TEXT.greeting, makeMapCard()); }

  if (FORCED) {
    base = FORCED; show(FORCED);
    if (!NOGREET) readyText().then(function () { window.setTimeout(greetNow, 500); });
  } else {
    show('wave'); base = 'idle';
    var greeted = NOGREET ? Promise.resolve() : readyText();
    var t0 = performance.now();
    greeted.then(function () {
      var wait = Math.max(0, 500 - (performance.now() - t0));
      window.setTimeout(function () { if (!NOGREET) greetNow(); }, wait);
    });
    window.setTimeout(function () {
      if (flying || current !== 'wave') return;
      if (NOGREET) { settle(); } else { talkFor(BO_TEXT.greeting); }
      armSleep();
    }, 2200);
  }
})();
