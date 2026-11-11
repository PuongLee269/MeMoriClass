/*
 * preload-pages.js - tải nền (prefetch) tài nguyên nặng của các trang KẾ TIẾP khi người xem đang ở trang khác.
 * Nhẹ, không phụ thuộc thư viện. KHÔNG BAO GIỜ prefetch video (mp4/webm/mov/m4v/ogv/m3u8).
 *
 * Cách dùng (chưa nối vào index.html; sẽ làm sau khi roadmap.html vào repo):
 *   <script src="assets/preload-pages.js" defer></script>
 *   <script>
 *     // chạy khi trình duyệt rảnh; bỏ qua nếu bật Tiết kiệm dữ liệu hoặc mạng 2g
 *     window.addEventListener('load', function () {
 *       MemoriPreload.prefetch([
 *         'roadmap.html',                    // trang kế tiếp
 *         'assets/roadmap/bg.webp',          // các lớp ảnh nặng của lộ trình
 *         'assets/roadmap/ground.webp',
 *         'assets/roadmap/scroll.webp',
 *         'assets/roadmap/leafL1.webp', 'assets/roadmap/leafR1.webp',
 *         'assets/roadmap/line.webp', 'assets/roadmap/glow1.webp' // ... glow2-4, poster1-4, ladybug_*.webp
 *       ]);
 *     });
 *   </script>
 * Đang dùng trong index.html: roadmap, dangky, lopf1 (lopf1.html + assets/lopf1/img/{bg,fg,frame,platform,beam,mask*}.webp).
 * Hoặc đặt data-urls trên thẻ script: <script src="assets/preload-pages.js" data-urls="a.webp,b.webp" defer></script>
 * (tự chạy khi có data-urls). Gọi lại nhiều lần an toàn: URL trùng chỉ thêm một lần.
 */
(function () {
  'use strict';
  var VIDEO = /\.(mp4|webm|mov|m4v|ogv|ogg|m3u8|mpd)(\?|#|$)/i;
  var done = {};
  function slow() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
  }
  function add(url) {
    if (done[url] || VIDEO.test(url)) return;
    done[url] = 1;
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = url;
    if (/\.(webp|png|jpe?g|avif|gif|svg)(\?|#|$)/i.test(url)) l.as = 'image';
    else if (/\.woff2?(\?|#|$)/i.test(url)) { l.as = 'font'; l.crossOrigin = 'anonymous'; }
    document.head.appendChild(l);
  }
  function prefetch(urls) {
    if (!urls || !urls.length || slow()) return;
    var list = Array.prototype.slice.call(urls), i = 0;
    function run(dl) {
      // vài file mỗi lượt rảnh, để không chen với tải trang hiện tại
      while (i < list.length && (!dl || dl.timeRemaining() > 4 || dl.didTimeout)) {
        add(list[i++]);
        if (dl && i % 3 === 0) break;
      }
      if (i < list.length) schedule();
    }
    function schedule() {
      if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 4000 });
      else setTimeout(run, 1500);
    }
    schedule();
  }
  window.MemoriPreload = { prefetch: prefetch };
  var me = document.currentScript;
  if (me && me.dataset && me.dataset.urls) {
    var go = function () { prefetch(me.dataset.urls.split(',').map(function (x) { return x.trim(); }).filter(Boolean)); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
  }
})();
