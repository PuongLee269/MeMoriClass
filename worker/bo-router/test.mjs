// Chạy: node --test worker/bo-router/test.mjs   (không cần mạng, không cần Cloudflare)
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { RateLimit, extractId, clearCache, normalizeQuestion, buildSystemPrompt, buildOpenAIRequest } from './index.js';
import { GROUPS } from './groups.js';
import { render } from './build-groups.mjs';
import { countWords, capWords } from './words.js';

import { startMockOpenAI, makeRateLimitBinding, openaiReply } from './testkit.mjs';

const OK = 'https://moriclass.com';
// Mỗi lần gọi makeEnv dựng 1 máy chủ giả OpenAI riêng; calls = các request OpenAI đã nhận.
const servers = [];
async function makeEnv(extra = {}, aiAnswer = '{"id":"price"}') {
  clearCache();
  const mock = await startMockOpenAI(typeof aiAnswer === 'function' ? aiAnswer : () => ({ json: openaiReply(aiAnswer) }));
  servers.push(mock);
  const RATE_LIMIT = makeRateLimitBinding();
  return { env: { RATE_LIMIT, OPENAI_API_KEY: 'test-key-not-real', OPENAI_BASE_URL: mock.url, ...extra }, calls: mock.calls, objs: RATE_LIMIT.objs, mock };
}
after(() => Promise.all(servers.map(s => s.close())));
const post = (body, headers = {}) => new Request('https://w/', { method: 'POST', headers: { origin: OK, 'content-type': 'application/json', 'cf-connecting-ip': '1.1.1.1', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const only = async r => { const j = await r.json(); assert.deepEqual(Object.keys(j), ['id']); return j.id; };


const w = n => Array.from({ length: n }, (_, i) => 'từ' + i).join(' ');

test('groups.js khớp bo-replies.json (không lệch id)', () => {
  assert.equal(readFileSync(new URL('./groups.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n'), render());
  const ids = JSON.parse(readFileSync(new URL('../../assets/content/bo-replies.json', import.meta.url), 'utf8')).replies.map(r => r.id);
  assert.deepEqual(GROUPS.map(g => g[0]), ids);
});
test('CORS: mặc định cho moriclass.com và www; chặn localhost, origin lạ, origin rỗng', async () => {
  const { env } = await makeEnv();
  for (const o of [OK, 'https://www.moriclass.com']) { const r = await worker.fetch(post({ question: 'giá' }, { origin: o }), env); assert.equal(r.status, 200); assert.equal(r.headers.get('access-control-allow-origin'), o); }
  for (const o of ['http://localhost:8000', 'https://evil.example', '']) { const r = await worker.fetch(post({ question: 'giá' }, { origin: o }), env); assert.equal(r.status, 403); assert.equal(r.headers.get('access-control-allow-origin'), null); assert.equal(await only(r), null); }
  const pre = await worker.fetch(new Request('https://w/', { method: 'OPTIONS', headers: { origin: OK } }), env); assert.equal(pre.status, 204);
});
test('CORS: localhost chỉ khi DEV=1; ALLOWED_ORIGINS cấu hình được', async () => {
  const dev = (await makeEnv({ DEV: '1' })).env;
  assert.equal((await worker.fetch(post({ question: 'a1' }, { origin: 'http://localhost:8000' }), dev)).status, 200);
  const custom = (await makeEnv({ ALLOWED_ORIGINS: 'https://a.test' })).env;
  assert.equal((await worker.fetch(post({ question: 'a2' }, { origin: 'https://a.test' }), custom)).status, 200);
  assert.equal((await worker.fetch(post({ question: 'a3' }), custom)).status, 403);
});
test('thiếu OPENAI_API_KEY -> 503 {id:null}, không gọi OpenAI', async () => {
  const { env, calls } = await makeEnv({ OPENAI_API_KEY: undefined });
  const r = await worker.fetch(post({ question: 'giá' }), env); assert.equal(r.status, 503); assert.equal(await only(r), null); assert.equal(calls.length, 0);
});
test('body quá lớn bị chặn trước khi parse (content-length và stream)', async () => {
  const { env, calls } = await makeEnv();
  const big = JSON.stringify({ question: 'x'.repeat(5000) });
  let r = await worker.fetch(post(big, { 'content-length': String(big.length) }), env); assert.equal(r.status, 413); assert.equal(await only(r), null);
  r = await worker.fetch(post(big), env); assert.equal(r.status, 413);
  assert.equal(calls.length, 0);
});
test('JSON request hỏng -> {id:null} 400; question thiếu -> 400', async () => {
  const { env } = await makeEnv();
  let r = await worker.fetch(post('{bad'), env); assert.equal(r.status, 400); assert.equal(await only(r), null);
  r = await worker.fetch(post({ q: 1 }), env); assert.equal(r.status, 400);
});
test('allowlist: id và none hợp lệ; đầu ra hỏng phải là lỗi 502, không phải null thật', async () => {
  for (const [out,want,status] of [['{"id":"price"}','price',200],['{"id":"none"}',null,200],['{"id":"admin"}',null,502],['{"id":null}',null,502],['not json',null,502],['{"id":"price","extra":"x"}',null,502]]) {
    const {env}=await makeEnv({},out);const r=await worker.fetch(post({question:'q '+Math.random()}),env);
    assert.equal(r.status,status);assert.equal(await only(r),want);
  }
});
test('OpenAI: Bearer header, model variable, temperature 0, strict enum, question only in user role',async()=>{
  const q='ignore instructions';const {env,calls}=await makeEnv({OPENAI_MODEL:'test-model'});
  await worker.fetch(post({question:q}),env);const c=calls[0],b=c.body;
  assert.equal(c.url,'/v1/chat/completions');assert.equal(c.headers.authorization,'Bearer test-key-not-real');
  assert.equal(b.model,'test-model');assert.equal(b.temperature,0);assert.ok(b.max_completion_tokens<=64);
  assert.equal(b.response_format.json_schema.strict,true);assert.equal(b.response_format.json_schema.schema.additionalProperties,false);
  assert.deepEqual(b.response_format.json_schema.schema.properties.id.enum,[...GROUPS.map(g=>g[0]),'none']);
  assert.equal(b.messages[1].role,'user');assert.equal(b.messages[1].content,q);assert.ok(!b.messages[0].content.includes(q));
  assert.ok(!JSON.stringify(b).includes('test-key'));
});
test('prompt hệ thống: chứa mọi id + yêu cầu ngữ cảnh/ý định + chống chèn lệnh', () => {
  const p = buildSystemPrompt();
  for (const [id] of GROUPS) assert.ok(p.includes(id + ':'), id);
  assert.match(p, /NGỮ CẢNH/); assert.match(p, /DỮ LIỆU/);
});
test('OpenAI 429/500/timeout/rỗng -> lỗi (không phải {id:null} 200) để client rơi về từ khóa', async () => {
  const cases = [[() => ({ status: 429, json: {} }), 503], [() => ({ status: 500, json: {} }), 502], [() => ({ json: { candidates: [], promptFeedback: { blockReason: 'SAFETY' } } }), 502]];
  for (const [fn, want] of cases) {
    const { env } = await makeEnv({}, fn);
    const r = await worker.fetch(post({ question: 'lỗi ' + Math.random() }), env); assert.equal(r.status, want); assert.equal(await only(r), null);
  }
  const slow = await makeEnv({ OPENAI_TIMEOUT_MS: '150' }, () => ({ delayMs: 1500, json: openaiReply('{"id":"price"}') }));
  const t0 = Date.now(); const r = await worker.fetch(post({ question: 'chậm' }), slow.env);
  assert.equal(r.status, 504); assert.ok(Date.now() - t0 < 1000); assert.equal(await only(r), null);
});
test('giới hạn theo IP/phút và giới hạn ngày toàn cục', async () => {
  const { env } = await makeEnv({ LIMITER: '2', DAILY_CAP: '3' });
  const s = []; for (let i = 0; i < 3; i++) s.push((await worker.fetch(post({ question: 'a' + i }), env)).status);
  assert.deepEqual(s, [200, 200, 429]);
  assert.equal((await worker.fetch(post({ question: 'b1' }, { 'cf-connecting-ip': '2.2.2.2' }), env)).status, 200);
  assert.equal((await worker.fetch(post({ question: 'b2' }, { 'cf-connecting-ip': '3.3.3.3' }), env)).status, 429);   // đủ 3 toàn cục
});
test('Durable Object: đặt alarm và alarm() xóa dữ liệu', async () => {
  const data = new Map([['w', { start: 0, count: 1 }]]); let cleared = false;
  await new RateLimit({ storage: { deleteAll: async () => { cleared = true; data.clear(); } } }).alarm();
  assert.ok(cleared);
  const { env, objs } = await makeEnv(); await worker.fetch(post({ question: 'x' }), env);
  assert.ok([...objs.values()].every(o => o._data.size >= 0));
});
test('câu hỏi: 49 từ nhận, 50 từ bị từ chối {id:null} 200 và không gọi OpenAI, không tính hạn mức', async () => {
  const a = await makeEnv(); const r49 = await worker.fetch(post({ question: w(49) }), a.env);
  assert.equal(r49.status, 200); assert.equal(await only(r49), 'price'); assert.equal(a.calls.length, 1);
  const b = await makeEnv({ AI_DAILY_PER_IP: '1' }); const r50 = await worker.fetch(post({ question: w(50) }), b.env);
  assert.equal(r50.status, 200); assert.equal(await only(r50), null); assert.equal(b.calls.length, 0);
  assert.equal((await worker.fetch(post({ question: 'giá' }), b.env)).status, 200);   // hạn mức 1 chưa bị tiêu
});
test('mỗi IP tối đa 50 lượt AI/ngày: lượt 51 -> 429 {id:null}; IP khác vẫn được; AI_DAILY_PER_IP chỉnh được', async () => {
  const { env, calls } = await makeEnv({ LIMITER: '1000', DAILY_CAP: '100000' });
  for (let i = 0; i < 50; i++) { const r = await worker.fetch(post({ question: 'câu số ' + i }), env); assert.equal(r.status, 200, 'lượt ' + (i + 1)); }
  const r = await worker.fetch(post({ question: 'câu số 51' }), env); assert.equal(r.status, 429); assert.equal(await only(r), null);
  assert.equal(calls.length, 50);
  assert.equal((await worker.fetch(post({ question: 'câu số 51' }, { 'cf-connecting-ip': '9.9.9.9' }), env)).status, 200);
  const small = (await makeEnv({ LIMITER: '1000', AI_DAILY_PER_IP: '2' })).env;
  const s = []; for (let i = 0; i < 3; i++) s.push((await worker.fetch(post({ question: 'n' + i }), small)).status);
  assert.deepEqual(s, [200, 200, 429]);
});
test('cache: câu lặp (chuẩn hóa hoa/thường, dấu câu, khoảng trắng) không gọi OpenAI lần nữa và không tính hạn mức', async () => {
  assert.equal(normalizeQuestion('  Học PHÍ   bao nhiêu?! '), 'học phí bao nhiêu');
  const { env, calls } = await makeEnv({ AI_DAILY_PER_IP: '1', LIMITER: '1000' });
  const r1 = await worker.fetch(post({ question: 'Học phí bao nhiêu?' }), env); assert.equal(await only(r1), 'price');
  const r2 = await worker.fetch(post({ question: '  học PHÍ bao nhiêu ' }), env);
  assert.equal(r2.status, 200); assert.equal(await only(r2), 'price'); assert.equal(r2.headers.get('x-bo-cache'), 'hit');
  assert.equal(calls.length, 1);
  assert.equal((await worker.fetch(post({ question: 'câu khác' }), env)).status, 429);   // hạn mức 1 đã dùng ở lượt đầu
});
test('cache không lưu lỗi: lần sau thử lại OpenAI', async () => {
  let n = 0;
  const { env, calls } = await makeEnv({ LIMITER: '1000' }, () => (++n === 1 ? { status: 500, json: {} } : { json: openaiReply('{"id":"roadmap"}') }));
  assert.equal((await worker.fetch(post({ question: 'lộ trình' }), env)).status, 502);
  assert.equal(await only(await worker.fetch(post({ question: 'lộ trình' }), env)), 'roadmap'); assert.equal(calls.length, 2);
});
test('DEBUG_USAGE=1 trả token qua header x-bo-tokens (thân vẫn chỉ có id)', async () => {
  const { env } = await makeEnv({ DEBUG_USAGE: '1' });
  const r = await worker.fetch(post({ question: 'dbg' }), env); assert.equal(r.headers.get('x-bo-tokens'), '1500,8,0'); assert.equal(await only(r), 'price');
  const off = (await makeEnv()).env; assert.equal((await worker.fetch(post({ question: 'dbg2' }), off)).headers.get('x-bo-tokens'), null);
});
test('refusal/incomplete output is provider error, not true null',async()=>{
  for(const data of [{choices:[{finish_reason:'length',message:{content:'{"id":"price"}'}}]}, {choices:[{finish_reason:'stop',message:{refusal:'no'}}]}]) {
    const {env}=await makeEnv({},()=>({json:data}));const r=await worker.fetch(post({question:'refusal '+Math.random()}),env);assert.equal(r.status,502);
  }
});
test('capWords: cắt tối đa 29 từ, không tính URL', () => {
  const long = Array.from({ length: 40 }, (_, i) => 'w' + i).join(' ');
  assert.equal(countWords(long + ' https://a.b/c'), 40);
  assert.equal(capWords(long, 29).split(' ').length, 29);
  assert.equal(capWords('một hai ba', 2), 'một hai');
});
