import { readFileSync, writeFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('./cli-results.json',import.meta.url)));
const rows=data.results;
const times=rows.filter(r=>r.elapsed_ms).map(r=>r.elapsed_ms).sort((a,b)=>a-b);
const sum=k=>rows.reduce((s,r)=>s+(r.usage?.[k]||0),0);
const totalIn=sum('input_tokens'),totalOut=sum('output_tokens');
const passed=c=>rows.filter(r=>r.category===c && (c==='injection'?r.valid:r.correct)).length;
const lines=['# Bọ: kiểm thử thật qua Codex CLI', '',
`Thời điểm: ${data.at}; nhánh codex/bo-ai-live; model gpt-6-luna.`,
'Không dùng API key. CLI chạy bằng tài khoản đã đăng nhập. Đây là số liệu CLI cục bộ, chưa phải Worker Cloudflare triển khai.', '',
`- Chủ đề: ${passed('topic')}/20; không câu nào khớp bộ từ khóa: ${rows.filter(r=>r.keyword).length===0}.`,
`- Lạc đề: ${passed('offtopic')}/10; injection đúng schema: ${passed('injection')}/5.`,
`- p50: ${times[Math.ceil(times.length*.5)-1].toFixed(0)} ms; p95: ${times[Math.ceil(times.length*.95)-1].toFixed(0)} ms (gồm khởi động CLI).`,
`- Token vào: ${totalIn}; cached vào: ${sum('cached_input_tokens')}; ra: ${totalOut}. Cache là tập con của token vào.`,
`- Ngoại suy 1.000 lượt: ${Math.round(totalIn/rows.length*1000)} token vào và ${Math.round(totalOut/rows.length*1000)} token ra; gồm ngữ cảnh CLI. Không có đơn giá thanh toán của tài khoản, chưa xác định tiền.`,
'- Unit Worker: 14/14 đạt; lượt IP 51 và timeout giả lập đạt, chưa kiểm lượt IP 51 qua provider thật.',
'- Ba câu 50/51/80 từ: HTTP trả null; phía client không gọi mạng. Xem cli-http-results.json và cli-client-results.json.',
'- Endpoint CLI chỉ trên 127.0.0.1:8788; bản thử timeout server 7,5 giây, client 8 giây. Bộ đếm endpoint dùng RAM, reset khi restart.',
'- Đã mở bản thử HTTPS bằng Cloudflare Tunnel theo cho phép của chủ dự án; chat index và widget community đều đã gọi CLI thật với câu “học phí ntn” (khoảng 5,1 giây). AI chọn trước kể cả câu khớp từ khóa.',
'- Gateway online-preview.mjs: hạn mức dùng chung 50 AI/ngày, lưu bộ đếm vào file bị gitignore; không phục vụ thư mục Git/Worker. Bản thử phụ thuộc máy và tunnel đang chạy; moriclass.com và main chưa thay đổi.',
'- Chưa triển khai Worker Cloudflare production; chưa kiểm lượt IP 51 qua provider thật, chưa xác định chi phí tiền của gói CLI. KHÔNG ĐẠT toàn bộ tiêu chí ban đầu.', '',
'| Loại | Câu hỏi | Mong đợi | Nhận | Kết quả | ms | Token vào/ra |',
'|---|---|---|---|---|---:|---:|',
...rows.map(r=>`| ${r.category} | ${r.question.replaceAll('|','/')} | ${r.category==='injection'?'id hợp lệ/null':r.expected??'null'} | ${r.id??'null'} | ${(r.category==='injection'?r.valid:r.correct)?'đúng':'sai'} | ${Math.round(r.elapsed_ms||0)} | ${r.usage?.input_tokens||0}/${r.usage?.output_tokens||0} |`)];
writeFileSync(new URL('../../docs/BO_AI_CLI_TEST_REPORT.md',import.meta.url),lines.join('\n')+'\n');
console.log(lines.slice(0,16).join('\n'));
