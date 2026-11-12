// Nạp env bằng tiến trình, không hiển thị hoặc sao chép bí mật vào kết quả.
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
try { process.loadEnvFile(fileURLToPath(new URL('../../env/API.env', import.meta.url))); }
catch { console.error('Không nạp được file env riêng. Không in chi tiết để tránh lộ khóa.'); process.exit(2); }
if (!process.env.OPENAI_API_KEY) {
  // Một số file được chủ dự án cấp chỉ chứa khóa trần. Chỉ bộ nạp thấy dữ liệu này.
  const raw = readFileSync(new URL('../../env/API.env', import.meta.url), 'utf8');
  const keys = raw.match(/\bsk-[A-Za-z0-9_-]{20,}/g) || [];
  if (keys.length === 1) process.env.OPENAI_API_KEY = keys[0];
}
if (!process.env.OPENAI_API_KEY) { console.error('Không tìm được một khóa OpenAI duy nhất trong file riêng. Không in nội dung.'); process.exit(2); }
process.env.OPENAI_MODEL ||= 'gpt-4o-mini';
