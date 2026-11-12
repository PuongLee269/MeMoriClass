// Đồ dùng test dùng chung: Durable Object giả (bộ nhớ) và máy chủ giả OpenAI. Không cần mạng, không cần khóa thật.
import http from 'node:http';
import { RateLimit } from './index.js';

export function makeRateLimitBinding() {
  const objs = new Map();
  return {
    objs,
    idFromName: n => n,
    get(name) {
      if (!objs.has(name)) {
        const data = new Map(); let alarm = null;
        const storage = { get: async k => data.get(k), put: async (k, v) => { data.set(k, v); }, getAlarm: async () => alarm, setAlarm: async t => { alarm = t; }, deleteAll: async () => { data.clear(); alarm = null; } };
        const o = new RateLimit({ storage }); o._data = data; objs.set(name, o);
      }
      const o = objs.get(name); return { fetch: u => o.fetch(new Request(u)) };
    }
  };
}

// handler(body, req) -> { status?, json?, delayMs? }. Mặc định trả {id:"price"}.
export async function startMockOpenAI(handler) {
  const calls = [];
  let h = handler || (() => ({ json: openaiReply('{"id":"price"}') }));
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', async () => {
      let body = null; try { body = JSON.parse(raw); } catch {}
      const call = { url: req.url, headers: req.headers, body }; calls.push(call);
      const out = await h(body, call);
      const send = () => { if (res.destroyed) return; res.writeHead(out.status || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(out.json || {})); };
      if (out.delayMs) setTimeout(send, out.delayMs); else send();
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { url: 'http://127.0.0.1:' + server.address().port, calls, set(fn) { h = fn; }, close: () => { server.closeAllConnections?.(); return new Promise(r => server.close(r)); } };
}

export const openaiReply = (text, usage = { prompt_tokens: 1500, completion_tokens: 8 }) => ({ choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: text } }], usage });
