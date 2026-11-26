/* Trang lộ trình đen trắng (prototype): chép hành vi từ roadmap.html, hình ảnh đen trắng, Bọ bằng sprite đen trắng. */
(async()=>{
const REL='../../',BO_PAGE='../bw-bo/',MAP_PAGE='../bw-map/';
const params=new URLSearchParams(location.search);
const FORCED=params.get('state');
const CONFIG_DEFAULT={
 hosts:{youtube:'https://www.youtube-nocookie.com',vimeo:'https://player.vimeo.com'},
 chapters:[
 {id:'c1',num:'Buổi 01',title:'Những sợi dây vô hình',poster:'assets/roadmap/poster1.webp',
  video:{provider:'youtube',id:'qHEqQn2xOlM',title:'KMM FILM STUDIO | ĐỪNG CHỨNG KIẾN HÃY LÊN TIẾNG',aspect:16/9,ui:'custom'}, /* TẠM THỜI: video thử (ngang 16:9) từ playlist kênh KMM FILM (@kmmfilmstudio), thay bằng phim thật của dự án */
  script:{scene:'Buổi 1: Từ người xa lạ thành người đồng hành',
   vo:'Điều gì kết nối chúng ta, ngay cả khi chưa biết tên nhau? Từ người xa lạ thành người đồng hành qua kể chuyện nhập vai.',
   cues:[{t:0,text:'Điều gì kết nối chúng ta,'},{t:10,text:'ngay cả khi chưa biết tên nhau?'},{t:22,text:'Từ người xa lạ thành người đồng hành qua kể chuyện nhập vai.'}]}},
 {id:'c2',num:'Buổi 02',title:'Dáng hình của câu chuyện',poster:'assets/roadmap/poster2.webp',
  video:{provider:'youtube',id:'t861TZCuC_A',title:'KMM FILM STUDIO | UCAN - Bạn có thể!',aspect:16/9,ui:'custom'}, /* TẠM THỜI: video thử (ngang 16:9) từ playlist kênh KMM FILM (@kmmfilmstudio), thay bằng phim thật của dự án */
  script:{scene:'Buổi 2: Vẽ ra câu chuyện, kể bằng những bức ảnh',
   vo:'Nếu câu chuyện của bạn có hình dáng, nó sẽ trông như thế nào? Biến một ý niệm trừu tượng thành hình ảnh, sinh vật hoặc đồ vật có cá tính.',
   cues:[{t:0,text:'Nếu câu chuyện của bạn có hình dáng,'},{t:8,text:'nó sẽ trông như thế nào?'},{t:14,text:'Biến một ý niệm trừu tượng thành hình ảnh, sinh vật hoặc đồ vật có cá tính.'},{t:30,text:'Rồi tự chọn ảnh, xâu chuỗi thành chuyện.'}]}},
 {id:'c3',num:'Buổi 03',title:'Ý tưởng hình thành dòng sông',poster:'assets/roadmap/poster3.webp',
  video:{provider:'youtube',id:'-si_3gkTv5o',title:'KMM FILM STUDIO |',aspect:16/9,ui:'custom'}, /* TẠM THỜI: video thử (ngang 16:9) từ playlist kênh KMM FILM (@kmmfilmstudio), thay bằng phim thật của dự án */
  script:{scene:'Buổi 3: Quay phim, dựng phim, kế hoạch video',
   vo:'Một câu chuyện sẽ trở nên sống động nhờ hình ảnh, âm thanh và nhịp điệu. Quay phim, ngôn ngữ hình ảnh, dựng phim và đăng tải.',
   cues:[{t:0,text:'Một câu chuyện sẽ trở nên sống động'},{t:12,text:'nhờ hình ảnh, âm thanh và nhịp điệu.'},{t:26,text:'Mang về kịch bản, storyboard và kế hoạch sản xuất.'}]}},
 {id:'c4',num:'Buổi 04',title:'Câu chuyện của riêng mình',poster:'assets/roadmap/poster4.webp',
  video:{provider:'youtube',id:'hxE_3eXLBa0',title:'Trailer phim Kẻ Mộng Mơ',aspect:16/9,ui:'custom'}, /* TẠM THỜI: video thử (ngang 16:9) từ playlist kênh KMM FILM (@kmmfilmstudio), thay bằng phim thật của dự án */
  script:{scene:'Buổi 4: Xem tác phẩm, trao đổi, khép lớp',
   vo:'Không giới hạn cách kể. Mỗi người chọn hình thức sáng tạo phù hợp nhất.',
   cues:[{t:0,text:'Không giới hạn cách kể.'},{t:7,text:'Mỗi người chọn hình thức sáng tạo phù hợp nhất.'},{t:14,text:'Khép lớp, mở cộng đồng: tổng kết hành trình và tiếp tục kết nối.'}]}}
 ]};

const RC=await MemoriContent.load('roadmap',{pageTitle:document.title,loaderText:(document.querySelector('.loader-text')||{}).textContent||'',chapters:CONFIG_DEFAULT.chapters}),SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
MemoriContent.setText('.loader-text',RC.loaderText);
const fixChapter=(d)=>{const c=RC.chapters.find(x=>x&&x.id===d.id)||d,v=c.video||{},dv=d.video,U=MemoriContent.url,prov=v.provider==='vimeo'?'vimeo':'youtube';
 const idOk=prov==='vimeo'?MemoriContent.vimeoId(String(v.id)):MemoriContent.youtubeId(String(v.id));
 const cues=((c.script||{}).cues||[]).filter(q=>q&&typeof q.text==='string'&&q.text&&isFinite(q.t)&&q.t>=0).map(q=>({t:+q.t,text:q.text}));
 return {id:d.id,num:c.num||d.num,title:c.title||d.title,poster:REL+U(c.poster,d.poster),
  video:Object.assign({},dv,{provider:idOk?prov:dv.provider,id:idOk||dv.id,title:typeof v.title==='string'?v.title:dv.title,aspect:(v.aspect>=.3&&v.aspect<=3)?v.aspect:dv.aspect,ui:(v.ui==='native'||v.ui==='custom')?v.ui:dv.ui,start:(v.start>0&&v.start<86400)?Math.floor(v.start):0}),
  script:{scene:(c.script||{}).scene||d.script.scene,vo:(c.script||{}).vo||d.script.vo,cues}}};
const CONFIG={hosts:CONFIG_DEFAULT.hosts,chapters:CONFIG_DEFAULT.chapters.map(fixChapter)};
const CHAPTERS=CONFIG.chapters;
let SELECTED=0; // mở trang vào Buổi 01

/* ================= HÌNH (toạ độ canvas 1670x942) ================= */
const CW=1670,CH=942;
const LAYERS={scroll:['img/scroll-bw.webp',443,547,767,208],moundL:['img/mound-bw.webp',146,759,306,92],moundR:['img/mound-bw.webp',1250,788,215,64],leafL:['img/leafL-bw.webp',-40,672,440,290],leafR:['img/leafR-bw.webp',1272,672,440,290],bg:['img/bg-bw.webp',0,0,1670,942]};
const NODES=[[430,788],[700,788],[970,788],[1240,788]];
const BOXC=[835,300],BOXW=640,BOXH=380; // hộp tối đa của khung video (toạ độ canvas)
const BO_FEET=[340,802],BO_SIZE=184,BO_IMG='../bw-bo/img/bo/',BO_POSES=['idle','wave','point','listen','happy','sleep'];

/* ================= TIỆN ÍCH ================= */
let now=0;
/* ================= TIỆN ÍCH ================= */
const $=id=>document.getElementById(id),app=$('app');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const rnd=(a,b)=>a+Math.random()*(b-a);
const mmss=s=>{if(!isFinite(s)||s<0)s=0;s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const timers={};function later(k,fn,ms){clearTimeout(timers[k]);timers[k]=setTimeout(fn,ms)}
const safe=(f)=>{try{return f()}catch(e){return null}};
const S_=n=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n))||0;

function mkImg(key,gx,gy,parent,cls){
  const L=LAYERS[key],im=new Image();im.className='l '+(cls||'');im.alt='';im.decoding='sync';
  im.style.cssText=`left:${L[1]-gx}px;top:${L[2]-gy}px;width:${L[3]}px;height:${L[4]}px`;
  im.onerror=()=>{im.classList.add('hide-fail')};im.src=L[0];parent.appendChild(im);return im;
}
const G={}; // nhóm: {el,gx,gy,tx,ty,kx,ky,depth}
function group(id,gx,gy,depth){const el=$(id);G[id]={el,gx,gy,tx:0,ty:0,kx:1,ky:1,depth};return G[id]}
group('bgG',0,0,.25);group('playerG',0,0,.6);group('scrollG',440,545,.9);
group('moundLG',165,640,1.0);group('chapG',330,700,1.1);group('leafLG',0,645,2.2);group('leafRG',1334,688,2.2);
const bgImg=$('bgImg');bgImg.style.cssText=`left:0;top:0;width:${CW}px;height:${CH}px`;bgImg.onerror=()=>{bgImg.classList.add('hide-fail')};bgImg.src=LAYERS.bg[0];
mkImg('scroll',440,545,$('scrollGI'));
mkImg('moundL',165,640,$('moundLGI'));mkImg('moundR',165,640,$('moundLGI')).style.transform='scaleX(-1)';
const leafL=mkImg('leafL',0,645,$('leafLGI'),'sway');leafL.style.transformOrigin='10% 100%';
const leafR=mkImg('leafR',1334,688,$('leafRGI'),'sway');leafR.style.transformOrigin='90% 100%';

/* ---- dòng lộ trình: một dây leo ngang (điện thoại: dây đứng bên trái), mỗi buổi là một thẻ giấy treo trên dây ---- */
const chapGI=$('chapGI');
chapGI.innerHTML=`<svg id="wave" width="1" height="1"><g id="vine" filter="url(#hand)"></g></svg>`;
const vine=$('vine');
const chBtns=[],ndEls=[],burstEls=[];
let NP=NODES.map(n=>[n[0],788]);   // vị trí nút trên dây (toạ độ nhóm chapG: canvas khi máy tính, px màn hình khi điện thoại)
const BURST_SVG='<svg viewBox="-60 -60 120 120" aria-hidden="true">'+[[0,27,46,2.6],[36,25,40,2],[72,28,50,2.6],[108,25,38,2],[144,27,47,2.6],[180,25,41,2],[216,28,50,2.6],[252,25,39,2],[288,27,46,2.6],[324,25,41,2]].map(([a,r1,r2,w])=>{const t=a*Math.PI/180;return `<path d="M${(Math.cos(t)*r1).toFixed(1)} ${(Math.sin(t)*r1).toFixed(1)}L${(Math.cos(t)*r2).toFixed(1)} ${(Math.sin(t)*r2).toFixed(1)}" stroke-width="${w}"/>`}).join('')+'</svg>';
NODES.forEach((n,i)=>{const d=document.createElement('div');d.className='nd';d.innerHTML='<i class="burst">'+BURST_SVG+'</i><i class="bead"></i>';chapGI.appendChild(d);ndEls.push(d);burstEls.push(d.querySelector('.burst'))});
CHAPTERS.forEach((c,i)=>{
  const b=document.createElement('button');b.type='button';b.className='ch';b.dataset.i=i;b.setAttribute('aria-label',`${c.num}: ${c.title}`);
  b.innerHTML=`<span class="lab"><b class="n"></b><b class="t"></b></span>`;
  chapGI.appendChild(b);chBtns.push(b);
});
function renderLabels(){chBtns.forEach((b,i)=>{b.querySelectorAll('.n').forEach(e=>e.textContent=CHAPTERS[i].num);b.querySelectorAll('.t').forEach(e=>e.textContent=CHAPTERS[i].title);b.setAttribute('aria-label',`${CHAPTERS[i].num}: ${CHAPTERS[i].title}`)})}
renderLabels();
/* dây leo: thân đôi nét mực + lá nhỏ + tua cuốn (SVG đen trắng), vẽ trong hệ toạ độ dọc dây (u dọc dây, v vuông góc) */
function vineSvg(ox,oy,rot,L,skipU,step,u0,sc,rad){
  let leaves='',k=0;
  for(let u=u0;u<L-14;u+=step,k++){
    if(skipU.some(n=>Math.abs(u-n)<rad))continue;
    const d=k%2?1:-1,kind=k%3,f=n=>(n*sc).toFixed(1);
    if(kind===2)leaves+=`<path d="M${u} 0c${f(3)} ${f(-d*9)} ${f(13)} ${f(-d*12)} ${f(15)} ${f(-d*5)}c${f(1.5)} ${f(d*6)} ${f(-7)} ${f(d*8)} ${f(-8.5)} ${f(d*2)}c${f(-1)} ${f(-d*3)} ${f(3)} ${f(-d*4)} ${f(4)} ${f(-d*2)}" fill="none"/>`;
    else leaves+=`<path d="M${u} 0q${f(3)} ${f(-d*15)} ${f(19)} ${f(-d*14)}q${f(-5)} ${f(d*13)} ${f(-19)} ${f(d*14)}z" fill="#fbfbfa"/><path d="M${u+1} ${f(-d*1)}L${(u+13*sc).toFixed(1)} ${f(-d*9)}" fill="none" stroke-width="1.2"/>`;
  }
  const body=`M0 0C${L*.25} -3 ${L*.4} 3 ${L*.55} 0S${L*.85} -3 ${L} 0`;
  return `<g transform="translate(${ox-330} ${oy-700}) rotate(${rot})" stroke-linecap="round" stroke-linejoin="round"><path d="${body}" fill="none" stroke="#111" stroke-width="7.5"/><path d="${body}" fill="none" stroke="#fbfbfa" stroke-width="2.8"/><g stroke="#111" stroke-width="1.7">${leaves}</g></g>`;
}

/* ================= BỌ (sprite đen trắng) ================= */
const BO={cur:null,flip:false,mood:'idle',tt:0,st:0,asleep:false,frozen:!!FORCED,front:0};
const boEl=document.createElement('div');boEl.id='bo';
boEl.style.cssText=`left:${BO_FEET[0]-BO_SIZE/2-5-165}px;top:${BO_FEET[1]-BO_SIZE+3-640}px;width:${BO_SIZE}px;height:${BO_SIZE}px`;
boEl.innerHTML='<div class="flip"><img alt="" draggable="false"><img alt="" draggable="false"></div><button type="button" id="boHit" aria-label="Bọ"></button>';
$('moundLGI').appendChild(boEl);
const boFlip=boEl.querySelector('.flip'),boImgs=[...boFlip.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]={im,ready:new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()})};im.src=BO_IMG+p+'.webp'});
function boShow(pose,flip){flip=!!flip;if(pose===BO.cur&&flip===BO.flip)return;
  const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;
  boFlip.style.transform=flip?'scaleX(-1)':'';BO.cur=pose;BO.flip=flip;boEl.dataset.pose=pose}
