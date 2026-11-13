// Kiểm qua HTTPS Worker thật, không nhận hoặc gửi khóa API.
// NET_MODE=quota cần Worker/namespace mới, 50/ngày/IP, LIMITER đủ cho 51 câu.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const url=process.env.LIVE_WORKER_URL,origin=process.env.LIVE_ORIGIN||'http://127.0.0.1:8766';
if(!url?.startsWith('https://'))throw new Error('Set HTTPS LIVE_WORKER_URL');
const rows=[],mode=process.env.NET_MODE||'boundary',out=process.env.NET_OUT||new URL('./live-controls-result.json',import.meta.url);
async function post(question,source=origin){const t=performance.now(),r=await fetch(url,{method:'POST',headers:{origin:source,'content-type':'application/json'},body:JSON.stringify({question})});return {status:r.status,body:await r.json(),ms:Math.round(performance.now()-t),tokens:r.headers.get('x-bo-tokens'),cache:r.headers.get('x-bo-cache')};}
function save(extra={}){writeFileSync(out,JSON.stringify({url,origin,mode,at:new Date().toISOString(),rows,...extra},null,2));}
let pass=true;
if(mode==='quota'){
 for(let n=1;n<=51;n++){const r=await post('học phí bao nhiêu cho lượt kiểm tra '+n);rows.push({n,...r});save();if(r.status!==(n<=50?200:429))pass=false;}
 const require=createRequire(import.meta.url),matcher=require('../../assets/bo-matcher.js');
 const faq=matcher.cleanFaq(JSON.parse(readFileSync(new URL('../../assets/content/bo-faq.json',import.meta.url))).faqs,null,500);
 const replies=JSON.parse(readFileSync(new URL('../../assets/content/bo-replies.json',import.meta.url))).replies;
 const values=new Map(),st={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const sb={window:{localStorage:st,sessionStorage:st,setTimeout,clearTimeout},AbortController,fetch:(u,o)=>fetch(url,{...o,headers:{...o.headers,origin}})};
 vm.createContext(sb);vm.runInContext(readFileSync(new URL('../../assets/bo-ai.js',import.meta.url),'utf8'),sb);
 sb.window.BoAI.configure({enabled:true,endpoint:url},u=>u);
 const ai=await sb.window.BoAI.route('học phí lượt tiếp theo',()=>true),fallback=matcher.buildAll(faq,replies).find('học phí bao nhiêu')?.entry.id;
 pass=pass&&!ai.ok&&fallback==='faq-23';save({pass,ai,fallback});
}else if(mode==='timeout'){
 const r=await post('câu mới kiểm tra timeout '+Date.now());rows.push(r);pass=r.status===504&&r.body.id===null;save({pass});
}else{
 for(const [name,source,question,status]of [['cors','https://evil.example','hi',403],['oversize',origin,'x'.repeat(3000),413],... [50,51,80].map(n=>['long-'+n,origin,Array(n).fill('học').join(' '),200])]){
  const r=await post(question,source);rows.push({name,...r});pass=pass&&r.status===status&&r.body.id===null&&!r.tokens;
 }
 save({pass});
}
console.log({mode,pass,requests:rows.length});process.exitCode=pass?0:1;
