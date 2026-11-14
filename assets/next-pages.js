/* ME.MORI - gợi ý trang kế tiếp theo lộ trình trải nghiệm (thay nút "Về trang Bọ").
   Dùng: <nav class="np" data-next-pages aria-label="Trang gợi ý"></nav> + <script src="assets/next-pages.js" defer></script>
   Tuỳ chọn trên <nav>: data-page="id" (mặc định theo tên file), data-pill (kiểu nút kính của trang), data-home (thêm biểu tượng về trang Bọ, không chữ).
   Dữ liệu: assets/content/journey.json (pages: thứ tự + next = id các trang gợi ý ưu tiên). Chữ chỉ gán bằng textContent. */
(function () {
  'use strict';
  var DEF = { max: 2, pages: [
    { id: 'index', name: 'Trang chủ Bọ', href: 'index.html', next: ['gioithieu'] },
    { id: 'gioithieu', name: 'Giới thiệu', href: 'gioithieu.html', next: ['method', 'roadmap'] },
    { id: 'method', name: 'Phương pháp', href: 'method.html', next: ['roadmap', 'lopf1'] },
    { id: 'roadmap', name: 'Lộ trình Lớp F2', short: 'Lộ trình', href: 'roadmap.html', next: ['lopf1', 'dangky'] },
    { id: 'lopf1', name: 'Lớp F1', href: 'lopf1.html', next: ['khampha', 'dangky'] },
    { id: 'khampha', name: 'Khám phá tác phẩm', short: 'Khám phá', href: 'khampha.html', next: ['gallery', 'dangky'] },
    { id: 'gallery', name: 'Workshop', short: 'Workshop', href: 'gallery.html', next: ['community', 'dangky'] },
    { id: 'community', name: 'Cộng đồng', href: 'community.html', next: ['dangky'] },
    { id: 'dangky', name: 'Đăng ký', href: 'dangky.html', next: ['community', 'gioithieu'] },
    { id: 'sitemap', name: 'Bản đồ trang', href: 'sitemap.html', next: ['gioithieu'] }
  ] };
  var hosts = [].slice.call(document.querySelectorAll('[data-next-pages]'));
  if (!hosts.length) return;
  var CSS = '.np{display:flex;flex-wrap:wrap;align-items:center;gap:0 12px;max-width:var(--np-w,calc(100vw - 110px))}' +
    '.np-fx{position:fixed;left:var(--np-l,max(16px,env(safe-area-inset-left,0px)));top:var(--np-t,max(12px,env(safe-area-inset-top,0px)));z-index:var(--np-z,30)}' +
    '.np a{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;text-decoration:none;-webkit-tap-highlight-color:transparent}' +
    '.np:not([data-pill]) a{padding:0 6px;color:var(--np-c,#f6ecd0);font:500 16px/1 var(--sans,"Be Vietnam Pro",system-ui,sans-serif);text-shadow:var(--np-s,0 1px 3px rgba(0,0,0,.9),0 0 10px rgba(0,0,0,.6))}' +
    '.np:not([data-pill]) a:hover,.np:not([data-pill]) a:focus-visible{color:var(--np-hc,#fff);text-shadow:var(--np-hs,0 1px 3px #000,0 0 14px rgba(255,205,120,.85))}' +
    '.np:not([data-pill]) a:focus-visible{outline:2px solid var(--np-o,#ffd98a);outline-offset:2px;border-radius:6px}' +
    '.np[data-pill] a{padding:0 14px}.np-s{display:none}@media(max-width:480px){.np-n.has-s{display:none}.np-s{display:inline}}.np-ar{font-size:1.05em;line-height:1}.np-home{width:44px;padding:0!important}.np-home svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  var C = window.MemoriContent;
  function pageId(h) {
    if (h.dataset.page) return h.dataset.page;
    var m = location.pathname.match(/([^\/]+?)(?:\.html)?$/); return (m && m[1]) || 'index';
  }
  function safe(href) { return C ? C.url(href, '') : (/^[\w.-]+\.html$/.test(href) ? href : ''); }
  function pick(J, id) {
    var ps = J.pages, cur = null, i, out = [];
    for (i = 0; i < ps.length; i++) if (ps[i] && ps[i].id === id) { cur = ps[i]; break; }
    function byId(x) { for (var k = 0; k < ps.length; k++) if (ps[k] && ps[k].id === x) return ps[k]; return null; }
    ((cur && cur.next) || []).forEach(function (x) { var p = byId(x); if (p && p.id !== id && p.name && safe(p.href) && out.indexOf(p) < 0) out.push(p); });
    if (!out.length && cur) { var n = ps[ps.indexOf(cur) + 1]; if (n && n.name && safe(n.href)) out.push(n); }
    return out.slice(0, Math.max(1, Math.min(4, J.max | 0 || 2)));
  }
  function render(J) {
    hosts.forEach(function (h) {
      var id = pageId(h), pill = h.hasAttribute('data-pill');
      while (h.firstChild) h.removeChild(h.firstChild);
      if (h.hasAttribute('data-home')) {
        var a = document.createElement('a'); a.className = 'np-home'; a.href = 'index.html'; a.setAttribute('aria-label', 'Về trang Bọ');
        if (pill) a.classList.add('pill');
        var ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg'), p = document.createElementNS(ns, 'path');
        s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); p.setAttribute('d', 'M19 12H5M11 6l-6 6 6 6');
        s.appendChild(p); a.appendChild(s); h.appendChild(a);
      }
      pick(J, id).forEach(function (pg) {
        var a = document.createElement('a'), n = document.createElement('span'), r = document.createElement('span');
        a.href = safe(pg.href); if (pill) a.className = 'pill';
        n.textContent = pg.name; if (pg.short) { n.className = 'np-n has-s'; var sh = document.createElement('span'); sh.className = 'np-s'; sh.textContent = pg.short; a.appendChild(sh); } r.className = 'np-ar'; r.textContent = '→'; r.setAttribute('aria-hidden', 'true');
        a.insertBefore(n, a.firstChild); a.appendChild(r); h.appendChild(a);
      });
    });
  }
  function norm(j) { return j && Array.isArray(j.pages) ? j : DEF; }
  render(DEF);
  if (C && C.load) C.load('journey', DEF, { replace: ['pages'] }).then(function (J) { render(norm(J)); }, function () {});
})();
