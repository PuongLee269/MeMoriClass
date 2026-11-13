/* Bộ định tuyến AI dùng chung cho chat của Bọ (widget và trang chủ).
   Mặc định TẮT. Khi bật (ai.enabled + endpoint) AI được hỏi TRƯỚC. Worker (Gemini) làm hai bước theo thứ tự ưu tiên:
   (1) chọn CÂU HỎI CÓ SẴN (FAQ hoặc nhóm dẫn đường) sát nghĩa nhất -> trả {id};
   (2) chỉ khi không có câu nào sát: AI tự trả lời ngắn (<= 60 chữ, chỉ từ dữ kiện đã xác nhận) -> trả {id:null, answer}.
   Giới hạn: câu hỏi tối đa maxQuestionWords từ (49), tối đa maxPerDay lượt/ngày/trình duyệt (50), timeoutMs mặc định 8000.
   route() trả { ok, id, answer? }: ok=true là AI đã trả lời (id null và không có answer = lạc đề/ngoài phạm vi -> câu dự phòng);
   ok=false là AI không dùng được (lỗi/timeout/hết lượt/429) -> nơi gọi rơi về bo-matcher từ khóa rồi câu dự phòng. Không bao giờ ném lỗi, không hiện lỗi. */
(function () {
  'use strict';
  var KEY = 'memori.bo.ai-day';
  var DEF = { enabled: false, endpoint: '', maxPerDay: 50, maxQuestionWords: 49, maxAnswerWords: 60, timeoutMs: 8000 };
  var cfg = Object.assign({}, DEF);
  function num(v, d, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d)); }
  function configure(ai, urlFn) {
    cfg = Object.assign({}, DEF);
    if (!ai || typeof ai !== 'object') return cfg;
    cfg.enabled = ai.enabled === true;
    cfg.endpoint = typeof ai.endpoint === 'string' && urlFn ? (urlFn(ai.endpoint, '', {}) || '') : '';
    cfg.maxPerDay = num(ai.maxPerDay, 50, 0, 50);
    cfg.maxQuestionWords = num(ai.maxQuestionWords, 49, 1, 49);
    cfg.maxAnswerWords = num(ai.maxAnswerWords, 60, 1, 60);
    cfg.timeoutMs = num(ai.timeoutMs || 8000, 8000, 1000, 10000);
    return cfg;
  }
  function active() { return !!(cfg.enabled && cfg.endpoint); }
  function words(s) { var t = String(s || '').trim(); return t ? t.split(/\s+/).length : 0; }
  function today() { return new Date().toISOString().slice(0, 10); }   /* ngày UTC, khớp với Worker */
  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  function readCount() {
    var d = today(), kinds = ['localStorage', 'sessionStorage'];
    for (var i = 0; i < kinds.length; i++) {
      try {
        var st = store(kinds[i]); if (!st) continue;
        var v = String(st.getItem(KEY) || '').split(':');
        return { kind: kinds[i], n: v[0] === d ? (Number(v[1]) || 0) : 0 };
      } catch (e) {}
    }
    return null;
  }
  function writeCount(kind, n) { try { store(kind).setItem(KEY, today() + ':' + n); return true; } catch (e) { return false; } }
  function bump(c) {
    if (writeCount(c.kind, c.n + 1)) return true;
    return c.kind === 'localStorage' && writeCount('sessionStorage', c.n + 1);
  }
  function exhaust() { if (!writeCount('localStorage', 9999)) writeCount('sessionStorage', 9999); }
  /* Câu AI tự viết: chỉ nhận chuỗi, <= maxAnswerWords chữ, <= 700 ký tự; hiển thị bằng textContent (không chèn HTML). */
  function cleanAnswer(a) {
    if (typeof a !== 'string') return '';
    a = a.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
    return a && a.length <= 700 && words(a) <= cfg.maxAnswerWords ? a : '';
  }
  var cache = {}, cacheN = 0;
  function norm(q) { return String(q || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim(); }
  function canAsk(question) {                          /* có đáng hiện trạng thái chờ không (sẽ thật sự gọi AI) */
    if (!active() || !String(question || '').trim() || words(question) > cfg.maxQuestionWords) return false;
    if (Object.prototype.hasOwnProperty.call(cache, norm(question))) return true;
    var c = readCount(); return !!(c && c.n < cfg.maxPerDay);
  }
  async function route(question, isValid) {
    var FAIL = { ok: false, id: null };
    if (!active()) return FAIL;
    if (words(question) > cfg.maxQuestionWords) return FAIL;          /* câu dài: không gọi AI */
    var key = norm(question);
    if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
    var c = readCount();
    if (!c || c.n >= cfg.maxPerDay) return FAIL;
    if (!bump(c)) return FAIL;
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, cfg.timeoutMs) : 0;
    try {
      var response = await fetch(cfg.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: String(question).trim() }),
        signal: controller ? controller.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      if (response.status === 429) { exhaust(); return FAIL; }
      if (!response.ok) return FAIL;
      var data = await response.json();
      if (!data || typeof data !== 'object' || !('id' in data)) return FAIL;
      var id = typeof data.id === 'string' && isValid(data.id) ? data.id : null;
      var res = { ok: true, id: id };
      if (!id) { var ans = cleanAnswer(data.answer); if (ans) res.answer = ans; }   /* câu AI tự trả lời (chỉ khi không có câu sẵn) */
      if (cacheN >= 100) { cache = {}; cacheN = 0; }
      cache[key] = res; cacheN++;
      return res;
    } catch (e) { return FAIL; }
    finally { if (timer) window.clearTimeout(timer); }
  }
  window.BoAI = { configure: configure, active: active, route: route, canAsk: canAsk, words: words };
})();
