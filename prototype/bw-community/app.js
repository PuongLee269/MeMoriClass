/* Trang Cộng đồng đen trắng (prototype): chép hành vi từ community.html (6 quả cầu nối bằng một sợi dây, thẻ hồ sơ, bài thơ, phát lại),
   hình ảnh đen trắng, Bọ bằng sprite đen trắng. Khung vẽ bằng DOM + SVG thay cho canvas. */
(async()=>{
'use strict';
const REL='../../',BO_PAGE='../bw-bo/',BO_IMG='../bw-bo/img/bo/';
const CW=1672,CH=941,PW=852,PH=1846;
const $=id=>document.getElementById(id);
const el=(t,c,tx,h)=>{const e=document.createElement(t);if(c)e.className=c;if(tx!=null)e.textContent=tx;if(h!=null)e.innerHTML=h;return e};
const SVGNS='http://www.w3.org/2000/svg',sv=(t,a)=>{const e=document.createElementNS(SVGNS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=new URLSearchParams(location.search);
const FREEZE=Q.get('freeze')==='1';
if(FREEZE)document.documentElement.classList.add('still');
const asset=u=>/^(https?:|data:|\.\.\/|\/)/.test(u)?u:REL+u;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

/* ===== NỘI DUNG MẶC ĐỊNH (giống assets/content/community.json; admin sửa file JSON, trang tự nạp) ===== */
const POEM0=['Giữa muôn vàn vì sao, ta tìm thấy nhau.','Sợi dây nhân duyên nối những tâm hồn,','để sự kết nối còn mãi với thời gian.'];
const MEMBERS0=[
  {id:'m1',name:'Linh Nguyễn',place:'Hà Nội',avatar:'assets/community/avatar.webp',href:'https://example.com/1',caption:'Người kể chuyện (nội dung mẫu)'},
  {id:'m2',name:'Minh Trần',place:'Đà Lạt',avatar:'assets/community/avatar.webp',href:'https://example.com/2',caption:'Người làm vườn (nội dung mẫu)'},
  {id:'m3',name:'An Phạm',place:'Huế',avatar:'assets/community/avatar.webp',href:'https://example.com/3',caption:'Bạn đồng hành (nội dung mẫu)'},
  {id:'m4',name:'Mai Lê',place:'Đà Nẵng',avatar:'assets/community/avatar.webp',href:'https://example.com/4',caption:'Người sáng tạo (nội dung mẫu)'},
  {id:'m5',name:'Khoa Vũ',place:'TP. Hồ Chí Minh',avatar:'assets/community/avatar.webp',href:'https://example.com/5',caption:'Người khám phá (nội dung mẫu)'},
  {id:'m6',name:'Vy Đỗ',place:'Cần Thơ',avatar:'assets/community/avatar.webp',href:'https://example.com/6',caption:'Người giữ ký ức (nội dung mẫu)'}
];
const CC=await MemoriContent.load('community',{pageTitle:'Cộng Đồng Me.Mori',srTitle:'Cộng đồng Me.Mori',replayLabel:'↻ Phát lại',poem:POEM0,members:MEMBERS0});
const SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
document.title=(CC.pageTitle||'Cộng Đồng Me.Mori')+' (bản mẫu đen trắng)';
MemoriContent.setText('#srt',CC.srTitle);MemoriContent.setText('#replay',CC.replayLabel);
MemoriContent.setText('.loader-text',CC.srTitle);
$('view').setAttribute('aria-label',CC.srTitle||'Cộng đồng Me.Mori');
let POEM=(CC.poem||[]).filter(l=>typeof l==='string'&&l.trim()).slice(0,8);if(!POEM.length)POEM=POEM0;
const MEMBERS=MEMBERS0.map(d=>{const c=(CC.members||[]).find(x=>x&&x.id===d.id)||d;
  return{id:d.id,name:c.name||d.name,place:typeof c.place==='string'?c.place:d.place,avatar:asset(MemoriContent.url(c.avatar,d.avatar)),href:MemoriContent.url(c.href,d.href),caption:typeof c.caption==='string'?c.caption:d.caption}});

/* neo 6 quả cầu trên canvas 1672×941 (từ layers.json trang cũ); sợi dây đi lần lượt 0-1-2-3-4-5, mỗi đoạn một cung */
const ANCH=[[289,185],[367,478],[667,346],[1011,247],[1097,541],[1461,391]];
const BOWS=[.1,-.09,.08,-.1,.09];

const view=$('view'),scenery=$('scenery'),rope=$('rope'),orbsHost=$('orbs'),poemBox=$('poemBox'),bo=$('bo'),replayBtn=$('replay');
let W=0,H=0,land=true,S=1;
const orbs=[];let av=null,openIdx=-1;

/* ===== dựng DOM ===== */
POEM.forEach(l=>poemBox.appendChild(el('div',null,l)));
const gHand=sv('g',{class:'hand'});rope.appendChild(gHand);
const segs=[];
for(let i=0;i<5;i++){
  const m=sv('path',{class:'main seg',pathLength:'1'}),t=sv('path',{class:'thin seg',pathLength:'1'});
  gHand.appendChild(m);gHand.appendChild(t);segs.push({m,t});
}
const link=sv('path',{class:'link',pathLength:'1'});gHand.appendChild(link);
MEMBERS.forEach((m,i)=>{
  const b=el('button','orb');b.type='button';
  b.setAttribute('aria-label',m.name+(m.place?', '+m.place:'')+': xem hồ sơ');b.setAttribute('aria-expanded','false');
  const wrap=el('span','bob'),im=new Image();im.alt='';im.decoding='async';im.draggable=false;im.src='img/orb-'+(i+1)+'.webp';wrap.appendChild(im);b.appendChild(wrap);
  b.style.setProperty('--b',(-i*1.1).toFixed(1)+'s');
  const o={el:b,m,i,x:0,y:0,r:50,d:100};
  b.addEventListener('click',e=>{e.stopPropagation();openAv(i)});
  b.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')b.classList.add('prs')});
  ['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>b.classList.remove('prs')));
  orbsHost.appendChild(b);orbs.push(o);
});

/* ===== bố cục ===== */
function layout(){
  W=innerWidth;H=innerHeight;land=W/H>=1.05;
  scenery.textContent='';
  const bg=new Image();bg.alt='';bg.decoding='async';bg.draggable=false;
  const nw=land?CW:PW,nh=land?CH:PH,cover=Math.max(W/nw,H/nh);
  bg.src=land?'img/bg-desk-bw.webp':'img/bg-phone-bw.webp';
  bg.style.cssText='left:'+((W-nw*cover)/2)+'px;top:'+((H-nh*cover)/2)+'px;width:'+nw*cover+'px;height:'+nh*cover+'px';
  scenery.appendChild(bg);scenery.appendChild(el('div','veil'+(land?'':' m')));
  let pts=[],d;
  if(land){
    const contain=Math.min(W/CW,H/CH);let OX=(W-CW*cover)/2,OY=(H-CH*cover)/2;S=cover;
    const bad=ANCH.some(a=>{const x=OX+a[0]*S,y=OY+a[1]*S,r=83*S+10;return x-r<0||x+r>W||y-r<0||y+r>H});
    if(bad){S=contain;OX=(W-CW*S)/2;OY=(H-CH*S)/2}
    d=166*S;pts=ANCH.map(a=>[OX+a[0]*S,OY+a[1]*S]);
    bo.style.cssText='';bo.style.width=bo.style.height=clamp(92*S,76,104)+'px';
  }else{
    S=1;d=Math.min(112,W*.28);
    const bsz=76;bo.style.width=bo.style.height=bsz+'px';
    poemBox.style.setProperty('--pd','2.4s');
    const poemH=poemBox.offsetHeight||130,poemTop=H-poemH-24;
    bo.style.bottom=(poemH+24+10)+'px';
    const top=124+d/2,bot=poemTop-28-d/2,xs=[.3,.72,.3,.7,.3,.7];
    for(let i=0;i<6;i++)pts.push([W*xs[i],top+(bot-top)*i/5]);
  }
  orbs.forEach((o,i)=>{o.d=d;o.r=d/2;o.x=pts[i][0];o.y=pts[i][1];
    const s=o.el.style;s.width=s.height=d+'px';s.setProperty('--x',(o.x-d/2).toFixed(1)+'px');s.setProperty('--y',(o.y-d/2).toFixed(1)+'px');
    s.setProperty('--d',(.3+i*.12).toFixed(2)+'s')});
  rope.setAttribute('width',W);rope.setAttribute('height',H);rope.setAttribute('viewBox','0 0 '+W+' '+H);
  const ws=land?clamp(S*1.05,.75,1.5):clamp(W/430,.8,1.1);
  segs.forEach((s,i)=>{
    const A=orbs[i],B=orbs[i+1],bow=BOWS[i];
    s.m.setAttribute('d',curve(A,B,bow));s.t.setAttribute('d',curve(A,B,-bow*.55));
    s.m.style.strokeWidth=(3.4*ws).toFixed(2);s.t.style.strokeWidth=(1.5*ws).toFixed(2);
    s.m.style.setProperty('--d',(1+i*.25).toFixed(2)+'s');s.t.style.setProperty('--d',(1.05+i*.25).toFixed(2)+'s');
  });
  poemBox.style.setProperty('--pd','2.4s');
  if(av)placeAv(openIdx);
}
function curve(A,B,bow){
  const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,bw=bow*L;
  const p1=[A.x+ux*L*.3+nx*bw*1.4,A.y+uy*L*.3+ny*bw*1.4],p2=[A.x+ux*L*.7+nx*bw*.6,A.y+uy*L*.7+ny*bw*.6];
  const f=n=>n.toFixed(1);
  return'M'+f(A.x)+' '+f(A.y)+'C'+f(p1[0])+' '+f(p1[1])+' '+f(p2[0])+' '+f(p2[1])+' '+f(B.x)+' '+f(B.y);
}

/* ===== thẻ hồ sơ (ảnh màu) ===== */
const obstacles=()=>[poemBox,replayBtn,$('mapBtn'),$('np'),bo].map(e=>e.getBoundingClientRect());
function inter(r,o){const cx=Math.max(r.x,Math.min(o.x,r.x+r.w)),cy=Math.max(r.y,Math.min(o.y,r.y+r.h)),dd=Math.hypot(o.x-cx,o.y-cy);return dd<o.r?o.r-dd:0}
function placeAv(i){
  const a=av,o=orbs[i],w=a.offsetWidth,h=a.offsetHeight,g=Math.max(22,o.r*.3),pad=12,topSafe=land?84:66;
  const cand=[{x:o.x+o.r+g,y:o.y-h/2},{x:o.x-o.r-g-w,y:o.y-h/2},{x:o.x-w/2,y:o.y-o.r-g-h},{x:o.x-w/2,y:o.y+o.r+g}];
  const obs=obstacles();let best=null;
  cand.forEach(c=>{
    const x=clamp(c.x,pad,W-w-pad),y=clamp(c.y,topSafe,H-h-pad),r={x,y,w,h};let sc=0;
    orbs.forEach(q=>{sc+=inter(r,{x:q.x,y:q.y,r:q.r*.78})*(q===o?3:1)});
    sc+=Math.abs(x-c.x)+Math.abs(y-c.y);
    obs.forEach(b=>{const ox=Math.min(x+w,b.right+8)-Math.max(x,b.left-8),oy=Math.min(y+h,b.bottom+8)-Math.max(y,b.top-8);if(ox>0&&oy>0)sc+=2000+oy*4});
    if(!best||sc<best.sc)best={x,y,sc};
  });
  a.style.transform='translate3d('+best.x+'px,'+best.y+'px,0)';a._pos=best;
  /* dây ngắn nối quả cầu với thẻ */
  const R={x:best.x,y:best.y,w,h};let tx=clamp(o.x,R.x,R.x+R.w),ty=clamp(o.y,R.y,R.y+R.h);
  if(o.x>R.x&&o.x<R.x+R.w)ty=o.y<R.y?R.y:R.y+R.h;else if(o.y>R.y&&o.y<R.y+R.h)tx=o.x<R.x?R.x:R.x+R.w;
  const dx=tx-o.x,dy=ty-o.y,L=Math.hypot(dx,dy)||1,sx=o.x+dx/L*o.r*.85,sy=o.y+dy/L*o.r*.85;
  link.setAttribute('d','M'+sx.toFixed(1)+' '+sy.toFixed(1)+'Q'+((sx+tx)/2-dy/L*10).toFixed(1)+' '+((sy+ty)/2+dx/L*10).toFixed(1)+' '+tx.toFixed(1)+' '+ty.toFixed(1));
}
function closeAv(){
  if(!av)return;const a=av;av=null;
  if(openIdx>=0){orbs[openIdx].el.setAttribute('aria-expanded','false');orbs[openIdx].el.classList.remove('sel')}
  openIdx=-1;orbsHost.classList.remove('dim');link.classList.remove('on');a.classList.remove('on');
  if(RM||FREEZE){a.remove();return}
  a.animate([{opacity:1},{opacity:0,transform:a.style.transform+' scale(.6)'}],{duration:180,fill:'forwards'}).onfinish=()=>a.remove();
}
function openAv(i){
  const same=openIdx===i;closeAv();if(same)return;
  const o=orbs[i],m=o.m,a=el('a','avatar');
  a.href=m.href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',m.name+': mở liên kết');
  a.style.width=Math.round(Math.min(land?204:164,W*.46))+'px';
  const pic=el('span','pic'),im=new Image();im.alt='';im.draggable=false;im.src=m.avatar;pic.appendChild(im);a.appendChild(pic);
  const cap=el('span','cap'),b=el('b',null,m.name);cap.appendChild(b);
  if(m.place)cap.appendChild(el('span',null,m.place));
  if(m.caption)cap.appendChild(el('span',null,m.caption));
  a.appendChild(cap);
  o.el.after(a);
  av=a;openIdx=i;o.el.setAttribute('aria-expanded','true');o.el.classList.add('sel');orbsHost.classList.add('dim');
  a.classList.add('on');a.style.opacity=1;placeAv(i);link.classList.add('on');
  if(!RM&&!FREEZE){const t=a.style.transform;a.animate([{opacity:0,transform:t+' scale(.3)'},{opacity:1,transform:t+' scale(1.05)',offset:.7},{opacity:1,transform:t+' scale(1)'}],{duration:380,easing:'cubic-bezier(.2,.8,.3,1)'})}
  boFlash('happy',1300);
}

/* ===== Bọ (sprite đen trắng) ===== */
const BO_POSES=['idle','wave','happy','surprised','think','sleep'];
const BO={cur:null,mood:'idle',tt:0,st:0,asleep:false,front:0,flashUntil:0,frozen:FREEZE};
const boImgs=[...bo.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]={ready:new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()})};im.src=BO_IMG+p+'.webp'});
function boShow(pose){if(pose===BO.cur)return;const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;BO.cur=pose}
const boBase=()=>BO.asleep?'sleep':BO.mood;
function boFlash(pose,ms){if(BO.frozen)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose);BO.tt=setTimeout(()=>boShow(boBase()),ms)}
function boArmSleep(){clearTimeout(BO.st);if(BO.frozen)return;BO.st=setTimeout(()=>{BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(BO.frozen)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
(function boIdleLoop(){setTimeout(()=>{if(!BO.asleep&&!document.hidden)boFlash(Math.random()<.5?'wave':'think',1400);boIdleLoop()},5000+Math.random()*7000)})();
boShow('idle');boArmSleep();

/* ===== thanh gợi ý: về trang Bọ + trang kế tiếp ===== */
(async()=>{
  const nav=$('np'),BW=['gioithieu','method','khampha','gallery','community','dangky'];
  const BW_PAGES={'index.html':'../bw-bo/','sitemap.html':'../bw-map/','gioithieu.html':'../bw-gioithieu/','method.html':'../bw-method/','roadmap.html':'../bw-roadmap/','lopf1.html':'../bw-lopf1/','khampha.html':'../bw-khampha/','gallery.html':'../bw-gallery/','community.html':'../bw-community/','dangky.html':'../bw-dangky/'};
const fixHref=h=>{h=String(h==null?'':h);if(!h||/^(https?:|mailto:|#|\.\.\/)/i.test(h))return h;const m=/^([^#?]*)([?#].*)?$/.exec(h);return BW_PAGES[m[1]]?BW_PAGES[m[1]]+(m[2]||''):REL+h};
  const home=el('a','np-home');home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
  home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
  const DEF={max:2,pages:[
    {id:'community',name:'Cộng đồng',href:'community.html',next:['dangky']},
    {id:'dangky',name:'Đăng ký',href:'dangky.html',next:['community','gioithieu']}]};
  const J=await MemoriContent.load('journey',DEF,{replace:['pages']});
  const ps=(J&&Array.isArray(J.pages))?J.pages:DEF.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('community'),out=[];
  ((cur&&cur.next)||[]).forEach(x=>{const p=by(x);if(p&&p.id!=='community'&&p.name&&MemoriContent.url(p.href,'')&&!out.includes(p))out.push(p)});
  out.slice(0,2).forEach(pg=>{const a=el('a');a.href=fixHref(MemoriContent.url(pg.href,''));
    const n=el('span','np-n'+(pg.short?' has-s':''));n.textContent=pg.name;a.appendChild(n);
    if(pg.short){const s=el('span','np-s');s.textContent=pg.short;a.appendChild(s)}
    const r=el('span');r.textContent='→';r.setAttribute('aria-hidden','true');a.appendChild(r);nav.appendChild(a)});
})();

/* ===== phát lại, đóng thẻ ===== */
function replay(){
  closeAv();view.classList.remove('go');void view.offsetWidth;view.classList.add('go');boFlash('surprised',900);
}
replayBtn.addEventListener('click',replay);
document.addEventListener('click',e=>{if(!e.target.closest('.avatar'))closeAv()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeAv()});
addEventListener('resize',()=>{layout()});

/* ===== khởi động ===== */
function loadGate(){
  const loader=document.querySelector('.loader'),bar=loader.querySelector('.loader-track span');
  const dec=im=>new Promise(r=>{const g=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};if(im.complete&&im.naturalWidth)g();else if(im.complete)r();else{im.addEventListener('load',g,{once:true});im.addEventListener('error',()=>r(),{once:true})}});
  const list=[...document.querySelectorAll('.scenery img,.orb img')].map(dec);
  BO_POSES.forEach(p=>list.push(BOC[p].ready));
  const sample=POEM.join('')+CC.srTitle+CC.replayLabel+MEMBERS.map(m=>m.name+m.place+m.caption).join('')+' Đăng ký Cộng đồng Về trang Bọ Bản đồ trang';
  ['400 32px "Oooh Baby"','400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"','600 17px "Be Vietnam Pro"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
  let n=0;const tot=list.length;list.forEach(p=>p.then(()=>{n++;bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'}));
  const all=Promise.all(list),timeout=new Promise(r=>setTimeout(r,20000)),minShow=new Promise(r=>setTimeout(r,RM?200:900));
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
layout();
loadGate().then(()=>{
  layout();
  window.__loaderDone=performance.now();view.classList.add('in','go');
  if(!BO.frozen)boFlash('wave',1500);
});
window.__cm={replay,open:openAv,close:closeAv,get open_(){return openIdx},get state(){return{W,H,land,S,bo:BO.cur,open:openIdx,orbs:orbs.map(o=>[Math.round(o.x),Math.round(o.y),Math.round(o.d)])}}};
})();
