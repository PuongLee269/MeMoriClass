// Đếm/cắt từ. URL không tính vào giới hạn từ.
const URL_RE = /(?:https?:\/\/|www\.)\S+/gi;
export function countWords(text) {
  const t = String(text || '').replace(URL_RE, ' ').trim();
  return t ? t.split(/\s+/).length : 0;
}
// Cắt chữ sinh ra (nếu có đường dẫn nào đó sinh chữ) xuống tối đa `max` từ, không tính URL. Giữ nguyên URL.
export function capWords(text, max = 29) {
  const parts = String(text || '').trim().split(/\s+/).filter(Boolean);
  const out = []; let n = 0;
  for (const p of parts) {
    if (/^(?:https?:\/\/|www\.)\S+$/i.test(p)) { out.push(p); continue; }
    if (n >= max) break;
    out.push(p); n++;
  }
  return out.join(' ');
}
