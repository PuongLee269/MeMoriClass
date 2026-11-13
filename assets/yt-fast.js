/* YTFast: tăng tốc phát YouTube (dùng chung cho Lớp F1, Lộ trình, Giới thiệu, Phương pháp).
   - warm(): preconnect tới các máy chủ player, chỉ chạy một lần, chỉ khi có dấu hiệu sắp bấm (hover / chạm / gần màn hình / trang rảnh).
   - prime(id): nạp sẵn file player vào bộ nhớ đệm bằng một iframe ẩn (không autoplay), chỉ khi mạng đủ tốt (không 2G/3G) và không bật tiết kiệm dữ liệu; cancelPrime() gỡ nó nếu người dùng bấm phát khi chưa xong.
   - thumb(id,w): ảnh bìa webp đúng cỡ (i.ytimg.com/vi_webp), có dự phòng.
   - near(el,fn): gọi fn một lần khi el sắp vào màn hình (IntersectionObserver).
   Không có chữ hiển thị; chỉ trả về URL / thao tác DOM. */
(function (g) {
  'use strict';
  var HOSTS = [['https://www.youtube-nocookie.com'], ['https://i.ytimg.com'], ['https://www.google.com'], ['https://fonts.gstatic.com', 1], ['https://www.gstatic.com']];
  var warmed = false, primed = {}, primeEl = null;
  function warm() {
    if (warmed) return; warmed = true;
    try {
      HOSTS.forEach(function (h) {
        var l = document.createElement('link'); l.rel = 'preconnect'; l.href = h[0]; if (h[1]) l.crossOrigin = ''; document.head.appendChild(l);
        var d = document.createElement('link'); d.rel = 'dns-prefetch'; d.href = h[0]; document.head.appendChild(d);
      });
    } catch (e) {}
  }
  function slowNet() {
    var c = navigator.connection; if (!c) return false;
    return !!c.saveData || /(^|-)[23]g$/.test(c.effectiveType || '');
  }
  /* nạp sẵn player vào cache: iframe ẩn, không autoplay; gỡ sau khi tải xong. Bỏ qua khi tiết kiệm dữ liệu / mạng 2G. */
  function prime(id, host) {
    if (!id || primed[id] || slowNet()) return; primed[id] = 1; warm();
    try {
      var f = document.createElement('iframe');
      f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = '';
      f.style.cssText = 'position:fixed;left:-9999px;top:0;width:320px;height:180px;border:0;opacity:0;pointer-events:none';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.src = (host || 'https://www.youtube-nocookie.com') + '/embed/' + encodeURIComponent(id) + '?autoplay=0&playsinline=1&rel=0';
      var rm = function () { setTimeout(function () { if (f.parentNode) f.remove(); }, 1200); };
      f.addEventListener('load', function () { primeEl = null; rm(); }); setTimeout(rm, 15000);
      primeEl = f; document.body.appendChild(f);
    } catch (e) {}
  }
  /* người dùng bấm phát khi iframe nạp sẵn chưa xong: gỡ nó để băng thông dồn cho player thật */
  function cancelPrime() { if (primeEl) { try { primeEl.remove(); } catch (e) {} primeEl = null; } }
  function thumb(id, w) {
    /* hqdefault 4:3 có viền đen trên/dưới: object-fit:cover trong khung 16:9 sẽ cắt đúng phần hình */
    return 'https://i.ytimg.com/vi_webp/' + id + '/' + (w > 480 ? 'maxresdefault' : 'hqdefault') + '.webp';
  }
  function thumbImg(id, w) {
    var im = new Image(); im.decoding = 'async'; im.loading = 'lazy'; im.alt = ''; im.src = thumb(id, w);
    if (w > 480) im.onerror = function () { im.onerror = null; im.src = 'https://i.ytimg.com/vi_webp/' + id + '/hqdefault.webp'; };
    return im;
  }
  function near(el, fn, margin) {
    if (!el) return;
    if (!('IntersectionObserver' in g)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); }
    }, { rootMargin: margin || '300px' });
    io.observe(el);
  }
  /* hover / chạm / lấy nét => warm */
  function intent(el) {
    if (!el) return;
    ['pointerenter', 'touchstart', 'focus', 'pointerdown'].forEach(function (ev) { el.addEventListener(ev, warm, { once: true, passive: true }); });
  }
  g.YTFast = { warm: warm, prime: prime, cancelPrime: cancelPrime, thumb: thumb, thumbImg: thumbImg, near: near, intent: intent };
})(window);