function boBase(){return BO.asleep?'sleep':BO.mood}
function boFlash(pose,ms,flip){if(BO.frozen)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose,flip);BO.tt=setTimeout(()=>{boShow(boBase())},ms)}
function boMood(m){BO.mood=m;if(BO.frozen)return;if(!BO.asleep&&performance.now()>=(BO.flashUntil||0))boShow(boBase())}
function boArmSleep(){clearTimeout(BO.st);if(BO.frozen)return;BO.st=setTimeout(()=>{if(app.classList.contains('playing')){boArmSleep();return}BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(BO.frozen)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
$('boHit').addEventListener('click',()=>boFlash('happy',1400));
if(FORCED&&BO_POSES.includes(FORCED))boShow(FORCED);else boShow('idle');
if(!FORCED)boArmSleep();

/* ================= BỐ CỤC ================= */
let VW=0,VH=0,PORT=false,UI={},CARD=[],BOX={cx:835,cy:300,w:640,h:380,k:1,M:48};
function setG(g,tx,ty,kx,ky){g.tx=tx;g.ty=ty;g.kx=kx;g.ky=ky}
const gp=(g,x,y)=>[g.tx+(x-g.gx)*g.kx,g.ty+(y-g.gy)*g.ky]; // canvas -> màn hình (chưa parallax)
function layout(){
  VW=app.clientWidth;VH=app.clientHeight;PORT=VW/VH<0.8;app.classList.toggle('port',PORT);
  const sl=S_('--gutl')||16;
  if(!PORT){
    const s=Math.min(VW/CW,VH/CH),ox=(VW-CW*s)/2,oy=(VH-CH*s)/2;
    for(const id in G){const g=G[id];setG(g,ox+g.gx*s,oy+g.gy*s,s,s)}
    setG(G.leafLG,0,VH-(942-645)*s,s,s);setG(G.leafRG,VW-(1672-1334)*s,VH-(942-688)*s,s,s);   // lá tiền cảnh bám mép màn hình
    bg(1.03);
    BOX={cx:ox+BOXC[0]*s,cy:oy+BOXC[1]*s,w:BOXW*s,h:BOXH*s,k:s,M:Math.round(clamp(48*s,30,56))};
    UI={gs:s,s,u:s,nf:17,tf:16};
    NP=NODES.map(n=>[n[0],788]);CARD=NP.map(n=>[n[0]-129,810,258,70]);
  }else{
    const m=Math.max(14,sl*.8),mp=m,CHH=54,GAP=8,listH=4*CHH+3*GAP,top0=70;
    const minAR=Math.min(...CHAPTERS.map((c,i)=>vcfg(i).aspect));
    const boxW=VW-2*mp,boxH=Math.round(clamp(boxW/minAR,150,VH*.42));
    let sks=(VW-2*m)/767,sky=sks*1.8,foot=112,need=()=>boxH+16+208*sky+14+listH+foot;
    if(top0+need()>VH){sky=sks*1.5;foot=90}
    const spare=Math.max(0,VH-top0-need());
    const topPad=top0+spare*.2,gapBox=16+spare*.25,gapList=14+spare*.25;
    const sTop=topPad+boxH+gapBox,listTop=sTop+208*sky+gapList;
    BOX={cx:VW/2,cy:topPad+boxH/2,w:boxW,h:boxH,k:boxW/BOXW,M:Math.round(clamp(boxW/BOXW*48,24,36))};
    setG(G.scrollG,m-(443-440)*sks,sTop-(547-545)*sky,sks,sky);
    setG(G.chapG,330,700,1,1);   // nhóm chapG: toạ độ = px màn hình
    const cx=m+40,cw=VW-cx-m;
    CARD=[0,1,2,3].map(i=>[cx,listTop+i*(CHH+GAP),cw,CHH]);NP=CARD.map(c=>[m+10,c[1]+c[3]/2]);
    const gk=clamp(VW/390*.42,.34,.5);setG(G.moundLG,VW/2-(BO_FEET[0]-165)*gk,VH-30-(BO_FEET[1]-640)*gk,gk,gk);
    const kl=clamp(VW/390*.3,.24,.42);
    setG(G.leafLG,0,VH-(942-645)*kl,kl,kl);
    setG(G.leafRG,VW-336*kl,VH-(942-688)*kl,kl,kl);
    bg(1.04);
    UI={gs:BOX.k,s:1,u:1,nf:13.5,tf:14,sks,vx:m+10,vy:listTop,vl:listH};
  }
  
  applyUI();
}
function bg(extra){const s=Math.max(VW/CW,VH/CH)*(extra||1);setG(G.bgG,(VW-CW*s)/2,(VH-CH*s)/2,s,s)}
function applyUI(){
  const Sg=G.scrollG;
  setWrapTarget(true);
  let tr;
  if(!PORT){tr=[566,573,399,150]}else{tr=[560,562,540,172]}
  const t0=gp(Sg,tr[0],tr[1]),t1=gp(Sg,tr[0]+tr[2],tr[1]+tr[3]);
  const st=$('stext');const u=PORT?1.1:UI.s;
  st.style.cssText=`left:${t0[0]}px;top:${t0[1]}px;width:${t1[0]-t0[0]}px;height:${t1[1]-t0[1]}px;--u:${u}`;
  st.classList.toggle('port',PORT);
  const dc=$('deco');if(!PORT){const d0=gp(Sg,480,650),d1=gp(Sg,1140,730);dc.style.cssText=`display:block;left:${d0[0]}px;top:${d0[1]}px;width:${d1[0]-d0[0]}px;height:${d1[1]-d0[1]}px`}else dc.style.display='none';
  const sk=$('sketch');
  if(!PORT){const k0=gp(Sg,975,600),k1=gp(Sg,1130,690);sk.style.cssText=`display:block;left:${k0[0]}px;top:${k0[1]}px;width:${k1[0]-k0[0]}px;height:${k1[1]-k0[1]}px`}else sk.style.display='none';
  const sl=$('seal'),sc=gp(Sg,443+767*(PORT?.905:.925),547+208*.74),ss=PORT?40:Math.max(34,64*UI.s);
  sl.style.cssText=`left:${sc[0]-ss/2}px;top:${sc[1]-ss/2}px;width:${ss}px;height:${ss}px`;
  const rs=document.documentElement.style;rs.setProperty('--nf',UI.nf+'px');rs.setProperty('--tf',UI.tf+'px');
  chBtns.forEach((b,i)=>{const c=CARD[i];b.style.cssText=`left:${c[0]-330}px;top:${c[1]-700}px;width:${c[2]}px;height:${c[3]}px`;
    ndEls[i].style.cssText=`left:${NP[i][0]-330}px;top:${NP[i][1]-700}px`});
  if(!PORT)vine.innerHTML=vineSvg(NP[0][0]-34,788,0,NP[3][0]-NP[0][0]+68,NP.map(n=>n[0]-NP[0][0]+34),38,22,1.45,32);
  else vine.innerHTML=vineSvg(NP[0][0],NP[0][1]-22,90,NP[3][1]-NP[0][1]+44,NP.map(n=>n[1]-NP[0][1]+22),20,10,1.1,19);
  moveRing();
  fitText();
}
function moveRing(){}

/* ================= KHUNG VIDEO THEO TỈ LỆ CLIP ================= */
const curIdx=()=>chapIdx<0?SELECTED:chapIdx;
const vcfg=i=>{const v=CHAPTERS[i].video||{},p=v.provider==='vimeo'?'vimeo':'youtube';return{provider:p,id:v.id||'',aspect:v.aspect||16/9,start:v.start||0,ui:v.ui||(p==='vimeo'?'native':'custom')}};
const getAR=i=>vcfg(i).aspect;
const PST=[];
(function(){const w=$('vwrap'),sh=$('tram');CHAPTERS.forEach((c,i)=>{const im=new Image();im.className='pst';im.alt='';im.decoding='sync';im.onerror=()=>{im.classList.add('hide-fail')};im.src=c.poster;w.insertBefore(im,sh);PST.push(im)})})();
let pz_=0;
function showPoster(i){const e=PST[i];PST.forEach((q,k)=>{if(k!==i)q._off=setTimeout(()=>{if(chapIdx!==k)q.classList.remove('pon')},520)});clearTimeout(e._off);e.style.zIndex=++pz_;
  if(!e.classList.contains('pon'))requestAnimationFrame(()=>e.classList.add('pon'))}
const PW={x:0,y:0,w:640,h:360,ok:0},PS={x:0,y:0,w:0,h:0},PTg={x:0,y:0,w:0,h:0},PM={on:false,t0:null,dur:.6};
let swT=null;
function wrapTarget(){const ar=getAR(curIdx());let w=BOX.w,h=w/ar;if(h>BOX.h){h=BOX.h;w=h*ar}return{x:BOX.cx-w/2,y:BOX.cy-h/2,w,h}}
function setWrapTarget(snap){const t=wrapTarget(),pz=$('pz');
  if(snap||RM||!PW.ok){clearTimeout(swT);swT=null;pz.classList.remove('swp','swi');Object.assign(PW,t);PW.ok=1;Object.assign(PTg,t);paintWrap();return}
  if(Math.abs(t.x-PTg.x)+Math.abs(t.y-PTg.y)+Math.abs(t.w-PTg.w)+Math.abs(t.h-PTg.h)<.5)return;
  Object.assign(PTg,t);if(swT)return;
  // đổi tỉ lệ khung: mờ đi -> đổi kích thước lúc đang ẩn -> hiện lại (chỉ opacity, không animate layout)
  pz.classList.remove('swi');pz.classList.add('swp');
  swT=setTimeout(()=>{swT=null;Object.assign(PW,PTg);paintWrap();pz.classList.remove('swp');pz.classList.add('swi');setTimeout(()=>pz.classList.remove('swi'),340)},180)}
function paintWrap(){const st=$('pw').style;st.left=PW.x+'px';st.top=PW.y+'px';st.width=PW.w+'px';st.height=PW.h+'px';
  ctlLayout(PW.w,PW.h)}
// điều khiển co theo kích thước khung: bỏ dần thanh âm lượng, thời gian, cài đặt, phụ đề (nút tắt tiếng bỏ cuối cùng)
function ctlLayout(W,H){const pw=$('pw'),fs=isFs(),cl=pw.classList,st=pw.style;
  let bs,bps,ccf,bpad=8,prog=22,hide={vol:0,time:0,set:0,cc:0,mute:0};
  if(fs){W=VW;H=VH;bs=VW<620?44:52;bps=96;ccf=clamp(VW*.026,17,30);prog=28;bpad=20}
  else{
    const coarse=matchMedia('(pointer:coarse)').matches,minB=coarse?44:34,order=['vol','time','set','cc','mute'];
    if(W<360)hide.vol=1;
    const cnt=()=>2+(hide.set?0:1)+(hide.cc?0:1)+(hide.mute?0:1),fixed=()=>2*bpad+(hide.vol?0:92)+(hide.time?0:100);
    let oi=0;while(cnt()*minB+fixed()>W&&oi<order.length)hide[order[oi++]]=1;
    bs=clamp((W-fixed())/cnt(),minB,44);
    bps=clamp(Math.min(W,H)*.2,48,84);ccf=clamp(W/28,11.5,22);
  }
  for(const k in hide)cl.toggle('h-'+k,!!hide[k]);
  st.setProperty('--bs',bs.toFixed(1)+'px');st.setProperty('--bps',bps.toFixed(1)+'px');st.setProperty('--spn',Math.max(30,bps*.5).toFixed(1)+'px');st.setProperty('--ccfs',ccf.toFixed(1)+'px');
  st.setProperty('--bpad',bpad+'px');st.setProperty('--prog',prog+'px');st.setProperty('--barh',(prog+bs)+'px');st.setProperty('--shh',(prog+bs+(fs?0:36))+'px')}
const _fsStub=0;
function wrapTick(){
  if(PM.on){if(PM.t0==null)PM.t0=now;const f=clamp((now-PM.t0)/PM.dur),e=f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2;
    PW.x=PS.x+(PTg.x-PS.x)*e;PW.y=PS.y+(PTg.y-PS.y)*e;PW.w=PS.w+(PTg.w-PS.w)*e;PW.h=PS.h+(PTg.h-PS.h)*e;if(f>=1){PM.on=false;PW.x=PTg.x;PW.y=PTg.y;PW.w=PTg.w;PW.h=PTg.h}paintWrap()}}


/* ================= KỊCH BẢN ================= */
const stext=$('stext');
function renderScript(i){const c=CHAPTERS[i],s=c.script;
  stext.innerHTML=`<div class="hd"></div><div class="sc"><svg viewBox="0 0 20 18" fill="none" stroke="#111" stroke-width="1.3" stroke-linejoin="round"><rect x="1.5" y="6.5" width="17" height="10" rx="1"/><path d="M2 6.5l2-4 3 .5-2 3.5M8 6.5l2-3.6 3 .5-2 3.2M14 6.5l1.8-3 2.6.4"/></svg><span></span></div><div class="vo">VO (Lời kể):</div><div class="nr"></div>`;
  stext.querySelector('.hd').textContent='Kịch bản – '+c.num;stext.querySelector('.sc span').textContent=s.scene;stext.querySelector('.nr').textContent=s.vo;fitText()}
let FT={};
function fitText(){const nr=stext.querySelector('.nr');if(!nr)return;const sc=stext.querySelector('.sc');
  const key=curIdx()+'|'+stext.style.cssText+'|'+PORT,h=FT[key];
  if(h){sc.style.display=h.d;nr.style.fontSize=h.fs;nr.style.setProperty('-webkit-line-clamp',h.lc);nr.style.setProperty('line-clamp',h.lc);return}
  const u=parseFloat(stext.style.getPropertyValue('--u'))||1;
  sc.style.display=(PORT&&stext.clientHeight<112)?'none':'';
  let f=PORT?15:18;nr.style.fontSize=`calc(var(--u,1)*${f}px)`;
  for(let k=0;k<24&&(stext.scrollHeight>stext.clientHeight+1||nr.scrollHeight>nr.clientHeight+1);k++){f-=PORT?.8:.7;nr.style.fontSize=`calc(var(--u,1)*${Math.max(f,PORT?12.4:6)}px)`}
  let lc='4';if(PORT)lc='5';
  nr.style.setProperty('-webkit-line-clamp',lc);nr.style.setProperty('line-clamp',lc);
  FT[key]={d:sc.style.display,fs:nr.style.fontSize,lc}}
// tính sẵn cỡ chữ cho cả 4 chương lúc rảnh (ẩn, trong cùng một tác vụ => không nhấp nháy)
function warmFit(){const i0=chapIdx;stext.classList.add('meas');CHAPTERS.forEach((c,i)=>{if(i===i0)return;chapIdx=i;renderScript(i)});chapIdx=i0;renderScript(i0);stext.classList.remove('meas')}


/* ================= PLAYER (iframe nhúng: facade + postMessage) =================
   Không dùng <video>, không có preload/prefetch. Iframe chỉ được tạo khi bấm phát; đổi chương = mờ dần + xoá iframe cũ, tạo iframe mới (không bao giờ đổi src của iframe đang hiện).
   Điều khiển YouTube: giao thức postMessage của iframe API (enablejsapi=1: {event:'listening'} + {event:'command',func,args}; nhận onStateChange / infoDelivery).
   Điều khiển Vimeo: giao thức postMessage của Player.js (api=1: {method,value}; nhận event ready/play/pause/ended/timeupdate/progress).
   Không nạp script ngoài (sandbox của Artifact chặn script lạ) nên dùng thẳng postMessage thay cho file iframe_api / player.js. */
let chapIdx=-1,volume=1,muted=false,ccOn=false,rate=1,seeking=false,autoT=null;
const PL={ci:-1,ifr:null,prov:'',loaded:false,q:[],t:0,d:0,buf:0,paused:true,ended:false,started:false,to:0,
  get currentTime(){return this.t},set currentTime(s){plSeek(s)},get duration(){return this.d}};
const V=()=>PL;
const isPH=id=>!id||/^(YOUTUBE|VIMEO|REPLACE)/i.test(id);
function setAriaPlay(){const p=!PL.paused&&!PL.ended;
  $('bPlay').setAttribute('aria-label',p?'Tạm dừng':'Phát');$('bPlay').innerHTML=p?'<svg viewBox="0 0 24 24"><path class="fillic" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>':'<svg viewBox="0 0 24 24"><path class="fillic" d="M8 5.5v13l11-6.5z"/></svg>';
  const bp=$('bigplay');bp.setAttribute('aria-label',PL.ended?'Phát lại':'Phát video');
  bp.innerHTML=PL.ended?'<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;margin:0"><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4.5V9h4.5"/></svg>':'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>';
  app.classList.toggle('playing',p);boMood(p?'listen':(PL.ended?'happy':'idle'))}
let READY=false;const idle=f=>window.requestIdleCallback?requestIdleCallback(f,{timeout:2500}):setTimeout(f,60);
function embedUrl(i){const c=vcfg(i),H=CONFIG.hosts,id=encodeURIComponent(c.id),ctl=c.ui==='custom'?0:1;
  if(c.provider==='vimeo')return `${H.vimeo}/video/${id}?api=1&player_id=rm${i}&autoplay=1&playsinline=1&dnt=1&title=0&byline=0&portrait=0${ctl?'':'&controls=0'}${c.start?'#t='+c.start+'s':''}`;
  const org=/^https?:/.test(location.origin)?'&origin='+encodeURIComponent(location.origin):'';
  return `${H.youtube}/embed/${id}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&controls=${ctl}${c.start?'&start='+c.start:''}${org}`}
function plPost(m){const f=PL.ifr;if(!f||!f.contentWindow)return;try{f.contentWindow.postMessage(JSON.stringify(m),PL.prov==='vimeo'?CONFIG.hosts.vimeo:CONFIG.hosts.youtube)}catch(e){}}
function plMap(c,a){
  if(PL.prov==='vimeo')return({play:{method:'play'},pause:{method:'pause'},seek:{method:'setCurrentTime',value:a},vol:{method:'setVolume',value:a},mute:{method:'setMuted',value:true},unmute:{method:'setMuted',value:false},rate:{method:'setPlaybackRate',value:a}})[c];
  const f={play:['playVideo',[]],pause:['pauseVideo',[]],seek:['seekTo',[a,true]],vol:['setVolume',[Math.round(a*100)]],mute:['mute',[]],unmute:['unMute',[]],rate:['setPlaybackRate',[a]]}[c];
  return f&&{event:'command',func:f[0],args:f[1]}}
function plCmd(c,a){if(!PL.ifr)return;const m=plMap(c,a);if(!m)return;if(!PL.loaded){PL.q.push(m);return}plPost(m)}
function plSeek(s){s=Math.max(0,Math.min(s,PL.d||1e9));PL.t=s;plCmd('seek',s)}
function plPlay(){clearAuto();plCmd('play')}
function plPause(){plCmd('pause')}
/* dùng lại iframe YouTube đang có (đã bắt tay xong) khi đổi chương lúc đang phát: loadVideoById thay vì dựng lại cả player */
function plReuse(i){const c=vcfg(i),f=PL.ifr;
  if(!f||PL.prov!=='youtube'||c.provider!=='youtube'||!PL.loaded||isPH(c.id))return false;
  clearTimeout(PL.to);plPost({event:'command',func:'pauseVideo',args:[]});
  Object.assign(PL,{ci:i,t:0,d:0,buf:0,paused:true,ended:false,started:false});
  f.classList.remove('show');app.classList.add('embedded','buffering');
  plPost({event:'command',func:'loadVideoById',args:[{videoId:c.id,startSeconds:c.start||0}]});
  PL.to=setTimeout(()=>{if(PL.ifr===f&&!PL.started){plStart(i,true)}},9000);   /* không chạy sau 9 giây: dựng iframe mới như cũ */
  setAriaPlay();upd();return true}
function plStart(i,noReuse){if(window.YTFast)YTFast.cancelPrime();plRelease(true);const c=vcfg(i);
  if(isPH(c.id)){showMsg('Chưa gắn video thật cho chương này: sửa CONFIG.chapters['+i+'].video.id (chỉ cần ID YouTube hoặc Vimeo).',5000);return}
  const f=document.createElement('iframe');f.className='emb';f.title=CHAPTERS[i].num+': '+CHAPTERS[i].title;
  f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.referrerPolicy='strict-origin-when-cross-origin';f.setAttribute('allowfullscreen','');
  Object.assign(PL,{ci:i,ifr:f,prov:c.provider,loaded:false,q:[],t:0,d:0,buf:0,paused:true,ended:false,started:false});
  f.addEventListener('load',()=>{if(PL.ifr!==f)return;PL.loaded=true;
    if(PL.prov==='vimeo')['play','pause','ended','timeupdate','progress','seeked'].forEach(e=>plPost({method:'addEventListener',value:e}));
    else plPost({event:'listening',id:i,channel:'widget'});
    const q=PL.q;PL.q=[];q.forEach(plPost);applyVol();if(rate!==1)plCmd('rate',rate)});
  f.src=embedUrl(i);$('vwrap').insertBefore(f,$('tram'));
  app.classList.add('embedded','buffering');
  PL.to=setTimeout(()=>{if(PL.ifr===f&&!PL.started){app.classList.remove('buffering');showMsg('Không tải được video (mạng chậm hoặc nhà cung cấp bị chặn nhúng).')}},15000);
  setAriaPlay();upd()}
function plRelease(now_){clearTimeout(PL.to);const f=PL.ifr;
  if(f){plPost(PL.prov==='vimeo'?{method:'pause'}:{event:'command',func:'pauseVideo',args:[]});f.classList.remove('show');if(now_)f.remove();else setTimeout(()=>f.remove(),360)}
  Object.assign(PL,{ci:-1,ifr:null,loaded:false,q:[],t:0,d:0,buf:0,paused:true,ended:false,started:false});
  app.classList.remove('embedded','buffering')}
function plPlaying(){PL.paused=false;PL.ended=false;if(!PL.started){PL.started=true;clearTimeout(PL.to);PL.ifr&&PL.ifr.classList.add('show')}
  app.classList.remove('buffering');hideMsg();setAriaPlay();clearAuto();bumpUI()}
function plPaused(){PL.paused=true;setAriaPlay();showUI()}
function plEnded(){PL.paused=true;PL.ended=true;setAriaPlay();upd();showUI();onEnded()}
function ytState(s){if(s===1)plPlaying();else if(s===2){if(PL.started)plPaused();app.classList.remove('buffering')}else if(s===0)plEnded();else if(s===3&&PL.started&&!PL.paused)app.classList.add('buffering')}
function onYT(m){const inf=m.info;
  if(m.event==='onStateChange'&&typeof inf==='number'){ytState(inf);return}
  if((m.event==='infoDelivery'||m.event==='initialDelivery')&&inf&&typeof inf==='object'){
    if('currentTime' in inf)PL.t=+inf.currentTime||0;if(inf.duration)PL.d=+inf.duration;if('videoLoadedFraction' in inf)PL.buf=+inf.videoLoadedFraction||0;
    if('playerState' in inf&&inf.playerState!==PL._ys){PL._ys=inf.playerState;ytState(inf.playerState)}upd()}}
function onVimeo(m){const e=m.event,d=m.data||{};
  if(e==='ready'){['play','pause','ended','timeupdate','progress','seeked'].forEach(x=>plPost({method:'addEventListener',value:x}));return}
  if(d.duration)PL.d=+d.duration;if(typeof d.seconds==='number')PL.t=d.seconds;if(e==='progress'&&typeof d.percent==='number')PL.buf=d.percent;
  if(e==='play')plPlaying();else if(e==='pause'){if(PL.started&&!PL.ended)plPaused()}else if(e==='ended')plEnded();upd()}
addEventListener('message',e=>{const f=PL.ifr;if(!f||e.source!==f.contentWindow)return;
  if(e.origin!==(PL.prov==='vimeo'?CONFIG.hosts.vimeo:CONFIG.hosts.youtube))return;
  let m=e.data;if(typeof m==='string'){try{m=JSON.parse(m)}catch(_){return}}if(!m||typeof m!=='object')return;
  PL.prov==='vimeo'?onVimeo(m):onYT(m)});
function togglePlay(){
  if(!PL.ifr||PL.ci!==curIdx()){clearAuto();plStart(curIdx());return}
  if(PL.paused||PL.ended){if(PL.ended){PL.ended=false;plSeek(0)}plPlay()}else plPause()}
function showMsg(t,ms){const m=$('msg');m.textContent=t;m.classList.add('show');clearTimeout(timers.msg);if(ms)timers.msg=setTimeout(()=>m.classList.remove('show'),ms)}
function hideMsg(){$('msg').classList.remove('show')}
function upd(){const d=PL.d,ok=isFinite(d)&&d>0;
  if(!seeking)$('seek').value=ok?Math.round(PL.t/d*1000):0;
  $('played').style.width=(ok?PL.t/d*100:0)+'%';$('buf').style.width=(ok?PL.buf*100:0)+'%';
  $('time').textContent=ok?mmss(PL.t)+' / '+mmss(d):'--:--';$('seek').setAttribute('aria-valuetext',ok?mmss(PL.t)+' trên '+mmss(d):'chưa rõ thời lượng');
  updCC()}
function updCC(){const cc=$('cc');const cues=CHAPTERS[chapIdx<0?SELECTED:chapIdx].script.cues||[];
  if(!ccOn||!cues.length){cc.textContent='';return}
  const t=PL.t;let txt='';for(const q of cues){if(q.t<=t)txt=q.text}cc.textContent=txt}
function onEnded(){const nxt=chapIdx+1;if(nxt>=CHAPTERS.length)return;
  let n=3;const box=$('nextbox'),tx=$('nexttxt');box.classList.add('show');
  const tick=()=>{tx.textContent=`Chương tiếp theo sau ${n} giây`;if(n<=0){clearAuto();select(nxt,{play:true});return}n--;autoT=setTimeout(tick,1000)};tick()}
function clearAuto(){clearTimeout(autoT);autoT=null;$('nextbox').classList.remove('show')}
$('cancelNext').addEventListener('click',clearAuto);
function applyVol(){const eff=muted?0:volume;plCmd('vol',eff);plCmd(eff===0?'mute':'unmute');
  $('vol').value=Math.round(eff*100);$('vol').style.setProperty('--p',Math.round(eff*100)+'%');
  $('volX').style.display=eff===0?'':'none';$('volWaves').style.display=eff===0?'none':'';
  $('bMute').setAttribute('aria-label',eff===0?'Bật tiếng':'Tắt tiếng')}
$('bPlay').onclick=togglePlay;$('bigplay').onclick=togglePlay;if(window.YTFast){YTFast.intent($('bigplay'));YTFast.intent($('vclick'))}
// bấm bằng chuột/chạm xong thì bỏ focus nút để phím Space/K luôn điều khiển video (bàn phím vẫn dùng bình thường)
app.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.cb,#bigplay,.mi');if(b&&e.detail>0)setTimeout(()=>b.blur(),0)});
$('bMute').onclick=()=>{if(muted||volume===0){muted=false;if(volume===0)volume=.6}else muted=true;applyVol()};
$('vol').addEventListener('input',e=>{volume=e.target.value/100;muted=volume===0;applyVol()});
$('bCC').onclick=toggleCC;
function toggleCC(){const cues=CHAPTERS[chapIdx<0?SELECTED:chapIdx].script.cues||[];if(!cues.length)return;ccOn=!ccOn;$('bCC').setAttribute('aria-pressed',ccOn);updCC()}
function refreshCCBtn(){const cues=CHAPTERS[chapIdx<0?SELECTED:chapIdx].script.cues||[];const b=$('bCC');b.disabled=!cues.length;b.setAttribute('aria-label',cues.length?'Phụ đề':'Chương này chưa có phụ đề');updCC()}
const seek=$('seek');
seek.addEventListener('input',()=>{seeking=true;if(isFinite(PL.d)&&PL.d>0){const t=seek.value/1000*PL.d;plSeek(t);$('played').style.width=(seek.value/10)+'%';$('time').textContent=mmss(t)+' / '+mmss(PL.d);updCC()}clearAuto()});
seek.addEventListener('change',()=>{seeking=false;upd()});
seek.addEventListener('pointerup',()=>{seeking=false});
// tốc độ + menu
const spd=document.querySelector('#menu .speeds');
[.5,.75,1,1.25,1.5,2].forEach(r=>{const b=document.createElement('button');b.type='button';b.className='mi';b.setAttribute('role','radio');b.dataset.r=r;b.textContent=r===1?'Chuẩn':r+'×';b.setAttribute('aria-checked',r===1);
  b.onclick=()=>{rate=r;plCmd('rate',r);spd.querySelectorAll('.mi').forEach(x=>x.setAttribute('aria-checked',+x.dataset.r===r))};spd.appendChild(b)});
function menu(open){const m=$('menu');m.hidden=!open;if(open)m.style.display='';else m.style.display='none';$('bSet').setAttribute('aria-expanded',open)}
$('bSet').onclick=e=>{e.stopPropagation();menu($('menu').hidden)};
document.addEventListener('pointerdown',e=>{if(!$('menu').hidden&&!e.target.closest('#menu')&&!e.target.closest('#bSet'))menu(false)});
// toàn màn hình: chỉ phần tử #pfs (video + điều khiển), không phải cả sân khấu
const pfs=$('pfs');let pseudo=false;
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement}
function isFs(){return fsEl()===pfs||pseudo}
function lockOri(){try{if(screen.orientation&&screen.orientation.lock&&PORT){const r=screen.orientation.lock('landscape');if(r&&r.catch)r.catch(()=>{})}}catch(e){}}
function unlockOri(){try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}}
function pseudoFs(on){pseudo=on;syncFs()}
function enterFs(){
  const rq=pfs.requestFullscreen||pfs.webkitRequestFullscreen||pfs.msRequestFullscreen,ok=document.fullscreenEnabled||document.webkitFullscreenEnabled||document.msFullscreenEnabled;
  if(rq&&ok!==false){try{const r=rq.call(pfs);if(r&&r.then)r.then(lockOri,()=>pseudoFs(true));else lockOri()}catch(e){pseudoFs(true)}}
  else pseudoFs(true)
}
function exitFs(){if(pseudo)pseudoFs(false);const ex=document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen;if(fsEl()&&ex){try{const r=ex.call(document);if(r&&r.catch)r.catch(()=>{})}catch(e){}}}
function toggleFs(){isFs()?exitFs():enterFs()}
function syncFs(){const on=isFs();pfs.classList.toggle('fs',on);app.classList.toggle('isfs',on);
  $('bFs').setAttribute('aria-label',on?'Thoát toàn màn hình':'Toàn màn hình');$('fsIn').setAttribute('d',on?'M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5':'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5');
  if(!on)unlockOri();layout();bumpUI()}
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(!fsEl())pseudo=false;syncFs()}));
$('bFs').onclick=toggleFs;

