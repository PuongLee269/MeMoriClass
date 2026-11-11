/* Bộ định tuyến AI dùng chung cho chat của Bọ (widget và trang chủ).
   Mặc định TẮT. Chỉ gọi khi từ khóa không khớp. Giới hạn: câu hỏi tối đa maxQuestionWords từ (mặc định 49),
   tối đa maxPerDay lần/ngày/trình duyệt (mặc định 50). AI không viết chữ: chỉ trả một id có trong danh sách (isValid).
   Hết hạn mức hoặc máy chủ báo 429 thì im lặng, Bọ trả lời bằng từ khóa/câu mặc định. */
(function () {
  'use strict';
  var KEY = 'memori.bo.ai-day';
  var DEF = { enabled: false, endpoint: '', maxPerDay: 50, maxQuestionWords: 49, maxAnswerWords: 29, timeoutMs: 4500 };
  var cfg = Object.assign({}, DEF);
  function num(v, d, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d)); }
  function configure(ai, urlFn) {
    cfg = Object.assign({}, DEF);
    if (!ai || typeof ai !== 'object') return cfg;
    cfg.enabled = ai.enabled === true;
    cfg.endpoint = typeof ai.endpoint === 'string' && urlFn ? (urlFn(ai.endpoint, '', {}) || '') : '';
    cfg.maxPerDay = num(ai.maxPerDay, 50, 0, 50);
    cfg.maxQuestionWords = num(ai.maxQuestionWords, 49, 1, 49);
    cfg.maxAnswerWords = num(ai.maxAnswerWords, 29, 1, 29);
    cfg.timeoutMs = num(ai.timeoutMs || 4500, 4500, 1000, 8000);
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
  async function route(question, isValid) {
    if (!active()) return null;
    if (words(question) > cfg.maxQuestionWords) return null;           /* câu dài: không gọi AI */
    var c = readCount();
    if (!c || c.n >= cfg.maxPerDay) return null;
    if (!bump(c)) return null;
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, cfg.timeoutMs) : 0;
    try {
      var response = await fetch(cfg.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: String(question).trim() }),
        signal: controller ? controller.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      if (response.status === 429) { exhaust(); return null; }
      if (!response.ok) return null;
      var data = await response.json();
      return data && typeof data.id === 'string' && isValid(data.id) ? data.id : null;
    } catch (e) { return null; }
    finally { if (timer) window.clearTimeout(timer); }
  }
  window.BoAI = { configure: configure, active: active, route: route, words: words };
})();
