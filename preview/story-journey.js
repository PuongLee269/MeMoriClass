/* Responses use only confirmed course facts and existing library destinations. No API. */
'use strict';
const normalizeQuestion = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const guideScripts = [
 {intent:'payment', keywords:['hoc phi','bao nhieu tien','gia khoa hoc','thanh toan','dong tien','dong hoc phi','mien phi','buoi dau','khong phu hop'], answer:'Học phí 2.400.000 VNĐ/toàn khóa. Bạn được trải nghiệm buổi đầu trước khi thanh toán. Nếu không phù hợp, có thể dừng và không phải đóng học phí; nếu tiếp tục, đóng học phí sau buổi đầu.', target:'#classInfo', label:'Đọc chính sách lớp'},
 {intent:'schedule', keywords:['lich','khai giang','dia diem','dia chi','o dau','may buoi','bao nhieu buoi','bao nhieu nguoi','bao lau','so cho','may nguoi','si so'], answer:'Lớp có 6 học viên, 4 buổi × 3 giờ. Lịch học linh hoạt; ngày học, địa điểm và tình trạng nhận đăng ký cần trao đổi trực tiếp với Me.Mori.', target:'#classInfo', label:'Xem thông tin lớp'},
 {intent:'support', keywords:['kho khan','ho tro','cong dong','sau khoa'], answer:'Có hỗ trợ cá nhân khi bạn gặp khó khăn và cộng đồng Mori để tiếp tục trao đổi sau khóa.', target:'#classInfo', label:'Tìm hiểu cách đồng hành'},
 {intent:'workshop', keywords:['workshop','khong khi','lop hoc','footage','video lop'], answer:'Bạn có thể xem tư liệu workshop trước đây. Đây không phải footage lớp F2 hiện tại và không phải feedback học viên.', target:'#workshopFilm', label:'Xem tư liệu workshop'},
 {intent:'library', keywords:['tac pham','bai giang','mau','danh co','ban dung','thu vien','xem video'], answer:'Cùng xem bài thực hành đánh cờ và các bài giảng ngắn đã công bố. Bốn phiên bản đánh cờ do giảng viên dựng lại để phân tích lựa chọn hình ảnh và nhịp dựng.', target:'#exploreContent', label:'Mở thư viện'},
 {intent:'mentor', keywords:['giang vien','le hong phuong','thay','nguoi day'], answer:'Người hướng dẫn là Lê Hồng Phương. Bạn có thể xem các bài giảng ngắn đã công bố để tìm hiểu cách giảng dạy.', target:'#exploreContent', label:'Xem bài giảng'},
 {intent:'register', keywords:['dang ky','lien he','facebook','nhan tin','giu cho'], answer:'Me.Mori hiện nhận đăng ký và trao đổi trực tiếp qua Facebook. Hãy nhắn để hỏi lịch học linh hoạt và thông tin tham gia.', target:'#journeyEnd', label:'Đến kênh liên hệ'},
 {intent:'learning', keywords:['f2','hoc gi','noi dung','ke chuyen','cong cu','phan mem','video','dung ai','tri tue nhan tao'], answer:'F2 tập trung thực hành kể chuyện qua video từ trải nghiệm đời sống. Công cụ có thể hỗ trợ dựng video; lựa chọn câu chuyện và cá tính vẫn do bạn quyết định.', target:'#classInfo', label:'Khám phá F2'}
];
function findGuideScripts(question) {
 const text=' '+normalizeQuestion(question)+' ';
 return guideScripts.filter(script=>script.keywords.some(keyword=>text.includes(' '+keyword+' ')));
}
const content=document.createElement('main');
content.id='journeyContent';content.hidden=true;
content.innerHTML=`
<nav class="journey-nav" aria-label="Điều hướng câu chuyện"><a href="#guide">Bọ dẫn đường</a><a href="#classInfo">Thông tin lớp</a><a href="#workshopFilm">Workshop</a><a href="#exploreContent">Thư viện</a><a href="#journeyEnd">Đăng ký</a><button type="button" id="returnStory">← Bốn ảnh của bạn</button></nav>
<section id="guide" class="journey-chapter"><span class="kicker">02 · Người bạn đồng hành</span><h2 id="guideTitle" tabindex="-1">Một câu chuyện của bạn.<br>Một người bạn dẫn đường.</h2><p><span aria-hidden="true">🪲</span> Mình là bọ cánh cứng, cùng bạn tìm hiểu Me.Mori Class F2 từ những khung hình vừa chọn.</p><p class="guide-disclosure">Bạn cứ nhập câu hỏi tự do. Mình tra cứu từ khóa theo kịch bản thông tin đã chốt, không phải AI trò chuyện tổng quát.</p><div id="guideLog" role="log" aria-label="Cuộc trò chuyện với bọ cánh cứng" aria-live="polite" aria-relevant="additions"></div><form id="guideForm"><label for="guideQuestion">Bạn muốn hỏi điều gì?</label><div class="question-row"><input id="guideQuestion" name="question" maxlength="500" required autocomplete="off" placeholder="Ví dụ: Không phù hợp sau buổi đầu thì sao?"><button type="submit">Gửi câu hỏi →</button></div></form><div class="guide-suggestions" aria-label="Gợi ý câu hỏi"><button type="button">Học phí bao nhiêu?</button><button type="button">F2 học gì?</button><button type="button">Xem bài giảng mẫu</button></div><a class="chapter-next" href="#classInfo">Cùng tìm hiểu lớp ↓</a></section>
<section id="classInfo" class="journey-chapter"><span class="kicker">03 · Từ khung hình đến cách kể</span><h2>Me.Mori Class F2</h2><p>Thực hành kể chuyện qua video từ trải nghiệm đời sống. Công cụ hỗ trợ dựng video; câu chuyện và cá tính do bạn quyết định.</p><dl class="class-facts"><div><dt>Nhóm nhỏ</dt><dd>6 học viên/lớp</dd></div><div><dt>Thời lượng</dt><dd>4 buổi × 3 giờ</dd></div><div><dt>Học phí toàn khóa</dt><dd>2.400.000 VNĐ</dd></div><div><dt>Lịch học</dt><dd>Linh hoạt · trao đổi trực tiếp</dd></div></dl><h3>Học buổi đầu. Rồi hãy quyết định.</h3><p>Bạn được trải nghiệm buổi đầu trước khi thanh toán. Nếu không phù hợp, có thể dừng và không phải đóng học phí. Nếu tiếp tục, đóng học phí sau buổi đầu.</p><p>Có hỗ trợ cá nhân khi bạn gặp khó khăn, cùng cộng đồng Mori để tiếp tục trao đổi sau khóa. Người hướng dẫn: <strong>Lê Hồng Phương</strong>.</p><a class="chapter-next" href="#workshopFilm">Ghé một workshop trước đây ↓</a></section>
<section id="workshopFilm" class="journey-chapter"><span class="kicker">04 · Một lát cắt thực tế</span><h2>Không khí một buổi workshop</h2><p>Tư liệu workshop trước đây — không phải footage lớp F2 hiện tại và không phải feedback học viên.</p><button type="button" id="loadWorkshop">▶ Tải video workshop</button><div id="workshopPlayer"></div><p>Nếu video bị chặn, không tải hoặc báo không khả dụng, hãy <a href="https://www.youtube.com/shorts/dzLtrYGiey8" target="_blank" rel="noopener noreferrer">mở video gốc trên YouTube ↗</a>. Bạn có thể tiếp tục khám phá mà không cần xem video.</p><a class="chapter-next" href="#exploreContent">Khám phá cách kể bằng hình ảnh ↓</a></section>
<section id="exploreContent" class="journey-chapter"><span class="kicker">05 · Những lựa chọn tạo nên cách kể</span><h2>Cùng một cảnh. Nhiều cách dựng.</h2><p>Bài thực hành đánh cờ từ thư viện cũ. Các phiên bản dưới đây do giảng viên dựng lại để phân tích, không phải kết quả độc lập của học viên.</p><div class="guide-suggestions" id="cutOptions"></div><div id="cutPlayer"></div><p><a id="cutOriginal" href="https://drive.google.com/file/d/1ySFN_pYL-CNqoccRqmVPpS125D8WKv-i/view" target="_blank" rel="noopener noreferrer">Mở bản dựng gốc nếu trình phát bị chặn ↗</a></p><h3>Bài giảng ngắn của Lê Hồng Phương</h3><p>Tiếp tục khám phá qua các bài giảng đã công bố trên kênh hiện có.</p><a class="chapter-next" href="https://www.youtube.com/@anhcuabum/shorts" target="_blank" rel="noopener noreferrer">Xem bài giảng ngắn ↗</a><a class="chapter-next" href="#journeyEnd">Chọn bước tiếp theo ↓</a></section>
<section id="journeyEnd" class="journey-chapter"><span class="kicker">06 · Câu chuyện vẫn tiếp tục</span><h2>Bạn muốn đi tiếp thế nào?</h2><p>Có thể quay lại, xem thêm hoặc trao đổi khi bạn sẵn sàng.</p><div class="guide-suggestions"><a href="#classInfo">Xem thông tin lớp</a><a href="#exploreContent">Xem tác phẩm / bài giảng mẫu</a><a href="https://www.facebook.com/phuonglhdp/" target="_blank" rel="noopener noreferrer">Đăng ký / liên hệ qua Facebook ↗</a></div><p>Đăng ký được tiếp nhận bằng trao đổi trực tiếp; website không tự động xác nhận chỗ học.</p></section>`;
document.body.append(content);
const log=document.getElementById('guideLog'),question=document.getElementById('guideQuestion');
function askGuide(value){
 const clean=value.trim();if(!clean)return;
 const entry=document.createElement('article'),asked=document.createElement('p');asked.textContent='Bạn: '+clean;entry.append(asked);
 const matches=findGuideScripts(clean);
 const responses=matches.length?matches:[{answer:'Mình chưa có thông tin đã xác nhận cho câu hỏi này. Bạn có thể hỏi rõ hơn, mở thông tin lớp hoặc liên hệ trực tiếp để được giải đáp.',target:'#journeyEnd',label:'Liên hệ Me.Mori'}];
 responses.forEach(script=>{const p=document.createElement('p');p.textContent='Bọ: '+script.answer;const a=document.createElement('a');a.href=script.target;a.textContent=script.label+' →';entry.append(p,a)});
 log.append(entry);while(log.children.length>12)log.firstElementChild.remove();question.value='';
}
document.getElementById('guideForm').addEventListener('submit',event=>{event.preventDefault();askGuide(question.value)});
document.querySelectorAll('.guide-suggestions button').forEach(button=>button.addEventListener('click',()=>{askGuide(button.textContent);question.focus()}));
document.getElementById('loadWorkshop').addEventListener('click',event=>{document.getElementById('workshopPlayer').innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/dzLtrYGiey8" title="Tư liệu workshop Me.Mori trước đây" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>';event.currentTarget.hidden=true});
const cuts=['1ySFN_pYL-CNqoccRqmVPpS125D8WKv-i','1xjAhRA_AgrOtjyF9vOKIL0XFYT4pnCQ_','1LobZdRMENW0MONi-qjcaZJtg53AaVgGa','1s0ryKUUBD6X53Rw1fXryt_07cFK_G2c3'];
cuts.forEach((id,index)=>{const button=document.createElement('button');button.type='button';button.textContent='Xem bản dựng '+(index+1);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{document.querySelectorAll('#cutOptions button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('cutPlayer').innerHTML='<iframe src="https://drive.google.com/file/d/'+id+'/preview" title="Đánh cờ — bản dựng '+(index+1)+' do giảng viên thực hiện" allowfullscreen></iframe>';document.getElementById('cutOriginal').href='https://drive.google.com/file/d/'+id+'/view'});document.getElementById('cutOptions').append(button)});
document.getElementById('returnStory').addEventListener('click',()=>{content.hidden=true;document.body.classList.remove('exploring');document.getElementById('storyNext').classList.add('active');document.getElementById('storyNext').setAttribute('aria-hidden','false');document.body.classList.add('story-open');document.getElementById('top').inert=true;document.getElementById('backToFrames').focus();window.scrollTo(0,0)});

// Keep keyboard focus within the visible scene; do not expose hidden scenes to AT.
const introPanel=document.getElementById('intro'),heroPanel=document.getElementById('top'),storyPanel=document.getElementById('storyNext');
function syncSceneAccess(){
 const introActive=introPanel.classList.contains('active');
 const storyActive=storyPanel.classList.contains('active');
 heroPanel.inert=introActive||storyActive||!content.hidden;
 storyPanel.inert=introActive||!storyActive;
 content.inert=introActive||content.hidden||storyActive;
 introPanel.inert=!introActive;
 introPanel.setAttribute('aria-hidden',String(!introActive));
 if(introActive)introPanel.querySelectorAll('.stage').forEach(stage=>stage.inert=!stage.classList.contains('active'));
}
new MutationObserver(syncSceneAccess).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden']});
syncSceneAccess();
document.addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const panel=introPanel.classList.contains('active')?introPanel:storyPanel.classList.contains('active')?storyPanel:null;
 if(!panel)return;
 const controls=[...panel.querySelectorAll('button,a[href],input')].filter(el=>!el.disabled&&!el.closest('[inert]')&&el.getClientRects().length);
 if(!controls.length)return;
 if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus()}
 else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus()}
});
