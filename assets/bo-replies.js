/* Bản mặc định nhúng sẵn. Nếu có assets/content/bo-replies.json + bo.json (sửa từ trang admin) thì khối cuối file này thay nội dung; lỗi/không có file => dùng bản này. */
const BO_REPLIES = [
  { id: 'tour_phrase', card: true, keys: ['tham quan','đi một vòng','dạo một vòng','một vòng'], reply: 'Tuyệt! Bạn bấm vào tấm bản đồ này, Bọ dẫn bạn đi một vòng nhé.', link: { href: 'sitemap.html', label: 'Tham quan bản đồ' } },
  { id: 'tour_yes', exact: true, card: true, keys: ['có','co','có ạ','có chứ','có nha','có nhé','ok','okay','oke','ok bọ','đi','đi thôi','đi nào','dẫn đi','dẫn mình đi','vâng','dạ','dạ có','ừ','ừ có','yes','muốn','mình muốn','đồng ý','được','được chứ','tham quan','tham quan đi','tham quan thôi'], reply: 'Tuyệt! Bạn bấm vào tấm bản đồ này, Bọ dẫn bạn đi một vòng nhé.', link: { href: 'sitemap.html', label: 'Tham quan bản đồ' } },
  { id: 'course_short_video', keys: ['storytelling cho video ngắn','video ngắn','video ngan','cấu trúc câu chuyện','cau truc cau chuyen','mở đầu cuốn hút','thông điệp'], reply: 'Workshop "Storytelling cho video ngắn" dạy bạn xây cấu trúc câu chuyện, mở đầu cuốn hút và thông điệp dễ nhớ.', link: { href: 'home-backup.html#courses', label: 'Xem workshop' } },
  { id: 'course_cinematic', keys: ['tư duy hình ảnh cinematic','tu duy hinh anh','cinematic','bố cục','bo cuc','ánh sáng','anh sang','chuyển động máy'], reply: 'Workshop "Tư duy hình ảnh cinematic" rèn bố cục, ánh sáng, chuyển động máy và nhịp cảm xúc cho khung hình của bạn.', link: { href: 'home-backup.html#courses', label: 'Xem workshop' } },
  { id: 'course_editing', keys: ['quay dựng cho creator','quay dựng','quay dung','dựng phim','dung phim','edit','footage','hậu kỳ','hau ky'], reply: 'Workshop "Quay dựng cho creator" giúp bạn biến footage thô thành sản phẩm hoàn chỉnh, rõ nhịp và rõ ý.', link: { href: 'home-backup.html#courses', label: 'Xem workshop' } },
  { id: 'register', keys: ['đăng ký','dang ky','dang ki','đăng kí','ghi danh','tham gia','muốn học','muon hoc','đăng ký lớp f2','dang ky lop f2','lớp f2','lop f2'], reply: 'Bạn mở trang Đăng ký lớp F2, điền thông tin rồi đóng dấu xác nhận là xong. Cần hỏi thêm thì gửi mail tới hello@memori.class nhé.', link: { href: 'dangky.html', label: 'Đăng ký lớp F2' } },
  { id: 'roadmap', keys: ['lộ trình','lo trinh','lộ trình học','lo trinh hoc','chapter','chương','kịch bản','kich ban','video','roadmap'], reply: 'Bọ có một cuộn giấy Lộ trình lớp F2: mỗi chapter là một chặng với video giới thiệu kèm kịch bản. Bạn bước vào xem cùng Bọ nhé!', link: { href: 'roadmap.html', label: 'Xem Lộ trình' } },
  { id: 'contact', keys: ['liên hệ','lien he','email','mail','instagram','facebook','inbox','hỏi thêm','hoi them'], reply: 'Bạn có thể viết cho ME.MORI qua hello@memori.class, hoặc tìm trang Instagram và Facebook ở phần chân trang nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'price', keys: ['học phí','hoc phi','giá','gia','bao nhiêu tiền','bao nhieu tien','chi phí','chi phi','phí','price'], reply: 'Bọ chưa thấy học phí trên trang này. Bạn gửi mail tới hello@memori.class để được báo chính xác nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'schedule', keys: ['lịch học','lich hoc','khai giảng','khai giang','khi nào','khi nao','giờ học','gio hoc','ngày học','lịch'], reply: 'Trang chưa đăng lịch khai giảng cụ thể. Bạn nhắn hello@memori.class để hỏi lịch workshop mới nhất nhé.', link: { href: 'home-backup.html#contact', label: 'Hỏi lịch' } },
  { id: 'duration', keys: ['bao lâu','bao lau','thời lượng','thoi luong','mấy buổi','may buoi','kéo dài','keo dai','bao nhiêu buổi'], reply: 'Các lớp được thiết kế ngắn gọn, mỗi buổi tập trung vào một kỹ năng rõ ràng. Số buổi cụ thể bạn hỏi qua hello@memori.class nhé.', link: { href: 'home-backup.html#method', label: 'Xem phương pháp' } },
  { id: 'location', keys: ['địa chỉ','dia chi','ở đâu','o dau','học online','hoc online','offline','trực tiếp','truc tiep','địa điểm','dia diem'], reply: 'Bọ chưa có thông tin địa điểm hay hình thức học (online/offline) trên trang. Bạn hỏi giúp qua hello@memori.class nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'workshops', keys: ['workshop','khóa học','khoa hoc','lớp học','lop hoc','có lớp nào','co lop nao','workshop có gì','workshop co gi','danh sách lớp'], reply: 'Hiện có 3 workshop: Storytelling cho video ngắn, Tư duy hình ảnh cinematic và Quay dựng cho creator. Lớp nào cũng ngắn gọn, áp dụng được ngay.', link: { href: 'home-backup.html#courses', label: 'Xem workshop' } },
  { id: 'what_learn', keys: ['học gì','hoc gi','được học','duoc hoc','nội dung','noi dung','dạy gì','day gi','kỹ năng','ky nang'], reply: 'Bạn học tư duy cinematic, cách kể chuyện, quay dựng và tạo cảm xúc bằng hình ảnh, qua bài tập thật có phản hồi.', link: { href: 'home-backup.html#features', label: 'Xem nội dung' } },
  { id: 'method', keys: ['phương pháp','phuong phap','bàn đá','ban da','ghép đá','ghep da','khối đá','khoi da','học như thế nào','cách học','cach hoc','quy trình','quy trinh','các bước','feedback'], reply: 'Phương pháp học nằm trên một chiếc bàn đá: bạn ghép ba khối đá cùng ký hiệu để mở từng phương pháp. Mỗi buổi tập trung một kỹ năng, có ví dụ, thực hành theo brief và feedback.', link: { href: 'method.html', label: 'Xem phương pháp' } },
  { id: 'beginner', keys: ['người mới','nguoi moi','mới bắt đầu','moi bat dau','chưa biết','chua biet','phù hợp','phu hop','dành cho ai','danh cho ai','beginner'], reply: 'Lớp dành cho creator muốn có tư duy cinematic. Khi đăng ký, bạn chọn chủ đề hợp với mục tiêu và kinh nghiệm hiện tại của mình.', link: { href: 'home-backup.html#method', label: 'Xem phương pháp' } },
  { id: 'practice', keys: ['thực hành','thuc hanh','bài tập','bai tap','brief','làm bài','lam bai'], reply: 'Bạn làm bài tập tại lớp, quay dựng theo brief và nhận phản hồi để cải thiện từng phiên bản sản phẩm.', link: { href: 'home-backup.html#features', label: 'Thực hành thật' } },
  { id: 'sitemap', keys: ['bản đồ','ban do','sitemap','site map','sơ đồ','so do','sơ đồ trang','đi đâu','di dau','bắt đầu từ đâu','bat dau tu dau','không biết','khong biet','lạc','lac','tìm trang','tim trang','các trang','cac trang','danh sách trang','mục lục','muc luc','điều hướng','dieu huong','menu','xem gì','xem gi','có gì','co gi','trang web có gì'], reply: 'Bọ giữ một tấm bản đồ của cả trang: Lớp F2, Cộng đồng, Gallery, Lộ trình... Bạn muốn Bọ mở ra cho xem không?', link: { href: 'sitemap.html', label: 'Xem bản đồ trang' } },
  { id: 'lopf1', keys: ['lớp f1','lop f1','f1','sách ảnh','sach anh','cuốn sách','cuon sach','kéo sách','keo sach','lớp học f1'], reply: 'Lớp F1 là một cuốn sách kỳ diệu: bạn kéo sang trái hoặc phải để lật qua từng hình và video của lớp. Bọ dẫn bạn vào xem nhé!', link: { href: 'lopf1.html', label: 'Vào trang Lớp F1' } },
  { id: 'gallery', keys: ['gallery','thư viện ảnh','thu vien anh','ảnh','anh','hình ảnh','hinh anh','tác phẩm','tac pham','triển lãm','trien lam','máy chiếu','may chieu','xem ảnh','xem anh','album','photo','hình','hinh','bức tranh','buc tranh','tranh','viên đá','vien da','đá quý','da quy','bọ rùa','bo rua','ladybug','phòng tranh','phong tranh'], reply: 'Bọ có một phòng tranh nhỏ. Bạn kéo ngón tay qua ba viên đá trên khay gỗ, máy chiếu sẽ hiện ra một bức ảnh khác nhau. Vào xem với Bọ nhé!', link: { href: 'gallery.html', label: 'Vào trang Gallery' } },
  { id: 'works', keys: ['tác phẩm','tac pham','dự án học viên','du an hoc vien','sản phẩm học viên','video mẫu','video mau','xem thử','demo'], reply: 'Mục "Dự án học viên" nằm ở cộng đồng ME.MORI. Bạn cũng có thể xem video giới thiệu ở đầu trang nhé.', link: { href: 'home-backup.html#workshops', label: 'Về đầu trang' } },
  { id: 'community', keys: ['cộng đồng','cong dong','community','mọi người','moi nguoi','thành viên','thanh vien','kết nối','ket noi','hội nhóm','hoi nhom','bạn bè','ban be','feedback nhóm','group','cộng đồng me.mori'], reply: 'ME.MORI có cộng đồng creator cùng yêu video, điện ảnh và kể chuyện bằng hình ảnh, có cả feedback nhóm. Bạn bước vào trang Cộng đồng để gặp mọi người nhé, Bọ dẫn đường cho!', link: { href: 'community.html', label: 'Vào trang Cộng đồng' } },
  { id: 'storytelling', keys: ['kể chuyện','ke chuyen','storytelling','câu chuyện','cau chuyen','nghệ thuật kể chuyện','story'], reply: 'ME.MORI giúp bạn biết mình muốn kể gì, vì sao câu chuyện đáng xem và nên thể hiện nó thế nào.', link: { href: 'home-backup.html#workshops', label: 'Xem giới thiệu' } },
  { id: 'teachers', keys: ['giáo viên','giao vien','giảng viên','giang vien','thầy','cô','mentor','ai dạy','ai day'], reply: 'Bọ chưa thấy thông tin giảng viên trên trang. Bạn hỏi qua hello@memori.class để biết ai đồng hành cùng lớp nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'equipment', keys: ['thiết bị','thiet bi','máy quay','may quay','điện thoại','dien thoai','máy ảnh','may anh','chuẩn bị','chuan bi'], reply: 'Trang chưa nêu yêu cầu thiết bị. Bạn cứ hỏi hello@memori.class xem cần chuẩn bị gì cho workshop mình chọn nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'certificate', keys: ['chứng chỉ','chung chi','chứng nhận','chung nhan','bằng cấp','bang cap','certificate'], reply: 'Trang chưa nhắc tới chứng chỉ. Bạn hỏi thêm qua hello@memori.class để chắc chắn nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'refund', keys: ['hoàn tiền','hoan tien','hoàn phí','hoan phi','hủy lớp','huy lop','bảo lưu','bao luu','refund'], reply: 'Bọ chưa có chính sách hoàn tiền hay bảo lưu trên trang. Bạn hỏi trực tiếp qua hello@memori.class nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'age_size', keys: ['độ tuổi','do tuoi','bao nhiêu tuổi','tuổi','tuoi','sĩ số','si so','mấy người','may nguoi','lớp bao nhiêu'], reply: 'Bọ chưa có thông tin về độ tuổi hay sĩ số lớp. Bạn nhắn hello@memori.class để được giải đáp nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'ai_tools', keys: ['ai','phần mềm','phan mem','premiere','capcut','công cụ','cong cu','tools','software'], reply: 'Trang chưa nhắc tới AI hay phần mềm cụ thể. Workshop tập trung vào tư duy hình ảnh và kỹ năng quay dựng; bạn hỏi thêm qua hello@memori.class nhé.', link: { href: 'home-backup.html#contact', label: 'Liên hệ' } },
  { id: 'who_bo', keys: ['bọ là ai','bo la ai','bạn là ai','ban la ai','con bọ','con bo','tên gì','ten gi','chatbot'], reply: 'Mình là Bọ, chú bọ nhỏ trên trang ME.MORI Class. Bọ chuyên chỉ đường và trả lời các câu hỏi về lớp học.' },
  { id: 'intro', keys: ['giới thiệu','gioi thieu','giới thiệu me.mori','về mori','ve mori','về me.mori','mori là gì','mori la gi','me.mori là gì','video giới thiệu','trang giới thiệu'], reply: 'Bạn xem video giới thiệu Me.Mori ở trang Giới thiệu nhé. Xem xong Bọ sẽ đưa bạn sang bản đồ.', link: { href: 'gioithieu.html', label: 'Xem giới thiệu' } },
  { id: 'what_is', keys: ['me.mori','memori','mori class','giới thiệu','gioi thieu','là gì','la gi','về lớp','ve lop'], reply: 'ME.MORI Class là không gian học dành cho creator, kết hợp điện ảnh, storytelling và kỹ năng làm nội dung.', link: { href: 'home-backup.html#workshops', label: 'Giới thiệu' } },
  { id: 'fun', keys: ['kể chuyện cười','ke chuyen cuoi','đùa','dua','vui','hài','hai','joke','thích gì','thich gi'], reply: 'Bọ nhỏ xíu nhưng mê điện ảnh lắm, chỗ nào có ánh sáng đẹp là Bọ bay tới liền. Bạn muốn Bọ chỉ workshop nào không?', link: { href: 'home-backup.html#courses', label: 'Xem workshop' } },
  { id: 'thanks', keys: ['cảm ơn','cam on','thanks','thank','cám ơn','biết ơn'], reply: 'Không có chi nha bạn! Cần gì cứ hỏi Bọ tiếp nhé.' },
  { id: 'goodbye', keys: ['tạm biệt','tam biet','bye','hẹn gặp lại','hen gap lai','đi đây','pp'], reply: 'Tạm biệt bạn nhé, hẹn gặp lại ở ME.MORI Class. Bọ vẫy cánh chào!' },
  { id: 'help', keys: ['giúp','giup','hỏi gì','hoi gi','trợ giúp','tro giup','help','hướng dẫn','huong dan','làm được gì','lam duoc gi','có thể làm gì','co the lam gi'], reply: 'Bạn có thể hỏi Bọ về các workshop, nội dung học, cách đăng ký hoặc liên hệ nhé.', link: { href: 'home-backup.html#courses', label: 'Xem workshop' } },
  { id: 'greeting', keys: ['xin chào','chào','xin chao','hello','hi','alo','chao bo','hey'], reply: 'Chào bạn, Bọ đây! Bạn muốn tìm hiểu workshop nào của ME.MORI Class?' }
];
let BO_FALLBACK = 'Bọ chưa hiểu ý bạn lắm. Thử hỏi Bọ nhé: "Có những workshop nào?", "Học được gì?" hoặc "Đăng ký thế nào?" hoặc "Bản đồ trang đâu?"';

/* Chữ cố định của Bọ (sửa được qua assets/content/bo.json). */
var BO_TEXT = {
  pageTitle: 'Mình là Bọ — Me.Mori Class',
  greeting: 'Chào bạn, chào mừng bạn đến với Mori Class. Bạn có muốn tham quan một vòng không?',
  mapCardLabel: 'Tham quan bản đồ',
  openLine: 'Mình nghe đây. Bạn muốn hỏi gì nào?',
  emptyPrompt: 'Bạn hãy nhập câu hỏi vào khung rồi gửi nhé.',
  placeholder: 'Hỏi Me.Mori…',
  fallback: BO_FALLBACK,
  widgetLabel: 'Trò chuyện với Bọ',
  widgetTitle: 'Bọ',
  widgetGreeting: 'Mình là Bọ đây. Bạn muốn hỏi về lớp, lộ trình hay cách đăng ký nào?',
  widgetSend: 'Gửi',
  widgetClose: 'Đóng khung chat'
};

/* Nạp nội dung từ JSON (không làm hỏng trang nếu thiếu). Phát sự kiện 'bo:content' khi xong; window.BO_READY là Promise. */
var BO_READY = (typeof MemoriContent === 'undefined') ? Promise.resolve() : (function () {
  var C = MemoriContent;
  var T0 = JSON.parse(JSON.stringify(BO_TEXT));
  return Promise.all([
    C.load('bo', T0),
    C.load('bo-replies', { replies: BO_REPLIES }, { replace: ['replies'], max: 5000, timeout: 8000 })
  ]).then(function (r) {
    var t = r[0], rep = (r[1] && r[1].replies) || [];
    Object.keys(T0).forEach(function (k) { if (typeof t[k] === 'string' && t[k].trim()) BO_TEXT[k] = t[k]; });
    BO_FALLBACK = BO_TEXT.fallback;
    var seen = {}, out = [];
    rep.forEach(function (e) {
      if (!e || typeof e.id !== 'string' || seen[e.id] || typeof e.reply !== 'string' || !e.reply.trim() || !Array.isArray(e.keys)) return;
      var keys = e.keys.filter(function (k) { return typeof k === 'string' && k.trim() && k.length <= 80; }).slice(0, 120);
      if (!keys.length) return;
      seen[e.id] = 1;
      var o = { id: e.id.slice(0, 60), keys: keys, reply: e.reply };
      if (e.exact === true) o.exact = true;
      if (e.card === true) o.card = true;
      if (e.link && typeof e.link === 'object') {
        var href = C.url(e.link.href, '', { hash: true });
        if (href && typeof e.link.label === 'string' && e.link.label.trim()) o.link = { href: href, label: e.link.label };
      }
      out.push(o);
    });
    if (out.length) BO_REPLIES.splice.apply(BO_REPLIES, [0, BO_REPLIES.length].concat(out));
    try { document.dispatchEvent(new CustomEvent('bo:content')); } catch (e) {}
  }).catch(function () {});
})();
