/* Trang Đăng ký (đen trắng, prototype). Hành vi và nơi gửi form giữ nguyên trang cũ dangky.html. */
(async()=>{
'use strict';
const REL='../../',BO_PAGE='../bw-bo/',BO_IMG='../bw-bo/img/bo/',BO_POSES=['idle','wave','point','listen','happy','sleep','think','surprised'];
const PAGE_MAP={'index.html':'../bw-bo/','sitemap.html':'../bw-map/','roadmap.html':'../bw-roadmap/','lopf1.html':'../bw-lopf1/','gioithieu.html':'../bw-gioithieu/','method.html':'../bw-method/','khampha.html':'../bw-khampha/','gallery.html':'../bw-gallery/','community.html':'../bw-community/','dangky.html':'../bw-dangky/'};
const Q=new URLSearchParams(location.search),FROZEN=Q.get('freeze')==='1',FORCED=Q.get('pose');
if(FROZEN)document.body.classList.add('freeze');
const $=s=>document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches||FROZEN;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ===== nội dung: giống trang cũ (assets/content/dangky.json + site.json) ===== */
const CONFIG_DEFAULT={
 pageTitle:'Đăng ký lớp F2',loaderText:'Bọ đang trải tờ giấy đăng ký…',
 srTitle:'Đăng ký lớp F2',
 srText:'Học phí ưu đãi 1.500.000đ, giá gốc 2.400.000đ. Số lượng có hạn.',
 enrolledLabel:'Số chỗ đã xác nhận',seatWord:'chỗ',hint:'',hintDone:'Đã gửi, ME.MORI sẽ liên hệ bạn sớm',
 form:{title:'Đăng ký lớp F2',lead:'Để lại thông tin, Bọ sẽ liên hệ giữ chỗ cho bạn.',
  fields:[{id:'ten',label:'Họ tên',ph:'Nguyễn Văn A',type:'text',ac:'name',req:1},
          {id:'sdt',label:'Số điện thoại',ph:'09xx xxx xxx',type:'tel',ac:'tel',req:1},
          {id:'email',label:'Email',ph:'ban@email.com',type:'email',ac:'email',req:0},
          {id:'lop',label:'Lớp',ph:'F2',type:'text',ac:'off',value:'F2'}],
  submit:'Gửi đăng ký',sending:'Đang gửi…',close:'Đóng',errReq:'Vui lòng nhập thông tin này.',
  errPhone:'Số điện thoại chưa đúng (ví dụ 0912 345 678).',errEmail:'Email chưa đúng (ví dụ ban@email.com).',errSend:'Chưa gửi được. Bạn thử lại sau ít phút nhé.',
  thanksTitle:'Cảm ơn bạn!',thanksText:'Đã gửi, ME.MORI sẽ liên hệ bạn sớm'},
 fullLabel:'Đã hết chỗ',seats:{capacity:6}
};
const CC=await MemoriContent.load('dangky',CONFIG_DEFAULT),SITE=await MemoriContent.load('site',MemoriContent.SITE_DEFAULT);
const CONFIG=CC;
{const D=CONFIG_DEFAULT.form;CC.form.fields=D.fields.map(d=>{const c=CC.form.fields.find(x=>x&&x.id===d.id)||d;return Object.assign({},d,{label:c.label||d.label,ph:typeof c.ph==='string'?c.ph:d.ph})});
 CC.seats.capacity=Math.max(1,Math.floor(CC.seats.capacity))}
const E=MemoriContent.esc;
document.title=(CC.pageTitle||'Đăng ký lớp F2')+' (bản mẫu đen trắng)';
MemoriContent.setText('.loader-text',CC.loaderText);

/* chữ trên tờ giấy: tiêu đề, giá, ghi chú (lấy từ srText của trang cũ; trang cũ vẽ thành ảnh) */
const SRT=CC.srText||CONFIG_DEFAULT.srText;
const prices=SRT.match(/\d{1,3}(?:\.\d{3})+\s*đ/g)||[];
const noteM=SRT.match(/Số lượng[^.]*/i);
$('#ttl').textContent=CC.srTitle||CC.pageTitle;
$('#now').textContent=(prices[0]||'1.500.000đ').replace(/\s+/g,'');
$('#was').textContent=(prices[1]||'2.400.000đ').replace(/\s+/g,'');
$('#limited').textContent=noteM?noteM[0].trim():'Số lượng có hạn';
$('#a11y').innerHTML='<h1>'+E(CC.srTitle)+'</h1><p>'+E(SRT)+'</p>';
$('#hint').textContent=CC.hint||'';

/* ===== bố cục theo hướng màn hình ===== */
const body=document.body,bgImg=$('#bg');
function layout(){
 const port=innerWidth/innerHeight<.9;
 if(body.classList.contains('port')!==port||!bgImg.dataset.set){bgImg.dataset.set='1';body.classList.toggle('port',port);bgImg.src=port?'img/bg-phone-bw.webp':'img/bg-desk-bw.webp'}
 stampSize();parkPos();
}

/* ===== Bọ (sprite đen trắng) ===== */
const BO={cur:null,front:0,mood:'idle',asleep:false,tt:0,st:0,rt:0,flashUntil:0};
const boEl=$('#bo'),boFlip=boEl.querySelector('.flip'),boImgs=[...boFlip.querySelectorAll('img')],BOC={};
BO_POSES.forEach(p=>{const im=new Image();im.decoding='async';BOC[p]=new Promise(res=>{im.onload=()=>{(im.decode?im.decode():Promise.resolve()).then(res,res)};im.onerror=()=>res()});im.src=BO_IMG+p+'.webp'});
function boShow(pose){if(pose===BO.cur)return;const nx=1-BO.front,a=boImgs[nx],b=boImgs[BO.front];a.src=BO_IMG+pose+'.webp';a.classList.add('vis');b.classList.remove('vis');BO.front=nx;BO.cur=pose;boEl.dataset.pose=pose}
const boBase=()=>BO.asleep?'sleep':BO.mood;
function boFlash(pose,ms){if(FROZEN)return;clearTimeout(BO.tt);BO.asleep=false;BO.flashUntil=performance.now()+ms;boShow(pose);BO.tt=setTimeout(()=>boShow(boBase()),ms)}
function boMood(m){BO.mood=m;if(FROZEN)return;if(!BO.asleep&&performance.now()>=BO.flashUntil)boShow(boBase())}
function boArmSleep(){clearTimeout(BO.st);if(FROZEN)return;BO.st=setTimeout(()=>{if(mopen||busy){boArmSleep();return}BO.asleep=true;clearTimeout(BO.tt);boShow('sleep')},25000)}
function boTouch(){if(FROZEN)return;if(BO.asleep){BO.asleep=false;boShow(boBase())}boArmSleep()}
function boWander(){clearTimeout(BO.rt);if(FROZEN)return;BO.rt=setTimeout(()=>{if(!BO.asleep&&!mopen&&!busy&&!document.hidden)boFlash(Math.random()<.5?'wave':'think',1500);boWander()},rnd(5000,12000))}
['pointerdown','keydown','pointermove','touchstart'].forEach(ev=>addEventListener(ev,boTouch,{passive:true,capture:true}));
$('#boHit').addEventListener('click',()=>boFlash('happy',1400));
boShow(FORCED&&BO_POSES.includes(FORCED)?FORCED:'idle');
if(!FORCED){boArmSleep();boWander()}

/* ===== thanh gợi ý: về trang Bọ + trang kế tiếp ===== */
(async()=>{
 const nav=$('#np'),fixHref=h=>{h=String(h==null?'':h);if(!h||/^(https?:|mailto:|#|\.\.\/)/i.test(h))return h;const m=/^([^#?]*)([?#].*)?$/.exec(h);return PAGE_MAP[m[1]]?PAGE_MAP[m[1]]+(m[2]||''):REL+h};
 const home=document.createElement('a');home.className='np-home';home.href=BO_PAGE;home.setAttribute('aria-label',SITE.backLabel||'Về trang Bọ');
 home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';nav.appendChild(home);
 const DEF={max:2,pages:[{id:'dangky',name:'Đăng ký',href:'dangky.html',next:['community','gioithieu']},
  {id:'community',name:'Cộng đồng',href:'community.html',next:['dangky']},{id:'gioithieu',name:'Giới thiệu',href:'gioithieu.html',next:['method']}]};
 const J=await MemoriContent.load('journey',DEF,{replace:['pages']});
 const ps=(J&&Array.isArray(J.pages))?J.pages:DEF.pages,by=id=>ps.find(p=>p&&p.id===id),cur=by('dangky'),out=[];
 ((cur&&cur.next)||[]).forEach(x=>{const p=by(x);if(p&&p.name&&MemoriContent.url(p.href,'')&&!out.includes(p))out.push(p)});
 out.slice(0,2).forEach(pg=>{const a=document.createElement('a');a.href=fixHref(MemoriContent.url(pg.href,''));
  const n=document.createElement('span');n.textContent=(innerWidth<=620&&pg.short)?pg.short:pg.name;const r=document.createElement('span');r.textContent='→';r.setAttribute('aria-hidden','true');a.append(n,r);nav.appendChild(a)});
})();

/* ===== số đếm (chữ thật, lăn từng chữ số) ===== */
let EN=null,CAP=CC.seats.capacity,sent=false;
function roll(host,n){
 const s=String(n).padStart(String(CAP).length,'0');
 while(host.children.length>s.length)host.firstChild.remove();
 while(host.children.length<s.length){const col=document.createElement('span');col.className='col';const strip=document.createElement('span');strip.className='strip';strip.innerHTML=[...'0123456789'].map(d=>'<span>'+d+'</span>').join('');col.appendChild(strip);host.insertBefore(col,host.firstChild)}
 [...host.children].forEach((c,i)=>{c.firstChild.style.transform='translateY(-'+(+s.padStart(host.children.length,'0')[i]*1.05)+'em)'});
}
const enrEl=document.createElement('span');enrEl.className='sr';enrEl.id='enr';$('#sheet').appendChild(enrEl);
function setEnrolled(n,capacity){
 if(capacity!=null)CAP=Math.max(1,Math.floor(+capacity||CAP||1));
 EN=n==null?null:Math.max(0,Math.floor(+n||0));renderSeats();
}
function renderSeats(){
 const host=$('#rRem');const occupied=EN===null?null:Math.min(CAP,EN);
 if(occupied===null)host.textContent='—';else{if(!host.children.length)host.textContent='';roll(host,occupied)}
 roll($('#rCap'),CAP);
 enrEl.textContent=occupied===null?'Chưa có số chỗ đã xác nhận':CC.enrolledLabel+': '+occupied+' / '+CAP+' '+CC.seatWord+(occupied===CAP?' · '+CC.fullLabel:'');
}

/* ===== gửi đăng ký F2 tới Apps Script (đúng như trang cũ) ===== */
const registration=MemoriRegistration.create(window.fetch.bind(window));
let seatRequest;
async function refreshSeats(){
 if(seatRequest)return;
 const controller=new AbortController();seatRequest=controller;
 const timeout=setTimeout(()=>controller.abort(),8000),capacity=CAP;
 try{const remaining=await registration.loadRemaining(capacity,controller.signal);setEnrolled(capacity-remaining,capacity)}
 catch(_){setEnrolled(null)}
 finally{clearTimeout(timeout);seatRequest=null}
}
window.MemoriRegister={setEnrolled,getState:()=>({enrolled:EN,capacity:CAP,remaining:EN===null?null:Math.max(0,CAP-EN)}),submitRegistration(data){return registration.submit(data)}};
const submitRegistration=data=>window.MemoriRegister.submitRegistration(data||{});

/* ===== con dấu: con trỏ = con dấu (chuột), chạm = con dấu hạ xuống ===== */
const stamp=$('#stamp'),zone=$('#zone'),imp=$('#imprint');
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const HX=.5,HY=.86;
let SS=150,zc=[0,0],mouse=null,cur=null,parked=true,busy=false,mopen=false,ready=false,stamped=false,rafS=0;
if(fine)body.classList.add('stampcur');
const stampH=()=>SS*1.25;
function stampSize(){SS=body.classList.contains('port')?112:Math.round(Math.min(160,Math.max(120,innerWidth*.09)));stamp.style.setProperty('--ss',SS+'px')}
function apply(x,y){stamp.style.transform='translate3d('+(x-HX*SS).toFixed(1)+'px,'+(y-HY*stampH()).toFixed(1)+'px,0)'}
function parkPos(){const r=zone.getBoundingClientRect();zc=[r.left+r.width/2,r.top+r.height/2];if(parked||!mouse){cur=zc.slice();apply(zc[0],zc[1])}}
function showStamp(v){stamp.classList.toggle('show',!!v)}
function follow(){rafS=0;if(!mouse||parked||busy||!fine)return;
 const dx=mouse[0]-cur[0],dy=mouse[1]-cur[1];cur[0]+=dx*.34;cur[1]+=dy*.34;apply(cur[0],cur[1]);
 if(Math.hypot(dx,dy)>.4)rafS=requestAnimationFrame(follow)}
function setOver(v){body.classList.toggle('overui',!!v)}
addEventListener('pointermove',e=>{
 if(e.pointerType==='touch'||!fine)return;
 mouse=[e.clientX,e.clientY];
 const over=!!(e.target.closest&&e.target.closest('a,.mdl,#boHit'));
 setOver(over||mopen);
 if(busy)return;
 if(over||mopen){showStamp(false);return}
 if(parked){parked=false;stamp.classList.remove('glide');cur=mouse.slice()}
 if(ready)showStamp(true);
 if(!rafS)rafS=requestAnimationFrame(follow);
},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{if(fine&&!busy&&!mopen){parked=true;stamp.classList.add('glide');parkPos()}});
zone.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')body.classList.add('zone-hot')});
zone.addEventListener('pointerleave',()=>body.classList.remove('zone-hot'));
zone.addEventListener('focus',()=>{if(zone.matches(':focus-visible')){body.classList.add('zone-hot');if(!busy&&fine){parked=true;stamp.classList.add('glide');parkPos();showStamp(true)}}});
zone.addEventListener('blur',()=>body.classList.remove('zone-hot'));
addEventListener('resize',layout);
if(window.visualViewport)visualViewport.addEventListener('resize',layout);
async function doStamp(){
 if(busy)return;busy=true;boFlash('point',1600);
 parkPos();
 if(!fine&&!RM){stamp.classList.remove('glide');cur=[zc[0],zc[1]-stampH()*.9];apply(cur[0],cur[1]);showStamp(false);void stamp.offsetWidth}
 stamp.classList.add('glide');showStamp(true);apply(zc[0],zc[1]);
 await wait(RM?0:480);
 body.classList.add('press');await wait(RM?0:230);
 zone.classList.add('on');stamped=true;
 const rp=$('#ripple');rp.classList.remove('go');void rp.offsetWidth;rp.classList.add('go');
 await wait(RM?0:420);
 body.classList.remove('press','zone-hot');
 await wait(RM?0:260);
 busy=false;
 if(!fine)showStamp(false);else{parked=true;}
 boFlash('happy',1400);
 openModal();
}
zone.addEventListener('click',doStamp);

/* ===== form đăng ký (mở sau khi đóng dấu): giữ nguyên tên trường và nơi gửi ===== */
const FM=CC.form;
const mdl=document.createElement('div');mdl.className='mdl';mdl.setAttribute('role','dialog');mdl.setAttribute('aria-modal','true');mdl.setAttribute('aria-labelledby','mTitle');mdl.setAttribute('aria-hidden','true');
mdl.innerHTML='<div class="mcard"><button type="button" class="mx" aria-label="'+E(FM.close)+'">×</button><h2 id="mTitle">'+E(FM.title)+'</h2><p class="lead">'+E(FM.lead)+'</p><form class="mf" novalidate>'+
 FM.fields.map(f=>'<div><label for="m-'+f.id+'">'+E(f.label)+(f.req?' *':'')+'</label><input id="m-'+f.id+'" name="'+f.id+'" type="'+f.type+'" placeholder="'+E(f.ph)+'" autocomplete="'+f.ac+'"'+(f.value?' value="'+E(f.value)+'"':'')+(f.req?' required aria-required="true"':'')+' aria-describedby="e-'+f.id+'"><span class="err" id="e-'+f.id+'" aria-live="polite"></span></div>').join('')+
 '<div class="sr" aria-hidden="true"><label for="m-website">Website</label><input id="m-website" name="website" type="text" autocomplete="off" tabindex="-1"></div>'+
 '<p class="gerr" id="gerr" aria-live="polite"></p><button type="submit" class="go">'+E(FM.submit)+'</button></form>'+
 '<div class="thx" role="status"><h2>'+E(FM.thanksTitle)+'</h2><p>'+E(FM.thanksText)+'</p><button type="button" class="tclose">'+E(FM.close)+'</button></div></div>';
document.body.appendChild(mdl);
let lastFocus=null,submitting=false;
const mform=mdl.querySelector('form');
mform.elements.ten.maxLength=100;mform.elements.email.maxLength=254;mform.elements.lop.readOnly=true;
const focusables=()=>[...mdl.querySelectorAll('button,input')].filter(e=>e.offsetParent!==null&&!e.disabled);
function openModal(){
 mopen=true;lastFocus=zone;setOver(true);showStamp(false);boMood('listen');
 mdl.classList.remove('sent');mdl.classList.add('open');mdl.setAttribute('aria-hidden','false');
 setTimeout(()=>{const f=mdl.querySelector('input');f&&f.focus({preventScroll:true})},RM?0:150);
}
function closeModal(){
 mopen=false;mdl.classList.remove('open');mdl.setAttribute('aria-hidden','true');boMood('idle');
 if(fine){parked=true;stamp.classList.add('glide');parkPos();showStamp(true);setOver(false)}
 setTimeout(()=>{if(lastFocus)lastFocus.focus({preventScroll:true})},50);
}
mdl.querySelector('.mx').addEventListener('click',closeModal);
mdl.querySelector('.tclose').addEventListener('click',closeModal);
mdl.addEventListener('pointerdown',e=>{if(e.target===mdl)closeModal()});
mdl.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();closeModal();return}
 if(e.key==='Tab'){const f=focusables();if(!f.length)return;const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
});
const PHONE=/^\d{9,11}$/,MAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate(){
 let ok=true,first=null;const data={};
 for(const f of FM.fields){
  const i=mform.elements[f.id],v=i.value.trim();data[f.id]=v;let m='';
  if(f.req&&!v)m=FM.errReq;
  else if(f.id==='ten'&&v.length>100)m='Họ tên tối đa 100 ký tự.';
  else if(f.id==='sdt'&&v&&!PHONE.test(v.replace(/[\s()+.\-‐-―]/g,'')))m=FM.errPhone;
  else if(f.type==='email'&&v&&!MAIL.test(v))m=FM.errEmail;
  document.getElementById('e-'+f.id).textContent=m;i.setAttribute('aria-invalid',m?'true':'false');
  if(m){ok=false;if(!first)first=i}
 }
 if(first)first.focus();
 data.website=mform.elements.website.value.trim();
 return ok?data:null;
}
mform.addEventListener('input',e=>{const i=e.target;if(i.getAttribute('aria-invalid')==='true'){i.setAttribute('aria-invalid','false');document.getElementById('e-'+i.name).textContent=''}});
mform.addEventListener('submit',async e=>{
 e.preventDefault();if(submitting)return;const data=validate();if(!data)return;submitting=true;
 const btn=mform.querySelector('.go');btn.disabled=true;btn.textContent=FM.sending;$('#gerr').textContent='';
 try{await submitRegistration(data);sent=true;$('#hint').textContent=CC.hintDone;$('#live').textContent=CC.hintDone;mdl.classList.add('sent');boFlash('happy',2400);setTimeout(()=>mdl.querySelector('.tclose').focus(),30);refreshSeats()}
 catch(err){$('#gerr').textContent=err.code==='not-configured'?'Form đang chờ kết nối. Vui lòng quay lại sau.':FM.errSend+(err.fallbackEmail?' Liên hệ qua '+err.fallbackEmail+'.':'')}
 finally{submitting=false;btn.disabled=false;btn.textContent=FM.submit}
});

/* ===== tải xong rồi mới mở ===== */
layout();renderSeats();refreshSeats();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSeats()});
setInterval(()=>{if(!document.hidden)refreshSeats()},60000);
function loadGate(){
 const loader=document.querySelector('.loader'),bar=loader.querySelector('.loader-track span');
 const dec=im=>new Promise(r=>{const go=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};if(im.complete&&im.naturalWidth)go();else if(im.complete)r();else{im.addEventListener('load',go,{once:true});im.addEventListener('error',()=>r(),{once:true})}});
 const list=[...document.images].filter(im=>!im.closest('.loader')).map(dec);
 Object.values(BOC).forEach(p=>list.push(p));
 const sample='Đăng ký lớp F2 Số lượng có hạn Còn 0123456789 Cảm ơn bạn! Họ tên Số điện thoại 1.500.000đ 2.400.000đ';
 ['400 40px "Oooh Baby"','400 16px "Be Vietnam Pro"','500 16px "Be Vietnam Pro"'].forEach(f=>list.push(document.fonts&&document.fonts.load?document.fonts.load(f,sample).catch(()=>{}):Promise.resolve()));
 let n=0;const tot=list.length;list.forEach(p=>p.then(()=>{n++;bar.style.transform='scaleX('+Math.max(.04,n/tot*.96)+')'}));
 const all=Promise.all(list),timeout=wait(30000),minShow=wait(RM?200:900);
 const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 return Promise.all([minShow,Promise.race([all,timeout])]).then(raf2).then(()=>{bar.style.transform='scaleX(1)';loader.classList.add('is-done');setTimeout(()=>loader.remove(),1000)});
}
loadGate().then(async()=>{
 window.__loaderDone=performance.now();
 body.classList.add('ready');ready=true;layout();
 if(fine){parked=true;showStamp(true);parkPos()}
 if(!FORCED)boFlash('wave',1500);
});
window.__dk={get state(){return{port:body.classList.contains('port'),stamped,mopen,sent,bo:BO.cur,EN,CAP}},doStamp,closeModal};
})();
