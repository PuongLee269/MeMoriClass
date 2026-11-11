/* Bộ định tuyến AI dùng chung cho chat của Bọ (widget và trang chủ).
   Mặc định TẮT. Chỉ gọi khi từ khóa không khớp; tối đa maxPerSession lần/phiên; câu hỏi cắt 200 ký tự;
   chỉ nhận lại một id có trong danh sách trả lời (isValid). Không hiển thị chữ do AI sinh ra. */
(function () {
  'use strict';
  var KEY = 'memori.bo.ai-count';
  var cfg = { enabled: false, endpoint: '', maxPerSession: 3, timeoutMs: 4500 };
  function configure(ai, urlFn) {
    cfg = { enabled: false, endpoint: '', maxPerSession: 3, timeoutMs: 4500 };
    if (!ai || typeof ai !== 'object') return cfg;
    cfg.enabled = ai.enabled === true;
    cfg.endpoint = typeof ai.endpoint === 'string' && urlFn ? (urlFn(ai.endpoint, '', {}) || '') : '';
    cfg.maxPerSession = Math.max(0, Math.min(10, Number.isFinite(Number(ai.maxPerSession)) ? Number(ai.maxPerSession) : 3));
    cfg.timeoutMs = Math.max(1000, Math.min(8000, Number(ai.timeoutMs) || 4500));
    return cfg;
  }
  function active() { return !!(cfg.enabled && cfg.endpoint); }
  async function route(question, isValid) {
    if (!active()) return null;
    var used = 0;
    try { used = Number(sessionStorage.getItem(KEY)) || 0; } catch (e) { return null; }
    if (used >= cfg.maxPerSession) return null;
    try { sessionStorage.setItem(KEY, String(used + 1)); } catch (e) { return null; }
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, cfg.timeoutMs) : 0;
    try {
      var response = await fetch(cfg.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: String(question).slice(0, 200) }),
        signal: controller ? controller.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      if (!response.ok) return null;
      var data = await response.json();
      return data && typeof data.id === 'string' && isValid(data.id) ? data.id : null;
    } catch (e) { return null; }
    finally { if (timer) window.clearTimeout(timer); }
  }
  window.BoAI = { configure: configure, active: active, route: route };
})();
