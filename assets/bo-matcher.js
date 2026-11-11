/* ME.MORI - bộ so khớp câu trả lời của Bọ (dùng chung: index.html, assets/bo-widget.js, admin.html, test).
   Giữ NGUYÊN luật cũ của index.html:
   - bỏ dấu, chữ thường, chỉ giữ a-z 0-9 và khoảng trắng;
   - khóa khớp cả TỪ (đủ ranh giới từ); khóa dài hơn 4 ký tự còn khớp cả CHUỖI CON;
   - điểm của mục = tổng độ dài các khóa khớp (khóa trùng trong cùng mục cộng nhiều lần);
   - mục exact:true chỉ khớp khi CẢ câu bằng một khóa (điểm 1000), không cộng điểm kiểu thường;
   - hòa điểm -> mục đứng trước thắng; không mục nào có điểm > 0 -> không khớp (null).
   Khác cũ: dựng CHỈ MỤC ngược một lần (build), mỗi câu hỏi tốn O(độ dài câu + số khóa khớp), không còn O(số mục x số khóa).
     - khóa > 4 ký tự: tra theo 5 ký tự đầu (gram5) tại mọi vị trí của câu;
     - khóa <= 4 ký tự: tra theo từ đầu tiên của khóa tại mọi đầu từ, rồi kiểm tra ranh giới từ.
   API: BoMatcher.plain(text) | build(replies) -> {find(q, explain), reply(q, fallback), size, keys} |
        findLinear(replies, q) (bản cũ để đối chiếu/test) | clean(rawList, urlFn, max) | duplicates(replies) | isPagePill(href) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BoMatcher = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function plain(text) {
    return String(text).toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* Trang con có nút viên thuốc (class go-community) + hiệu ứng chuyển trang. */
  var PILL_RE = /(^|\/)(?:community|gallery|sitemap|roadmap|dangky|method|gioithieu|lopf1)\.html(?:$|[?#])/;
  function isPagePill(href) { return typeof href === 'string' && PILL_RE.test(href); }

  /* Bản đối chiếu: đúng từng chữ bộ so khớp cũ trong index.html (O(mục x khóa)). */
  function findLinear(replies, question) {
    var q = ' ' + plain(question) + ' ';
    var best = null, bestScore = 0;
    for (var i = 0; i < replies.length; i++) {
      var entry = replies[i];
      var pk = entry.plainKeys || (entry.plainKeys = entry.keys.map(plain));
      var score = 0;
      if (entry.exact && pk.indexOf(q.trim()) >= 0) score = 1000;
      if (!entry.exact) for (var j = 0; j < pk.length; j++) { var key = pk[j]; if (key && q.indexOf(' ' + key + ' ') >= 0 || (key.length > 4 && q.indexOf(key) >= 0)) score += key.length; }
      if (score > bestScore) { best = entry; bestScore = score; }
    }
    return best ? { entry: best, score: bestScore } : null;
  }

  function build(replies) {
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    var n = replies.length;
    var exact = new Map();          /* khóa đã chuẩn hóa -> [chỉ số mục exact] */
    var recs = new Map();           /* khóa duy nhất (mục thường) -> {k,len,post:[mục,số lần,...],seen} */
    var gram = new Map();           /* 5 ký tự đầu -> [rec] (khóa dài > 4) */
    var word = new Map();           /* từ đầu -> [rec] (khóa <= 4 ký tự) */
    var keyCount = 0;
    for (var i = 0; i < n; i++) {
      var e = replies[i], keys = e.keys || [];
      for (var j = 0; j < keys.length; j++) {
        var k = plain(keys[j]);
        keyCount++;
        if (e.exact) {
          var ex = exact.get(k);
          if (!ex) exact.set(k, ex = []);
          if (ex[ex.length - 1] !== i) ex.push(i);
          continue;
        }
        if (!k) continue;
        var r = recs.get(k);
        if (!r) {
          r = { k: k, len: k.length, post: [], seen: 0 };
          recs.set(k, r);
          var h, m;
          if (k.length > 4) { h = k.slice(0, 5); m = gram; }
          else { var sp = k.indexOf(' '); h = sp < 0 ? k : k.slice(0, sp); m = word; }
          var l = m.get(h);
          if (!l) m.set(h, l = []);
          l.push(r);
        }
        var p = r.post;
        if (p[p.length - 2] === i) p[p.length - 1]++; else p.push(i, 1);
      }
    }
    var scores = new Int32Array(n), touched = [], stamp = 0;

    function add(r, hits) {
      var p = r.post, w = r.len;
      for (var x = 0; x < p.length; x += 2) {
        var ei = p[x];
        if (scores[ei] === 0) touched.push(ei);
        scores[ei] += w * p[x + 1];
      }
      if (hits) hits.push(r);
    }

    /* find(câu hỏi, explain) -> {index, entry, score[, keys, ranking]} hoặc null. explain=true trả thêm khóa khớp và top 5. */
    function find(question, explain) {
      var q = plain(question), qp = ' ' + q + ' ', L = qp.length;
      var hits = explain ? [] : null;
      stamp++;
      touched.length = 0;
      var j, recsAt, x, r;
      var ex = exact.get(q);
      if (ex) for (x = 0; x < ex.length; x++) { if (scores[ex[x]] === 0) touched.push(ex[x]); scores[ex[x]] = 1000; if (hits) hits.push({ k: q, exact: true, post: [ex[x], 1] }); }
      for (j = 1; j + 5 <= L; j++) {                         /* khóa dài: chuỗi con tại vị trí j */
        recsAt = gram.get(qp.substr(j, 5));
        if (recsAt) for (x = 0; x < recsAt.length; x++) { r = recsAt[x]; if (r.seen !== stamp && qp.startsWith(r.k, j)) { r.seen = stamp; add(r, hits); } }
      }
      for (j = 1; j < L - 1; j++) {                          /* khóa ngắn: đủ từ, bắt đầu tại đầu từ */
        if (qp.charCodeAt(j - 1) !== 32) continue;
        var e2 = qp.indexOf(' ', j); if (e2 < 0) e2 = L;
        recsAt = word.get(qp.slice(j, e2));
        if (recsAt) for (x = 0; x < recsAt.length; x++) { r = recsAt[x]; if (r.seen !== stamp && qp.startsWith(r.k, j) && qp.charCodeAt(j + r.len) === 32) { r.seen = stamp; add(r, hits); } }
      }
      var best = -1, bestScore = 0, t;
      for (t = 0; t < touched.length; t++) { var ei = touched[t], s = scores[ei]; if (s > bestScore || (s === bestScore && ei < best)) { best = ei; bestScore = s; } }
      var out = null;
      if (best >= 0 && bestScore > 0) {
        out = { index: best, entry: replies[best], score: bestScore };
        if (explain) {
          out.keys = hits.filter(function (h) { for (var y = 0; y < h.post.length; y += 2) if (h.post[y] === best) return true; return false; }).map(function (h) { return h.k; });
          out.ranking = touched.map(function (ei2) { return { index: ei2, score: scores[ei2] }; }).sort(function (a, b) { return b.score - a.score || a.index - b.index; }).slice(0, 5);
        }
      }
      for (t = 0; t < touched.length; t++) scores[touched[t]] = 0;
      return out;
    }

    /* Giống findReply cũ của index.html. */
    function reply(question, fallback) {
      var m = find(question);
      if (!m) return { reply: fallback || 'Bọ chưa hiểu lắm, bạn hỏi lại giúp mình nhé.', target: null, label: null, card: false, entry: null, score: 0 };
      var en = m.entry;
      return { reply: en.reply, target: en.link && en.link.href, label: en.link && en.link.label, card: !!en.card, entry: en, score: m.score };
    }

    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    return { find: find, reply: reply, size: n, keys: keyCount, uniqueKeys: recs.size + exact.size, buildMs: t1 - t0 };
  }

  /* Lọc/giới hạn danh sách thô (từ JSON) -> mục hợp lệ, cùng luật với assets/bo-replies.js. urlFn = MemoriContent.url (kiểm tra link). */
  function clean(list, urlFn, max) {
    var seen = Object.create(null), out = [];
    if (!Array.isArray(list)) return out;
    max = max || 5000;
    for (var i = 0; i < list.length && out.length < max; i++) {
      var e = list[i];
      if (!e || typeof e.id !== 'string' || seen[e.id] || typeof e.reply !== 'string' || !e.reply.trim() || !Array.isArray(e.keys)) continue;
      var keys = e.keys.filter(function (k) { return typeof k === 'string' && k.trim() && k.length <= 80; }).slice(0, 120);
      if (!keys.length) continue;
      seen[e.id] = 1;
      var o = { id: e.id.slice(0, 60), keys: keys, reply: e.reply };
      if (e.exact === true) o.exact = true;
      if (e.card === true) o.card = true;
      if (e.link && typeof e.link === 'object' && typeof e.link.label === 'string' && e.link.label.trim()) {
        var href = urlFn ? urlFn(e.link.href, '', { hash: true }) : e.link.href;
        if (href) o.link = { href: href, label: e.link.label };
      }
      out.push(o);
    }
    return out;
  }

  /* Cảnh báo cho admin: mục có BỘ KHÓA giống hệt nhau (sau khi bỏ dấu) và khóa nằm ở nhiều mục. */
  function duplicates(replies) {
    var bySet = new Map(), byKey = new Map(), identical = [], shared = [];
    replies.forEach(function (e, i) {
      var ks = Array.from(new Set((e.keys || []).map(plain).filter(Boolean))).sort();
      if (!ks.length) return;
      var sig = (e.exact ? 'x:' : 'n:') + ks.join('|');
      var g = bySet.get(sig); if (!g) bySet.set(sig, g = []); g.push(e.id || String(i));
      ks.forEach(function (k) { var a = byKey.get(k); if (!a) byKey.set(k, a = []); a.push(e.id || String(i)); });
    });
    bySet.forEach(function (ids) { if (ids.length > 1) identical.push(ids); });
    byKey.forEach(function (ids, k) { if (ids.length > 1) shared.push({ key: k, ids: ids }); });
    return { identical: identical, shared: shared };
  }

  return { plain: plain, build: build, findLinear: findLinear, clean: clean, duplicates: duplicates, isPagePill: isPagePill, PILL_RE: PILL_RE };
});
