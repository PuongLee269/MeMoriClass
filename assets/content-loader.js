/* ME.MORI - bộ nạp nội dung dùng chung (assets/content/<tên>.json).
   - Nạp JSON bằng fetch + ?v=<thời gian> (bỏ cache). Lỗi mạng / 404 / file:// / JSON hỏng => dùng mặc định nhúng trong trang.
   - Trộn sâu lên mặc định: chỉ nhận giá trị ĐÚNG KIỂU với mặc định; trường thiếu lấy từ mặc định.
   - Chữ chỉ được gán bằng textContent (KHÔNG innerHTML); đường dẫn qua MemoriContent.url(); ID video qua youtubeId()/vimeoId().
   - Xem trước từ trang admin: thêm ?mcpreview=1 vào địa chỉ trang, bộ nạp sẽ đọc localStorage['memori.preview.<tên>'] (chỉ trong trình duyệt của chính người đó). */
(function (g) {
  'use strict';
  if (g.MemoriContent) return;
  var BASE = 'assets/content/';
  var YT = /^[A-Za-z0-9_-]{11}$/, VM = /^\d{6,12}$/;
  var BAD = { '__proto__': 1, 'constructor': 1, 'prototype': 1 };
  var CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;
  var raw = {}, defs = {};

  function isObj(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
  function clone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
  function clean(s, max) { s = String(s).replace(CTRL, ''); return s.length > (max || 4000) ? s.slice(0, max || 4000) : s; }

  /* Làm sạch giá trị không có mặc định tương ứng (mục thêm mới trong danh sách). */
  function sanitize(v, depth) {
    depth = depth || 0;
    if (depth > 6) return undefined;
    if (typeof v === 'string') return clean(v);
    if (typeof v === 'number') return isFinite(v) ? v : undefined;
    if (typeof v === 'boolean' || v === null) return v;
    if (Array.isArray(v)) return v.slice(0, 500).map(function (x) { return sanitize(x, depth + 1); }).filter(function (x) { return x !== undefined; });
    if (isObj(v)) {
      var o = {};
      Object.keys(v).forEach(function (k) { if (BAD[k]) return; var s = sanitize(v[k], depth + 1); if (s !== undefined) o[k] = s; });
      return o;
    }
    return undefined;
  }

  function findDef(def, item, i) {
    if (isObj(item) && item.id !== undefined) {
      for (var j = 0; j < def.length; j++) if (isObj(def[j]) && def[j].id === item.id) return def[j];
      return undefined;
    }
    return def[i];
  }

  /* merge(mặc định, dữ liệu): trả bản mới, không sửa đầu vào. opts.replace = tên khoá mảng thay hoàn toàn (danh sách thêm/bớt được); opts.max = số phần tử tối đa của mảng (mặc định 500; thư viện Bọ dùng 5000). */
  function merge(def, data, opts, key) {
    if (data === undefined) return clone(def);
    if (def === undefined) return sanitize(data);
    if (Array.isArray(def)) {
      if (!Array.isArray(data)) return clone(def);
      var rep = opts && opts.replace && opts.replace.indexOf(key) >= 0;
      return data.slice(0, (opts && opts.max) || 500).map(function (it, i) {
        var d = rep ? undefined : findDef(def, it, i);
        return d === undefined ? sanitize(it) : merge(d, it, opts, null);
      }).filter(function (x) { return x !== undefined; });
    }
    if (isObj(def)) {
      if (data === null) return clone(def);
      if (!isObj(data)) return clone(def);
      var out = {};
      Object.keys(def).forEach(function (k) { out[k] = merge(def[k], data[k], opts, k); });
      return out;
    }
    if (typeof def === 'string') return typeof data === 'string' ? clean(data) : def;
    if (typeof def === 'number') return typeof data === 'number' && isFinite(data) ? data : def;
    if (typeof def === 'boolean') return typeof data === 'boolean' ? data : def;
    return def;
  }

  /* Địa chỉ an toàn: https://..., đường dẫn tương đối trong site (assets/..., trang.html#neo), tuỳ chọn mailto:. Còn lại trả fallback. */
  function url(v, fallback, o) {
    fallback = fallback === undefined ? '' : fallback;
    if (typeof v !== 'string') return fallback;
    v = v.trim();
    if (!v || v.length > 2000 || /[\u0000-\u001F\u007F\s<>"'`\\]/.test(v)) return fallback;
    if (/^https:\/\/[^\s/]+\.[^\s/]+/i.test(v)) return v;
    if (o && o.mailto && /^mailto:[^\s@]+@[^\s@]+$/i.test(v)) return v;
    if (o && o.hash && /^#[\w-]*$/.test(v)) return v;
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.indexOf('//') === 0 || v.charAt(0) === '/') return fallback;
    if (v.indexOf('..') >= 0) return fallback;
    if (/^[\w.%-]+(\/[\w.%-]+)*(\?[\w=&.%-]*)?(#[\w-]*)?$/.test(v)) return v;
    return fallback;
  }
  function youtubeId(v) {
    if (typeof v !== 'string') return '';
    v = v.trim();
    if (YT.test(v)) return v;
    var m = v.match(/^https:\/\/(?:www\.|m\.|music\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#\/]|$)/i);
    return m ? m[1] : '';
  }
  function vimeoId(v) {
    if (typeof v !== 'string') return '';
    v = v.trim();
    if (VM.test(v)) return v;
    var m = v.match(/^https:\/\/(?:www\.)?(?:vimeo\.com\/(?:channels\/[\w-]+\/|groups\/[\w-]+\/videos\/|video\/)?|player\.vimeo\.com\/video\/)(\d{6,12})(?:[?\/#]|$)/i);
    return m ? m[1] : '';
  }
  /* Nhận link YouTube/Vimeo, trả {provider,id} hoặc null. */
  function parseVideo(v) {
    var y = youtubeId(v); if (y) return { provider: 'youtube', id: y };
    var m = vimeoId(v); if (m && !YT.test(String(v).trim())) return { provider: 'vimeo', id: m };
    if (typeof v === 'string' && VM.test(v.trim())) return { provider: 'vimeo', id: v.trim() };
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function previewData(name) {
    try {
      if (!/[?&]mcpreview=1(&|$)/.test(location.search)) return undefined;
      var s = localStorage.getItem('memori.preview.' + name);
      return s ? JSON.parse(s) : undefined;
    } catch (e) { return undefined; }
  }

  /* Bắt đầu tải sớm (gọi trong <head>); load() dùng lại kết quả. */
  function prefetch(name, timeout) {
    if (raw[name]) return raw[name];
    raw[name] = new Promise(function (resolve) {
      var done = false;
      function fin(v) { if (!done) { done = true; resolve(v); } }
      var pv = previewData(name);
      if (pv !== undefined) return fin(pv);
      if (g.location.protocol === 'file:' || typeof g.fetch !== 'function') return fin(undefined);
      var t = setTimeout(function () { fin(undefined); }, timeout || 2500);
      try {
        g.fetch(BASE + name + '.json?v=' + Date.now(), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw 0; return r.json(); })
          .then(function (j) { clearTimeout(t); fin(j); })
          .catch(function () { clearTimeout(t); fin(undefined); });
      } catch (e) { clearTimeout(t); fin(undefined); }
    });
    return raw[name];
  }

  /* load(tên, mặc định, opts) => Promise<nội dung đã trộn>. Không bao giờ reject. */
  function load(name, defaults, opts) {
    defs[name] = clone(defaults);
    return prefetch(name, opts && opts.timeout).then(function (j) {
      try { return merge(defaults, j, opts); } catch (e) { return clone(defaults); }
    });
  }

  /* Gán chữ vào phần tử (selector hoặc node) bằng textContent; bỏ qua nếu thiếu. */
  function setText(sel, text, root) {
    var el = typeof sel === 'string' ? (root || document).querySelector(sel) : sel;
    if (el && typeof text === 'string') el.textContent = text;
    return el;
  }
  /* Nút "Về trang Bọ" dùng chung: nhãn + đường dẫn từ site.json. */
  function applySite(site, sel) {
    if (!site) return;
    var a = document.querySelector(sel || '[data-site-back]');
    if (!a) return;
    if (typeof site.backLabel === 'string' && site.backLabel.trim()) a.textContent = site.backLabel;
    var h = url(site.backHref, '', { hash: true });
    if (h) a.setAttribute('href', h);
  }
  var SITE_DEFAULT = { backLabel: '← Về trang Bọ', backHref: 'index.html', soundDefault: true, backgroundMusicUrl: '' };

  g.MemoriContent = {
    BASE: BASE, defaults: defs, SITE_DEFAULT: SITE_DEFAULT,
    prefetch: prefetch, load: load, merge: merge, clean: clean, url: url,
    youtubeId: youtubeId, vimeoId: vimeoId, parseVideo: parseVideo, esc: esc,
    setText: setText, applySite: applySite
  };
})(window);
