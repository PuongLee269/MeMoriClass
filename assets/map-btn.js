/* Nut ban do goc man hinh, dung chung moi trang.
   Cach dung: <script src="assets/map-btn.js" defer></script> (co the them data-corner="tr|br|tl|bl", mac dinh tr)
   Trang dang o sitemap.html thi khong chen nut. */
(function () {
  var s = document.currentScript, base = s ? s.src.replace(/map-btn\.js[^/]*$/, '') : 'assets/';
  if (/(^|\/)sitemap\.html$/.test(location.pathname) || document.querySelector('.map-btn')) return;
  var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = base + 'map-btn.css'; document.head.appendChild(link);
  function add() {
    var a = document.createElement('a');
    a.className = 'map-btn'; a.href = 'sitemap.html'; a.setAttribute('aria-label', 'Bản đồ trang'); a.title = 'Bản đồ trang';
    a.dataset.corner = (s && s.dataset.corner) || 'tr';
    a.innerHTML = '<span class="map-art"><img src="' + base + 'sitemap/map-thumb.webp" width="128" height="83" alt="" decoding="async"><i class="map-star"></i><i class="map-star"></i><i class="map-star"></i><i class="map-star"></i></span><span class="map-tip" aria-hidden="true">Bản đồ trang</span>';
    document.body.appendChild(a);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
