// Sinh dữ liệu dẫn xuất từ hai nguồn: assets/content/bo-replies.json (nhóm cũ) và assets/content/bo-faq.json (FAQ có sẵn).
//   - worker/bo-router/faq.js    : cho AI: FAQ (id + chủ đề + 2 câu hỏi đại diện), nhóm dẫn đường/xã giao (id + mô tả gọn), câu "chưa muốn thông tin sai", danh sách nhóm cũ trùng FAQ
//   - assets/bo-replies.js       : bản mặc định NHÚNG SẴN (BO_REPLIES + BO_FAQ) giữa hai dấu BO-EMBED
//   - assets/content/defaults/   : bản sao mặc định của hai file JSON
// Chạy: node worker/bo-router/build-groups.mjs   (thêm --check để chỉ kiểm tra, thoát 1 nếu lệch)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const P = {
  replies: join(ROOT, 'assets', 'content', 'bo-replies.json'),
  faq: join(ROOT, 'assets', 'content', 'bo-faq.json'),
  defReplies: join(ROOT, 'assets', 'content', 'defaults', 'bo-replies.json'),
  defFaq: join(ROOT, 'assets', 'content', 'defaults', 'bo-faq.json'),
  embed: join(ROOT, 'assets', 'bo-replies.js'),
  faqJs: join(here, 'faq.js')
};

// Nhóm cũ có nội dung TRÙNG FAQ: FAQ được ưu tiên, nên không đưa cho AI chọn (bộ từ khóa dự phòng vẫn dùng chúng).
export const FAQ_OVERLAP = ['register', 'registration_page', 'price', 'discount', 'schedule', 'duration', 'location', 'refund', 'installment', 'payment_method',
  'trial_class', 'after_register', 'age_size', 'equipment', 'teachers', 'what_is', 'what_learn', 'beginner', 'practice', 'final_project', 'privacy_info', 'works', 'method'];

const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
const readJson = p => JSON.parse(readFileSync(p, 'utf8'));
const J = v => JSON.stringify(v);

// Nhóm dẫn đường/xã giao cho AI: [id, mô tả gọn]. Bỏ các nhóm trùng FAQ (FAQ ưu tiên).
export function buildNav() {
  const data = readJson(P.replies);
  return data.replies.filter(r => !FAQ_OVERLAP.includes(r.id)).map(r => {
    const keys = [], seen = new Set();
    for (const k of r.keys || []) { const p = plain(k); if (p.length >= 3 && !seen.has(p)) { seen.add(p); keys.push(p); } if (keys.length >= 4) break; }
    let gist = String(r.description || r.reply || '').replace(/\s+/g, ' ').trim();
    if (gist.length > 90) gist = gist.slice(0, 90).replace(/\s+\S*$/, '') + '...';
    return [r.id, gist + ' | ' + keys.join(', ')];
  });
}
export const buildGroups = buildNav;

// FAQ cho AI: [id, chủ đề, câu hỏi 1, câu hỏi 2]. Không chứa câu trả lời (Worker không cần; trang giữ câu trả lời).
export function buildFaqList() {
  const d = readJson(P.faq);
  return d.faqs.map(f => [f.id, f.topic || '', f.questions[0], f.questions[1] || '']);
}
export function renderFaq() {
  const d = readJson(P.faq);
  const rows = buildFaqList().map(g => '  ' + J(g)).join(',\n');
  return `// TỰ SINH từ assets/content/bo-faq.json bằng build-groups.mjs. Không sửa tay.\n`
    + `export const FAQS = [\n${rows}\n];\n`
    + `export const NAV = [\n${buildNav().map(g => '  ' + J(g)).join(',\n')}\n];\n`
    + `export const UNKNOWN_REPLY = ${J(d.meta && d.meta.unknownReply || '')};\n`
    + `export const FAQ_OVERLAP = ${J(FAQ_OVERLAP)};\n`;
}

// Bản nhúng sẵn trong assets/bo-replies.js (dùng khi không tải được JSON). Cùng định dạng cũ: khóa không ngoặc kép.
function repLine(r) {
  const parts = ['id:' + J(r.id)];
  if (r.exact === true) parts.push('exact:true');
  if (r.card === true) parts.push('card:true');
  parts.push('keys:' + J(r.keys), 'reply:' + J(r.reply));
  if (r.link && r.link.href) parts.push('link:{href:' + J(r.link.href) + ',label:' + J(r.link.label) + '}');
  return '  {' + parts.join(',') + '}';
}
function faqLine(f) {
  const parts = ['id:' + J(f.id), 'questions:' + J(f.questions), 'answer:' + J(f.answer)];
  if (f.needsConfirm) parts.push('needsConfirm:true');
  if (f.link && f.link.href) parts.push('link:{href:' + J(f.link.href) + ',label:' + J(f.link.label) + '}');
  return '  {' + parts.join(',') + '}';
}
const BEGIN = '/*BO-EMBED-BEGIN tự sinh bằng worker/bo-router/build-groups.mjs, không sửa tay*/', END = '/*BO-EMBED-END*/';
export function renderEmbedBlock() {
  return BEGIN + '\nconst BO_REPLIES = [\n' + readJson(P.replies).replies.map(repLine).join(',\n') + '\n];\n'
    + 'const BO_FAQ = [\n' + readJson(P.faq).faqs.map(faqLine).join(',\n') + '\n];\n' + END;
}
export function renderEmbed(cur) {
  const block = renderEmbedBlock();
  if (cur.includes(BEGIN) && cur.includes(END)) return cur.slice(0, cur.indexOf(BEGIN)) + block + cur.slice(cur.indexOf(END) + END.length);
  const m = cur.match(/const BO_REPLIES = \[[\s\S]*?\n\];/);
  if (!m) throw new Error('bo-replies.js: không tìm thấy khối BO_REPLIES để thay');
  return cur.replace(m[0], () => block);
}

function targets() {
  const embedCur = readFileSync(P.embed, 'utf8');
  return [
    [P.faqJs, renderFaq()], [P.embed, renderEmbed(embedCur)],
    [P.defReplies, readFileSync(P.replies, 'utf8')], [P.defFaq, readFileSync(P.faq, 'utf8')]
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const t = targets();
  if (process.argv.includes('--check')) {
    let bad = 0;
    for (const [p, text] of t) { let cur = ''; try { cur = readFileSync(p, 'utf8'); } catch {} if (cur !== text) { console.error('LỆCH: ' + p); bad++; } }
    if (bad) { console.error('Chạy: node worker/bo-router/build-groups.mjs'); process.exit(1); }
    console.log('faq.js, bo-replies.js (nhúng) và defaults khớp nguồn JSON');
  } else {
    for (const [p, text] of t) writeFileSync(p, text);
    console.log('Đã ghi: ' + buildNav().length + ' nhóm dẫn đường (trên ' + readJson(P.replies).replies.length + ' nhóm cũ), ' + buildFaqList().length + ' FAQ');
  }
}
