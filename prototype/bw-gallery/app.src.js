/* Trang Workshop (gallery) đen trắng (prototype): chép hành vi từ gallery.html (9 viên đá, chọn bộ ba -> máy chiếu đổi ảnh, khung xem lớn),
   hình ảnh đen trắng bằng DOM/SVG; ảnh workshop đang chiếu giữ màu thật; Bọ bằng sprite đen trắng. Không dùng canvas. */
(async()=>{
'use strict';
const REL='../../',BO_PAGE='../bw-bo/',BO_IMG='../bw-bo/img/bo/';
const $=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=new URLSearchParams(location.search),FROZEN=Q.get('freeze')==='1';
if(FROZEN)document.documentElement.classList.add('still');
const STILL=RM||FROZEN;
const el=(tag,cls,css,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(css)e.style.cssText=css;if(html)e.innerHTML=html;return e};
const asset=u=>/^(https?:|data:|\.\.\/|\/)/.test(u)?u:REL+u;

/* ===== NỘI DUNG MẶC ĐỊNH (giống assets/content/gallery.json; admin sửa file JSON, trang tự nạp) ===== */
const DEF=__DEFAULTS__;
const GC=await MemoriContent.load('gallery',DEF,{replace:['photos']}),SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
document.title=(GC.pageTitle||'Workshop Me.Mori')+' (bản mẫu đen trắng)';
MemoriContent.setText('#hint',GC.hint);
const PHOTOS=(()=>{const seen={},out=[];for(const p of GC.photos){if(!p||typeof p.id!=='string'||!/^[a-z0-9_-]{1,32}$/i.test(p.id)||seen[p.id])continue;const src=MemoriContent.url(p.src,'');if(!src)continue;seen[p.id]=1;
  const tx=k=>typeof p[k]==='string'?p[k]:'',nm=k=>typeof p[k]==='number'&&isFinite(p[k])&&p[k]>0&&p[k]<20000?Math.round(p[k]):0;
  const fu=k=>{const u=MemoriContent.url(p[k],'');return u?asset(u):''};
  out.push({id:p.id,src:asset(src),alt:tx('alt'),title:tx('title'),desc:tx('desc'),caption:tx('caption'),full:fu('full'),fullm:fu('fullm'),fw:nm('fw'),fh:nm('fh')})}
  return out.length?out:DEF.photos.map(p=>({id:p.id,src:asset(p.src),alt:p.alt,title:p.title,desc:p.desc,caption:p.caption,full:asset(p.full),fullm:asset(p.fullm),fw:p.fw,fh:p.fh}))})();
const ASSIGNMENTS=DEF.assignments.map((d,i)=>{const c=GC.assignments&&GC.assignments[i];const ok=c&&PHOTOS.some(p=>p.id===c.photo);return{gems:d.gems,photo:ok?c.photo:(PHOTOS.some(p=>p.id===d.photo)?d.photo:PHOTOS[0].id)}});
const GNAME=['đỏ','xanh dương','cam','xanh lá','tím','vàng chanh','lam','hồng','trắng'];

/* ===== hình học hai bố cục (desktop 1672x941; điện thoại 852x1844) ===== */
const GEO={
  d:{W:1672,H:941,F:{x:405,y:98,w:856,h:436},lens:[808,659],proj:{x:664,y:607,w:300},tray:{x:962,y:640,w:310,h:274,cw:90,ch:78,pad:14,gap:6},bo:{x:500,y:630,s:132},
     fgL:{x:-4,w:487,h:167},fgR:{w:468,h:201},sock:62},
  m:{W:852,H:1844,F:{x:44,y:292,w:764,h:389},lens:[426,957],proj:{x:268,y:900,w:316},tray:{x:92,y:1210,w:668,h:548,cw:200,ch:160,pad:24,gap:10},bo:{x:30,y:972,s:200},
     fgL:{x:-4,w:439,h:151},fgR:{w:420,h:180},sock:70}
};
let MODE='d',S=1,built={d:false,m:false},ST=null,G=null,gemEls=[],gemPos=[];
const view=$('view'),live=$('live'),hint=$('hint');
const gemSvg=i=>{
  const dark=(i===0||i===3||i===8);
  const fc=dark?'#fbfbfa':'#111';
  return `<svg viewBox="0 0 100 76" aria-hidden="true" focusable="false"><g class="gm">
    <ellipse class="gsh" cx="52" cy="73" rx="34" ry="4.5"/>
    <g filter="url(#hand)"><path class="gbody" d="M28 5H72L96 28 50 72 4 28Z" fill="url(#gp${i})" stroke="#111" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M4 28H96M28 5 38 28 50 72 62 28 72 5" fill="none" stroke="${fc}" stroke-width="${dark?1.8:2}" stroke-linejoin="round"/>
    <path d="M4 28H96" fill="none" stroke="#111" stroke-width="2.4"/></g></g></svg>`};

/* ===== dựng cảnh ===== */
const img=(src,x,y,w,h,cls)=>`<img class="L ${cls||''}" src="${src}" alt="" draggable="false" style="left:${x}px;top:${y}px;width:${w}px;${h?'height:'+h+'px':''}">`;
function beamSvg(g,k){
  const [lx,ly]=g.lens,f=g.F,by=f.y+f.h+10,cx=f.x+f.w/2,half=f.w*(k==='m'?.34:.3),n=9,id='bf'+k;
  let lines='';for(let i=0;i<n;i++){const t=i/(n-1)-.5,x=cx+t*2*half;lines+=`<path d="M${lx+t*30} ${ly}L${x} ${by}" stroke-width="${i%2?1.5:2.2}" opacity="${i%2?.5:.8}"/>`}
  lines+=`<path d="M${lx-15} ${ly}L${cx-half-10} ${by}M${lx+15} ${ly}L${cx+half+10} ${by}" stroke-width="2.6"/>`;
  return `<svg class="beam" width="${g.W}" height="${g.H}" viewBox="0 0 ${g.W} ${g.H}" fill="none" stroke="#111" stroke-linecap="round" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="${ly}" x2="0" y2="${by}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#111" stop-opacity=".16"/><stop offset="1" stop-color="#111" stop-opacity="0"/></linearGradient></defs>
  <path d="M${lx-15} ${ly}L${cx-half-10} ${by}L${cx+half+10} ${by}L${lx+15} ${ly}Z" fill="url(#${id})" stroke="none"/><g filter="url(#hand)">${lines}</g></svg>`}
function trayHtml(g){
  const t=g.tray;let cells='';
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)cells+=`<i class="cell" style="left:${t.pad+c*(t.cw+t.gap)}px;top:${t.pad+r*(t.ch+t.gap)}px;width:${t.cw}px;height:${t.ch}px"></i>`;
  return `<div class="tray" style="left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px"><div class="tray-bg"></div>${cells}</div>`}
function build(mode){
  const g=GEO[mode],st=$(mode==='d'?'stage':'mstage'),f=g.F,t=g.tray;
  const bg=mode==='d'?'img/bg-desk-bw.webp':'img/bg-phone-bw.webp';
  st.style.width=g.W+'px';st.style.height=g.H+'px';
  st.innerHTML=`<div class="scenery">${img(bg,0,0,g.W,g.H)}<div class="veil ${mode}"></div></div>`
   +`<div class="fgw" style="left:${g.fgL.x}px;top:${g.H-g.fgL.h+6}px;width:${g.fgL.w}px;height:${g.fgL.h}px">${img('img/fgL.webp',0,0,g.fgL.w,g.fgL.h)}</div>`
   +`<div class="fgw" style="left:${g.W-g.fgR.w+4}px;top:${g.H-g.fgR.h+6}px;width:${g.fgR.w}px;height:${g.fgR.h}px">${img('img/fgR.webp',0,0,g.fgR.w,g.fgR.h)}</div>`
   +beamSvg(g,mode)
   +img('img/projector.webp',g.proj.x,g.proj.y,g.proj.w,0,'proj')
   +`<svg class="gsock" viewBox="0 0 100 76" style="left:${g.lens[0]-g.sock/2}px;top:${g.lens[1]-g.sock*.36}px;width:${g.sock}px" aria-hidden="true"><g filter="url(#hand)"><path d="M28 5H72L96 28 50 72 4 28Z" fill="#fbfbfa" stroke="#111" stroke-width="5" stroke-linejoin="round"/><path d="M4 28H96M28 5 38 28 50 72 62 28 72 5" fill="none" stroke="#111" stroke-width="3"/></g></svg>`
   +`<div class="pframe" id="pf${mode}" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px"><i class="pf-sh"></i><i class="pf-bd"></i><div class="pwin"></div><div class="pfx"><i class="bar"></i><i class="bar"></i><i class="bar"></i></div></div>`
   +`<button class="view-btn" id="vb${mode}" type="button" hidden style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px"><span class="vb-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></span></button>`
   +trayHtml(g)
   +`<svg class="thread" width="${g.W}" height="${g.H}" viewBox="0 0 ${g.W} ${g.H}" aria-hidden="true"><g filter="url(#hand2)"><polyline class="t-un" points=""/><polyline class="t-ln" points=""/></g></svg>`
   +`<div class="sparks"></div>`;
  const els=[],pos=[];
  for(let i=0;i<9;i++){
    const r=Math.floor(i/3),c=i%3,cx=t.x+t.pad+c*(t.cw+t.gap)+t.cw/2,cy=t.y+t.pad+r*(t.ch+t.gap)+t.ch/2,w=t.cw*.84;
    const b=el('button','gem','left:'+(cx-w/2)+'px;top:'+(cy-w*.38-4)+'px;width:'+w+'px;height:'+(w*.76+8)+'px;--i:'+i,gemSvg(i));
    b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Viên đá '+GNAME[i]+', số '+(i+1));
    b.addEventListener('click',()=>toggleKey(i));b.addEventListener('focus',()=>{focusGem=i;rf()});b.addEventListener('blur',()=>{if(focusGem===i)focusGem=-1;rf()});
    st.appendChild(b);els.push(b);pos.push([cx,cy]);
  }
  const pf=$('pf'+mode),vb=$('vb'+mode);
  vb.addEventListener('click',()=>{const i=PHOTOS.findIndex(p=>p.id===curPhoto);lbOpenAt(i<0?0:i)});
  built[mode]={st,g,gems:els,pos,pf,pwin:pf.querySelector('.pwin'),vb,tun:st.querySelector('.t-un'),tln:st.querySelector('.t-ln'),thread:st.querySelector('.thread'),sparks:st.querySelector('.sparks'),beam:st.querySelector('.beam'),sock:st.querySelector('.gsock'),cw:t.cw,ch:t.ch};
}
function applyMode(){
  view.classList.toggle('m',MODE==='m');document.body.classList.toggle('m-on',MODE==='m');
  if(!built[MODE])build(MODE);
  G=built[MODE];ST=G.st;gemEls=G.gems;gemPos=G.pos;
  const bp=G.g.bo;boEl.style.cssText=`left:${bp.x}px;top:${bp.y}px;width:${bp.s}px;height:${bp.s}px`;ST.appendChild(boEl);
  if(introDone)gemEls.forEach(b=>b.classList.add('shown'));
  if(curPhoto&&photoReady(curPhoto))setPhoto(curPhoto,false);
  gemEls.forEach((b,i)=>{b.classList.toggle('sel',sel.includes(i));b.setAttribute('aria-pressed',sel.includes(i)?'true':'false')});
  rf();
}
function layout(){
  const vw=innerWidth,vh=innerHeight,nm=(vw/vh<0.9)?'m':'d';
  if(nm!==MODE){MODE=nm;applyMode()}
  const g=G.g,s=Math.min(vw/g.W,vh/g.H),ox=(vw-g.W*s)/2,oy=vh-g.H*s;S=s;
  ST.style.transform=`translate3d(${ox}px,${oy}px,0) scale(${s})`;
}

/* ===== ảnh chiếu ===== */
const PH={};for(const p of PHOTOS)PH[p.id]={img:null,ok:false,done:false,loading:false,cbs:[],def:p};
function ensurePhoto(id,cb){const o=PH[id];if(!o)return;
  if(o.done){if(cb)cb(!o.ok);return}
  if(cb)o.cbs.push(cb);if(o.loading)return;o.loading=true;
  const fin=err=>{o.done=true;o.loading=false;const l=o.cbs;o.cbs=[];l.forEach(f=>f(err))};
  const im=new Image();im.decoding='async';im.draggable=false;im.onload=()=>{o.img=im;o.ok=true;fin(false)};im.onerror=()=>fin(true);im.src=o.def.src}
const photoReady=id=>PH[id]&&PH[id].ok;
let curPhoto=null,introDone=false;
function setPhoto(id,animate){
  const o=PH[id],pw=G.pwin,prev=[...pw.querySelectorAll('.pimg')].pop();
  const im=el('img','pimg');im.src=o.def.src;im.alt=o.def.alt||o.def.title||'';im.draggable=false;pw.appendChild(im);
  curPhoto=id;
  const done=()=>{[...pw.querySelectorAll('.pimg')].forEach(x=>{if(x!==im)x.remove()})};
  if(animate&&!STILL&&im.animate){
    im.animate([{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:850,easing:'cubic-bezier(.3,.6,.3,1)',fill:'both'}).onfinish=done;
    if(prev){G.pf.classList.remove('scan');void G.pf.offsetWidth;G.pf.classList.add('scan');const pf=G.pf;setTimeout(()=>pf.classList.remove('scan'),950)}
  }else done();
  G.vb.hidden=!introDone;G.vb.setAttribute('aria-label','Xem ảnh lớn: '+(o.def.title||o.def.alt));
}

/* ===== chọn bộ ba viên đá ===== */
const say=t=>{live.textContent='';setTimeout(()=>{live.textContent=t},30)};
const keyOf=a=>[...a].sort((x,y)=>x-y).join(',');
const MAP=new Map();for(const a of ASSIGNMENTS)MAP.set(keyOf(a.gems),a.photo);
let sel=[],stroke=false,locked=false,pointer=null,hover=-1,focusGem=-1,fireTok=0,glitchT=0,thHold=false;
function setSel(a){sel=a;gemEls.forEach((b,i)=>{b.classList.toggle('sel',sel.includes(i));b.setAttribute('aria-pressed',sel.includes(i)?'true':'false')});rf()}
function rf(){ // vẽ lại sợi nối + viền rê/lấy nét
  if(!G)return;
  gemEls.forEach((b,i)=>b.classList.toggle('hot',(hover===i||focusGem===i)&&!sel.includes(i)));
  if(thHold)return;
  let pts=sel.map(i=>gemPos[i]);
  if(stroke&&!locked&&pointer&&pts.length)pts=pts.concat([pointer]);
  const s=pts.length>1?pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '):'';
  G.tun.setAttribute('points',s);G.tln.setAttribute('points',s);G.thread.classList.toggle('on',pts.length>1);
}
function burst(i,n){if(STILL||!G)return;const [x,y]=gemPos[i];
  for(let k=0;k<n;k++){const d=el('i','spk'+(k%3===0?' ln':k%3===1?' wh':''));const a=Math.random()*Math.PI*2,r=30+Math.random()*34;
    d.style.cssText=`left:${x}px;top:${y-6}px;--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r-16}px;--rot:${a}rad`;G.sparks.appendChild(d);setTimeout(()=>d.remove(),800)}}
function fire(){
  const set=sel.slice(),id=MAP.get(keyOf(set)),tok=++fireTok,Gx=G;
  // sợi nối giữ lại rồi mờ dần
  rf();thHold=true;Gx.thread.classList.add('fade');
  setTimeout(()=>{thHold=false;Gx.thread.classList.remove('fade');rf()},500);
  const noPhoto=()=>{boEvent('glitch');glitch();say('Bộ ba viên đá này chưa có ảnh. Máy chiếu bị nhiễu, hãy thử bộ khác.')};
  const show=()=>{
    if(curPhoto!==id)setPhoto(id,true);
    flare();boEvent('photo');say('Đã đổi ảnh: '+PH[id].def.alt);
  };
  if(id&&PH[id]){
    if(photoReady(id))show();else ensurePhoto(id,err=>{if(tok!==fireTok)return;if(err||!photoReady(id))noPhoto();else show()});
  }else noPhoto();
  sel=[];gemEls.forEach(b=>{b.classList.remove('sel');b.setAttribute('aria-pressed','false')});
}
function flare(){if(STILL||!G)return;[G.beam,G.sock].forEach(e=>{e.classList.remove('flare');void e.getBoundingClientRect();e.classList.add('flare')})}
function glitch(){
  if(!G)return;clearTimeout(glitchT);
  const Gx=G;Gx.pf.classList.add('glitch');Gx.beam.classList.add('gl');
  const bars=[...Gx.pf.querySelectorAll('.bar')],rnd=(a,b)=>a+Math.random()*(b-a);
  const tick=()=>bars.forEach(b=>{b.style.top=rnd(0,95)+'%';b.style.height=rnd(1.5,5)+'%';b.style.width=rnd(20,60)+'%';b.style.left=rnd(0,45)+'%'});
  tick();const iv=STILL?0:setInterval(tick,90);
  glitchT=setTimeout(()=>{clearInterval(iv);Gx.pf.classList.remove('glitch');Gx.beam.classList.remove('gl');flare()},RM?900:1350);
}
function addGem(i){if(sel.length>=3||sel.includes(i))return;setSel(sel.concat(i));burst(i,6);if(sel.length===3){locked=true;fire()}}
function toggleKey(i){if(!introDone)return;if(sel.includes(i))setSel(sel.filter(x=>x!==i));else addGem(i)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sel.length&&!lbOpen)setSel([])});
function pos(e){const r=ST.getBoundingClientRect(),k=r.width/G.g.W;return [(e.clientX-r.left)/k,(e.clientY-r.top)/k]}
function hitGem(x,y){const hw=G.cw*.5,hh=G.ch*.5;let best=-1,bd=9;for(let i=0;i<9;i++){const ex=x-gemPos[i][0],ey=y-gemPos[i][1];if(Math.abs(ex)>hw||Math.abs(ey)>hh)continue;const d=(ex/G.cw)**2+(ey/G.ch)**2;if(d<bd){bd=d;best=i}}return best}
view.addEventListener('pointerdown',e=>{if(!introDone||lbOpen||e.target.closest('.view-btn'))return;const [x,y]=pos(e);pointer=[x,y];const g=hitGem(x,y);boPtr(x);
  if(g<0)return;try{view.setPointerCapture(e.pointerId)}catch(_){}
  stroke=true;locked=false;thHold=false;setSel([]);hover=g;addGem(g);view.style.cursor='grabbing';e.preventDefault()});