// bấm vào ảnh
let lastTap=0;
$('vclick').addEventListener('dblclick',e=>{e.preventDefault();toggleFs()});
$('vclick').addEventListener('click',e=>{if(app.classList.contains('idleui')){showUI();return}if(e.pointerType==='touch'&&!uiShownByTap){uiShownByTap=true;showUI();return}togglePlay()});
let uiShownByTap=true;
// tự ẩn điều khiển sau 2,5 s
function showUI(){app.classList.remove('idleui');clearTimeout(timers.ui)}
function bumpUI(){showUI();if(!V().paused)timers.ui=setTimeout(()=>{if(!V().paused&&!$('menu').matches(':hover')&&$('menu').hidden&&!document.activeElement?.closest?.('#bar'))app.classList.add('idleui');else bumpUI()},2500)}
['pointermove','pointerdown','touchstart','keydown','focusin'].forEach(ev=>app.addEventListener(ev,()=>{if(!V().paused)bumpUI();else showUI()},{passive:true}));
// phím tắt
document.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;const k=e.key,t=e.target;const tag=t&&t.tagName;
  if(tag==='BUTTON'&&(k===' '||k==='Enter'))return; // để nút tự xử lý
  const v=PL;let used=true;
  switch(k){
    case ' ':case 'k':case 'K':togglePlay();break;
    case 'ArrowLeft':v.currentTime=Math.max(0,v.currentTime-5);break;
    case 'ArrowRight':v.currentTime=Math.min(v.duration||1e9,v.currentTime+5);break;
    case 'ArrowUp':volume=clamp(volume+.1);muted=false;applyVol();break;
    case 'ArrowDown':volume=clamp(volume-.1);muted=volume===0;applyVol();break;
    case 'm':case 'M':$('bMute').click();break;
    case 'f':case 'F':toggleFs();break;
    case 'c':case 'C':toggleCC();break;
    case 'Escape':if(!$('menu').hidden){menu(false)}else if(pseudo){pseudoFs(false)}else used=false;break;
    default:used=false}
  if(used){e.preventDefault();upd()}
});


