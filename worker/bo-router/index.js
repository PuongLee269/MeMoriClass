const GROUPS = [
  ['tour_phrase', 'tham quan ban do va cac trang'], ['tour_yes', 'dong y tham quan'],
  ['course_short_video', 'workshop storytelling video ngan'], ['course_cinematic', 'workshop tu duy hinh anh cinematic'],
  ['course_editing', 'workshop quay dung creator'], ['register', 'cach dang ky lop f2'],
  ['registration_page', 'mo trang dang ky'], ['roadmap', 'lo trinh va noi dung cac chuong f2'],
  ['contact', 'email va kenh lien he'], ['price', 'hoc phi gia va chi phi'],
  ['schedule', 'lich khai giang thoi gian hoc'], ['duration', 'thoi luong so buoi'],
  ['location', 'dia diem va hinh thuc online offline'], ['workshops', 'danh sach workshop'],
  ['what_learn', 'noi dung va ky nang se hoc'], ['method', 'phuong phap day hoc'],
  ['beginner', 'lop co phu hop nguoi moi'], ['practice', 'thuc hanh bai tap feedback'],
  ['sitemap', 'ban do va dieu huong website'], ['khampha', 'trang kham pha thanh pho tren may'],
  ['lopf1', 'trang lop f1'], ['gallery', 'gallery thu vien anh'], ['works', 'tac pham hoc vien'],
  ['community', 'trang cong dong creator'], ['storytelling', 'cach ke chuyen bang hinh anh'],
  ['teachers', 'thong tin giang vien mentor'], ['equipment', 'thiet bi can chuan bi'],
  ['certificate', 'chung chi chung nhan'], ['refund', 'hoan tien huy lop bao luu'],
  ['age_size', 'do tuoi va si so lop'], ['ai_tools', 'cong cu phan mem ai'], ['who_bo', 'danh tinh chatbot bo'],
  ['intro', 'video trang gioi thieu me mori'], ['what_is', 'me mori class la gi'],
  ['fun', 'tro chuyen vui'], ['thanks', 'loi cam on'], ['goodbye', 'tam biet'],
  ['help', 'tro giup cach hoi'], ['greeting', 'loi chao']
];
const ALLOWED_IDS = new Set(GROUPS.map(([id]) => id));
const ORIGIN = 'https://moriclass.com';

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: {
    'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
    'access-control-allow-origin': origin || ORIGIN, 'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type', 'vary': 'Origin', 'x-content-type-options': 'nosniff'
  }});
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (origin !== ORIGIN) return json({ error: 'origin_not_allowed' }, 403, ORIGIN);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin'
    }});
    if (request.method !== 'POST') return json({ id: null }, 405, origin);
    if (!env.RATE_LIMIT) return json({ id: null }, 503, origin);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const limiterId = env.RATE_LIMIT.idFromName(ip);
    const limited = await env.RATE_LIMIT.get(limiterId).fetch('https://rate-limit/check');
    if (!limited.ok) return json({ id: null }, 429, origin);
    let body;
    try { body = await request.json(); } catch { return json({ id: null }, 400, origin); }
    if (!body || typeof body.question !== 'string' || !body.question.trim()) return json({ id: null }, 400, origin);
    if (!env.AI || !env.AI_MODEL) return json({ id: null }, 503, origin);

    const question = body.question.slice(0, 200);
    const prompt = `Chọn đúng một id phù hợp nhất với câu hỏi tiếng Việt hoặc null nếu không phù hợp nhóm nào. Chỉ trả JSON theo schema {"id":"..."} hoặc {"id":null}. Không trả lời câu hỏi, không tạo nhóm mới. Thông tin về giá, lịch, địa điểm, giáo viên, chính sách chỉ được phân loại vào nhóm tương ứng; tuyệt đối không suy đoán.\nCác nhóm cố định:\n${GROUPS.map(([id, desc]) => `${id}: ${desc}`).join('\n')}\nCâu hỏi: ${question}`;
    try {
      const result = await env.AI.run(env.AI_MODEL, {
        messages: [{ role: 'system', content: prompt }], max_tokens: 24
      });
      const raw = typeof result === 'string' ? result : (result && result.response);
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return json({ id: parsed && ALLOWED_IDS.has(parsed.id) ? parsed.id : null }, 200, origin);
    } catch { return json({ id: null }, 502, origin); }
  }
};

export class RateLimit {
  constructor(state, env) { this.state = state; this.limiter = env.LIMITER; }
  async fetch() {
    const current = await this.state.storage.get('window') || { start: Date.now(), count: 0 };
    const now = Date.now();
    const window = now - current.start >= 60_000 ? { start: now, count: 0 } : current;
    window.count++;
    await this.state.storage.put('window', window, { expirationTtl: 120 });
    return new Response(null, { status: window.count <= (Number(this.limiter) || 12) ? 204 : 429 });
  }
}