view.addEventListener('pointermove',e=>{if(!introDone||!G||lbOpen)return;const [x,y]=pos(e);pointer=[x,y];const g=hitGem(x,y);boPtr(x);
  if(e.pointerType==='mouse'){hover=g;if(!stroke)view.style.cursor=g>=0?'grab':''}else hover=stroke?g:-1;
  if(stroke&&!locked&&g>=0)addGem(g);rf()});
function endStroke(){if(!stroke)return;stroke=false;view.style.cursor='';if(!locked&&sel.length)setSel([]);locked=false;pointer=null;rf()}
view.addEventListener('pointerup',endStroke);view.addEventListener('pointercancel',endStroke);
view.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!stroke){hover=-1;rf()}});
view.addEventListener('contextmenu',e=>e.preventDefault());

/* ===== khung xem ảnh lớn (lightbox) ===== */
const SVG='<svg viewBox="0 0 24 24" aria-hidden="true">';
const lb=el('div','lb');lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Ảnh Workshop');
lb.innerHTML='<figure class="lb-fig"><img alt="" decoding="async"></figure><div class="lb-cap"><h2></h2><p class="lb-d"></p><p class="lb-c"></p></div>'+
 '<button type="button" class="lb-b lb-x" aria-label="Đóng">'+SVG+'<path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
 '<button type="button" class="lb-b lb-p" aria-label="Ảnh trước">'+SVG+'<path d="M15 5l-7 7 7 7"/></svg></button>'+
 '<button type="button" class="lb-b lb-n" aria-label="Ảnh kế tiếp">'+SVG+'<path d="M9 5l7 7-7 7"/></svg></button>';