/* ================= CHỌN CHƯƠNG ================= */
function setSel(i){chBtns.forEach((b,k)=>{b.classList.toggle('sel',k===i);b.setAttribute('aria-current',k===i?'true':'false')});}
function paintChapters(){chBtns.forEach((b,i)=>{ndEls[i].classList.toggle('on2',b.classList.contains('sel'))})}
function burst(i){const e=burstEls[i];if(!e||RM)return;e.classList.add('go');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('go'),300)}
function select(i,opt){opt=opt||{};const first=chapIdx<0;if(i===chapIdx&&!opt.force)return;
  const wasPlaying=(!first&&!PL.paused&&!PL.ended)||!!opt.play;
  clearAuto();hideMsg();SELECTED=i;chapIdx=i;setSel(i);paintChapters();
  const c=CHAPTERS[i];
  showPoster(i);
  app.classList.toggle('nativeui',vcfg(i).ui==='native');
  if(!first){
    if(wasPlaying&&PL.ifr&&plReuse(i)){clearTimeout(timers.vplay)}
    else{plRelease();
    if(wasPlaying)later('vplay',()=>{if(chapIdx===i)plStart(i)},170);else clearTimeout(timers.vplay)}
  }
  applyVol();setAriaPlay();upd();refreshCCBtn();
  if(first)renderScript(i);else{stext.classList.add('swap');$('sketch').style.opacity=.2;setTimeout(()=>{renderScript(i);stext.classList.remove('swap');$('sketch').style.opacity=''},230)}
  setWrapTarget(first);moveRing();
  if(!first){burst(i);boFlash('point',1200,!PORT&&NP[i][0]>BO_FEET[0])}
  $('live').textContent=`Đã chọn ${c.num}: ${c.title}`;
}
chBtns.forEach((b,i)=>{
  b.addEventListener('click',()=>select(i));
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){b.classList.add('hov');paintChapters()}});
  b.addEventListener('pointerleave',()=>{b.classList.remove('hov');paintChapters()});
  b.addEventListener('focus',()=>{if(b.matches(':focus-visible')){b.classList.add('hov');paintChapters()}});
  b.addEventListener('blur',()=>{b.classList.remove('hov');paintChapters()});
  b.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){b.classList.add('hov');paintChapters()}});
  ['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,e=>{if(e.pointerType!=='mouse'){setTimeout(()=>{b.classList.remove('hov');paintChapters()},350)}}));
});

