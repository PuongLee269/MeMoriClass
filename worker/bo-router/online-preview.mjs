// Bản xem thử tạm; không phải cấu hình production. Chỉ công khai HTML/asset.
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, realpathSync, statSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import worker, { RateLimit } from './index.js';
import './load-private-env.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const stateFile = fileURLToPath(new URL('./.preview-rate-state.json', import.meta.url));
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {};
const objects = new Map(); let busy = false;
const env = { DEV:'1',OPENAI_MODEL:process.env.OPENAI_MODEL,OPENAI_API_KEY:process.env.OPENAI_API_KEY,OPENAI_TIMEOUT_MS:'6000',
  RATE_LIMIT:{idFromName:n=>createHash('sha256').update(n).digest('hex'),get(name){
    if(!objects.has(name)) {
      state[name] ||= {};
      const persist=()=>writeFileSync(stateFile,JSON.stringify(state));
      objects.set(name,new RateLimit({storage:{get:async k=>state[name][k],put:async(k,v)=>{state[name][k]=v;persist();},getAlarm:async()=>null,setAlarm:async()=>{},deleteAll:async()=>{state[name]={};persist();}}}));
    }
    return {fetch:url=>objects.get(name).fetch(new Request(url))};
  }}};
const pages = new Set(['index.html','khampha.html','lopf1.html','sitemap.html','method.html','roadmap.html','gallery.html','community.html','dangky.html','gioithieu.html','home-backup.html']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4','.mp3':'audio/mpeg'};
http.createServer(async(req,res)=>{
  const fail=(code)=>{res.writeHead(code,{'content-type':'application/json','cache-control':'no-store'});res.end('{"id":null}');};
  try {
    const url=new URL(req.url,'http://localhost'); const path=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
    if(path==='bo-ai') {
      if(req.method!=='POST')return fail(405);
      if(!['http://'+req.headers.host,'https://'+req.headers.host].includes(req.headers.origin))return fail(403);
      if(busy)return fail(429);
      busy=true;
      try {
        let size=0;const chunks=[];
        for await(const chunk of req){size+=chunk.length;if(size>2048)return fail(413);chunks.push(chunk);}
        // Hạn mức dùng chung 50/ngày cho bản xem thử, nghiêm hơn 50/IP.
        const response=await worker.fetch(new Request('http://localhost/bo-ai',{method:'POST',headers:{Origin:'http://localhost','content-type':'application/json','cf-connecting-ip':'preview-shared'},body:Buffer.concat(chunks)}),env);
        res.writeHead(response.status,{'content-type':'application/json','cache-control':'no-store'});res.end(await response.text());
      } finally {busy=false;}
      return;
    }
    if(!['GET','HEAD'].includes(req.method))return fail(405);
    if(path==='assets/content/bo.json') {
      const config=JSON.parse(readFileSync(resolve(root,path),'utf8'));
      config.ai={...config.ai,enabled:true,endpoint:'bo-ai',timeoutMs:8000};
      res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(req.method==='HEAD'?'':JSON.stringify(config));return;
    }
    if(!pages.has(path)&&!path.startsWith('assets/'))return fail(404);
    if(path.split('/').some(p=>p.startsWith('.')))return fail(404);
    const file=realpathSync(resolve(root,path));
    if(!file.startsWith(realpathSync(root)+sep)||!statSync(file).isFile())return fail(404);
    res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','x-content-type-options':'nosniff'});
    if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
  }catch{if(!res.headersSent)fail(404);else res.end();}
}).listen(8789,'127.0.0.1',()=>console.log('Online preview ready on 127.0.0.1:8789; 50 AI/day shared, persistent counters.'));