document.body.appendChild(lb);
const lbImg=lb.querySelector('img'),lbT=lb.querySelector('h2'),lbD=lb.querySelector('.lb-d'),lbC=lb.querySelector('.lb-c'),lbX=lb.querySelector('.lb-x'),lbP=lb.querySelector('.lb-p'),lbN=lb.querySelector('.lb-n');
let lbI=0,lbOpen=false,lbFrom=null;
const bigSrc=p=>(p.fullm&&matchMedia('(max-width:700px)').matches)?p.fullm:(p.full||p.src);
function lbShow(i){
  const n=PHOTOS.length;lbI=(i%n+n)%n;const p=PHOTOS[lbI];
  lbT.textContent=p.title;lbD.textContent=p.desc;lbC.textContent=p.caption;lbT.hidden=!p.title;lbD.hidden=!p.desc;lbC.hidden=!p.caption;
  lbImg.style.opacity=0;lbImg.alt=p.alt||p.title||'';
  if(p.fw&&p.fh){lbImg.width=p.fw;lbImg.height=p.fh}else{lbImg.removeAttribute('width');lbImg.removeAttribute('height')}
  const src=bigSrc(p),show=()=>{if(PHOTOS[lbI]===p)lbImg.style.opacity=1};
  lbImg.onload=show;lbImg.onerror=()=>{if(PHOTOS[lbI]===p&&src!==p.src){lbImg.onerror=show;lbImg.src=p.src}else show()};
  lbImg.src=src;if(lbImg.complete&&lbImg.naturalWidth)show();
  lbP.hidden=lbN.hidden=n<2;
  if(n>1)[1,n-1].forEach(d=>{new Image().src=bigSrc(PHOTOS[(lbI+d)%n])});
}
function lbClose(){if(!lbOpen)return;lbOpen=false;lb.classList.remove('on');setTimeout(()=>{if(!lbOpen)lb.hidden=true},RM?0:250);{const f=lbFrom&&document.contains(lbFrom)?lbFrom:G.vb;f.focus({preventScroll:true})}}
function lbOpenAt(i){lbFrom=document.activeElement;lbOpen=true;lb.hidden=false;lbShow(i);requestAnimationFrame(()=>{lb.classList.add('on');lbX.focus({preventScroll:true})})}
lbX.addEventListener('click',lbClose);lbP.addEventListener('click',()=>lbShow(lbI-1));lbN.addEventListener('click',()=>lbShow(lbI+1));
lb.addEventListener('click',e=>{if(e.target===lb||e.target===lb.firstChild)lbClose()});
document.addEventListener('keydown',e=>{if(!lbOpen)return;
  if(e.key==='Escape'){lbClose();e.stopImmediatePropagation();return}
  if(e.key==='ArrowLeft'){lbShow(lbI-1);e.preventDefault()}else if(e.key==='ArrowRight'){lbShow(lbI+1);e.preventDefault()}
  else if(e.key==='Tab'){const f=[lbX,lbP,lbN].filter(b=>!b.hidden),k=f.indexOf(document.activeElement);const nx=e.shiftKey?(k<=0?f.length-1:k-1):(k<0||k>=f.length-1?0:k+1);f[nx].focus();e.preventDefault()}},true);
{let sx=null,sy=0;const fig=lb.firstChild;
 fig.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
 fig.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)lbShow(lbI+(dx<0?1:-1))});
 fig.addEventListener('pointercancel',()=>{sx=null})}

