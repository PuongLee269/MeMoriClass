/* Trang Giới thiệu đen trắng (prototype): chép hành vi từ gioithieu.html (trình phát YouTube qua iframe + postMessage), hình đen trắng, Bọ bằng sprite đen trắng. */
(async()=>{
'use strict';
const REL='../../',BO_PAGE='../bw-bo/',BO_IMG='../bw-bo/img/bo/';
const $=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=new URLSearchParams(location.search);
if(Q.get('freeze')==='1')document.documentElement.classList.add('still');
const asset=u=>/^(https?:|data:|\.\.\/|\/)/.test(u)?u:REL+u;
const BW_PAGES={'index.html':'../bw-bo/','sitemap.html':'../bw-map/','gioithieu.html':'../bw-gioithieu/','method.html':'../bw-method/','roadmap.html':'../bw-roadmap/','lopf1.html':'../bw-lopf1/','khampha.html':'../bw-khampha/','gallery.html':'../bw-gallery/','community.html':'../bw-community/','dangky.html':'../bw-dangky/'};
const fixHref=h=>{
  h=String(h==null?'':h);
  if(!h||/^(https?:|mailto:|#|\.\.\/)/i.test(h))return h;
  const m=/^([^#?]*)([?#].*)?$/.exec(h);
  return BW_PAGES[m[1]]?BW_PAGES[m[1]]+(m[2]||''):REL+h;
};

/* ===== NỘI DUNG MẶC ĐỊNH (giống assets/content/gioithieu.json; admin sửa file JSON, trang tự nạp) ===== */
const CONFIG={
  hosts:['https://www.youtube-nocookie.com','https://www.youtube.com'],
  loadTimeoutMs:8000,loadTalkingMs:25000,
  video:{id:'qHEqQn2xOlM',title:'KMM FILM STUDIO | ĐỪNG CHỨNG KIẾN HÃY LÊN TIẾNG',aspect:16/9,start:0,loop:false,poster:'assets/gioithieu/poster.webp'},
  NEXT_PAGE:'sitemap.html',previewMode:Q.get('noexit')==='1',nextCountdown:3,
  nextText:'Đang chuyển về bản đồ',toastText:'Chuyển về trang bản đồ…',
  copy:{title:'Giới thiệu',sub:'Lớp F2: khám phá bản thân và thế giới qua nghệ thuật kể chuyện. Bốn buổi, mỗi buổi ba giờ, tối đa sáu người, học trực tiếp.',posterTitle:'Giới thiệu Me.Mori',posterSub:'',loading:'Bọ đang trải tấm nền rừng…'}
};
const SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
{
  const C=MemoriContent,DEF={pageTitle:'Giới thiệu Me.Mori',copy:Object.assign({},CONFIG.copy),
    video:{provider:'youtube',id:CONFIG.video.id,title:CONFIG.video.title,aspect:CONFIG.video.aspect,start:0,poster:CONFIG.video.poster},
    nextPage:CONFIG.NEXT_PAGE,nextText:CONFIG.nextText,toastText:CONFIG.toastText};
  try{
    const J=await C.load('gioithieu',DEF);
    document.title=((J.pageTitle||'').trim()||DEF.pageTitle)+' (bản mẫu đen trắng)';
    Object.keys(CONFIG.copy).forEach(k=>{if(typeof J.copy[k]==='string'&&J.copy[k].trim())CONFIG.copy[k]=J.copy[k]});
    const v=J.video,yid=C.youtubeId(v.id);
    if(yid)CONFIG.video.id=yid;
    if(v.title.trim())CONFIG.video.title=v.title;
    if(v.aspect>0.5&&v.aspect<4)CONFIG.video.aspect=v.aspect;
    if(v.start>=0)CONFIG.video.start=Math.floor(v.start);
    CONFIG.video.poster=C.url(v.poster,CONFIG.video.poster);
    CONFIG.NEXT_PAGE=C.url(J.nextPage,CONFIG.NEXT_PAGE,{hash:true});
    if(J.nextText.trim())CONFIG.nextText=J.nextText;
    if(J.toastText.trim())CONFIG.toastText=J.toastText;
  }catch(e){}
}
const view=$('view'),slot=$('slot'),stack=$('stack');
$('fbA').href='https://www.youtube.com/watch?v='+encodeURIComponent(CONFIG.video.id);
{const pi=$('pImg');pi.onerror=()=>pi.classList.add('hide-fail');pi.src=asset(CONFIG.video.poster)}
MemoriContent.setText('#capT',CONFIG.copy.title);MemoriContent.setText('#capP',CONFIG.copy.sub);
MemoriContent.setText('.loader-text',CONFIG.copy.loading);
$('view').style.setProperty('--ar',CONFIG.video.aspect);
slot.setAttribute('aria-label','Trình phát video giới thiệu');
$('pImg').alt=CONFIG.copy.posterTitle||'';

const IC={play:'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
 replay:'<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round"><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4.5V9h4.5"/></svg>',
 vol:'<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.6L12.5 19V5L7.6 9.5z" stroke="none"/><path class="st" d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg>',
 mute:'<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.6L12.5 19V5L7.6 9.5z" stroke="none"/><path class="st" d="M16 9l5 6M21 9l-5 6"/></svg>'};
const mmss=s=>{if(!isFinite(s)||s<0)s=0;s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};

/* ===== BỐ CỤC ===== */
let MOBILE=false;
function layout(){
  const vw=innerWidth,vh=innerHeight;
  MOBILE=vw/vh<0.9;view.classList.toggle('m-on',MOBILE);
  if(slot.classList.contains('pfs')||document.fullscreenElement===slot)return;
  const land=vh<520&&vw>vh,cap=$('cap');cap.style.display=land?'none':'';
  const top=MOBILE?74:Math.max(78,vh*.09),bottom=MOBILE?16:22,gap=land?0:(MOBILE?14:18),ctrl=58+5,ar=CONFIG.video.aspect;
  let w=Math.min(vw-(MOBILE?28:40),1280);
  for(let i=0;i<3;i++){
    stack.style.setProperty('--w',w+'px');cap.style.width=Math.min(w,760)+'px';
    const ch=land?0:cap.offsetHeight,availH=vh-top-bottom-ch-gap-ctrl;
    const nw=Math.max(240,Math.min(vw-(MOBILE?28:40),1280,availH*ar));
    if(Math.abs(nw-w)<1)break;w=nw;
  }
  stack.style.setProperty('--w',w+'px');cap.style.width=Math.min(w,760)+'px';
  stack.style.setProperty('--gap',gap+'px');
  const total=w/ar+ctrl+(land?0:cap.offsetHeight+gap),room=vh-top-bottom;
  stack.style.setProperty('--top',(top+Math.max(0,(room-total)/2))+'px');
  slot.classList.toggle('compact',w<560);
}
/* ===== PLAYER (iframe YouTube: facade + postMessage) ===== */
const PL={ifr:null,loaded:false,q:[],t:0,d:0,buf:0,paused:true,ended:false,started:false,to:0};
let hostIdx=0;const HOST=()=>CONFIG.hosts[hostIdx];
let volume=1,muted=false,seeking=false;
const isPH=id=>!id||/^(YOUTUBE|REPLACE)/i.test(id);
function embedUrl(){const c=CONFIG.video,org=/^https?:/.test(location.origin)?'&origin='+encodeURIComponent(location.origin):'';
 return `${HOST()}/embed/${encodeURIComponent(c.id)}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&controls=0${c.loop?'&loop=1&playlist='+encodeURIComponent(c.id):''}${c.start?'&start='+c.start:''}${org}`}
function plPost(m){const f=PL.ifr;if(!f||!f.contentWindow)return;try{f.contentWindow.postMessage(JSON.stringify(m),HOST())}catch(e){}}
const CMD={play:['playVideo',[]],pause:['pauseVideo',[]],mute:['mute',[]],unmute:['unMute',[]]};
function plCmd(c,a){if(!PL.ifr)return;const m=c==='seek'?{event:'command',func:'seekTo',args:[a,true]}:c==='vol'?{event:'command',func:'setVolume',args:[Math.round(a*100)]}:{event:'command',func:CMD[c][0],args:CMD[c][1]};
 if(!PL.loaded){PL.q.push(m);return}plPost(m)}
function plStart(hi){if(window.YTFast)YTFast.cancelPrime();plRelease(true);hostIdx=hi||0;hideFb();
 if(isPH(CONFIG.video.id)){showMsg('Chưa gắn video thật.',5000);return}
 const f=document.createElement('iframe');f.className='emb';f.title=CONFIG.video.title;
 f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.referrerPolicy='strict-origin-when-cross-origin';
 Object.assign(PL,{ifr:f,loaded:false,q:[],t:0,d:0,buf:0,paused:true,ended:false,started:false});
 muted=false;slot.classList.remove('muted');
 f.addEventListener('load',()=>{if(PL.ifr!==f)return;let n=0;const hs=()=>{if(PL.ifr!==f||PL.loaded||n++>20)return;plPost({event:'listening',id:1,channel:'widget'});setTimeout(hs,500)};hs()});
 f.src=embedUrl();$('vid').insertBefore(f,$('vclick'));
 slot.classList.add('buffering');slot.classList.remove('ended');setUI();
 PL.to=setTimeout(()=>{if(PL.ifr===f&&!PL.started){
   if(PL.loaded&&!PL._ext){PL._ext=1;PL.to=setTimeout(()=>{if(PL.ifr===f&&!PL.started)failEmbed()},CONFIG.loadTalkingMs)}
   else failEmbed()}},CONFIG.loadTimeoutMs)}
function hideFb(){$('fb').classList.remove('show');slot.classList.remove('failed')}
function failEmbed(){if(hostIdx<CONFIG.hosts.length-1){plStart(hostIdx+1);return}
 clearTimeout(PL.to);if(PL.ifr){PL.ifr.remove()}Object.assign(PL,{ifr:null,loaded:false,q:[],started:false});slot.classList.remove('buffering','started');slot.classList.add('paused');setUI();$('fb').classList.add('show');slot.classList.add('failed')}
function plRelease(now){clearTimeout(PL.to);const f=PL.ifr;
 if(f){try{plPost({event:'command',func:'pauseVideo',args:[]})}catch(e){}if(now)f.remove();else setTimeout(()=>f.remove(),360)}
 Object.assign(PL,{ifr:null,loaded:false,q:[],t:0,d:0,buf:0,paused:true,ended:false,started:false,_ext:0});
 slot.classList.remove('buffering','started','ended');slot.classList.add('paused');setUI();boMood('idle')}
function plPlaying(){clearNext();PL.paused=false;PL.ended=false;if(!PL.started){PL.started=true;clearTimeout(PL.to);PL.ifr&&PL.ifr.classList.add('show');slot.classList.add('started')}
 slot.classList.remove('buffering','paused','ended');hideMsg();setUI();boMood('listen')}
function plPaused(){PL.paused=true;slot.classList.add('paused');setUI();boMood('idle')}
let nxT=0;
function clearNext(){clearTimeout(nxT);nxT=0;$('next').classList.remove('show');$('exitv').classList.remove('on')}
function goNext(){$('exitv').classList.add('on');
 if(CONFIG.previewMode){const t=$('toast');t.textContent=CONFIG.toastText;t.classList.add('show');setTimeout(()=>{t.classList.remove('show');$('exitv').classList.remove('on')},1800);return}
 setTimeout(()=>{location.href=fixHref(CONFIG.NEXT_PAGE)},600)}
function onEnded(){let n=CONFIG.nextCountdown;$('next').classList.add('show');
 const tick=()=>{$('nextT').textContent=CONFIG.nextText+' ('+n+')…';if(n<=0){clearNext();goNext();return}n--;nxT=setTimeout(tick,1000)};tick()}
$('nextX').onclick=clearNext;
function plEnded(){PL.paused=true;PL.ended=true;slot.classList.add('paused','ended');setUI();upd();onEnded();boFlash('happy',1800)}
function ytState(s){if(s===1)plPlaying();else if(s===2){if(PL.started)plPaused();slot.classList.remove('buffering')}else if(s===0)plEnded();else if(s===3&&PL.started&&!PL.paused)slot.classList.add('buffering')}
addEventListener('message',e=>{const f=PL.ifr;if(!f||e.source!==f.contentWindow||e.origin!==HOST())return;
 let m=e.data;if(typeof m==='string'){try{m=JSON.parse(m)}catch(_){return}}if(!m||typeof m!=='object')return;
 if(!PL.loaded){PL.loaded=true;const q=PL.q;PL.q=[];q.forEach(plPost);applyVol(true)}
 if(m.event==='onError'){failEmbed();return}
 const inf=m.info;
 if(m.event==='onStateChange'&&typeof inf==='number'){ytState(inf);return}
 if((m.event==='infoDelivery'||m.event==='initialDelivery')&&inf&&typeof inf==='object'){
  if('currentTime' in inf)PL.t=+inf.currentTime||0;if(inf.duration)PL.d=+inf.duration;if('videoLoadedFraction' in inf)PL.buf=+inf.videoLoadedFraction||0;
  if('playerState' in inf&&inf.playerState!==PL._ys){PL._ys=inf.playerState;ytState(inf.playerState)}upd()}});
function togglePlay(){
 if(!PL.ifr){plStart(0);return}
 if(PL.paused||PL.ended){clearNext();if(PL.ended){PL.ended=false;plCmd('seek',0)}plCmd('play')}else plCmd('pause')}
function showMsg(t,ms){const m=$('msg');m.textContent=t;m.classList.add('show');clearTimeout(showMsg.t);if(ms)showMsg.t=setTimeout(()=>m.classList.remove('show'),ms)}
function hideMsg(){$('msg').classList.remove('show')}
function setUI(){const p=!PL.paused&&!PL.ended;
 $('bPlay').innerHTML=p?IC.pause:(PL.ended?IC.replay:IC.play);$('bPlay').setAttribute('aria-label',p?'Tạm dừng':PL.ended?'Phát lại':'Phát');
 $('bigplay').innerHTML=PL.ended?IC.replay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';$('bigplay').setAttribute('aria-label',PL.ended?'Phát lại':'Phát video');
 upd()}
function upd(){const d=PL.d,ok=isFinite(d)&&d>0;
 if(!seeking)$('seek').value=ok?Math.round(PL.t/d*1000):0;
 $('played').style.width=(ok?PL.t/d*100:0)+'%';
 $('time').textContent=ok?mmss(PL.t)+' / '+mmss(d):'--:--';$('seek').setAttribute('aria-valuetext',ok?mmss(PL.t)+' trên '+mmss(d):'chưa rõ thời lượng')}
function applyVol(init){const eff=muted?0:volume;
 plCmd('vol',eff||0);plCmd(eff===0?'mute':'unmute');
 $('vol').value=Math.round(eff*100);$('volFill').style.width=Math.round(eff*100)+'%';
 $('bMute').innerHTML=eff===0?IC.mute:IC.vol;$('bMute').setAttribute('aria-label',eff===0?'Bật tiếng':'Tắt tiếng');
 slot.classList.toggle('muted',eff===0)}
$('bPlay').onclick=togglePlay;$('bigplay').onclick=togglePlay;
if(window.YTFast){YTFast.intent($('bigplay'));YTFast.intent($('vclick'))}
$('vclick').onclick=()=>{if(!PL.ifr||PL.ended)togglePlay();else togglePlay()};
function unmute(){muted=false;if(volume===0)volume=.7;applyVol()}
$('bMute').onclick=()=>{if(muted||volume===0)unmute();else{muted=true;applyVol()}};
$('vol').addEventListener('input',e=>{volume=e.target.value/100;muted=volume===0;applyVol()});
const seek=$('seek');
seek.addEventListener('input',()=>{seeking=true;if(isFinite(PL.d)&&PL.d>0){const t=seek.value/1000*PL.d;PL.t=t;plCmd('seek',t);$('played').style.width=(seek.value/10)+'%';$('time').textContent=mmss(t)+' / '+mmss(PL.d)}});
seek.addEventListener('change',()=>{seeking=false;upd()});seek.addEventListener('pointerup',()=>{seeking=false});
/* toàn màn hình (chỉ phần tử #slot) */
let pseudo=false;
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
function enterFs(){const rq=slot.requestFullscreen||slot.webkitRequestFullscreen;
 if(rq&&document.fullscreenEnabled!==false){try{const r=rq.call(slot);if(r&&r.catch)r.catch(()=>{pseudo=true;syncFs()})}catch(e){pseudo=true;syncFs()}}else{pseudo=true;syncFs()}}
function exitFs(){if(pseudo){pseudo=false;syncFs()}const ex=document.exitFullscreen||document.webkitExitFullscreen;if(fsEl()&&ex){try{const r=ex.call(document);if(r&&r.catch)r.catch(()=>{})}catch(e){}}}
function syncFs(){const on=fsEl()===slot||pseudo;slot.classList.toggle('pfs',pseudo);
 $('bFs').setAttribute('aria-label',on?'Thoát toàn màn hình':'Toàn màn hình');$('fsIn').setAttribute('d',on?'M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5':'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5');
 if(!on)layout()}
$('bFs').onclick=()=>{(fsEl()===slot||pseudo)?exitFs():enterFs()};
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(!fsEl())pseudo=false;syncFs()}));
addEventListener('keydown',e=>{if(e.key==='Escape'&&pseudo)exitFs()});
addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.cb,#bigplay');if(b&&e.detail>0)setTimeout(()=>b.blur(),0)});

/* ===== BỌ (sprite đen trắng) ===== */
const BO_POSES=['idle','wave','listen','happy','sleep','surprised','think'];
const BO={cur:null,flip:false,mood:'idle',tt:0,st:0,asleep:false,front:0,flashUntil:0,frozen:Q.get('freeze')==='1'};
const boEl=$('bo'),boFlip=boEl.firstChild,boImgs=[...boFlip.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]={ready:new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()})};im.src=BO_IMG+p+'.webp'});
function boShow(pose,flip){flip=!!flip;if(pose===BO.cur&&flip===BO.flip)return;
  const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;
  boFlip.style.transform=flip?'scaleX(-1)':'';BO.cur=pose;BO.flip=flip}
