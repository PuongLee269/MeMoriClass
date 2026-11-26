/* Trang Khám phá tác phẩm đen trắng (prototype): chép hành vi từ khampha.html, hình ảnh đen trắng, Bọ bằng sprite đen trắng. */
(async()=>{
'use strict';
const REL='../../',BO_PAGE='../bw-bo/',BO_IMG='../bw-bo/img/bo/';
const W=1672,H=941,$=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER=matchMedia('(hover:hover) and (pointer:fine)').matches;
const Q=new URLSearchParams(location.search);
const FROZEN=Q.get('freeze')==='1';
if(FROZEN)document.documentElement.classList.add('still');
const el=(tag,cls,css,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(css)e.style.cssText=css;if(html)e.innerHTML=html;return e};
/* liên kết: trang đang làm đen trắng trỏ sang bản mẫu, còn lại về trang thật */
const BW_PAGES={'index.html':'bw-bo','sitemap.html':'bw-map','roadmap.html':'bw-roadmap','lopf1.html':'bw-lopf1','gioithieu.html':'bw-gioithieu','method.html':'bw-method','khampha.html':'bw-khampha','gallery.html':'bw-gallery','community.html':'bw-community','dangky.html':'bw-dangky'};
const fixHref=h=>{h=String(h==null?'':h);if(!h||/^(https?:|mailto:|#|\.\.\/)/i.test(h))return h;const m=/^([^#?]*)([?#].*)?$/.exec(h);return BW_PAGES[m[1]]?'../'+BW_PAGES[m[1]]+'/'+(m[2]||''):REL+h};

/* ===== NỘI DUNG MẶC ĐỊNH (rút gọn từ assets/content/khampha.json; admin sửa file JSON, trang tự nạp) ===== */
const CONFIG_DEFAULT={"version":1,"page":{"title":"Khám phá tác phẩm","subtitle":"","subtitleTouch":"","hint":"","backLabel":"← Về trang Bọ","backHref":"index.html","loaderText":"Bọ đang thắp đèn trên mây…","soonText":"Sắp có","openText":"","tapText":"","noLinkText":"Chưa có liên kết","boLabel":"Trò chuyện với Bọ","viewText":"Vào xem","closeLabel":"Đóng","notFoundText":"Chưa tìm thấy tác phẩm này.","playLabel":"Phát video","galleryLabel":"Hình ảnh thêm"},"items":[{"id":"kiln","title":"Lò gốm","desc":"Nơi những bàn tay nhỏ nhào đất, nặn bình và nung thành món quà của riêng mình.","url":"","target":"","hotspot":{"poly":[[460,106],[465,141],[428,180],[412,230],[413,252],[408,271],[420,284],[445,294],[478,299],[590,300],[645,290],[668,281],[681,269],[681,211],[705,182],[694,167],[679,163],[653,138],[618,147],[589,147],[565,143],[550,135],[537,136],[524,123],[529,118],[529,105],[514,92],[492,89],[475,93]]},"litBox":[404,85,306,222],"labelAnchor":[556,89],"workId":""},{"id":"studio","title":"Studio ảnh thời trang","desc":"Ánh đèn, khung tranh và chiếc váy hoa: góc làm ảnh và thiết kế của lớp.","url":"","target":"","hotspot":{"poly":[[1195,138],[1204,243],[1172,296],[1186,308],[1203,293],[1221,311],[1221,338],[1232,349],[1265,357],[1297,357],[1309,349],[1380,349],[1439,336],[1458,338],[1479,328],[1494,331],[1505,320],[1522,332],[1533,321],[1505,270],[1506,228],[1512,221],[1514,206],[1527,192],[1527,175],[1503,151],[1451,152],[1438,134],[1421,121],[1284,125],[1258,111],[1220,126],[1208,125]]},"litBox":[1168,107,370,255],"labelAnchor":[1352,111],"workId":""},{"id":"house","title":"Homestay / Ngôi nhà mặt trời","desc":"Căn nhà nhỏ sáng đèn dưới mặt trời, nơi cả lớp nghỉ chân sau một ngày dài.","url":"","target":"","hotspot":{"poly":[[93,581],[94,588],[115,612],[157,633],[185,629],[203,644],[242,646],[263,656],[288,653],[337,658],[369,653],[399,638],[411,639],[422,632],[474,620],[489,606],[507,580],[508,572],[502,565],[504,553],[462,512],[424,519],[368,449],[369,439],[357,427],[317,426],[294,448],[286,447],[273,434],[277,425],[263,409],[263,393],[251,381],[241,384],[223,367],[216,366],[199,382],[185,379],[171,392],[175,410],[157,428],[157,433],[177,454],[173,460],[186,473],[197,468],[217,489],[200,507],[180,498],[168,508],[161,503],[144,508],[106,552],[105,565]]},"litBox":[89,362,424,301],"labelAnchor":[300,366],"workId":""},{"id":"stage","title":"Sân khấu","desc":"Tấm màn đỏ đã mở, cô bé đứng giữa ánh đèn: nơi trình diễn và kể chuyện.","url":"","target":"","hotspot":{"poly":[[1173,476],[1160,445],[1166,437],[1166,426],[1140,396],[1138,381],[1121,366],[1102,365],[1086,349],[1084,329],[1090,322],[1090,304],[1075,286],[1063,287],[1048,302],[999,296],[967,284],[953,270],[952,262],[933,247],[914,262],[913,274],[900,287],[880,297],[834,310],[822,298],[812,297],[796,312],[799,323],[784,339],[773,343],[758,331],[750,332],[737,346],[738,362],[699,395],[686,399],[653,430],[649,440],[649,452],[665,472],[663,483],[668,492],[683,506],[703,509],[727,533],[836,544],[846,550],[986,550],[994,544],[1089,534],[1101,529],[1122,509],[1153,506],[1166,493]]},"litBox":[645,243,533,312],"labelAnchor":[911,247],"workId":""},{"id":"class","title":"Lớp học","desc":"Bảng xanh, chồng sách và ngọn đèn: nơi mọi buổi học bắt đầu.","url":"","target":"","hotspot":{"poly":[[713,729],[716,749],[731,766],[749,767],[763,777],[835,790],[880,790],[921,796],[1051,781],[1068,771],[1105,770],[1136,740],[1129,716],[1088,681],[1086,656],[1075,637],[1031,601],[1022,603],[1012,613],[882,613],[872,603],[862,601],[846,617],[842,664],[829,677],[793,667],[776,680],[763,680],[729,708]]},"litBox":[709,597,432,204],"labelAnchor":[924,601],"workId":"mau"}],"settings":{"target":"_blank","showLabels":true,"fadeMs":450},"works":[{"id":"mau","title":"Tác phẩm mẫu","cardDesc":"Trang mẫu để xem luồng từ ngôi nhà đến bài giới thiệu. Chữ và hình sẽ được thay bằng tác phẩm thật.","thumb":"assets/lopf1/img/demo4.webp","thumbW":952,"thumbH":498}]};
const C=await MemoriContent.load('khampha',CONFIG_DEFAULT,{replace:['items','works']});
const SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
const PG=C.page,ST=C.settings||CONFIG_DEFAULT.settings;
document.title=(PG.title||'Khám phá tác phẩm')+' (bản mẫu đen trắng)';
MemoriContent.setText('.loader-text',PG.loaderText);
MemoriContent.setText('#ttl h1',PG.title);MemoriContent.setText('#ttl p',HOVER?PG.subtitle:(PG.subtitleTouch||PG.subtitle));
const view=$('view'),stage=$('stage'),live=$('live');
view.setAttribute('aria-label',PG.title);
$('bo').setAttribute('aria-label',PG.boLabel||'Trò chuyện với Bọ');
document.documentElement.style.setProperty('--fade',Math.max(0,Math.min(3000,Math.min(300,ST.fadeMs||260)))+'ms');
const asset=u=>/^(https?:|data:|\.\.\/|\/)/.test(u)?u:REL+u;
const url=(v,d)=>{const r=MemoriContent.url(v,d);return r?asset(r):r};

/* ===== hình dạng công trình: hộp + đa giác bấm theo bản vẽ mới (img/layout.json), dự phòng theo JSON cũ ===== */
let LAY={};try{const r=await fetch('img/layout.json');if(r.ok)LAY=await r.json()}catch(e){}
const num=v=>typeof v==='number'&&isFinite(v);
const ITEMS=(C.items||[]).map(it=>{
  const L=LAY[it.id];
  if(!L)return null;
  const hp=L.poly,lb=L.box;
  const rawHref=MemoriContent.url(it.url,'')||'';
  const href=rawHref?fixHref(rawHref):'';
  const wk=(C.works||[]).find(w=>w&&w.id&&w.id===it.workId);
  const work=wk&&it.workId?{id:String(wk.id),title:String(wk.title||''),desc:String(wk.cardDesc||''),thumb:url(wk.thumb,''),
    tw:typeof wk.thumbW==='number'&&wk.thumbW>0?wk.thumbW:16,th:typeof wk.thumbH==='number'&&wk.thumbH>0?wk.thumbH:9}:null;
  const tg=it.target==='_self'||it.target==='_blank'?it.target:(ST.target==='_self'?'_self':'_blank');
  const xs=hp.map(p=>p[0]),ys=hp.map(p=>p[1]);
  return{id:String(it.id||''),title:String(it.title||''),desc:String(it.desc||''),href:work?'':href,work,live:!!(work||href),target:tg,poly:hp,img:'img/b-'+it.id+'.webp',box:lb,
    bb:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],
    anchor:[(Math.min(...xs)+Math.max(...xs))/2,Math.min(...ys)]};
}).filter(Boolean);

/* ===== bố cục: điện thoại dọc = phủ kín chiều cao và kéo ngang; còn lại vừa khung ===== */
let S=1,OX=0,OY=0;
function layout(){
  const vw=innerWidth,vh=innerHeight,portrait=vw/vh<.9;
  const s=portrait?vh/H:Math.min(vw/W,vh/H);
  const oy=portrait?(vh-H*s)/2:Math.round((vh-H*s)/2),ox=portrait?0:Math.round((vw-W*s)/2);
  const wasPan=view.classList.contains('pan');
  view.classList.toggle('pan',portrait);document.body.classList.toggle('m-on',portrait||vw<=600);
  $('spacer').style.width=portrait?Math.round(W*s)+'px':'0';
  if(portrait&&!wasPan)view.scrollLeft=(W*s-vw)/2;
  S=s;OX=ox;OY=oy;
  stage.style.transform='translate3d('+ox+'px,'+oy+'px,0) scale('+s+')';
  placeTips();placeCard();
}

/* ===== công trình: bản vẽ, lớp viền mực (lit), vùng bấm, thẻ chú thích ===== */
const bldsBox=$('blds'),litsBox=$('lits'),hotsBox=$('hots'),tipsBox=$('tips');
const state=new Map();   /* id -> {hover,focus,tap,open} */
let boLookFn=()=>{};
let lastPtr='';
let openSt=null;
ITEMS.forEach((it,idx)=>{
  const css='left:'+it.box[0]+'px;top:'+it.box[1]+'px;width:'+it.box[2]+'px;height:'+it.box[3]+'px';
  const b=el('img','L bld',css);b.alt='';b.decoding='async';b.draggable=false;b.src=it.img;bldsBox.appendChild(b);
  const lit=el('img','L lit',css);lit.alt='';lit.decoding='async';lit.draggable=false;lit.src=it.img;litsBox.appendChild(lit);
  const [x0,y0,x1,y1]=it.bb,w=x1-x0,h=y1-y0;
  const hs=document.createElement(it.href?'a':'button');hs.className='hs'+(it.live?'':' nolink');
  if(it.href){hs.href=it.href;hs.target=it.target;if(it.target==='_blank')hs.rel='noopener noreferrer'}else hs.type='button';
  hs.style.cssText='left:'+x0+'px;top:'+y0+'px;width:'+w+'px;height:'+h+'px;clip-path:polygon('+it.poly.map(p=>(p[0]-x0)+'px '+(p[1]-y0)+'px').join(',')+')';
  hs.setAttribute('aria-label',it.work?(it.work.title||it.title)+'. '+(it.work.desc||it.desc):it.title+'. '+it.desc+(it.href?'':' '+PG.noLinkText+'.'));
  hs.dataset.id=it.id;hotsBox.appendChild(hs);
  const tip=el('div','tip'+(it.live?'':' soon'));tip.setAttribute('aria-hidden','true');
  tip.innerHTML='<b></b><span></span><em></em>';tip.firstChild.textContent=it.title;tip.children[1].textContent=it.desc;
  tipsBox.appendChild(tip);
  const st={hover:false,focus:false,tap:false,open:false,lit,hs,tip,it,idx};state.set(it.id,st);
  const sync=()=>{
    const on=st.hover||st.focus||st.tap||st.open;
    lit.classList.toggle('on',on);
    tip.classList.toggle('on',on&&ST.showLabels&&!st.open);
    tip.lastChild.textContent=it.live?(st.tap&&!HOVER?PG.tapText:PG.openText):PG.soonText;
    if(on)placeTips();
    const any=[...state.values()].find(s=>s.hover||s.focus||s.tap);boLookFn(any?(any.it.bb[0]>180?1:-1):0);
  };
  st.sync=sync;
  hs.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){st.hover=true;sync()}});
  hs.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){st.hover=false;sync()}});
  hs.addEventListener('focus',()=>{if(hs.matches(':focus-visible')){st.focus=true;sync();live.textContent=it.title+'. '+it.desc+(it.live?'':' '+PG.noLinkText+'.')}});
  hs.addEventListener('blur',()=>{st.focus=false;sync()});
  hs.addEventListener('click',e=>{
    if(it.work){e.preventDefault();if(lastPtr!=='touch'&&lastPtr!=='pen')openCard(st,lastPtr==='kbd');return}   /* nhà có tác phẩm: mở thẻ (cảm ứng xử lý ở pointerup) */
    if(st.go){st.go=false;if(!it.href)e.preventDefault();return}
    if(lastPtr==='touch'||lastPtr==='pen'){e.preventDefault();return}
    if(!it.href){e.preventDefault();flashSoon(st)}
  });
});
document.addEventListener('keydown',()=>{lastPtr='kbd'},true);
/* chạm: nhận diện "tap" (di chuyển < 10px) ở pointerup nên kéo ngang cuộn cảnh không nhầm thành chạm; vùng nhận rộng hơn đa giác */
const inPoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
function hitTest(cx,cy){
  const x=(cx+view.scrollLeft-OX)/S,y=(cy-OY)/S,pad=Math.max(10,22/S);let best=null,bd=1e9;
  state.forEach(st=>{
    const b=st.it.bb;
    if(inPoly(x,y,st.it.poly)){best=st;bd=-1;return}
    if(bd<0)return;
    const dx=Math.max(b[0]-x,0,x-b[2]),dy=Math.max(b[1]-y,0,y-b[3]),d=Math.hypot(dx,dy);
    if(d<=pad&&d<bd){best=st;bd=d}
  });
  return best;
}
let down=null;
view.addEventListener('pointerdown',e=>{lastPtr=e.pointerType;down=e.pointerType==='mouse'?null:{id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()}},true);
view.addEventListener('pointercancel',()=>{down=null});
view.addEventListener('pointerup',e=>{
  const d=down;down=null;
  if(!d||d.id!==e.pointerId||e.pointerType==='mouse')return;
  if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>10||performance.now()-d.t>900)return;
  const st=hitTest(e.clientX,e.clientY);
  if(!st){clearTaps('');closeCard();return}
  if(st.it.work){clearTaps('');openCard(st,false);return}
  if(openSt)closeCard();
  if(!st.tap){clearTaps(st.it.id);st.tap=true;st.sync();return}
  if(st.it.href){st.go=true;st.hs.click()}else flashSoon(st)
});
function clearTaps(except){state.forEach(s=>{if(s.tap&&s.it.id!==except){s.tap=false;s.sync()}})}
function flashSoon(st){
  const em=st.tip.lastChild;st.tip.classList.add('on');em.textContent=PG.soonText;
  if(!RM&&!FROZEN)st.tip.animate([{transform:'translate3d(0,0,0)'},{transform:'translate3d(0,-4px,0)'},{transform:'translate3d(0,0,0)'}],{duration:320,easing:'ease-out'});
  live.textContent=st.it.title+'. '+PG.soonText;
  clearTimeout(st.t);st.t=setTimeout(()=>{if(!(st.hover||st.focus||st.tap))st.tip.classList.remove('on')},1600);
}

