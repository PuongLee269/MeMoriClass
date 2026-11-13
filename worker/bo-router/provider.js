// LỚP NHÀ CUNG CẤP AI: mọi lệnh gọi mô hình đi qua MỘT hàm, generate(). Hiện dùng Google Gemini.
// Muốn đổi sang OpenAI: viết generateOpenAI(env, req) có cùng đầu vào/đầu ra (xem dưới) rồi đổi dòng dispatch trong generate().
// Phần còn lại của Worker (index.js) không biết gì về Gemini hay OpenAI.
//
// req = { system: string,            // chỉ thị cố định (danh sách FAQ / kiến thức an toàn)
//         user: string,              // câu hỏi của người dùng: DỮ LIỆU, luôn nằm ở vai trò "user", không bao giờ nối vào system
//         schema: object,            // JSON Schema (chữ thường): {type:'object',properties:{...},required:[...]}; enum cho chuỗi
//         maxOutputTokens: number, timeoutMs: number, temperature?: number }
// trả   { ok:true, text:string, usage:[vào, ra, suy nghĩ] | null }  hoặc  { ok:false, status:502|503|504 }
// Nhà cung cấp phải trả JSON đúng schema ở dạng chuỗi; Worker tự kiểm lại (allowlist id, độ dài, nội dung) nên không tin mù đầu ra.

export async function generate(env, req) {
  return generateGemini(env, req);          // <- đổi một dòng này khi chuyển nhà cung cấp
}

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

// Gemini dùng kiểu chữ HOA (OBJECT, STRING) trong responseSchema.
function toGeminiSchema(s) {
  if (!s || typeof s !== 'object') return s;
  const o = { ...s };
  if (typeof o.type === 'string') o.type = o.type.toUpperCase();
  if (o.properties) o.properties = Object.fromEntries(Object.entries(o.properties).map(([k, v]) => [k, toGeminiSchema(v)]));
  if (o.items) o.items = toGeminiSchema(o.items);
  return o;
}

export function buildGeminiRequest(env, req) {
  const generationConfig = {
    temperature: req.temperature ?? 0, maxOutputTokens: req.maxOutputTokens, responseMimeType: 'application/json',
    responseSchema: toGeminiSchema(req.schema)
  };
  if (env.GEMINI_THINKING_BUDGET !== undefined && env.GEMINI_THINKING_BUDGET !== '') generationConfig.thinkingConfig = { thinkingBudget: Number(env.GEMINI_THINKING_BUDGET) };
  return {
    systemInstruction: { parts: [{ text: req.system }] },
    contents: [{ role: 'user', parts: [{ text: req.user }] }],
    generationConfig
  };
}

async function generateGemini(env, req) {
  const model = String(env.GEMINI_MODEL || DEFAULT_MODEL).replace(/[^\w.\-]/g, '');
  const base = String(env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, req.timeoutMs || 6000));
  try {
    const res = await fetch(base + '/v1beta/models/' + model + ':generateContent', {
      method: 'POST', signal: controller.signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify(buildGeminiRequest(env, req))
    });
    if (!res.ok) { try { await res.body && res.body.cancel(); } catch {} return { ok: false, status: res.status === 429 ? 503 : 502 }; }
    const data = await res.json();
    const part = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const text = Array.isArray(part) ? part.map(p => (p && typeof p.text === 'string') ? p.text : '').join('') : '';
    if (!text) return { ok: false, status: 502 };    // bị chặn an toàn/rỗng: coi là lỗi để trang rơi về từ khóa
    const u = data.usageMetadata;
    return { ok: true, text, usage: u ? [u.promptTokenCount | 0, u.candidatesTokenCount | 0, u.thoughtsTokenCount | 0] : null };
  } catch (e) {
    return { ok: false, status: e && e.name === 'AbortError' ? 504 : 502 };
  } finally { clearTimeout(timer); }
}