/* ===== Bọ (sprite đen trắng), đứng cạnh máy chiếu ===== */
const BO_POSES=['idle','wave','point','happy','sleep','think','confused'];
const BO={cur:null,flip:false,tt:0,st:0,asleep:false,front:0,flashUntil:0,frozen:FROZEN};
const boEl=el('div',null,null,'<div class="flip"><img alt="" draggable="false"><img alt="" draggable="false"></div>');boEl.id='bo';boEl.setAttribute('aria-hidden','true');
const boFlip=boEl.firstChild,boImgs=[...boFlip.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]={ready:new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()})};im.src=BO_IMG+p+'.webp'});
function boShow(pose,flip){flip=!!flip;if(pose===BO.cur&&flip===BO.flip)return;
  const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;
  boFlip.style.transform=flip?'scaleX(-1)':'';BO.cur=pose;BO.flip=flip}
const boBase=()=>BO.asleep?'sleep':'idle';
function boFlash(pose,ms,flip){if(BO.frozen)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose,flip);BO.tt=setTimeout(()=>boShow(boBase()),ms)}
function boEvent(kind){boFlash(kind==='glitch'?'confused':'happy',1500)}
function boPtr(x){ // nhìn theo con trỏ: chỉ về phía con trỏ, về nghỉ sau 6s
  if(BO.frozen||!G||performance.now()<BO.flashUntil)return;const b=G.g.bo,dir=x>b.x+b.s/2?1:-1;
  clearTimeout(BO.tt);BO.asleep=false;boShow('point',dir<0);BO.tt=setTimeout(()=>boShow(boBase()),6000)}