/* ================= VÒNG LẶP: parallax, trôi nhẹ ================= */
let mx=0,my=0,smx=0,smy=0,vis=true;
app.addEventListener('pointermove',e=>{mx=(e.clientX/VW-.5)*2;my=(e.clientY/VH-.5)*2},{passive:true});
function tf(el,g,dx,dy){el.style.transform=`translate(${(g.tx+dx).toFixed(2)}px,${(g.ty+dy).toFixed(2)}px) scale(${g.kx},${g.ky})`}
function frame(ts){
  now=ts/1000;requestAnimationFrame(frame);if(!vis)return;
  smx+=(mx-smx)*.06;smy+=(my-smy)*.06;
  const A=RM?0:1,pxs=PORT?.35:1,ds=Math.sin(now*.35)*3*A,dc=Math.cos(now*.27)*2*A;
  const bobY=A*Math.sin(now*1.1)*5*(PORT?.6:1)*(UI.s||1);
  let pdx=0,pdy=0;
  for(const id in G){const g=G[id];const k=(UI.s||1);let dx=A*(smx*g.depth*-7*pxs+ds*g.depth*.5)*Math.max(.5,k),dy=A*(smy*g.depth*-4*pxs+dc*g.depth*.5)*Math.max(.5,k);
    if(id==='scrollG')dy+=bobY;
    if(id==='playerG'){pdx=dx;pdy=dy}
    tf(g.el,g,dx,dy);G[id]._dx=dx;G[id]._dy=dy}
  {const z=$('pz').style;z.left=pdx.toFixed(2)+'px';z.top=pdy.toFixed(2)+'px'}
  wrapTick();
  const sg=G.scrollG,tr=`translate(${sg._dx.toFixed(2)}px,${sg._dy.toFixed(2)}px)`;
  stext.style.transform=stext.classList.contains('swap')?`translate(${sg._dx}px,${(sg._dy+5).toFixed(2)}px)`:tr;
  $('sketch').style.transform=tr;$('deco').style.transform=tr;$('seal').style.transform=tr;
  if(!RM){const sw=Math.sin(now*.6)*.5;leafL.style.transform=`rotate(${sw}deg)`;leafR.style.transform=`rotate(${-sw*.9}deg)`}
  if(!RM&&!BO.frozen)boEl.style.transform=`scaleY(${(1+.012*Math.sin(now*1.5)).toFixed(4)})`;
}
document.addEventListener('visibilitychange',()=>{vis=!document.hidden;app.classList.toggle('paused',document.hidden)});

