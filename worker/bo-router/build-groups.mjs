// Sinh groups.js từ assets/content/bo-replies.json (nguồn duy nhất của id nhóm).
// Chạy: node worker/bo-router/build-groups.mjs   (thêm --check để chỉ kiểm tra, thoát 1 nếu lệch)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', '..', 'assets', 'content', 'bo-replies.json');
const OUT = join(here, 'groups.js');

const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

export function buildGroups() {
  const data = JSON.parse(readFileSync(SRC, 'utf8'));
  return data.replies.map(r => {
    const seen = new Set(), keys = [];
    for (const k of r.keys || []) {
      const p = plain(k);
      if (p.length >= 3 && !seen.has(p)) { seen.add(p); keys.push(p); }
      if (keys.length >= 8) break;
    }
    // Nội dung đã duyệt giúp phân biệt các nhóm có từ khóa gần nhau.
    // Không đưa dữ kiện mới vào prompt và không sửa bộ khớp từ khóa.
    return [r.id, keys.join(', ') + '. Nội dung nhóm: ' + r.reply];
  });
}

export function render() {
  const rows = buildGroups().map(g => '  ' + JSON.stringify(g)).join(',\n');
  return `// TỰ SINH từ assets/content/bo-replies.json bằng build-groups.mjs. Không sửa tay.\nexport const GROUPS = [\n${rows}\n];\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = render();
  if (process.argv.includes('--check')) {
    let cur = ''; try { cur = readFileSync(OUT, 'utf8'); } catch {}
    if (cur !== text) { console.error('groups.js lệch bo-replies.json. Chạy: node worker/bo-router/build-groups.mjs'); process.exit(1); }
    console.log('groups.js khớp bo-replies.json');
  } else {
    writeFileSync(OUT, text);
    writeFileSync(join(here, 'cli-schema.json'), JSON.stringify({ type: 'object', properties: {
      id: { type: ['string', 'null'], enum: [...buildGroups().map(g => g[0]), null] }
    }, required: ['id'], additionalProperties: false }, null, 2));
    console.log('Đã ghi groups.js và cli-schema.json (' + buildGroups().length + ' nhóm)');
  }
}