/* ===== thẻ tác phẩm (ảnh tác phẩm đang chọn giữ màu thật) ===== */
const card=$('wc'),wcImg=$('wcImg');
function openCard(st,focusIt){
  const w=st.it.work;if(!w)return;
  if(openSt&&openSt!==st){openSt.open=false;openSt.sync()}
  openSt=st;st.open=true;st.sync();
  $('wcK').textContent=st.it.title;$('wcT').textContent=w.title||st.it.title;$('wcD').textContent=w.desc||st.it.desc;
  $('wcGoT').textContent=PG.viewText;$('wcX').setAttribute('aria-label',PG.closeLabel);
  $('wcGo').href=REL+'tacpham.html?id='+encodeURIComponent(w.id);
  if(w.thumb){wcImg.hidden=false;wcImg.width=w.tw;wcImg.height=w.th;if(wcImg.getAttribute('src')!==w.thumb)wcImg.src=w.thumb}else wcImg.hidden=true;
  card.removeAttribute('inert');card.classList.add('on');placeCard();
  live.textContent=(w.title||st.it.title)+'. '+(w.desc||st.it.desc);
  boMood('happy');
  if(focusIt)setTimeout(()=>{try{$('wcGo').focus({preventScroll:true})}catch(e){}},30);
}
function closeCard(back){
  if(!openSt)return;
  const st=openSt;openSt=null;st.open=false;st.tap=false;st.sync();
  card.classList.remove('on');card.setAttribute('inert','');boMood('idle');
  if(back){try{st.hs.focus({preventScroll:true})}catch(e){}}
}
function placeCard(){
  if(!openSt)return;
  const vw=innerWidth,vh=innerHeight,narrow=vw<=600;
  card.classList.toggle('row',narrow);
  card.style.width=(narrow?Math.min(vw-28,420):320)+'px';
  const cw=card.offsetWidth,ch=card.offsetHeight,b=openSt.it.bb;
  const hx0=OX-view.scrollLeft+b[0]*S,hx1=OX-view.scrollLeft+b[2]*S,hy0=OY+b[1]*S,hy1=OY+b[3]*S;
  const top=$('ttl').getBoundingClientRect().bottom+6,g=14,bt=12;
  const cand=narrow?[[(vw-cw)/2,vh-ch-bt],[(vw-cw)/2,top]]
    :[[(hx0+hx1)/2-cw/2,hy0-ch-g],[(hx0+hx1)/2-cw/2,hy1+g],[hx1+g,(hy0+hy1)/2-ch/2],[hx0-cw-g,(hy0+hy1)/2-ch/2]];
  let best=null,bo=1e12;
  cand.forEach(c=>{
    const x=Math.max(10,Math.min(vw-cw-10,c[0])),y=Math.max(top,Math.min(vh-ch-10,c[1]));
    const ov=Math.max(0,Math.min(x+cw,hx1)-Math.max(x,hx0))*Math.max(0,Math.min(y+ch,hy1)-Math.max(y,hy0));
    if(ov<bo-1){bo=ov;best=[x,y]}
  });
  card.style.left=Math.round(best[0])+'px';card.style.top=Math.round(best[1])+'px';
}
$('wcX').addEventListener('click',()=>closeCard(true));
addEventListener('keydown',e=>{if(e.key==='Escape'&&openSt)closeCard(card.contains(document.activeElement))});
view.addEventListener('click',e=>{if(lastPtr==='touch'||lastPtr==='pen')return;if(!e.target.closest('.hs'))closeCard()});