function boArmSleep(){clearTimeout(BO.st);if(BO.frozen)return;BO.st=setTimeout(()=>{BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(BO.frozen)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
(function boIdleLoop(){setTimeout(()=>{if(!BO.asleep&&!stroke&&!document.hidden&&!lbOpen&&BO.cur==='idle')boFlash(Math.random()<.5?'wave':'think',1400);boIdleLoop()},5000+Math.random()*7000)})();
boShow('idle');boArmSleep();

/* ===== thanh gợi ý: về trang Bọ + trang kế tiếp ===== */
(async()=>{
  const nav=$('np');
  const PAGE={'roadmap.html':'../bw-roadmap/','lopf1.html':'../bw-lopf1/','sitemap.html':'../bw-map/','index.html':BO_PAGE,'index.html#':BO_PAGE};
  ['gioithieu','method','khampha','gallery','community','dangky'].forEach(k=>{PAGE[k+'.html']='../bw-'+k+'/'});
  const fixHref=h=>PAGE[h]||(/^(https?:|mailto:|#|\.\.\/)/i.test(h)?h:REL+h);
  const home=el('a','np-home');home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
  home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
  const D0={max:2,pages:[
    {id:'gallery',name:'Workshop',short:'Workshop',href:'gallery.html',next:['community','dangky']},
    {id:'community',name:'Cộng đồng',href:'community.html',next:['dangky']},
    {id:'dangky',name:'Đăng ký',href:'dangky.html',next:['community','gioithieu']}]};
  const J=await MemoriContent.load('journey',D0,{replace:['pages']});
  const ps=(J&&Array.isArray(J.pages))?J.pages:D0.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('gallery'),out=[];
  ((cur&&cur.next)||[]).forEach(x=>{const p=by(x);if(p&&p.name&&MemoriContent.url(p.href,'')&&!out.includes(p))out.push(p)});
  out.slice(0,2).forEach(pg=>{const a=el('a');a.href=fixHref(MemoriContent.url(pg.href,''));
    const n=el('span','np-n'+(pg.short?' has-s':''));n.textContent=pg.name;a.appendChild(n);
    if(pg.short){const s=el('span','np-s');s.textContent=pg.short;a.appendChild(s)}
    const r=el('span');r.textContent='→';r.setAttribute('aria-hidden','true');a.appendChild(r);nav.appendChild(a)});
})();

/* ===== khởi động ===== */
function loadGate(){
  const loader=document.querySelector('.loader'),bar=loader.querySelector('.loader-track span');
  const dec=im=>new Promise(r=>{const g=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};if(im.complete&&im.naturalWidth)g();else if(im.complete)r();else{im.addEventListener('load',g,{once:true});im.addEventListener('error',()=>r(),{once:true})}});
  const list=[...document.images].filter(i=>!i.closest('.loader')).map(dec);
  BO_POSES.forEach(p=>list.push(BOC[p].ready));
  list.push(new Promise(r=>ensurePhoto(PHOTOS[0].id,r)));
  const sample=PHOTOS.map(p=>p.title+p.desc+p.caption).join('')+' Cộng đồng Đăng ký Về trang Bọ Bản đồ trang Viên đá Xem ảnh lớn Workshop';
  ['400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"','400 40px "Oooh Baby"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
  let n=0;const tot=list.length;list.forEach(p=>p.then(()=>{n++;bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'}));
  const all=Promise.all(list),timeout=new Promise(r=>setTimeout(r,30000)),minShow=new Promise(r=>setTimeout(r,RM?200:900));
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
MODE=(innerWidth/innerHeight<0.9)?'m':'d';
applyMode();layout();
addEventListener('resize',layout);
if(window.visualViewport)visualViewport.addEventListener('resize',layout);
loadGate().then(()=>{
  window.__loaderDone=performance.now();view.classList.add('in');
  if(!BO.frozen)boFlash('wave',1500);
  const open=()=>{introDone=true;gemEls.forEach(b=>b.classList.add('shown'));
    const f=PHOTOS[0].id;if(photoReady(f))setPhoto(f,true);else G.pwin.classList.add('fail');
    if(GC.hint)hint.classList.add('on')};
  if(STILL)open();else{view.classList.add('intro');setTimeout(open,1000)}
  setTimeout(()=>PHOTOS.slice(1).forEach(p=>ensurePhoto(p.id)),2500);
});
window.__gl={get state(){return{MODE,S,sel:sel.slice(),curPhoto,introDone,bo:BO.cur,lb:lbOpen}},toggle:toggleKey,gemPos:()=>gemPos.map(p=>p.slice())};
})();
