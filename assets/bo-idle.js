/* Bọ: hành vi TĨNH dùng chung (không có dáng nghiêng ngang/profile).
   - Nghỉ = chính diện ("rest"). Thỉnh thoảng (5-12 giây, ngẫu nhiên) có một biểu cảm ngắn rồi về nghỉ:
     chớp mắt (~2/3, đôi khi chớp đôi), hiếm hơn: cười, ngạc nhiên, ngước lên.
   - Khi trang muốn Bọ "nhìn về phía" một thứ: look(-1|+1) dùng dáng quay 3/4 (turnL/turnR), look(0) về nghỉ. look('up') dùng dáng quay lưng (chỉ trang Gallery dùng để nhìn ảnh chiếu).
   - prefers-reduced-motion: chỉ có dáng nghỉ, không biểu cảm, không quay.
   - Tư thế là ảnh đã giải mã sẵn xếp chồng, đổi bằng opacity (không nháy, không mạng sau khi tải). Tạm dừng khi tab ẩn.
   Cách dùng:
     BoIdle.preload()                       -> Promise (tải + giải mã cả bộ; gọi sớm cùng bộ tải trang)
     var ctl = BoIdle.create({every:[5,12]}) -> ctl.pose (tên tư thế hiện tại), ctl.look(dir), ctl.react('laugh',1400), ctl.pause()/resume()/destroy(), ctl.on(fn)
     BoIdle.mount(container, ctl)           -> chèn chồng ảnh vào container (position:relative/absolute) và tự đổi tư thế
     BoIdle.imgs[name] / BoIdle.W,H,FX,FY    -> cho trang vẽ canvas (ảnh 232x276, chân tại (116,266))
   Tên tư thế: rest, turnL, turnR, back, blink, surprised, laugh, lookup. (assets/bo/poses.json, docs/BO_POSES.md) */
(function (root) {
  'use strict';
  var sc = document.currentScript;
  var BASE = sc && sc.src ? sc.src.replace(/bo-idle\.js[^/]*$/, '') : 'assets/';
  var VER = sc && sc.src ? (sc.src.match(/\?v=[\w.]+/) || [''])[0] : '';
  var NAMES = ['rest', 'turnL', 'turnR', 'back', 'blink', 'surprised', 'laugh', 'lookup'];
  var W = 232, H = 276, FX = 116, FY = 266;
  var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(mq && mq.matches); };
  var imgs = {}, loadP = null;
  function url(n) { return BASE + 'bo/pose-' + n + '.webp' + VER; }

  function preload() {
    if (loadP) return loadP;
    loadP = Promise.all(NAMES.map(function (n) {
      return new Promise(function (res) {
        var im = new Image(); im.decoding = 'async';
        var done = function () { imgs[n] = im; res(); };
        im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).then(done, done); };
        im.onerror = function () { res(); };
        im.src = url(n);
      });
    })).then(function () { return imgs; });
    return loadP;
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function create(o) {
    o = o || {};
    var every = o.every || [5, 12];
    var gentle = o.profile === 'gentle', base = gentle ? (o.base || 'turnL') : 'rest';   /* gentle: luôn 3/4 (nghỉ = turnL), biểu cảm tự phát chỉ nhẹ (liếc turnR / ngước), cười + ngạc nhiên chỉ qua react() */
    var lookPose = null, expr = null, cbs = [], tExpr = 0, tNext = 0, paused = false, dead = false, last = base;
    function pose() { return reduced() ? base : (expr || lookPose || base); }
    function emit() { var p = pose(); if (p === last) return; last = p; cbs.forEach(function (f) { try { f(p); } catch (e) {} }); }
    function setExpr(n, ms, then) {
      clearTimeout(tExpr); expr = n; emit();
      tExpr = setTimeout(function () { expr = null; emit(); if (then) then(); }, ms);
    }
    function pick() {
      if (gentle) return Math.random() < 0.72 ? 'turnR' : 'lookup';
      var r = Math.random();
      if (r < 0.66) return 'blink';
      if (r < 0.80) return 'laugh';
      if (r < 0.92) return 'surprised';
      return 'lookup';
    }
    function fire() {
      if (dead || paused || reduced()) return schedule();
      if (lookPose || expr || (root.document && document.hidden)) { tNext = setTimeout(fire, 1500); return; }
      var n = pick();
      if (gentle) setExpr(n, rnd(1800, 2800));
      else if (n === 'blink') {
        setExpr('blink', 150, function () {
          if (Math.random() < 0.18) tExpr = setTimeout(function () { setExpr('blink', 150); }, 140);
        });
      } else setExpr(n, rnd(1100, 1700));
      schedule();
    }
    function schedule() { clearTimeout(tNext); if (dead || paused || reduced()) return; tNext = setTimeout(fire, rnd(every[0], every[1]) * 1000); }
    var api = {
      get pose() { return pose(); },
      on: function (f) { cbs.push(f); return api; },
      /* dir: -1 trái, +1 phải, 0/null về nghỉ, 'up' quay lưng (nhìn ảnh chiếu). Luôn là 3/4 hoặc lưng, KHÔNG BAO GIỜ ngang. */
      look: function (dir) {
        var p = dir === -1 || dir === 'L' ? 'turnL' : dir === 1 || dir === 'R' ? 'turnR' : dir === 'up' ? 'back' : null;
        if (p === lookPose) return api;
        lookPose = p; if (p) { clearTimeout(tExpr); expr = null; } emit(); return api;
      },
      react: function (name, ms) { if (dead || reduced() || NAMES.indexOf(name) < 0) return api; setExpr(name, ms || 1300); return api; },
      pause: function () { paused = true; clearTimeout(tNext); return api; },
      resume: function () { if (paused) { paused = false; schedule(); } return api; },
      destroy: function () { dead = true; clearTimeout(tNext); clearTimeout(tExpr); cbs = []; }
    };
    if (root.document) document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(tNext); else if (!dead && !paused) schedule(); });
    if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (reduced()) { clearTimeout(tExpr); expr = null; emit(); } schedule(); });
    schedule();
    return api;
  }

  /* Xếp chồng ảnh trong container; mỗi ảnh lấp đầy container (tỉ lệ 232:276). Chỉ ảnh hiện tại có opacity 1. */
  function mount(box, ctl, o) {
    o = o || {};
    var els = {};
    function add(n) {
      if (els[n]) return;
      var im = box.querySelector('img[data-pose="' + n + '"]');
      if (!im) { im = document.createElement('img'); im.src = url(n); im.alt = ''; im.draggable = false; im.decoding = 'async'; im.className = 'bo-pose'; im.dataset.pose = n; }
      im.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;opacity:' + (n === (ctl ? ctl.pose : 'rest') ? 1 : 0) + ';pointer-events:none;-webkit-user-drag:none;user-select:none';
      if (!im.parentNode) box.appendChild(im); els[n] = im;
    }
    function show(p) { for (var k in els) els[k].style.opacity = k === p ? 1 : 0; box.dataset.pose = p; }
    add(ctl ? ctl.pose : 'rest');
    var rest = function () { NAMES.forEach(add); show(ctl ? ctl.pose : 'rest'); };
    if (o.lazy === false) rest(); else (loadP || preload()).then(rest);
    if (ctl) ctl.on(show);
    box.dataset.pose = ctl ? ctl.pose : 'rest';
    return { show: show, els: els };
  }

  root.BoIdle = { preload: preload, create: create, mount: mount, imgs: imgs, names: NAMES, url: url, W: W, H: H, FX: FX, FY: FY, reduced: reduced };
})(window);