/* thẻ chú thích đặt theo toạ độ màn hình của công trình (trên đầu nếu đủ chỗ, không thì dưới chân) */
function placeTips(){
  const ttlB=$('ttl').getBoundingClientRect().bottom;
  state.forEach(st=>{
    const tw=st.tip.offsetWidth,th=st.tip.offsetHeight;
    const cx=OX-view.scrollLeft+st.it.anchor[0]*S,top=OY+st.it.bb[1]*S,bot=OY+st.it.bb[3]*S;
    let x=cx-tw/2,y=top-th-12;
    const lim=ttlB+6;
    if(y<lim&&bot+12+th<=innerHeight-8)y=bot+12;
    if(y<lim)y=lim;
    x=Math.max(10,Math.min(innerWidth-tw-10,x));y=Math.max(8,Math.min(innerHeight-th-8,y));
    st.tip.style.left=Math.round(x)+'px';st.tip.style.top=Math.round(y)+'px';
  });
}
addEventListener('resize',layout);if(window.visualViewport)visualViewport.addEventListener('resize',layout);
view.addEventListener('scroll',()=>{placeTips();placeCard()},{passive:true});

/* ===== Bọ (sprite đen trắng), nghỉ trên đám mây dưới trái ===== */
const BO_POSES=['idle','wave','point','listen','happy','sleep','surprised','think'];
const BO={cur:null,flip:false,mood:'idle',tt:0,st:0,asleep:false,front:0,flashUntil:0,frozen:FROZEN};
const boEl=$('bo'),boFlip=boEl.querySelector('.flip'),boImgs=[...boFlip.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]={ready:new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()})};im.src=BO_IMG+p+'.webp'});
function boShow(pose,flip){flip=!!flip;if(pose===BO.cur&&flip===BO.flip)return;
  const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;
  boFlip.style.transform=flip?'scaleX(-1)':'';BO.cur=pose;BO.flip=flip}