/* ================= THANH GỢI Ý: về trang Bọ + trang kế tiếp ================= */
(async()=>{
  const nav=$('np'),fixHref=h=>(h==='index.html'||h==='index.html#')?BO_PAGE:h==='lopf1.html'?'../bw-lopf1/':(/^(https?:|mailto:|#|\.\.\/)/i.test(h)?h:REL+h);
  const home=document.createElement('a');home.className='np-home';home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
  home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
  const DEF={max:2,pages:[
    {id:'roadmap',name:'Lộ trình Lớp F2',short:'Lộ trình',href:'roadmap.html',next:['lopf1','dangky']},
    {id:'lopf1',name:'Lớp F1',href:'lopf1.html',next:['khampha','dangky']},
    {id:'dangky',name:'Đăng ký',href:'dangky.html',next:['community','gioithieu']}]};
  const J=await MemoriContent.load('journey',DEF,{replace:['pages']});
  const ps=(J&&Array.isArray(J.pages))?J.pages:DEF.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('roadmap'),out=[];
  ((cur&&cur.next)||[]).forEach(x=>{const p=by(x);if(p&&p.name&&MemoriContent.url(p.href,'')&&!out.includes(p))out.push(p)});
  out.slice(0,2).forEach(pg=>{const a=document.createElement('a');a.href=fixHref(MemoriContent.url(pg.href,''));
    const n=document.createElement('span');n.textContent=pg.name;const r=document.createElement('span');r.textContent='→';r.setAttribute('aria-hidden','true');a.append(n,r);nav.appendChild(a)});
})();

/* ================= MỞ ĐẦU (~3 s) ================= */
function intro(){
  const on=(el)=>el&&el.classList.add('on');
  const steps=[[0,()=>on($('bgGI'))],[450,()=>{on($('pz'));on($('pw'))}],[1150,()=>{on($('scrollGI'));on($('stext'));on($('sketch'));on($('deco'));on($('seal'))}],
    [1650,()=>on($('chapGI'))],[2150,()=>{on($('moundLGI'))}],[2450,()=>{on($('leafLGI'));on($('leafRGI'))}],
    [3100,()=>{app.classList.remove('intro');app.querySelectorAll('.on').forEach(e=>e.classList.remove('on'))}]];
  steps.forEach(([t,f])=>setTimeout(f,t));
}
function loadGate(){
  const loader=document.querySelector('.loader'),bar=loader.querySelector('.loader-track span');
  const dec=im=>new Promise(r=>{const go=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};if(im.complete&&im.naturalWidth)go();else if(im.complete)r();else{im.addEventListener('load',go,{once:true});im.addEventListener('error',()=>r(),{once:true})}});
  const list=[...document.images].filter(im=>!im.closest('.loader')).map(dec);
  BO_POSES.forEach(p=>list.push(BOC[p].ready));
  const sample=CHAPTERS.map(c=>c.num+c.title+c.script.scene+c.script.vo+(c.script.cues||[]).map(q=>q.text).join('')).join(' ')+' Kịch bản VO (Lời kể): Lộ trình Me.Mori Chuẩn Tốc độ phát Chất lượng Tự động';
  ['400 40px "Oooh Baby"','400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
  let n=0;const tot=list.length,upd2=()=>{bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'};
  list.forEach(p=>p.then(()=>{n++;upd2()}));
  const all=Promise.all(list),timeout=new Promise(r=>setTimeout(r,30000)),minShow=new Promise(r=>setTimeout(r,RM?200:900));
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
function boot(){
  layout();select(SELECTED,{force:true});paintChapters();moveRing();
  requestAnimationFrame(frame);
  loadGate().then(()=>{window.__loaderDone=performance.now();
    if(!FORCED)boFlash('wave',1500);
    if(RM){app.classList.remove('intro');app.classList.add('ready');idle(warmFit);return}intro();setTimeout(()=>{app.classList.add('ready');idle(warmFit)},3300)});
}
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(layout,60)});
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(layout,60)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{FT={};fitText()});
boot();
window.__rm={select,get PL(){return PL},CHAPTERS,get PW(){return PW},get BOX(){return BOX},get state(){return{SELECTED,chapIdx,PORT,UI,PW,BOX,bo:BO.cur,flip:BO.flip}}};
})();
