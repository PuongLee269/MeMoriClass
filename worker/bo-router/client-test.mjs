// Chạy: node --test worker/bo-router/client-test.mjs
// Kiểm logic client (assets/bo-ai.js) nối với Worker thật (index.js) và Gemini GIẢ. Không cần mạng/khóa.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import worker, { clearCache } from './index.js';
import { startMockGemini, makeRateLimitBinding, geminiReply } from './testkit.mjs';

const require = createRequire(import.meta.url);
const BoMatcher = require('../../assets/bo-matcher.js');
const REPLIES = JSON.parse(readFileSync(new URL('../../assets/content/bo-replies.json', import.meta.url), 'utf8')).replies;
const FAQS = BoMatcher.cleanFaq(JSON.parse(readFileSync(new URL('../../assets/content/bo-faq.json', import.meta.url), 'utf8')).faqs, null, 500);
const SRC = readFileSync(new URL('../../assets/bo-ai.js', import.meta.url), 'utf8');
const ids = new Set([...REPLIES.map(r => r.id), ...FAQS.map(f => f.id)]), isValid = k => ids.has(k);
const same = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, m);
const servers = []; after(() => Promise.all(servers.map(s => s.close())));

// Dựng 1 "trình duyệt" giả: window + storage + fetch đi thẳng vào worker.fetch (có Origin hợp lệ).
async function setup(geminiFn, envExtra = {}, aiCfg = {}) {
  clearCache();
  const mock = await startMockGemini(geminiFn); servers.push(mock);
  const env = { RATE_LIMIT: makeRateLimitBinding(), GEMINI_API_KEY: 'k', GEMINI_BASE_URL: mock.url, LIMITER: '100000', ...envExtra };
  const mem = {}, store = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
  const stats = { fetches: 0 };
  const win = { localStorage: store, sessionStorage: store, setTimeout, clearTimeout };
  const sandbox = {
    window: win, AbortController, console, Date, Promise, Object, Number, Math, String, JSON, Error, RegExp,
    fetch: (url, opts) => {
      stats.fetches++;
      return new Promise((resolve, reject) => {
        if (opts.signal) opts.signal.addEventListener('abort', () => reject(Object.assign(new Error('abort'), { name: 'AbortError' })));
        worker.fetch(new Request(url, { method: opts.method, headers: { ...opts.headers, origin: 'https://moriclass.com', 'cf-connecting-ip': '5.5.5.5' }, body: opts.body, signal: opts.signal }), env).then(resolve, reject);
      });
    }
  };
  vm.runInNewContext(SRC, sandbox);
  const ai = win.BoAI;
  ai.configure({ enabled: true, endpoint: 'x', ...aiCfg }, (u) => 'https://worker.test/' + u);
  return { ai, mock, stats, mem };
}
const ok = id => () => ({ json: geminiReply(JSON.stringify({ id })) });

