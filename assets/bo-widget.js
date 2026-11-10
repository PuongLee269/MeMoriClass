/* Bọ nhỏ ở góc mọi trang con: bấm vào là mở khung chat (cùng bộ so khớp với trang Bọ).
   Cách dùng (trước </body>): <script src="assets/bo-widget.js" defer data-corner="bl"></script>
   data-corner: bl|br|tl|tr (mặc định bl); data-corner-m: góc riêng trên điện thoại (<=640px); data-ox / data-oy (và data-ox-m / data-oy-m cho điện thoại): dịch thêm (px, dương = vào trong/lên trên) để tránh điều khiển của trang.
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

  var PILL = /(^|\/)(?:community|gallery|sitemap|roadmap|dangky|method|gioithieu)\.html(?:$|[?#])/;   /* giống BoMatcher.PILL_RE */
  var SAFE = /^(?:https:\/\/[^\s<>"']+|[\w.%-]+(?:\/[\w.%-]+)*(?:\?[\w=&.%-]*)?(?:#[\w-]*)?)$/;
  var root, btn, panel, log, form, input, titleEl, closeBtn, flyImg;
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
  }

  function build() {
    if (built) return; built = true;
    root = el('div', 'bow');
    setCorner();
    btn = el('button', 'bow-bo'); btn.type = 'button';
    btn.setAttribute('aria-label', TEXT.widgetLabel); btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'bow-panel');
    var sh = el('i', 'bow-shadow');
    var art = el('span', 'bow-art');
    var idle = el('img', 'bow-idle'); idle.src = BASE + 'bo/bo-idle-s.webp'; idle.width = 144; idle.height = 144; idle.alt = ''; idle.decoding = 'async'; idle.draggable = false;
    var fly = el('span', 'bow-fly'); flyImg = el('img'); flyImg.width = 2448; flyImg.height = 280; flyImg.alt = ''; flyImg.decoding = 'async'; flyImg.draggable = false; fly.appendChild(flyImg);
    art.append(idle, fly);
    btn.append(sh, art, el('i', 'bow-spark'));
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
    root.append(btn, panel);
    document.body.appendChild(root);
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = BASE + 'bo-widget.css';
    css.onload = function () { root.classList.add('is-ready'); };
    css.onerror = function () { root.classList.add('is-ready'); };
    document.head.appendChild(css);

    /* cô lập sự kiện: bấm/phím/cuộn trong widget không lọt xuống trang (phím cách của trình phát, "bấm ra ngoài"...). pointermove/up KHÔNG chặn để một cú kéo của trang đang diễn ra mà thả ngón tay trên khung vẫn kết thúc đúng. */
    ['pointerdown', 'mousedown', 'touchstart', 'click', 'wheel', 'keydown', 'keyup', 'keypress', 'contextmenu', 'dblclick'].forEach(function (t) {
      root.addEventListener(t, function (e) { if (t === 'keydown' && e.key === 'Escape') { if (open) { e.preventDefault(); close(true); } } e.stopPropagation(); }, { passive: t !== 'keydown' });
    });
    root.querySelectorAll('.bow-panel').forEach(function (p) { p.addEventListener('wheel', function (e) { e.stopPropagation(); }, { passive: true }); });
    btn.addEventListener('click', function () { open ? close(true) : openPanel(); });
    btn.addEventListener('pointerenter', warm); btn.addEventListener('focus', warm);
    closeBtn.addEventListener('click', function () { close(true); });
    form.addEventListener('submit', onSubmit);
    var onMq = function () { setCorner(); };
    if (PHONE) { if (PHONE.addEventListener) PHONE.addEventListener('change', onMq); }
    if (window.visualViewport) {
      var vv = window.visualViewport, adj = function () { if (!open || !PHONE.matches) { root.style.removeProperty('--bow-sheet-b'); return; } var b = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); root.style.setProperty('--bow-sheet-b', b + 'px'); };
      vv.addEventListener('resize', adj); vv.addEventListener('scroll', adj);
    }
  }

  function warm() { if (flyImg && !flyImg.src) flyImg.src = BASE + 'bo/bo-fly.webp'; }
  function hop() {
    warm();
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
      var C = window.MemoriContent, list = null;
      if (C) {
        try {
          var res = await Promise.all([C.prefetch('bo', 4000), C.prefetch('bo-replies', 10000)]);
          var t = res[0];
          if (t && typeof t === 'object') Object.keys(TEXT).forEach(function (k) { if (typeof t[k] === 'string' && t[k].trim()) TEXT[k] = C.clean(t[k], 600); });
          if (res[1] && Array.isArray(res[1].replies)) list = res[1].replies;
        } catch (e) {}
      }
      var entries = window.BoMatcher ? BoMatcher.clean(list || [], C && C.url, 5000) : [];
      if (!entries.length && window.BoMatcher) entries = BoMatcher.clean(DEFAULT_REPLIES, C && C.url, 100);
      engine = window.BoMatcher ? BoMatcher.build(entries) : null;
      applyText();
      return engine;
    })().catch(function () { return null; });
    return loadP;
  }
  function applyText() {
    if (!built) return;
    btn.setAttribute('aria-label', TEXT.widgetLabel); titleEl.textContent = TEXT.widgetTitle; log.setAttribute('aria-label', TEXT.widgetTitle);
    input.placeholder = TEXT.placeholder; input.setAttribute('aria-label', TEXT.placeholder);
    closeBtn.setAttribute('aria-label', TEXT.widgetClose); form.querySelector('.bow-send').textContent = TEXT.widgetSend;
  }

  /* ---- mở / đóng ---- */
  function openPanel() {
    if (open) return; open = true;
    hop();
    panel.hidden = false; void panel.offsetWidth;
    root.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
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
    root.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); root.style.removeProperty('--bow-sheet-b');
    window.clearTimeout(replyTimer); if (finishTyping) finishTyping(); window.clearInterval(typeTimer);
    window.setTimeout(function () { if (!open) panel.hidden = true; }, (RM && RM.matches) ? 0 : 230);
    if (refocus) { try { btn.focus({ preventScroll: true }); } catch (e) {} }
  }

  function onSubmit(e) {
    e.preventDefault();
    var q = input.value.trim().slice(0, 200);
    if (!q) { botSay(TEXT.emptyPrompt); input.focus(); return; }
    userSay(q); input.value = '';
    window.clearTimeout(replyTimer);
    ensureEngine().then(function (eng) {
      var r = eng ? eng.reply(q, TEXT.fallback) : { reply: TEXT.fallback, target: null };
      replyTimer = window.setTimeout(function () { botSay(r.reply, r.target, r.label, r.card); }, (RM && RM.matches) ? 0 : 450);
    });
  }

  function init() { build(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.BoWidget = { open: function () { build(); openPanel(); }, close: function () { close(true); } };
})();
