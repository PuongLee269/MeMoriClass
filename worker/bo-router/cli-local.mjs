// Endpoint thử cục bộ. Không mở cổng này ra Internet; không dùng thay Cloudflare production.
import http from 'node:http';
import worker, { RateLimit } from './index.js';
import { classifyCli } from './cli-provider.mjs';
const objects = new Map();
const env = { DEV: '1', AI_MODEL: 'gpt-6-luna', MODEL_TIMEOUT_MS: '7500', LOG_USAGE: '0',
  RATE_LIMIT: { idFromName: n => n, get(name) {
    if (!objects.has(name)) {
      const data = new Map(); let alarm;
      const storage = { get: async k => data.get(k), put: async (k,v) => data.set(k,v),
        getAlarm: async () => alarm, setAlarm: async t => { alarm = t; }, deleteAll: async () => data.clear() };
      objects.set(name, new RateLimit({ storage }));
    }
    return { fetch: url => objects.get(name).fetch(new Request(url)) };
  } }, AI: { run: async (_model, req) => classifyCli(req.messages, { timeoutMs: 7500 }) } };
http.createServer(async (req, res) => {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 2048) { res.writeHead(413); res.end('{"id":null}'); return; } chunks.push(chunk); }
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
  headers.set('cf-connecting-ip', req.socket.remoteAddress || 'localhost');
  try {
    const response = await worker.fetch(new Request('http://localhost' + req.url, { method: req.method, headers,
      ...(!['GET','HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) }), env);
    res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
  } catch { res.writeHead(502); res.end('{"id":null}'); }
}).listen(8788, '127.0.0.1', () => console.log('Bọ CLI local: http://127.0.0.1:8788 (timeout 7,5 giây, bộ đếm RAM reset khi khởi động lại)'));