const boBase=()=>BO.asleep?'sleep':BO.mood;
function boFlash(pose,ms,flip){if(BO.frozen)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose,flip);BO.tt=setTimeout(()=>boShow(boBase()),ms)}
function boMood(m){BO.mood=m;if(BO.frozen)return;if(!BO.asleep&&performance.now()>=BO.flashUntil)boShow(boBase())}
function boLook(dir){if(BO.frozen)return;if(!dir){boShow(boBase());return}clearTimeout(BO.tt);BO.asleep=false;boShow('point',dir<0)}
boLookFn=boLook;
function boArmSleep(){clearTimeout(BO.st);if(BO.frozen)return;BO.st=setTimeout(()=>{BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(BO.frozen)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
(function boIdleLoop(){setTimeout(()=>{if(!BO.asleep&&!openSt&&!document.hidden)boFlash(Math.random()<.5?'wave':'think',1400);boIdleLoop()},5000+Math.random()*7000)})();
boShow('idle');boArmSleep();
boEl.addEventListener('pointerenter',()=>boFlash('happy',1400));

/* ===== thanh gợi ý: về trang Bọ + trang kế tiếp ===== */
(async()=>{
  const nav=$('np');
  const home=el('a','np-home');home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
  home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
  const DEF={max:2,pages:[
    {id:'khampha',name:'Khám phá tác phẩm',short:'Khám phá',href:'khampha.html',next:['gallery','dangky']},
    {id:'gallery',name:'Workshop',short:'Workshop',href:'gallery.html',next:['community','dangky']},
    {id:'dangky',name:'Đăng ký',href:'dangky.html',next:['community','gioithieu']}]};
  const J=await MemoriContent.load('journey',DEF,{replace:['pages']});
  const ps=(J&&Array.isArray(J.pages))?J.pages:DEF.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('khampha'),out=[];
  ((cur&&cur.next)||[]).forEach(x=>{const p=by(x);if(p&&p.name&&MemoriContent.url(p.href,'')&&!out.includes(p))out.push(p)});
  out.slice(0,2).forEach(pg=>{const a=el('a');a.href=fixHref(MemoriContent.url(pg.href,''));
    const n=el('span','np-n'+(pg.short?' has-s':''));n.textContent=pg.name;a.appendChild(n);
    if(pg.short){const s=el('span','np-s');s.textContent=pg.short;a.appendChild(s)}
    const r=el('span');r.textContent='→';r.setAttribute('aria-hidden','true');a.appendChild(r);nav.appendChild(a)});
})();

/* tạm dừng khi tab ẩn */
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('paused',document.hidden));

/* ===== tải thật: mọi ảnh + giải mã + phông chữ + dáng Bọ ===== */
function loadGate(){
  const loader=document.querySelector('.loader'),bar=loader.querySelector('.loader-track span');
  const dec=im=>new Promise(r=>{const g=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};if(im.complete&&im.naturalWidth)g();else if(im.complete)r();else{im.addEventListener('load',g,{once:true});im.addEventListener('error',()=>r(),{once:true})}});
  const list=[...document.images].filter(i=>!i.closest('.loader')).map(dec);
  BO_POSES.forEach(p=>list.push(BOC[p].ready));
  const sample=PG.title+PG.viewText+PG.subtitle+ITEMS.map(i=>i.title+i.desc).join('')+PG.soonText+' Workshop Đăng ký Về trang Bọ Bản đồ trang';
  ['400 40px "Oooh Baby"','400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"','600 16px "Be Vietnam Pro"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
  let n=0;const tot=list.length;list.forEach(p=>p.then(()=>{n++;bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'}));
  const all=Promise.all(list),timeout=new Promise(r=>setTimeout(r,30000)),minShow=new Promise(r=>setTimeout(r,RM?200:700));
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
layout();
loadGate().then(()=>{
  window.__loaderDone=performance.now();view.classList.add('in');
  if(!BO.frozen)boFlash('wave',1500);
});
window.__kp={items:ITEMS,state,get scale(){return S},get bo(){return BO.cur},openCard:id=>{const s=state.get(id);if(s)openCard(s,false)}};
})();
