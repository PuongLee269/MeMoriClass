/* Bọ nhỏ ở góc mọi trang con: bấm vào là mở khung chat (cùng bộ so khớp với trang Bọ).
   Cách dùng (trước </body>): <script src="assets/bo-widget.js" defer data-corner="bl"></script>
   data-corner: bl|br|tl|tr (mặc định bl); data-corner-m: góc riêng trên điện thoại (<=640px); data-ox / data-oy (và data-ox-m / data-oy-m cho điện thoại): dịch thêm (px, dương = vào trong/lên trên) để tránh điều khiển của trang.
   data-panel="right": trên máy tính khung chat gắn sát mép PHẢI màn hình (hẹp hơn) để không che bàn/đá; trên điện thoại (<=640px) khung là tấm trượt gắn ở ĐẦU màn hình, thấp (data-sheet-max-m, % chiều cao, mặc định 38) để vẫn kéo được vật ở nửa dưới.
   data-size / data-size-m: cỡ Bọ (px) trên máy tính / điện thoại. data-scroll-fade="1": Bọ mờ còn 35% khi đang cuộn trang, trở lại khi dừng (mặc định tắt).
   CHẾ ĐỘ (data-mode): "floating" (mặc định) = Bọ nhỏ ở góc, dùng cho trang CHƯA có Bọ riêng. "attach" = KHÔNG tạo Bọ nhỏ; trang đã có Bọ riêng thì bấm vào chính Bọ đó là mở khung chat. "hit" = chỉ gắn vùng bấm, bấm thì focus một phần tử (index.html: data-activate="#question").
   Chế độ attach/hit: data-target="<selector>" (phần tử có sẵn, kể cả lớp ảnh nướng sẵn), data-inset="l,t,r,b" (tỉ lệ 0..0.5 thu hẹp vùng bấm vào thân Bọ), data-side="top|left|right|edge-left|edge-right" (hướng khung chat so với Bọ; edge-* = khung hẹp sát mép), data-label.
   Trang tự vẽ Bọ (canvas) gọi: (window.boAttachQueue=window.boAttachQueue||[]).push([function(){return {x,y,w,h}|null}, {side, react:function(){...}, onPointer:function(e){...}}]) hoặc window.BoWidget.attachTo(selector|Element|hàm, tuỳ chọn).
   API: BoWidget.open() / close() / toggle() / attachTo(target, {label, inset, side, react, onPointer, onActivate}) -> {button, detach()}. Vùng bấm là <button class="bow-hit"> trong suốt >= 44px, bám theo Bọ mỗi khung hình; thêm ?bodebug=1 vào URL để thấy khung viền.
   Nhẹ: lúc tải trang chỉ có nút + ảnh Bọ nhỏ. bo-matcher.js, content-loader.js, bo.json, bo-replies.json CHỈ tải khi mở chat lần đầu. */
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script || document.querySelector('.bow')) return;
  var BASE = script.src.replace(/bo-widget\.js[^/]*$/, '');       /* .../assets/ */
  var SITE = BASE.replace(/assets\/$/, '');
  var DS = script.dataset;
  var KEY = 'memori.bo.thread';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  var PHONE = window.matchMedia && matchMedia('(max-width:640px)');

  /* Chữ mặc định (sửa ở assets/content/bo.json: widgetTitle, widgetLabel, widgetGreeting, widgetSend, widgetClose, placeholder, fallback). */
  var TEXT = {
    widgetLabel: 'Trò chuyện với Bọ',
    widgetTitle: 'Bọ',
    widgetGreeting: 'Mình là Bọ đây. Bạn muốn hỏi về lớp, lộ trình hay cách đăng ký nào?',
    widgetSend: 'Gửi',
    widgetClose: 'Đóng khung chat',
    emptyPrompt: 'Bạn hãy nhập câu hỏi vào khung rồi gửi nhé.',
    placeholder: 'Hỏi Me.Mori…',
    mapCardLabel: 'Tham quan bản đồ',
    fallback: 'Bọ chưa hiểu ý bạn lắm. Thử hỏi Bọ nhé: "Có những workshop nào?", "Học được gì?" hoặc "Đăng ký thế nào?" hoặc "Bản đồ trang đâu?"'
  };
  var repliesById = Object.create(null);
  /* Thư viện nhỏ dự phòng khi không tải được bo-replies.json. */
  var DEFAULT_REPLIES = [
    { id: 'w_register', keys: ['đăng ký', 'dang ky', 'ghi danh', 'học phí', 'hoc phi'], reply: 'Bạn đăng ký lớp F2 ở trang Đăng ký nhé.', link: { href: 'dangky.html', label: 'Đăng ký lớp' } },
    { id: 'w_roadmap', keys: ['lộ trình', 'lo trinh', 'roadmap', 'chapter'], reply: 'Lộ trình lớp F2 có 4 chapter, mỗi chapter có video và kịch bản.', link: { href: 'roadmap.html', label: 'Xem lộ trình' } },
    { id: 'w_community', keys: ['cộng đồng', 'cong dong', 'thành viên'], reply: 'Mời bạn ghé không gian Cộng đồng ME.MORI.', link: { href: 'community.html', label: 'Vào Cộng đồng' } },
    { id: 'w_gallery', keys: ['gallery', 'thư viện ảnh', 'tác phẩm', 'xem ảnh'], reply: 'Bạn xem ảnh tác phẩm ở Gallery nhé.', link: { href: 'gallery.html', label: 'Mở Gallery' } },
    { id: 'w_method', keys: ['phương pháp', 'phuong phap', 'bàn đá'], reply: 'Kéo ba khối đá cùng ký hiệu vào đĩa để mở một phương pháp dạy học.', link: { href: 'method.html', label: 'Bàn đá Phương pháp' } },
    { id: 'w_intro', keys: ['giới thiệu', 'gioi thieu', 'về mori', 'mori là gì'], reply: 'Xem video giới thiệu Me.Mori ở trang Giới thiệu nhé.', link: { href: 'gioithieu.html', label: 'Xem giới thiệu' } },
    { id: 'w_map', keys: ['bản đồ', 'ban do', 'tham quan', 'sitemap'], reply: 'Bạn bấm vào tấm bản đồ này, Bọ dẫn bạn đi một vòng nhé.', card: true, link: { href: 'sitemap.html', label: 'Tham quan bản đồ' } },
    { id: 'w_hello', keys: ['xin chào', 'chào', 'hello', 'hi', 'bọ ơi'], reply: 'Chào bạn, Bọ đây! Bạn muốn tìm hiểu gì ở ME.MORI Class?' }
  ];

  var PILL = /(^|\/)(?:community|gallery|sitemap|roadmap|dangky|method|gioithieu|lopf1|khampha)\.html(?:$|[?#])/;   /* giống BoMatcher.PILL_RE */
  var SAFE = /^(?:https:\/\/[^\s<>"']+|[\w.%-]+(?:\/[\w.%-]+)*(?:\?[\w=&.%-]*)?(?:#[\w-]*)?)$/;
  var MODE = DS.mode === 'attach' ? 'attach' : (DS.mode === 'hit' ? 'hit' : 'floating');
  var hits = [], anchor = null, raf = 0, DEBUG = /[?&]bodebug\b/.test(location.search);
  var root, btn, panel, log, form, input, titleEl, closeBtn, flyImg, idleBox = null, idleCtl = null;
  var open = false, built = false, loadP = null, engine = null, typeTimer = 0, replyTimer = 0, finishTyping = null;
  var thread = [];

  function load() { try { var j = JSON.parse(sessionStorage.getItem(KEY) || '[]'); return Array.isArray(j) ? j.filter(function (m) { return m && (m.r === 'u' || m.r === 'b') && typeof m.t === 'string'; }).slice(-30) : []; } catch (e) { return []; } }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(thread.slice(-30))); } catch (e) {} }

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

  function setCorner() {
    var c = (PHONE && PHONE.matches && DS.cornerM) || DS.corner || 'bl';
    if (!/^(bl|br|tl|tr)$/.test(c)) c = 'bl';
    root.dataset.corner = c;
    var ph = PHONE && PHONE.matches;
    root.style.setProperty('--bow-ox', (parseInt((ph && DS.oxM) || DS.ox, 10) || 0) + 'px');
    root.style.setProperty('--bow-oy', (parseInt((ph && DS.oyM) || DS.oy, 10) || 0) + 'px');
    root.dataset.face = /r$/.test(c) ? 'l' : 'r';       /* quay mặt vào phía trong trang */
    var sz = parseInt((ph && DS.sizeM) || DS.size, 10);
    if (sz >= 36 && sz <= 120) root.style.setProperty('--bow-size', sz + 'px'); else root.style.removeProperty('--bow-size');
    if (DS.panel === 'right') root.dataset.panel = 'right';
    var sm = parseInt(DS.sheetMaxM, 10);
    if (sm >= 20 && sm <= 76) root.style.setProperty('--bow-sheet-max', sm + 'dvh');
  }

  function build() {
    if (built) return; built = true;
    root = el('div', MODE === 'attach' ? 'bow bow-attach' : 'bow');
    if (MODE !== 'attach') setCorner();
    if (MODE !== 'attach') {      /* trang đã có Bọ riêng (attach) thì KHÔNG tạo Bọ nhỏ */
      btn = el('button', 'bow-bo'); btn.type = 'button';
      btn.setAttribute('aria-label', TEXT.widgetLabel); btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'bow-panel');
      var sh = el('i', 'bow-shadow');
      var art = el('span', 'bow-art');
      var idle = el('span', 'bow-idle'); idle.dataset.pose = 'rest'; idleBox = idle;
      var restImg = el('img', 'bo-pose'); restImg.src = BASE + 'bo/pose-rest.webp'; restImg.width = 232; restImg.height = 276; restImg.alt = ''; restImg.decoding = 'async'; restImg.draggable = false; restImg.dataset.pose = 'rest'; idle.appendChild(restImg);
      var fly = el('span', 'bow-fly'); flyImg = el('img'); flyImg.width = 2448; flyImg.height = 280; flyImg.alt = ''; flyImg.decoding = 'async'; flyImg.draggable = false; fly.appendChild(flyImg);
      art.append(idle, fly);
      btn.append(sh, art, el('i', 'bow-spark'));
    }
    panel = el('section', 'bow-panel'); panel.id = 'bow-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false');
    var head = el('header', 'bow-head');
    titleEl = el('h2', 'bow-title', TEXT.widgetTitle); titleEl.tabIndex = -1; panel.setAttribute('aria-labelledby', 'bow-title'); titleEl.id = 'bow-title';
    closeBtn = el('button', 'bow-x'); closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', TEXT.widgetClose);
    closeBtn.innerHTML = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    head.append(titleEl, closeBtn);
    log = el('div', 'bow-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite'); log.setAttribute('aria-relevant', 'additions text'); log.tabIndex = 0; log.setAttribute('aria-label', TEXT.widgetTitle);
    form = el('form', 'bow-form'); form.setAttribute('autocomplete', 'off');
    input = el('input', 'bow-in'); input.type = 'text'; input.maxLength = 200; input.placeholder = TEXT.placeholder; input.setAttribute('aria-label', TEXT.placeholder); input.enterKeyHint = 'send'; input.autocomplete = 'off'; input.setAttribute('autocapitalize', 'sentences');
    var send = el('button', 'bow-send', TEXT.widgetSend); send.type = 'submit';
    form.append(input, send);
    panel.append(head, log, form);
    if (btn) root.append(btn); root.append(panel);
    document.body.appendChild(root);
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = BASE + 'bo-widget.css' + ((script.src.match(/\?v=[\w.]+/) || [''])[0]);
    css.onload = function () { root.classList.add('is-ready'); };
    css.onerror = function () { root.classList.add('is-ready'); };
    document.head.appendChild(css);
    /* biểu cảm thỉnh thoảng (chớp mắt, cười...) từ assets/bo-idle.js, nạp nhẹ sau khi trang đã tải xong */
    if (idleBox) {
      var startIdle = function () {
        var go = function () { idleCtl = window.BoIdle.create({ every: [5, 12] }); window.BoIdle.mount(idleBox, idleCtl); };
        if (window.BoIdle) return go();
        var js = document.createElement('script'); js.src = BASE + 'bo-idle.js' + ((script.src.match(/\?v=[\w.]+/) || [''])[0]); js.onload = go; document.head.appendChild(js);
      };
      var later = function () { if (window.requestIdleCallback) window.requestIdleCallback(startIdle, { timeout: 2500 }); else setTimeout(startIdle, 400); };
      if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
    }

    /* cô lập sự kiện: bấm/phím/cuộn trong widget không lọt xuống trang (phím cách của trình phát, "bấm ra ngoài"...). pointermove/up KHÔNG chặn để một cú kéo của trang đang diễn ra mà thả ngón tay trên khung vẫn kết thúc đúng. */
    ['pointerdown', 'mousedown', 'touchstart', 'click', 'wheel', 'keydown', 'keyup', 'keypress', 'contextmenu', 'dblclick'].forEach(function (t) {
      root.addEventListener(t, function (e) { if (t === 'keydown' && e.key === 'Escape') { if (open) { e.preventDefault(); close(true); } } e.stopPropagation(); }, { passive: t !== 'keydown' });
    });
    root.querySelectorAll('.bow-panel').forEach(function (p) { p.addEventListener('wheel', function (e) { e.stopPropagation(); }, { passive: true }); });
    if (btn) { btn.addEventListener('click', function () { open ? close(true) : openPanel(); }); btn.addEventListener('pointerenter', warm); btn.addEventListener('focus', warm); }
    closeBtn.addEventListener('click', function () { close(true); });
    form.addEventListener('submit', onSubmit);
    if (DS.scrollFade === '1' || DS.scrollFade === 'true') {
      var idleT = 0, onScroll = function () { root.classList.add('is-scrolling'); window.clearTimeout(idleT); idleT = window.setTimeout(function () { root.classList.remove('is-scrolling'); }, 900); };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    window.addEventListener('resize', function () { if (open) placePanel(); });
    var onMq = function () { if (MODE !== 'attach') setCorner(); else if (open) placePanel(); };
    if (PHONE) { if (PHONE.addEventListener) PHONE.addEventListener('change', onMq); }
    if (window.visualViewport) {
      var vv = window.visualViewport, adj = function () { if (!open || !PHONE.matches) { root.style.removeProperty('--bow-sheet-b'); return; } var b = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); root.style.setProperty('--bow-sheet-b', b + 'px'); };
      vv.addEventListener('resize', adj); vv.addEventListener('scroll', adj);
    }
  }

  function eachBtn(f) { if (btn) f(btn); hits.forEach(function (h) { f(h.btn); }); }
  function warm() { if (flyImg && !flyImg.src) flyImg.src = BASE + 'bo/bo-fly.webp'; }
  function hop() {
    warm();
    if (!btn) return;           /* attach: Bọ của trang tự phản ứng (xem react) */
    if (RM && RM.matches) return;
    root.classList.remove('is-hop'); void root.offsetWidth; root.classList.add('is-hop');
    setTimeout(function () { root.classList.remove('is-hop'); }, 560);
  }

  /* ---- hiển thị tin nhắn ---- */
  function scrollDown() { log.scrollTop = log.scrollHeight; }
  function makeLink(target, label, card) {
    var a;
    if (card) {
      a = el('a', 'map-card'); a.href = 'sitemap.html';
      var im = el('img'); im.src = BASE + 'sitemap/map-card.webp'; im.width = 320; im.height = 196; im.alt = ''; im.loading = 'lazy';
      a.append(im, el('span', '', TEXT.mapCardLabel));
    } else if (target && SAFE.test(target)) {
      a = el('a'); a.href = target; a.textContent = label || target;
      if (PILL.test(target)) { a.classList.add('go-community'); a.textContent = '✦ ' + a.textContent; }
    }
    return a;
  }
  function addRow(role) { var p = el('p', 'bow-msg bow-' + (role === 'u' ? 'user' : 'bot')); log.appendChild(p); while (log.children.length > 30) log.firstElementChild.remove(); scrollDown(); return p; }
  function showMsg(m) {       /* khôi phục tin đã lưu: hiện ngay, không gõ chữ */
    var p = addRow(m.r); p.textContent = m.t;
    if (m.r === 'b' && (m.c || m.h)) { var a = makeLink(m.h, m.l, !!m.c); if (a) { p.append(' ', a); } }
  }
  function userSay(text) { addRow('u').textContent = text; thread.push({ r: 'u', t: text }); save(); }
  function botSay(text, target, label, card) {
    window.clearInterval(typeTimer); if (finishTyping) finishTyping();
    var p = addRow('b'), node = document.createTextNode(''); p.appendChild(node);
    var rec = { r: 'b', t: text }; if (target) { rec.h = target; rec.l = label; } if (card) rec.c = 1;
    thread.push(rec); save();
    var done = function () {
      finishTyping = null; node.data = text;
      var a = (target || card) ? makeLink(target, label, card) : null; if (a) p.append(' ', a);
      log.setAttribute('aria-busy', 'false'); scrollDown();
    };
    if (RM && RM.matches) { done(); return; }
    finishTyping = done; log.setAttribute('aria-busy', 'true');
    var t0 = Date.now(), per = Math.min(24, 2200 / Math.max(1, text.length));   /* theo thời gian thật (trang nặng vẫn gõ kịp), tối đa ~2,2 giây */
    typeTimer = window.setInterval(function () { var i = Math.min(text.length, Math.floor((Date.now() - t0) / per) + 1); node.data = text.slice(0, i); scrollDown(); if (i >= text.length) { window.clearInterval(typeTimer); done(); } }, 24);
  }

  /* ---- nạp thư viện (chỉ khi mở lần đầu) ---- */
  function loadScript(src) { return new Promise(function (res) { var s = document.createElement('script'); s.src = src; s.onload = function () { res(true); }; s.onerror = function () { res(false); }; document.head.appendChild(s); }); }
  function ensureEngine() {
    if (loadP) return loadP;
    loadP = (async function () {
      if (!window.BoMatcher) await loadScript(BASE + 'bo-matcher.js');
      if (!window.MemoriContent) await loadScript(BASE + 'content-loader.js');
      if (!window.BoAI) { try { await loadScript(BASE + 'bo-ai.js'); } catch (e) {} }
      var C = window.MemoriContent, list = null;
      if (C) {
        try {
          var res = await Promise.all([C.prefetch('bo', 4000), C.prefetch('bo-replies', 10000)]);
          var t = res[0];
          if (t && typeof t === 'object') Object.keys(TEXT).forEach(function (k) { if (typeof t[k] === 'string' && t[k].trim()) TEXT[k] = C.clean(t[k], 600); });
          if (t && window.BoAI) BoAI.configure(t.ai, C.url);
          if (res[1] && Array.isArray(res[1].replies)) list = res[1].replies;
        } catch (e) {}
      }
      var entries = window.BoMatcher ? BoMatcher.clean(list || [], C && C.url, 5000) : [];
      if (!entries.length && window.BoMatcher) entries = BoMatcher.clean(DEFAULT_REPLIES, C && C.url, 100);
      engine = window.BoMatcher ? BoMatcher.build(entries) : null;
      entries.forEach(function (entry) { repliesById[entry.id] = entry; });
      applyText();
      return engine;
    })().catch(function () { return null; });
    return loadP;
  }
  function applyText() {
    if (!built) return;
    eachBtn(function (b) { if (!b.dataset.custom) b.setAttribute('aria-label', TEXT.widgetLabel); }); titleEl.textContent = TEXT.widgetTitle; log.setAttribute('aria-label', TEXT.widgetTitle);
    input.placeholder = TEXT.placeholder; input.setAttribute('aria-label', TEXT.placeholder);
    closeBtn.setAttribute('aria-label', TEXT.widgetClose); form.querySelector('.bow-send').textContent = TEXT.widgetSend;
  }

  /* ---- mở / đóng ---- */
  function openPanel() {
    if (open) return; open = true;
    hop();
    panel.hidden = false; placePanel(); void panel.offsetWidth;
    root.classList.add('is-open'); eachBtn(function (b) { b.setAttribute('aria-expanded', 'true'); });
    if (window.visualViewport) window.visualViewport.dispatchEvent(new Event('resize'));
    var first = ensureEngine();
    if (!log.childElementCount) {
      thread = load();
      if (thread.length) { thread.forEach(showMsg); }
      else {
        var g = function () { if (!log.childElementCount) botSay(TEXT.widgetGreeting); };
        first.then(function () { window.setTimeout(g, (RM && RM.matches) ? 0 : 250); });
      }
    }
    window.setTimeout(function () { if (!open) return; if (PHONE && PHONE.matches) { titleEl.focus({ preventScroll: true }); } else { input.focus({ preventScroll: true }); } scrollDown(); }, 60);
  }
  function close(refocus) {
    if (!open) return; open = false;
    root.classList.remove('is-open'); eachBtn(function (b) { b.setAttribute('aria-expanded', 'false'); }); root.style.removeProperty('--bow-sheet-b');
    window.clearTimeout(replyTimer); if (finishTyping) finishTyping(); window.clearInterval(typeTimer);
    window.setTimeout(function () { if (!open) panel.hidden = true; }, (RM && RM.matches) ? 0 : 230);
    var fb = btn || (anchor && anchor.btn);
    if (refocus && fb) { try { fb.focus({ preventScroll: true }); } catch (e) {} }
  }

  function onSubmit(e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) { botSay(TEXT.emptyPrompt); input.focus(); return; }
    userSay(q); input.value = '';
    window.clearTimeout(replyTimer);
    ensureEngine().then(async function (eng) {
      var r = null;
      if (window.BoAI && BoAI.active()) {
        var id = await BoAI.route(q, function (k) { return Object.prototype.hasOwnProperty.call(repliesById, k); });
        var entry = id && repliesById[id];
        if (entry) r = { reply: entry.reply, target: entry.link && entry.link.href, label: entry.link && entry.link.label, card: !!entry.card };
      }
      r = r || (eng && eng.reply(q, TEXT.fallback)) || { reply: TEXT.fallback, target: null, label: null, card: false };
      replyTimer = window.setTimeout(function () { botSay(r.reply, r.target, r.label, r.card); }, (RM && RM.matches) ? 0 : 450);
    });
  }

  /* ---- vị trí khung chat gần Bọ của trang (chế độ attach) ---- */
  function placePanel() {
    if (MODE !== 'attach' || !panel) return;
    var st = panel.style, ph = PHONE && PHONE.matches, r = anchor && anchor.rect;
    st.left = st.top = st.right = st.bottom = st.width = st.maxHeight = '';
    if (ph) {        /* điện thoại: tấm trượt ở phía đối diện Bọ (Bọ ở nửa dưới thì tấm ở đầu màn hình) */
      var topSheet = !!(r && r.y + r.h / 2 > innerHeight * 0.5);
      if (topSheet) { root.dataset.panel = 'right'; root.style.setProperty('--bow-sheet-max', '40dvh'); } else { root.removeAttribute('data-panel'); st.maxHeight = 'min(48dvh, 420px)'; }
      return;
    }
    root.removeAttribute('data-panel');
    var vw = innerWidth, vh = innerHeight, M = 12, side = (anchor && anchor.opts.side) || DS.side || 'top';
    var edge = side === 'edge-right' || side === 'edge-left';
    var pw = edge ? Math.min(320, Math.max(250, Math.round(vw * 0.19))) : Math.min(372, vw - 2 * M);
    var mh = Math.min(edge ? 440 : 520, vh - 2 * M);
    st.width = pw + 'px'; st.maxHeight = mh + 'px';
    if (edge || !r) { if (side === 'edge-left') st.left = '8px'; else st.right = '8px'; st.bottom = M + 'px'; return; }
    var bottomEdge = Math.min(vh - M, r.y + r.h + 8);
    if (side === 'left' && r.x - 12 - pw >= M) { st.left = (r.x - 12 - pw) + 'px'; st.bottom = (vh - bottomEdge) + 'px'; st.maxHeight = Math.min(mh, bottomEdge - M) + 'px'; return; }
    if ((side === 'right' || side === 'left') && r.x + r.w + 12 + pw <= vw - M) { st.left = (r.x + r.w + 12) + 'px'; st.bottom = (vh - bottomEdge) + 'px'; st.maxHeight = Math.min(mh, bottomEdge - M) + 'px'; return; }
    if (side === 'left' && r.x - 12 - pw >= M) { st.left = (r.x - 12 - pw) + 'px'; st.bottom = (vh - bottomEdge) + 'px'; return; }
    var lx = Math.max(M, Math.min(r.x, vw - pw - M));        /* mặc định: phía trên Bọ, không có chỗ thì phía dưới */
    var above = r.y - 10 - M;
    if (above >= 240) { st.left = lx + 'px'; st.bottom = (vh - (r.y - 10)) + 'px'; st.maxHeight = Math.min(mh, above) + 'px'; }
    else if (vh - (r.y + r.h) - 10 - M >= 240) { st.left = lx + 'px'; st.top = (r.y + r.h + 10) + 'px'; st.maxHeight = Math.min(mh, vh - (r.y + r.h) - 10 - M) + 'px'; }
    else { st.left = lx + 'px'; st.bottom = M + 'px'; }
  }

  /* ---- gắn vào Bọ có sẵn của trang: vùng bấm trong suốt bám theo Bọ ---- */
  function updateHit(h) {
    var t = h.target, r = null;
    try {
      if (typeof t === 'function') r = t();
      else {
        var e = h.el;
        if (!e || !e.isConnected) { e = typeof t === 'string' ? document.querySelector(t) : t; h.el = e; }
        if (e) { var b = e.getBoundingClientRect(); if (b.width > 0 && b.height > 0) r = { x: b.left, y: b.top, w: b.width, h: b.height }; }
      }
    } catch (x) { r = null; }
    var s = h.opts.inset;
    if (r && s) r = { x: r.x + r.w * s[0], y: r.y + r.h * s[1], w: r.w * (1 - s[0] - s[2]), h: r.h * (1 - s[1] - s[3]) };
    if (r) { var W = Math.max(44, r.w), H = Math.max(44, r.h); r = { x: r.x - (W - r.w) / 2, y: r.y - (H - r.h) / 2, w: W, h: H }; }   /* vùng chạm >= 44 px */
    h.rect = r;
    var st = h.btn.style;
    if (!r) { if (h.shown !== false) { st.display = 'none'; h.shown = false; } return; }
    if (!h.shown) { st.display = 'block'; h.shown = true; }
    st.transform = 'translate(' + r.x.toFixed(1) + 'px,' + r.y.toFixed(1) + 'px)';
    var w = r.w.toFixed(1) + 'px', hh = r.h.toFixed(1) + 'px';
    if (h.w !== w) { st.width = w; h.w = w; } if (h.h !== hh) { st.height = hh; h.h = hh; }
  }
  function tick() { raf = requestAnimationFrame(tick); for (var i = 0; i < hits.length; i++) updateHit(hits[i]); }
  function defaultReact(h) {      /* nhảy nhẹ: dùng thuộc tính "translate" riêng, không đè animation transform của trang */
    if (RM && RM.matches) return;
    var e = h.el; if (!e || !e.animate) return;
    var d = Math.max(6, Math.round((h.rect ? h.rect.h : 60) * 0.12));
    try { e.animate([{ translate: '0 0' }, { translate: '0 ' + (-d) + 'px', offset: 0.4 }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' }); } catch (x) {}
  }
  function activate(h) {
    anchor = h;
    try { if (h.opts.react) h.opts.react(h); else defaultReact(h); } catch (x) {}
    if (h.opts.onActivate) { h.opts.onActivate(h); return; }
    if (MODE === 'hit') return;
    build();
    if (open) close(true); else openPanel();
  }
  function attachTo(target, o) {
    o = o || {};
    var b = el('button', 'bow-hit'); b.type = 'button';
    b.setAttribute('aria-label', o.label || TEXT.widgetLabel); if (o.label) b.dataset.custom = '1';
    if (!o.onActivate) { b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'bow-panel'); }
    b.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;margin:0;padding:0;border:0;border-radius:14px;background:transparent;z-index:9050;display:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;appearance:none;-webkit-appearance:none;' + (DEBUG ? 'outline:2px solid #ff2bd6;background:#ff2bd633;' : '');
    var h = { btn: b, target: target, opts: o, el: null, rect: null, shown: null };
    hits.push(h);
    b.addEventListener('click', function () { activate(h); });
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { b.addEventListener(t, function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }); });
    if (o.onPointer) ['pointermove', 'pointerdown', 'pointerenter'].forEach(function (t) { b.addEventListener(t, o.onPointer, { passive: true }); });
    document.body.appendChild(b);
    if (!raf) raf = requestAnimationFrame(tick);
    return { button: b, detach: function () { var i = hits.indexOf(h); if (i >= 0) hits.splice(i, 1); b.remove(); } };
  }
  function parseInset(v) { var a = String(v || '').split(',').map(parseFloat); return a.length === 4 && a.every(function (n) { return n >= 0 && n < 0.5; }) ? a : null; }

  function init() {
    if (MODE !== 'hit') build();
    if (MODE !== 'floating' && DS.target) {
      attachTo(DS.target, { inset: parseInset(DS.inset), side: DS.side, label: DS.label,
        onActivate: DS.activate ? function () { var n = document.querySelector(DS.activate); if (n) { try { n.focus(); } catch (e) {} } } : null });
    }
    var Q = window.boAttachQueue;      /* trang tự vẽ Bọ (canvas) đăng ký trước khi widget nạp xong */
    if (Array.isArray(Q)) Q.forEach(function (a) { attachTo(a[0], a[1]); });
    window.boAttachQueue = { push: function (a) { attachTo(a[0], a[1]); } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.BoWidget = {
    mode: MODE,
    open: function () { if (MODE === 'hit') return; build(); if (!anchor && hits.length) anchor = hits[0]; openPanel(); },
    close: function () { close(true); },
    toggle: function () { if (open) close(true); else this.open(); },
    attachTo: attachTo
  };
})();
