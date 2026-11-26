/* Trang Lớp F1 đen trắng (prototype): chép hành vi từ lopf1.html, hình ảnh đen trắng (ô giữa giữ màu), Bọ bằng sprite đen trắng. */
(async()=>{
'use strict';
const REL='../../',BO_PAGE='../bw-bo/',BO_IMG='../bw-bo/img/bo/';
const W=1672,H=941,$=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=new URLSearchParams(location.search);
if(Q.get('freeze')==='1')document.documentElement.classList.add('still');
const asset=u=>/^(https?:|data:|\.\.\/|\/)/.test(u)?u:REL+u;

/* ===== NỘI DUNG MẶC ĐỊNH (giống assets/content/lopf1.json; admin sửa file JSON, trang tự nạp) ===== */
const CONFIG_DEFAULT={
  version:1,
  page:{title:'Lớp F1',subtitle:'',hint:'',loaderText:'Bọ đang mở cuốn sách…',
    bookLabel:'Cuốn sách. Kéo sang trái hoặc phải, hoặc dùng phím mũi tên, để đổi hình.',prevLabel:'Hình trước',nextLabel:'Hình sau',
    playLabel:'Phát video',counterText:'{n} / {total}',announceText:'Hình {n} trên {total}: {caption}',videoText:'Video'},
  items:[
    {type:'image',imageUrl:'assets/lopf1/img/s_clouds.webp',videoId:'',provider:'',caption:'Mây trắng trên đồi cỏ',alt:'Những đám mây lớn trên đồi cỏ xanh'},
    {type:'image',imageUrl:'assets/lopf1/img/s_moon.webp',videoId:'',provider:'',caption:'Đêm trăng non trên núi',alt:'Trăng lưỡi liềm trên những đỉnh núi trong mây'},
    {type:'image',imageUrl:'assets/gallery/photo.webp',videoId:'',provider:'',caption:'Căn nhà bên hồ',alt:'Căn nhà gỗ sáng đèn bên hồ dưới trăng'},
    {type:'video',imageUrl:'assets/lopf1/img/demo3.webp',videoId:'jNQXAC9IVRw',provider:'youtube',caption:'Video mẫu (giữ chỗ)',alt:'Hình đại diện của video mẫu'},
    {type:'image',imageUrl:'assets/lopf1/img/demo1.webp',videoId:'',provider:'',caption:'Hình mẫu 1 (giữ chỗ)',alt:'Hình mẫu giữ chỗ'},
    {type:'image',imageUrl:'assets/lopf1/img/demo2.webp',videoId:'',provider:'',caption:'Hình mẫu 2 (giữ chỗ)',alt:'Hình mẫu giữ chỗ'},
    {type:'image',imageUrl:'assets/lopf1/img/demo4.webp',videoId:'',provider:'',caption:'Hình mẫu 3 (giữ chỗ)',alt:'Hình mẫu giữ chỗ'},
    {type:'image',imageUrl:'assets/lopf1/img/s_sunset.webp',videoId:'',provider:'',caption:'Hoàng hôn dưới gốc cây',alt:'Một người ngồi đọc sách dưới gốc cây lúc hoàng hôn'}
  ],
  drag:{threshold:56,snap:.4,flick:.55,inertia:true,loop:true,wheel:true,wheelCooldown:520},
  showArrows:true,
  mobile:{enabled:true,aspect:.9}
};
/* ma trận 3 ô tranh (chép từ lopf1.html) */
const PANELS={"L":{"box":[73,297,366,380],"w":367,"h":344,"m":"matrix3d(0.700116,-0.1783873,0,-0.0007714573,-0.01450068,0.821917,0,-3.420589e-05,0,0,1,0,4,56.52542,0,1)"},"C":{"box":[442,278,790,410],"w":788,"h":411,"m":"matrix3d(1.004763,0.002537643,0,9.277337e-06,-0.004853816,0.9989889,0,-1.236447e-05,0,0,1,0,1,-2.046154,0,1)"},"R":{"box":[1234,300,364,376],"w":367,"h":337,"m":"matrix3d(1.391699,0.2522039,0,0.001130326,0.002940837,1.160837,0,-2.652221e-05,0,0,1,0,0,-12.20845,0,1)"}};
const MASK=[37,620,778,488];             /* ô điện thoại */
/* sách vẽ lại: hộp sách + đa giác trang phải (toạ độ trong viewBox), trang trái lấy đối xứng qua gáy */
const BOOKS={
  d:{box:[702.5,721,270.7,90.2],vb:[1350,450],sp:665,r:[[668,105],[870,60],[1080,85],[1165,300],[900,275],[668,340]],ty:130,dy:22,m0:60,m1:400,sl:15,sw:7,lift:10,cx:836,cy:766},
  m:{box:[232.6,1253.6,384,138.6],vb:[1220,440],sp:615,r:[[620,100],[790,45],[985,75],[1075,290],[850,285],[620,350]],ty:130,dy:24,m0:60,m1:360,sl:14,sw:6,lift:16,cx:426,cy:1322}
};
const BOPOS={d:[790,98,92],m:[369,306,112]};

const C=await MemoriContent.load('lopf1',CONFIG_DEFAULT,{replace:['items']});
const SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
const PG=C.page;
document.title=(PG.title||'Lớp F1')+' (bản mẫu đen trắng)';
MemoriContent.setText('.loader-text',PG.loaderText);
MemoriContent.setText('#ttl h1',PG.title);MemoriContent.setText('#ttl p',PG.subtitle);
$('prev').setAttribute('aria-label',PG.prevLabel);$('next').setAttribute('aria-label',PG.nextLabel);
if(!C.showArrows)$('hud').classList.add('nonav');

/* ===== danh sách mục ===== */
const ITEMS=(C.items||[]).map(it=>{
  const type=it.type==='video'?'video':'image';
  let vid='';if(type==='video'){const v=MemoriContent.parseVideo(it.videoId);vid=v&&v.provider==='youtube'?v.id:''}
  let img=MemoriContent.url(it.imageUrl,'');img=img?asset(img):'';
  if(type==='video'&&!vid)return null;
  if(!img&&vid)img='https://i.ytimg.com/vi/'+vid+'/hqdefault.jpg';
  if(!img)return null;
  return{type,img,vid,caption:String(it.caption||''),alt:String(it.alt||it.caption||'')};
}).filter(Boolean);
if(!ITEMS.length)ITEMS.push({type:'image',img:asset('assets/lopf1/img/s_clouds.webp'),vid:'',caption:'',alt:''});
const N=ITEMS.length,LOOP=C.drag.loop!==false;
let idx=0;                                   /* mở trang vào mục 1 */
const mod=i=>((i%N)+N)%N;
const itemAt=i=>LOOP?ITEMS[mod(i)]:(i<0||i>=N?null:ITEMS[i]);

/* ===== dựng hai bố cục ===== */
const view=$('view'),hud=$('hud');
const el=(tag,cls,css,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(css)e.style.cssText=css;if(html)e.innerHTML=html;return e};
const img=(src,x,y,w,h,extra)=>`<img class="L" src="${src}" alt="" draggable="false" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra||''}">`;
let S=1,OX=0,OY=0,MODE='d';
const built={d:false,m:false},PD={},PM={},FX={d:null,m:null},BK={d:null,m:null};
let panelEls=PD,KEYS=['L','C','R'];const OFF={L:-1,C:0,R:1,M:0};

function beamSvg(id,cx,y0,xs,y1){
  const lines=xs.map((x,i)=>`<path d="M${cx+(x-cx)*.04} ${y0}L${x} ${y1}" stroke-width="${i%2?1.4:2}" opacity="${i%2?.5:.75}"/>`).join('');
  return `<svg id="${id}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" stroke="#111" stroke-linecap="round" aria-hidden="true"><g filter="url(#hand)">${lines}</g></svg>`;
}
function spiralSvg(cx,cy,size){
  let d='';for(let t=0;t<=12.4;t+=.3){const r=.8+t*2.0;d+=(t?'L':'M')+(Math.cos(t)*r).toFixed(1)+' '+(Math.sin(t)*r*.92).toFixed(1)}
  return `<svg class="L" style="left:${cx-size/2}px;top:${cy-size/2}px;width:${size}px;height:${size}px" viewBox="-30 -30 60 60" fill="none" stroke="#111" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}
function pageSvg(B,side){
  const sx=side==='r'?1:-1,mx=x=>B.sp+(x-B.sp)*sx,pts=B.r.map(p=>mx(p[0])+','+p[1]).join(' ');
  let lines='';for(let i=0;i<7;i++){const y=B.ty+i*B.dy;lines+=`<path d="M${mx(B.sp+B.m0)} ${y}L${mx(B.sp+B.m1-i*4)} ${y-B.sl}"/>`}
  return `<svg viewBox="0 0 ${B.vb[0]} ${B.vb[1]}" preserveAspectRatio="none" aria-hidden="true"><polygon points="${pts}" fill="#fbfbfa" stroke="#111" stroke-width="${B.sw}" stroke-linejoin="round"/><g stroke="#111" stroke-width="${B.sw*.7}" stroke-linecap="round" opacity=".6">${lines}</g><polygon class="sh" points="${pts}" fill="#111" opacity="0"/></svg>`;
}
function makeFx(B,parent){
  const [x,y,w,h]=B.box,f=el('div','fx',`left:${x}px;top:${y}px;width:${w}px;height:${h}px`),org=(B.sp/B.vb[0]*100)+'% 50%';
  const pl=el('div','pgw l',`transform-origin:${org}`,pageSvg(B,'l')),pr=el('div','pgw r',`transform-origin:${org}`,pageSvg(B,'r'));
  f.append(pl,pr);parent.appendChild(f);
  const sp=el('div','sparks',`left:${B.cx}px;top:${B.cy}px`);parent.appendChild(sp);
  return{pgL:pl,pgR:pr,sparks:sp,B};
}
function ringedBook(st,id,ring){const b=el('button',null,null);b.id=id;b.type='button';b.setAttribute('aria-describedby','live');b.setAttribute('aria-label',PG.bookLabel);st.appendChild(b);const r=el('div');r.id=ring;st.appendChild(r);return b}

function buildDesk(){
  const st=$('stage');
  st.innerHTML='<div class="scenery">'+img('img/bg-desk-bw.webp',0,0,W,H)+'<div class="veil"></div></div>'
   +'<div class="fgw" style="left:-4px;top:'+(H-155+6)+'px;width:487px;height:155px">'+img('img/fgL.webp',0,0,487,155)+'</div>'
   +'<div class="fgw" style="left:'+(W-468+4)+'px;top:'+(H-148+6)+'px;width:468px;height:148px">'+img('img/fgR.webp',0,0,468,148)+'</div>'
   +img('img/pedestal-d.webp',513,712,640,169)
   +beamSvg('beam',836,238,[400,470,545,620,700,972,1052,1128,1202,1272],292)
   +img('img/mound-d.webp',696,175,280,117)+spiralSvg(833,243,54)
   +'<div id="frames"></div><div id="panels"></div>';
  const fr=$('frames');
  [['L'],['C'],['R']].forEach(([k])=>{const b=PANELS[k].box;
    [['sh',7,6,7],['ink',7,0,0],['pp',4,0,0]].forEach(([c,d,dx,dy])=>{
      fr.appendChild(el('i','fk '+c,`left:${b[0]}px;top:${b[1]}px;width:${b[2]}px;height:${b[3]}px;transform:translate(${dx}px,${dy}px) scale(${(b[2]+2*d)/b[2]},${(b[3]+2*d)/b[3]})`)).dataset.k=k})});
  ['L','C','R'].forEach(k=>{
    const p=PANELS[k],pe=el('div','panel',`left:${p.box[0]}px;top:${p.box[1]}px;width:${p.box[2]}px;height:${p.box[3]}px`);pe.dataset.k=k;
    pe.innerHTML=`<div class="plane" style="width:${p.w}px;height:${p.h}px;transform:${p.m}"><div class="shift"></div></div>`;
    $('panels').appendChild(pe);PD[k]={el:pe,plane:pe.firstChild,shift:pe.firstChild.firstChild,w:p.w,h:p.h};
  });
  FX.d=makeFx(BOOKS.d,st);
  const bk=ringedBook(st,'book','bookring');bindBook(bk);BK.d={book:bk,ring:$('bookring')};
  built.d=true;
}
function buildMobile(){
  const st=$('mstage'),m=MASK;
  st.innerHTML='<div class="scenery" style="width:852px;height:1846px">'+img('img/bg-phone-bw.webp',0,0,852,1846)+'<div class="veil m"></div></div>'
   +'<div class="fgw" style="left:-4px;top:'+(1846-137+6)+'px;width:439px;height:137px">'+img('img/fgL.webp',0,0,439,137)+'</div>'
   +'<div class="fgw" style="left:'+(852-420+4)+'px;top:'+(1846-133+6)+'px;width:420px;height:133px">'+img('img/fgR.webp',0,0,420,133)+'</div>'
   +img('img/pedestal-m.webp',102,1229,639,298)
   +beamSvg('mbeam',425,500,[250,300,350,400,450,500,550,600],612).replace(`width="${W}" height="${H}"`,'width="852" height="1846"').replace(`0 0 ${W} ${H}`,'0 0 852 1846')
   +img('img/mound-m.webp',300,409,250,128)+spiralSvg(424,477,50)
   +'<div id="mhit"></div>'
   +'<div id="mframe">'+[['sh',7,6,7,'var(--ink)'],['ink',7,0,0,'var(--ink)'],['pp',4,0,0,'var(--paper)']].map(([c,d,dx,dy,bg])=>`<i class="mk" style="left:${m[0]-d+dx}px;top:${m[1]-d+dy}px;width:${m[2]+2*d}px;height:${m[3]+2*d}px;border-radius:${23+d}px;background:${bg}"></i>`).join('')+'</div>'
   +`<div class="panel" data-k="M" style="left:${m[0]}px;top:${m[1]}px;width:${m[2]}px;height:${m[3]}px"><div class="plane" style="width:${m[2]}px;height:${m[3]}px"><div class="shift"></div></div></div>`;
  const P=st.querySelector('.plane');PM.M={el:st.querySelector('.panel'),plane:P,shift:P.firstChild,w:m[2],h:m[3]};
  FX.m=makeFx(BOOKS.m,st);
  const bk=ringedBook(st,'mbook','mbookring');bindBook(bk);bindBook($('mhit'));BK.m={book:bk,ring:$('mbookring')};
  built.m=true;
}
function applyMode(){
  const m=MODE==='m';
  if(!built[MODE])(m?buildMobile:buildDesk)();
  view.classList.toggle('m',m);hud.classList.toggle('m-on',m);
  panelEls=m?PM:PD;KEYS=m?['M']:['L','C','R'];
  const p=BOPOS[MODE],bo=boEl;bo.style.cssText=`left:${p[0]}px;top:${p[1]}px;width:${p[2]}px;height:${p[2]}px`;
  (m?$('mstage'):$('stage')).appendChild(bo);
  fillPanels(0);
}

/* ===== bố cục: co giãn theo cửa sổ ===== */
function layout(){
  const vw=innerWidth,vh=innerHeight,nm=(C.mobile.enabled&&vw/vh<C.mobile.aspect)?'m':'d';
  if(nm!==MODE||!built[nm]){MODE=nm;if(boReady)applyMode()}
  if(!built[MODE])return;
  const prev=$('prev'),next=$('next');
  if(MODE==='m'){
    let s=Math.max(vw/852,vh/1846),vis=vh/s;if(vis<1080){s=vh/1080;vis=1080}
    let top=Math.max(0,Math.min(1846-vis,1050-vis/2));
    const cap=353-76/s;if(top>cap){if(cap+vis>=1440)top=Math.max(0,cap);else if(top<440)top=Math.min(1846-vis,440)}
    const ox=(vw-852*s)/2,oy=-top*s;S=s;OX=ox;OY=oy;
    $('mstage').style.transform=`translate3d(${ox}px,${oy}px,0) scale(${s})`;
    const bw=Math.max(400,70/s),bh=Math.max(170,60/s),B=BOOKS.m;
    [BK.m.book,BK.m.ring].forEach(e=>{e.style.left=(B.cx-bw/2)+'px';e.style.top=(B.cy-bh/2)+'px';e.style.width=bw+'px';e.style.height=bh+'px'});
    const ay=oy+864*s-30;prev.style.top=next.style.top=ay+'px';
    prev.style.left=(ox+MASK[0]*s+8)+'px';prev.style.right='';next.style.right=(vw-(ox+(MASK[0]+MASK[2])*s)+8)+'px';next.style.left='';
  }else{
    const s=Math.min(vw/W,vh/H),ox=(vw-W*s)/2,oy=vh-H*s;S=s;OX=ox;OY=oy;
    $('stage').style.transform=`translate3d(${ox}px,${oy}px,0) scale(${s})`;
    const bw=Math.max(372,64/s),bh=Math.max(112,56/s),B=BOOKS.d;
    [BK.d.book,BK.d.ring].forEach(e=>{e.style.left=(B.cx-bw/2)+'px';e.style.top=(B.cy-bh/2)+'px';e.style.width=bw+'px';e.style.height=bh+'px'});
    const ay=oy+487*s-34;prev.style.top=next.style.top=ay+'px';
    prev.style.left=Math.max(8,ox+4)+'px';prev.style.right='';next.style.right=Math.max(8,ox+4)+'px';next.style.left='';
  }
}

/* ===== ô tranh ===== */
let ytPlaying=null;
function makeSlot(item,k,fresh){
  const s=el('div','slot');
  const im=new Image();im.decoding='async';im.draggable=false;im.src=item.img;im.alt=(k==='C'||k==='M')?item.alt:'';if(k!=='C'&&k!=='M')im.setAttribute('aria-hidden','true');
  s.appendChild(im);
  const center=(k==='C'||k==='M');
  if(!center)s.classList.add('gray');
  else if(fresh){s.classList.add('gray');requestAnimationFrame(()=>requestAnimationFrame(()=>s.classList.remove('gray')))}   /* ô mới vào giữa: xám -> màu trong 300ms */
  if(item.type==='video'){
    if(center){
      const b=el('button','vplay');b.type='button';b.setAttribute('aria-label',PG.playLabel+': '+item.caption);
      b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5v19l17-9.5z"/></svg>';
      b.addEventListener('click',()=>playVideo(s,item));
      if(window.YTFast){YTFast.intent(b);YTFast.near(b,()=>{YTFast.warm()},'200px')}
      b.addEventListener('pointerdown',e=>e.stopPropagation());
      s.appendChild(b);
    }else{const t=el('span','vbadge');t.textContent=PG.videoText;s.appendChild(t)}
  }
  return s;
}
function playVideo(slot,item){
  stopVideo();
  if(window.YTFast){YTFast.cancelPrime();YTFast.warm()}
  const f=document.createElement('iframe'),sp=el('span','vspin');sp.setAttribute('aria-hidden','true');
  const org=/^https?:/.test(location.origin)?'&origin='+encodeURIComponent(location.origin):'';
  const HOST='https://www.youtube-nocookie.com';
  f.className='pend';slot.classList.remove('gray');
  f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.title=item.caption||PG.videoText;f.referrerPolicy='strict-origin-when-cross-origin';f.setAttribute('allowfullscreen','');
  let done=false,hs=0,tmo=0;
  const reveal=()=>{if(done)return;done=true;clearTimeout(hs);clearTimeout(tmo);removeEventListener('message',onMsg);f.classList.remove('pend');sp.remove()};
  const onMsg=e=>{if(e.source!==f.contentWindow||e.origin!==HOST)return;let m=e.data;if(typeof m==='string'){try{m=JSON.parse(m)}catch(_){return}}if(!m||typeof m!=='object')return;
    const inf=m.info;if(m.event==='onError'){reveal();return}
    if(m.event==='onStateChange'&&(inf===1||inf===3))reveal();
    else if((m.event==='infoDelivery'||m.event==='initialDelivery')&&inf&&typeof inf==='object'&&(inf.playerState===1||inf.playerState===3))reveal()};
  addEventListener('message',onMsg);
  f.addEventListener('load',()=>{let n=0;const tick=()=>{if(done||n++>20)return;try{f.contentWindow.postMessage(JSON.stringify({event:'listening',id:1,channel:'widget'}),HOST)}catch(_){}hs=setTimeout(tick,400)};tick()});
  tmo=setTimeout(reveal,8000);
  f.src=HOST+'/embed/'+item.vid+'?autoplay=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1'+org;
  slot.querySelectorAll('.vplay').forEach(b=>b.style.display='none');slot.appendChild(f);slot.appendChild(sp);ytPlaying=f;
  f._clean=()=>{done=true;clearTimeout(hs);clearTimeout(tmo);removeEventListener('message',onMsg);sp.remove()};
  boMood('listen');
}
function stopVideo(){if(ytPlaying){const s=ytPlaying.parentNode;if(ytPlaying._clean)ytPlaying._clean();ytPlaying.remove();ytPlaying=null;if(s)s.querySelectorAll('.vplay').forEach(b=>b.style.display='');boMood('idle')}}
function fillPanels(animDir){
  stopVideo();
  KEYS.forEach(k=>{
    const P=panelEls[k],item=itemAt(idx+OFF[k]),old=[...P.shift.children];
    if(!item){old.forEach(o=>o.remove());return}
    const s=makeSlot(item,k,!!animDir&&!RM);P.shift.appendChild(s);
    if(!animDir||RM){old.forEach(o=>o.remove());if(animDir&&RM)s.animate([{opacity:0},{opacity:1}],{duration:200});return}
    const dx=P.w*(k==='M'?.03:.12)*animDir;
    old.forEach(o=>{o.style.zIndex=1;const a=o.animate([{transform:'translate3d(0,0,0)',opacity:1},{transform:'translate3d('+(-dx)+'px,0,0)',opacity:0}],{duration:520,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});a.onfinish=()=>o.remove();setTimeout(()=>o.remove(),700)});
    s.style.zIndex=2;s.animate([{transform:'translate3d('+dx+'px,0,0)',opacity:0},{transform:'translate3d(0,0,0)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.7,.2,1)'});
  });
  paintText(animDir);
}
const capEl=$('cap'),capT=$('capt'),capN=$('capn'),live=$('live');
function paintText(anim){
  const it=ITEMS[mod(idx)],n=mod(idx)+1;
  const set=()=>{capT.textContent=it.caption;capN.textContent=PG.counterText.replace('{n}',n).replace('{total}',N);capEl.classList.remove('swap')};
  if(anim&&!RM){capEl.classList.add('swap');setTimeout(set,180)}else set();
  live.textContent=PG.announceText.replace('{n}',n).replace('{total}',N).replace('{caption}',it.caption||it.alt);
}

/* ===== hiệu ứng sách: lật trang nét mực trên sách vẽ lại ===== */
const curFx=()=>FX[MODE];
const fxr={
  render(dir,t){
    const f=curFx();if(!f)return;
    const th=t*Math.PI,c=Math.cos(th),sn=Math.sin(th),on=dir>0?f.pgR:f.pgL,off=dir>0?f.pgL:f.pgR;
    off.style.opacity=0;
    if(t<=.002){on.style.opacity=0;return}
    on.style.opacity=t>.84?Math.max(0,1-(t-.84)/.16):1;
    on.style.transform='translate3d(0,'+(-f.B.lift*sn)+'px,0) scaleX('+c+') skewY('+(dir*-5*sn)+'deg)';
    on.querySelector('.sh').setAttribute('opacity',(Math.min(1,sn*1.3)*.3).toFixed(2));
  },
  clear(){const f=curFx();if(f){f.pgR.style.opacity=0;f.pgL.style.opacity=0}}
};
function spawnSparks(dir){
  if(RM)return;const f=curFx(),k=MODE==='m'?1.5:1;
  for(let i=0;i<12;i++){
    const d=el('i','spk'+(i%3===0?' ln':i%3===1?' wh':''));
    const x=dir*(18+Math.random()*78)*k,y=(-6-Math.random()*14)*k,ang=dir*(-20-Math.random()*40);
    d.style.left=x+'px';d.style.top=y+'px';f.sparks.appendChild(d);
    const a=d.animate([{opacity:0,transform:'translate3d(0,0,0) rotate('+ang+'deg) scale(.5)'},{opacity:1,offset:.25},{opacity:0,transform:'translate3d('+(dir*(8+Math.random()*26)*k)+'px,'+((-22-Math.random()*38)*k)+'px,0) rotate('+ang+'deg) scale(1.1)'}],{duration:760+Math.random()*500,delay:Math.random()*120,easing:'ease-out'});
    a.onfinish=()=>d.remove();
  }
}
let flipT=0,flipDir=1,flipRaf=0;
function animateFlip(to,ms,done){
  cancelAnimationFrame(flipRaf);const from=flipT,t0=performance.now();
  if(RM||ms<=0){flipT=to;fxr.render(flipDir,flipT);if(to<=0||to>=1)fxr.clear();done&&done();return}
  const step=now=>{
    let u=Math.min(1,(now-t0)/ms);u=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
    flipT=from+(to-from)*u;fxr.render(flipDir,flipT);
    if(now-t0<ms)flipRaf=requestAnimationFrame(step);else{flipT=to;fxr.render(flipDir,flipT);if(to<=0||to>=1){fxr.clear();flipT=0}done&&done()}
  };flipRaf=requestAnimationFrame(step);
}
/* ===== đổi mục ===== */
function go(dir,steps){
  steps=steps||1;if(!LOOP&&(idx+dir*steps<0||idx+dir*steps>N-1)){const c=Math.max(0,Math.min(N-1,idx+dir*steps));if(c===idx){snapBack();return}steps=Math.abs(c-idx)}
  idx=LOOP?mod(idx+dir*steps):idx+dir*steps;
  flipDir=dir;fillPanels(dir);spawnSparks(dir);
  document.dispatchEvent(new CustomEvent('memori:sound',{detail:{page:'lopf1',name:'flip',dir:dir}}));
  boFlash('surprised',900);
  animateFlip(1,520,()=>{flipT=0});releaseShift();
}
$('next').addEventListener('click',()=>go(1));$('prev').addEventListener('click',()=>go(-1));
/* ===== kéo trên sách ===== */
let drag=null;
const thr=()=>Math.max(24,C.drag.threshold);
function setShift(p){KEYS.forEach(k=>{const P=panelEls[k];P.shift.classList.remove('rel');P.shift.style.transform='translate3d('+(p*P.w*(k==='M'?.018:.07))+'px,0,0)'})}
function releaseShift(){KEYS.forEach(k=>{const P=panelEls[k];P.shift.classList.add('rel');P.shift.style.transform='translate3d(0,0,0)'})}
function snapBack(){animateFlip(0,260);releaseShift()}
function bindBook(book){
  book.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    cancelAnimationFrame(flipRaf);
    drag={id:e.pointerId,x0:e.clientX,x:e.clientX,t:performance.now(),v:0,moved:false};
    try{book.setPointerCapture(e.pointerId)}catch(_){}
    book.classList.add('grab');view.classList.add('hot');boLook(0);
  });
  book.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const now=performance.now(),dx=e.clientX-drag.x0;
    drag.v=.8*drag.v+.2*((e.clientX-drag.x)/Math.max(1,now-drag.t));drag.x=e.clientX;drag.t=now;
    if(Math.abs(dx)>4)drag.moved=true;
    if(!drag.moved)return;
    const dir=dx<0?1:-1,p=Math.min(1,Math.abs(dx)/(thr()*1.7));
    if(dir!==flipDir||flipT===0){flipDir=dir;fxr.clear()}
    flipT=p*.5;fxr.render(flipDir,flipT);setShift(-dir*p);boLook(dir);
  });
  function endDrag(e,cancel){
    if(!drag||(e&&e.pointerId!==drag.id))return;
    const dx=drag.x-drag.x0,v=drag.v,moved=drag.moved;drag=null;
    book.classList.remove('grab');if(!matchMedia('(hover:hover)').matches||!book.matches(':hover'))view.classList.remove('hot');
    boLook(0);
    if(cancel||!moved){if(flipT>0)snapBack();return}
    const dir=dx<0?1:-1,ad=Math.abs(dx);
    const flick=C.drag.inertia&&Math.abs(v)>C.drag.flick&&ad>thr()*C.drag.snap;
    if(ad>=thr()||flick){const steps=(C.drag.inertia&&Math.abs(v)>2.4&&ad>thr())?2:1;flipDir=dir;go(dir,steps)}
    else snapBack();
  }
  book.addEventListener('pointerup',e=>endDrag(e,false));
  book.addEventListener('pointercancel',e=>endDrag(e,true));
  book.addEventListener('lostpointercapture',e=>{if(drag)endDrag(e,true)});
  book.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')view.classList.add('hot')});
  book.addEventListener('pointerleave',()=>{if(!drag&&!book.matches(':focus-visible'))view.classList.remove('hot')});
  book.addEventListener('focus',()=>{if(book.matches(':focus-visible'))view.classList.add('hot')});
  book.addEventListener('blur',()=>{if(!drag)view.classList.remove('hot')});
  book.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();go(1)}});
}
document.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='ArrowRight'){e.preventDefault();go(1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}
});
let wheelAcc=0,wheelT=0;
view.addEventListener('wheel',e=>{
  if(C.drag.wheel===false)return;e.preventDefault();
  const now=performance.now();if(now-wheelT<C.drag.wheelCooldown)return;
  const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;wheelAcc+=d;
  if(Math.abs(wheelAcc)>40){go(wheelAcc>0?1:-1);wheelAcc=0;wheelT=now}
},{passive:false});
view.addEventListener('contextmenu',e=>{if(drag)e.preventDefault()});

/* ===== Bọ (sprite đen trắng), đứng trên gò ===== */
const BO_POSES=['idle','wave','point','listen','happy','sleep','surprised','think'];
const BO={cur:null,flip:false,mood:'idle',tt:0,st:0,asleep:false,front:0,flashUntil:0,frozen:Q.get('freeze')==='1'};
const boEl=el('div',null,null,'<div class="flip"><img alt="" draggable="false"><img alt="" draggable="false"></div>');boEl.id='bo';boEl.setAttribute('aria-hidden','true');
const boFlip=boEl.firstChild,boImgs=[...boFlip.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]={ready:new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()})};im.src=BO_IMG+p+'.webp'});
function boShow(pose,flip){flip=!!flip;if(pose===BO.cur&&flip===BO.flip)return;
  const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;
  boFlip.style.transform=flip?'scaleX(-1)':'';BO.cur=pose;BO.flip=flip}
const boBase=()=>BO.asleep?'sleep':BO.mood;
function boFlash(pose,ms,flip){if(BO.frozen)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose,flip);BO.tt=setTimeout(()=>boShow(boBase()),ms)}
function boMood(m){BO.mood=m;if(BO.frozen)return;if(!BO.asleep&&performance.now()>=BO.flashUntil)boShow(boBase())}
function boLook(dir){if(BO.frozen)return;if(!dir){boShow(boBase());return}clearTimeout(BO.tt);BO.asleep=false;boShow('point',dir<0)}
function boArmSleep(){clearTimeout(BO.st);if(BO.frozen)return;BO.st=setTimeout(()=>{if(ytPlaying){boArmSleep();return}BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(BO.frozen)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
(function boIdleLoop(){setTimeout(()=>{if(!BO.asleep&&!drag&&!ytPlaying&&!document.hidden)boFlash(Math.random()<.5?'wave':'think',1400);boIdleLoop()},5000+Math.random()*7000)})();
boShow('idle');boArmSleep();
let boReady=false;

/* ===== thanh gợi ý: về trang Bọ + trang kế tiếp ===== */
(async()=>{
  const nav=$('np'),fixHref=h=>(h==='index.html'||h==='index.html#')?BO_PAGE:h==='roadmap.html'?'../bw-roadmap/':h==='lopf1.html'?'../bw-lopf1/':(/^(https?:|mailto:|#|\.\.\/)/i.test(h)?h:REL+h);
  const home=el('a','np-home');home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
  home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
  const DEF={max:2,pages:[
    {id:'lopf1',name:'Lớp F1',href:'lopf1.html',next:['khampha','dangky']},
    {id:'khampha',name:'Khám phá tác phẩm',short:'Khám phá',href:'khampha.html',next:['gallery','dangky']},
    {id:'dangky',name:'Đăng ký',href:'dangky.html',next:['community','gioithieu']}]};
  const J=await MemoriContent.load('journey',DEF,{replace:['pages']});
  const ps=(J&&Array.isArray(J.pages))?J.pages:DEF.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('lopf1'),out=[];
  ((cur&&cur.next)||[]).forEach(x=>{const p=by(x);if(p&&p.name&&MemoriContent.url(p.href,'')&&!out.includes(p))out.push(p)});
  out.slice(0,2).forEach(pg=>{const a=el('a');a.href=fixHref(MemoriContent.url(pg.href,''));
    const n=el('span','np-n'+(pg.short?' has-s':''));n.textContent=pg.name;a.appendChild(n);
    if(pg.short){const s=el('span','np-s');s.textContent=pg.short;a.appendChild(s)}
    const r=el('span');r.textContent='→';r.setAttribute('aria-hidden','true');a.appendChild(r);nav.appendChild(a)});
})();

/* ===== khởi động ===== */
function loadGate(){
  const loader=document.querySelector('.loader'),bar=loader.querySelector('.loader-track span'),warm=[];window.__warm=warm;
  const dec=im=>new Promise(r=>{const g=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};if(im.complete&&im.naturalWidth)g();else if(im.complete)r();else{im.addEventListener('load',g,{once:true});im.addEventListener('error',()=>r(),{once:true})}});
  const list=[...document.images].filter(i=>!i.closest('.loader')).map(dec);
  BO_POSES.forEach(p=>list.push(BOC[p].ready));
  const near=new Set([mod(idx-1),mod(idx),mod(idx+1)]);
  ITEMS.slice(0,9).forEach((it,i)=>{const im=new Image();if(near.has(i)){im.src=it.img;list.push(dec(im))}else warm.push([im,it.img])});
  const sample=PG.title+PG.subtitle+ITEMS.map(i=>i.caption).join('')+' Khám phá tác phẩm Đăng ký Về trang Bọ Bản đồ trang';
  ['400 40px "Oooh Baby"','400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"','600 16px "Be Vietnam Pro"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
  let n=0;const tot=list.length;list.forEach(p=>p.then(()=>{n++;bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'}));
  const all=Promise.all(list),timeout=new Promise(r=>setTimeout(r,30000)),minShow=new Promise(r=>setTimeout(r,RM?200:900));
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
boReady=true;
{const vw=innerWidth,vh=innerHeight;MODE=(C.mobile.enabled&&vw/vh<C.mobile.aspect)?'m':'d'}
applyMode();layout();
addEventListener('resize',layout);
if(window.visualViewport)visualViewport.addEventListener('resize',layout);
loadGate().then(()=>{
  window.__loaderDone=performance.now();view.classList.add('in');
  if(!BO.frozen)boFlash('wave',1500);
  setTimeout(()=>warm_(),1200);
});
function warm_(){(window.__warm||[]).forEach(w=>{w[0].src=w[1]})}
window.__lf={go,get idx(){return idx},get MODE(){return MODE},get state(){return{idx,MODE,S,OX,OY,bo:BO.cur}}};
})();
