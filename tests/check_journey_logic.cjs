const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('preview/index.html','utf8'),source=fs.readFileSync('preview/story-journey.js','utf8');
const core=source.slice(0,source.indexOf("const content=document.createElement"));
const ctx=vm.createContext({});vm.runInContext(core+';globalThis.lookup=findGuideScripts;globalThis.normalize=normalizeQuestion;',ctx);
const cases=[
 ['ĐĂNG KÝ','register'],['Học phí bao nhiêu?','payment'],['không phù hợp sau buổi đầu','payment'],['Hoc phi?','payment'],
 ['Học mấy buổi?','schedule'],['Lớp bao nhiêu người?','schedule'],['LỊCH HỌC Ở ĐÂU','schedule'],['Cần hỗ trợ cá nhân','support'],
 ['cộng đồng sau khóa','support'],['video workshop','workshop'],['Xem bài giảng mẫu','library'],['Lê Hồng Phương','mentor'],
 ['F2 học gì?','learning'],['công cụ dựng AI','learning']
];
for(const [q,intent] of cases)assert(ctx.lookup(q).some(x=>x.intent===intent),q);
for(const q of ['abcxyz','con mèo','sinh nhật của tôi','maimaitot','tối nay trời mưa không','<img src=x onerror=alert(1)>',''])assert.equal(ctx.lookup(q).length,0,q);
assert(ctx.lookup('Học phí và lịch học?').length===2);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);scripts.forEach((s,i)=>new vm.Script(s,{filename:`inline-${i}`}));
const all=html+source;
const ids=[...all.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
for(const link of source.matchAll(/(?:target:|href=)["']#([^"']+)["']/g))assert(ids.includes(link[1]),'Missing target '+link[1]);
assert(!source.includes('fetch('));assert(!/15%|15 phút|tối thiểu 3|6 buổi/.test(source));
assert(source.includes('4 buổi × 3 giờ'));assert(source.includes('2.400.000 VNĐ'));assert(source.includes('không phải feedback học viên'));
assert(html.indexOf('href="story-journey.css"')>html.lastIndexOf('</style>'),'Stylesheet must override legacy styles');
console.log(`PASS: ${cases.length} recognized questions; 7 safe fallbacks; multi-intent; ${scripts.length} inline scripts; unique IDs and valid destinations; course facts; no AI API or unapproved offer.`);