const boBase=()=>BO.asleep?'sleep':BO.mood;
function boFlash(pose,ms){if(BO.frozen)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose);BO.tt=setTimeout(()=>boShow(boBase()),ms)}
function boMood(m){BO.mood=m;if(BO.frozen)return;if(!BO.asleep&&performance.now()>=BO.flashUntil)boShow(boBase())}
function boArmSleep(){clearTimeout(BO.st);if(BO.frozen)return;BO.st=setTimeout(()=>{if(!PL.paused&&PL.started){boArmSleep();return}BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(BO.frozen)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
(function boIdleLoop(){setTimeout(()=>{if(!BO.asleep&&PL.paused&&!document.hidden)boFlash(Math.random()<.5?'wave':'think',1400);boIdleLoop()},5000+Math.random()*7000)})();
boShow('idle');boArmSleep();

/* ===== thanh gợi ý: về trang Bọ + trang kế tiếp ===== */
(async()=>{
  const nav=$('np'),el=(t,c)=>{const e=document.createElement(t);if(c)e.className=c;return e};
  const home=el('a','np-home');home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
  home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
  const DEF={max:2,pages:[
    {id:'gioithieu',name:'Giới thiệu',href:'gioithieu.html',next:['method','roadmap']},
    {id:'method',name:'Phương pháp',href:'method.html',next:['roadmap','lopf1']},
    {id:'roadmap',name:'Lộ trình Lớp F2',short:'Lộ trình',href:'roadmap.html',next:['lopf1','dangky']}]};
  const J=await MemoriContent.load('journey',DEF,{replace:['pages']});
  const ps=(J&&Array.isArray(J.pages))?J.pages:DEF.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('gioithieu'),out=[];
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
  const list=[...document.images].filter(i=>!i.closest('.loader')&&getComputedStyle(i).display!=='none').map(dec);
  BO_POSES.forEach(p=>list.push(BOC[p].ready));
  const sample=CONFIG.copy.title+CONFIG.copy.sub+' Phương pháp Lộ trình Hủy Phát video Tạm dừng';
  ['400 40px "Oooh Baby"','400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
  let n=0;const tot=list.length;list.forEach(p=>p.then(()=>{n++;bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'}));
  const all=Promise.all(list),timeout=new Promise(r=>setTimeout(r,30000)),minShow=new Promise(r=>setTimeout(r,RM?200:900));
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
setUI();applyVol();layout();
addEventListener('resize',layout);addEventListener('orientationchange',()=>setTimeout(layout,120));
if(window.visualViewport)visualViewport.addEventListener('resize',layout);
loadGate().then(()=>{
  layout();window.__loaderDone=performance.now();view.classList.add('in');
  if(!BO.frozen)boFlash('wave',1500);
  if(window.YTFast&&!isPH(CONFIG.video.id)){YTFast.warm();setTimeout(()=>YTFast.prime(CONFIG.video.id,CONFIG.hosts[0]),1200)}
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
window.__gt={PL,CONFIG,onEnded,get MOBILE(){return MOBILE},get bo(){return BO.cur}};
})();