test('AI trả id hợp lệ -> {ok:true,id}; đúng ý định dù từ khóa đánh lừa', async () => {
  const { ai } = await setup(ok('faq-02'));
  const q = 'học phí xong rồi mình có học được gì';
  same(await ai.route(q, isValid), { ok: true, id: 'faq-02' });
  assert.equal(BoMatcher.build(REPLIES).find(q).entry.id, 'price');   // bộ từ khóa sẽ hiểu sai thành hỏi học phí
});
test('AI trả none (lạc đề) -> ok:true,id:null (nơi gọi dùng câu dự phòng, không dùng từ khóa)', async () => {
  const { ai } = await setup(ok('none'));
  same(await ai.route('thời tiết hôm nay', isValid), { ok: true, id: null });
});
test('id không có trong danh sách của trang -> ok:true,id:null', async () => {
  const { ai } = await setup(ok('faq-23'));
  same(await ai.route('x', k => k === 'zzz'), { ok: true, id: null });
});
test('lỗi Gemini 500 / 429 / rỗng -> ok:false (rơi về từ khóa), không ném lỗi', async () => {
  for (const fn of [() => ({ status: 500, json: {} }), () => ({ status: 429, json: {} }), () => ({ json: { candidates: [] } })]) {
    const { ai } = await setup(fn);
    same(await ai.route('học phí', isValid), { ok: false, id: null });
  }
});
test('timeout: Gemini chậm hơn timeoutMs -> ok:false đúng hạn', async () => {
  const { ai } = await setup(() => ({ delayMs: 4000, json: geminiReply('{"id":"faq-23"}') }), { GEMINI_TIMEOUT_MS: '20000' }, { timeoutMs: 1000 });
  const t0 = Date.now(); const r = await ai.route('chậm', isValid);
  same(r, { ok: false, id: null }); assert.ok(Date.now() - t0 < 2500);
});
test('429 từ Worker (hết hạn mức IP) -> ok:false và client ngừng gọi cả ngày', async () => {
  const { ai, stats } = await setup(ok('faq-23'), { AI_DAILY_PER_IP: '1' });
  assert.equal((await ai.route('một', isValid)).ok, true);
  assert.equal((await ai.route('hai', isValid)).ok, false);   // Worker 429
  const n = stats.fetches;
  assert.equal((await ai.route('ba', isValid)).ok, false); assert.equal(stats.fetches, n);   // không gọi thêm
  assert.equal(ai.canAsk('bốn'), false);
});
test('câu >= 50 từ: không gọi mạng; 49 từ vẫn gọi', async () => {
  const { ai, stats } = await setup(ok('faq-23'));
  const w = n => Array.from({ length: n }, (_, i) => 'từ' + i).join(' ');
  assert.equal(ai.canAsk(w(50)), false); assert.equal((await ai.route(w(50), isValid)).ok, false); assert.equal(stats.fetches, 0);
  assert.equal(ai.canAsk(w(49)), true); assert.equal((await ai.route(w(49), isValid)).ok, true); assert.equal(stats.fetches, 1);
});
test('hạn mức 50 lượt/ngày/trình duyệt: lượt 51 không gọi mạng', async () => {
  const { ai, stats, mock } = await setup(ok('faq-23'));
  for (let i = 0; i < 50; i++) assert.equal((await ai.route('câu ' + i, isValid)).ok, true);
  assert.equal(stats.fetches, 50);
  same(await ai.route('câu 51', isValid), { ok: false, id: null }); assert.equal(stats.fetches, 50); assert.equal(mock.calls.length, 50);
});
test('cache phía client: câu lặp (chuẩn hóa) không gọi mạng và không tốn lượt', async () => {
  const { ai, stats } = await setup(ok('faq-23'));
  await ai.route('Học phí bao nhiêu?', isValid);
  same(await ai.route('  học PHÍ bao nhiêu  ', isValid), { ok: true, id: 'faq-23' });
  assert.equal(stats.fetches, 1);
});
test('AI tắt (enabled=false) -> ok:false, không gọi mạng', async () => {
  const { ai, stats } = await setup(ok('faq-23'), {}, { enabled: false });
  assert.equal(ai.canAsk('giá'), false); assert.equal((await ai.route('giá', isValid)).ok, false); assert.equal(stats.fetches, 0);
});
test('khi AI lỗi, bộ từ khóa (FAQ sinh từ câu hỏi + nhóm cũ) vẫn trả lời; không khớp thì ra câu dự phòng', async () => {
  const idx = BoMatcher.buildAll(FAQS, REPLIES);
  assert.equal(idx.find('học phí bao nhiêu').entry.id, 'faq-23');
  assert.equal(idx.find('cọc 300k có hoàn không').entry.id, 'faq-43');
  assert.equal(idx.reply('xyzabc qwerty', 'FALLBACK').reply, 'FALLBACK');
});
test('từ khóa dự phòng: mỗi câu hỏi mẫu của FAQ trả về đúng FAQ của nó (trừ câu là chuỗi con của câu FAQ khác)', () => {
  const idx = BoMatcher.buildAll(FAQS, REPLIES); const miss = [];
  for (const f of FAQS) for (const q of f.questions) { if (q.length > 80) continue; const m = idx.find(q); if (!m || m.entry.id !== f.id) miss.push(f.id + ' | ' + q + ' -> ' + (m && m.entry.id)); }
  const total = FAQS.reduce((a, f) => a + f.questions.length, 0);
  assert.ok(miss.length / total <= 0.05, miss.length + '/' + total + ' sai:\n' + miss.join('\n'));
});
test('FAQ ưu tiên hơn nhóm cũ ở dự phòng từ khóa; nhóm cũ không mâu thuẫn FAQ về giá', () => {
  const idx = BoMatcher.buildAll(FAQS, REPLIES);
  for (const [q, id] of [['học phí', 'price'], ['giá', 'price'], ['ưu đãi', 'discount'], ['hoàn tiền', 'refund'], ['địa chỉ', 'location'], ['lịch học', 'schedule']]) {
    const m = idx.find(q); assert.equal(m.entry.id, id, q);
    assert.ok(!/chưa (thấy|có thông tin)/.test(m.entry.reply) || ['refund', 'schedule', 'location'].includes(id), q);
  }
  assert.match(idx.find('học phí').entry.reply, /2\.400\.000đ/);
  assert.equal(idx.find('học phí bao nhiêu').entry.id, 'faq-23');   // câu hỏi cụ thể: FAQ thắng nhóm cũ
});
test('AI không có câu sẵn nhưng tự trả lời -> {ok:true,id:null,answer}; câu hợp lệ mới được nhận', async () => {
  const fn = body => JSON.stringify(body.systemInstruction).includes('DỮ KIỆN ĐÃ XÁC NHẬN') ? { json: geminiReply('{"kind":"answer","answer":"Lớp có tối đa 6 bạn và học trực tiếp nhé."}') } : { json: geminiReply('{"id":"none"}') };
  const { ai } = await setup(fn);
  same(await ai.route('lớp có nhỏ không', isValid), { ok: true, id: null, answer: 'Lớp có tối đa 6 bạn và học trực tiếp nhé.' });
  same(await ai.route('Lớp có nhỏ không', isValid), { ok: true, id: null, answer: 'Lớp có tối đa 6 bạn và học trực tiếp nhé.' });   // cache
});
test('client không tin Worker mù quáng: answer sai kiểu / quá dài / quá nhiều chữ bị bỏ (ok:true, id:null, không answer)', async () => {
  const { ai } = await setup(ok('none'));
  const realFetch = ai; void realFetch;
  for (const bad of [123, { a: 1 }, 'x'.repeat(701), Array.from({ length: 61 }, (_, i) => 'w' + i).join(' ')]) {
    const { ai: a2 } = await setup(() => ({ json: geminiReply('{"id":"none"}') }));
    // gọi trực tiếp BoAI với fetch giả trả answer xấu
    const sb = vm.createContext({ window: { localStorage: { getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => null, setItem() {} }, setTimeout, clearTimeout }, AbortController, Date, Promise, Object, Number, Math, String, JSON, Error, RegExp,
      fetch: async () => ({ ok: true, status: 200, json: async () => ({ id: null, answer: bad }) }) });
    vm.runInContext(SRC, sb); const b = sb.window.BoAI; b.configure({ enabled: true, endpoint: 'x' }, u => 'https://w.test/' + u);
    same(await b.route('câu ' + Math.random(), isValid), { ok: true, id: null }); void a2;
  }
});
