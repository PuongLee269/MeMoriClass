# Các trang con Bọ có thể mở

Bọ (khung chat trong `index.html` và Bọ nhỏ ở mọi trang con, xem mục "Bọ nhỏ ở góc mọi trang") tra từ khóa trong `assets/bo-replies.js` (`BO_REPLIES`, `BO_FALLBACK`) hoặc `assets/content/bo-replies.json`.
Bộ so khớp nằm ở `assets/bo-matcher.js` (dùng chung index.html, widget, admin): bỏ dấu, khớp cả từ; khóa dài hơn 4 ký tự khớp cả chuỗi con. Điểm = tổng độ dài khóa khớp, điểm bằng nhau thì mục đứng trước thắng; mục `exact:true` chỉ khớp khi cả câu bằng một khóa (điểm 1000).
Liên kết tới `community.html` và `gallery.html` được hiện thành nút viên thuốc (class `go-community`), và `PaperScene.linkTransitions` phát hiệu ứng giấy trước khi chuyển trang.

| Trang | Đường dẫn | Người xem làm được gì | Id mục | Từ khóa |
|---|---|---|---|---|
| `community.html` | `/community.html` | Vào không gian Cộng đồng ME.MORI, gặp các thành viên (quả cầu) và xem cảnh cộng đồng. Ảnh trong `assets/community/`. | `community` | cộng đồng, cong dong, community, mọi người, moi nguoi, thành viên, thanh vien, kết nối, ket noi, hội nhóm, hoi nhom, bạn bè, ban be, feedback nhóm, group, cộng đồng me.mori |
| `gallery.html` | `/gallery.html` | Kéo ngón tay/chuột qua ba viên đá trên khay gỗ để máy chiếu hiện bức ảnh tương ứng; bọ rùa phản ứng khi rê/chạm. Ảnh trong `assets/gallery/` (ảnh mẫu tạm). | `gallery` | gallery, thư viện ảnh, thu vien anh, ảnh, anh, hình ảnh, hinh anh, tác phẩm, tac pham, triển lãm, trien lam, máy chiếu, may chieu, xem ảnh, xem anh, album, photo, hình, hinh, bức tranh, buc tranh, tranh, viên đá, vien da, đá quý, da quy, bọ rùa, bo rua, ladybug, phòng tranh, phong tranh |

Lưu ý: `gallery` đứng trước `works` nên thắng khi hòa điểm ở "tác phẩm" / "tac pham"; "dự án học viên" và "video mẫu" vẫn về `works`.

## Thêm một trang mới
1. Copy `<trang>.html` vào gốc repo và ảnh vào `assets/<trang>/` (font dùng `assets/fonts/`, không gọi Google).
2. Thêm một mục vào `BO_REPLIES` trong `assets/bo-replies.js`: `id`, `keys` (có dấu và không dấu), `reply` (1-3 câu), `link: { href: '<trang>.html', label: '...' }`. Đặt trước các mục có khóa trùng nếu muốn thắng khi hòa.
3. Thêm tên trang vào `PILL_RE` trong `assets/bo-matcher.js` (và `PILL` trong `assets/bo-widget.js`) để có nút viên thuốc.
4. Thêm một dòng vào bảng này, rồi thử bằng vài câu hỏi mẫu.

## Cấu trúc trang chủ và quy tắc liên kết
- Trang chủ = `index.html` (trang Bọ). Trang chủ cũ (lớp, workshop, liên hệ) giữ ở `home-backup.html`; `admin.html` (bản mới, đăng nhập bằng token GitHub) sửa `content.json` của trang này ở tab "Trang chủ cũ" cùng với các trang khác.
- `me-mori-intro.html` chỉ còn là trang chuyển hướng về `index.html` (cho đường dẫn cũ).
- Liên kết tới lớp/workshop/liên hệ dùng `home-backup.html#courses`, `#workshops`, `#contact`...; không dùng `index.html#...`. Trang con quay về Bọ bằng `index.html`.
- Câu đầu của Bọ (gõ chữ khi vào trang): "Chào bạn, chào mừng bạn đến với Mori Class. Bạn có muốn tham quan một vòng không?", kèm thẻ bản đồ `.map-card` (ảnh `assets/sitemap/map-card.webp`, nhãn "Tham quan bản đồ") trỏ tới `sitemap.html`. Ô chat luôn dùng được. Gợi ý sau 14 giây và 3 link dưới cùng (Lớp F2, Tác phẩm, Đăng ký) đã bỏ.
- Mục `tour_yes` (`exact: true`) trả lời "có / ok / đi / vâng / tham quan..." khi CẢ câu trùng khóa (không khớp chuỗi con, điểm 1000, nên không đụng `cô`=`co` của `teachers`); mục `tour_phrase` khớp thường "tham quan", "một vòng". Cả hai có `card: true` nên Bọ hiện thẻ bản đồ.

## Nút bản đồ góc màn hình (mọi trang)
Dùng chung `assets/map-btn.css` + `assets/map-btn.js`. Thêm một dòng trước `</body>` của trang (đường dẫn tương đối gốc repo):
`<script src="assets/map-btn.js" defer></script>`
Script tự nạp CSS, chèn nút (ảnh `assets/sitemap/map-thumb.webp`, `aria-label="Bản đồ trang"`, trỏ `sitemap.html`), mặc định góc trên phải, `position:fixed`. Chọn góc khác bằng `data-corner="br|tl|bl"` trên thẻ script; nếu góc bị chiếm thì ghi đè `top` bằng `body .map-btn{...}` (xem `community.html`: hạ xuống dưới nút "Phát lại"). Trang `sitemap.html` không chèn nút. Trang "Giới thiệu" sắp thêm chỉ cần dòng script trên và kiểm tra không đè nút/link góc phải (điện thoại 390x844 và máy tính).
Đang dùng: index, community (dưới "Phát lại"), gallery, roadmap, dangky (góc trên phải); home-backup (góc dưới phải vì thanh nav chiếm góc trên phải).

| Trang | Đường dẫn | Ghi chú | Id mục |
|---|---|---|---|
| `sitemap.html` | `/sitemap.html` | Bản đồ trang web: 9 viên đá dẫn tới các trang (Đăng ký -> dangky.html, Lộ trình -> roadmap.html, Gallery, Cộng đồng, các mục của home-backup.html, Thử "Tôi có phù hợp không" -> index.html). Ảnh trong `assets/sitemap/`. | `sitemap` |
| `method.html` | `/method.html` | Bàn đá "Phương pháp": kéo ba khối đá cùng ký hiệu vào đĩa để mở một phương pháp dạy học (không có chữ hướng dẫn, tự khám phá). Ảnh trong `assets/method/`, nội dung và luật chơi trong `assets/content/method.json` (sửa ở `admin.html`, xem `docs/METHOD_SCHEMA.md`). | `method` (từ khóa mới: bàn đá, ghép đá, khối đá) |
| `roadmap.html` | `/roadmap.html` | Lộ trình lớp F2: 4 chapter, mỗi chapter có video YouTube nhúng (ID tạm từ playlist KMM FILM, cần thay) và kịch bản. Ảnh trong `assets/roadmap/`. | `roadmap` |
| `dangky.html` | `/dangky.html` | Đăng ký lớp F2 (đóng dấu xác nhận). `submitRegistration()` hiện chỉ là stub demo. Ảnh trong `assets/register/`, font Mali (kèm giấy phép) trong `assets/fonts/`. | `register` |
| `lopf1.html` | `/lopf1.html` | Cuốn sách ba ô trên bục: kéo trái/phải (hoặc phím mũi tên, con lăn, nút mũi tên) để đổi hình; ô giữa có thể là video YouTube (bấm Phát). Ảnh trong `assets/lopf1/` (+ `bookfx/` khung hình lật sách), nội dung ở `assets/content/lopf1.json` (admin tab "Lớp F1"), tài liệu giao việc ở `docs/lopf1/`. Viên đá "Lớp F1" trên bản đồ trỏ tới trang này. | `lopf1` (từ khóa: lớp f1, sách ảnh, cuốn sách) |

Từ khóa mới: `roadmap` (lộ trình, chapter, chương, kịch bản, video, lộ trình học); `register` trỏ tới `dangky.html` (đăng ký, lớp f2...).
`assets/preload-pages.js` được nối vào `index.html` (defer) để tải nền ảnh nặng của roadmap, dangky và lopf1 khi rảnh, bỏ qua khi Tiết kiệm dữ liệu/2g, không tải video.


## Nội dung sửa được bằng admin (JSON)
Chữ, link video/ảnh của các trang nằm trong `assets/content/*.json`, nạp bởi `assets/content-loader.js` (mặc định nhúng sẵn trong trang là phương án dự phòng). Câu trả lời từ khóa của Bọ: `assets/content/bo-replies.json` (+ `bo.json` cho lời chào/nhãn thẻ bản đồ/câu dự phòng); `assets/bo-replies.js` giữ bản mặc định và nạp đè khi có JSON. Sửa bằng `admin.html` (hướng dẫn: `docs/ADMIN.md`). Trên bản đồ, viên đá "Phương pháp" trỏ tới `method.html`.


## Giới thiệu (`gioithieu.html`)
Trang video giới thiệu Me.Mori (nền rừng đêm, bọ rùa, khung video không viền). Ảnh trong `assets/gioithieu/` (desktop/, mobile/, poster.webp, layers.json); font dùng chung `assets/fonts/`. Chữ, video (id YouTube), poster, trang kế tiếp, chữ đếm ngược nằm ở `assets/content/gioithieu.json` (nạp bằng `content-loader.js`, mặc định dự phòng nhúng trong trang ở `CONFIG`; sửa ở admin tab "Giới thiệu"). `CONFIG.previewMode=false`: hết video thì hiện "Đang chuyển về bản đồ (3)..." có nút Hủy rồi sang `sitemap.html` (`nextPage`). Video hiện là video thử từ playlist KMM FILM, cần thay id thật. Viên đá "Giới thiệu" trên bản đồ trỏ tới trang này; mục trả lời `intro` (giới thiệu, về mori, mori là gì...) có nút tới trang. Có nút bản đồ (góc trên phải) và Bọ nhỏ (góc dưới trái).

## Bọ nhỏ ở góc mọi trang (`assets/bo-widget.js` + `assets/bo-widget.css`)
Bọ nhỏ (ảnh `assets/bo/bo-idle-s.webp` 144 px, thở nhẹ, lấp lánh thưa, không hiện câu gợi ý). Bấm/chạm/Enter: Bọ nhảy một cái (dùng `bo-fly.webp`) và mở khung chat gọn (bottom sheet trên điện thoại <= 640px, khung nổi trên máy tính). Esc đóng và trả focus về Bọ. Sự kiện con trỏ/phím trong khung không lọt xuống trang. Thread chat lưu trong `sessionStorage` (`memori.bo.thread`, 30 tin cuối) nên chuyển trang vẫn còn.
Thêm vào trang chưa có Bọ (trước `</body>`): `<script src="assets/bo-widget.js" defer data-mode="floating" data-corner="bl"></script>`; tùy chọn `data-corner-m` (góc riêng trên điện thoại), `data-ox`, `data-oy`, `data-ox-m`, `data-oy-m` (dịch vào trong/lên trên, px) để tránh điều khiển của trang.

| Trang | Góc | Ghi chú |
|---|---|---|
| community | bl; điện thoại nâng lên 125px | thơ ở đáy màn hình điện thoại |
| home-backup | bl | |
| method | tl | góc dưới trái có nút "Trang Bọ", khối đá ở đáy |
Nút bản đồ vẫn ở góc của nó (trên phải; home-backup: dưới phải). `index.html` chỉ dùng `data-mode="hit"` (bấm Bọ thì focus ô chat; không có khung chat riêng).

### Chế độ của widget theo trang (`data-mode`)
Nguyên tắc: trang nào đã có bọ rùa riêng thì KHÔNG thêm Bọ nhỏ thứ hai; bấm vào chính bọ rùa đó mở khung chat. Trang chưa có Bọ thì dùng Bọ nhỏ ở góc (`floating`).

| Trang | Bọ riêng? | Loại | Chế độ widget | Phần tử / vùng bấm | Hướng khung chat (máy tính; điện thoại: tấm ở phía đối diện Bọ) |
|---|---|---|---|---|---|
| gallery | có | canvas (nhiều tư thế) | attach (hàm `boAttachQueue`) | vùng bấm bám theo toạ độ vẽ Bọ; rê lên Bọ vẫn gọi `ladyPtr` (tư thế "front"); bấm: `setPose('front')` + nhảy | `left` |
| roadmap | có | canvas trên gò trái | attach (`boAttachQueue`) | bám `LADY.sx/sy`; rê giữ logic `LADY.ptr`; bấm: pose "front" + nhảy | `top` |
| sitemap | có | sprite DOM `#lady` trên gò rêu | attach (`boAttachQueue`, `'#lady'`) | thu hẹp vào thân Bọ để không đè đá; bấm: pose "front" + nhảy (logic rê đá đổi tư thế giữ nguyên) | `edge-right` |
| dangky | có | ẢNH nướng sẵn `#art .bug` (cầm bút) | attach (`data-target="#art .bug"`) | nút trong suốt phủ lên ảnh, tránh vùng đóng dấu; con trỏ = pointer, con dấu ẩn khi rê lên Bọ; ẩn khi form mở | `edge-left` |
| gioithieu | có | lớp ảnh `#fxs [data-k=lady]` (bọ rùa trên lá) | attach (`data-target`) | nút trong suốt phủ lên lớp, nhảy bằng thuộc tính `translate` | `edge-left` |
| index | có | lớp giấy `.beetle-head` | `hit` (không khung chat riêng) | bấm Bọ: focus ô `#question` | không có |
| community, method, home-backup | không | | floating (Bọ nhỏ ở góc như bảng trên) | | method: `data-panel="right"` |

Gắn vào Bọ có sẵn: `data-mode="attach" data-target="<selector>" data-inset="l,t,r,b" data-side="top|left|right|edge-left|edge-right"` trên thẻ script, hoặc (Bọ vẽ bằng canvas) `(window.boAttachQueue=window.boAttachQueue||[]).push([hàmTrảVềHCN|selector,{side,react,onPointer}])`. `react` là phản ứng của Bọ trang (dùng tư thế/hop của chính trang; mặc định nhảy nhẹ bằng `translate`). API JS: `BoWidget.open() / close() / toggle() / attachTo(target, tuỳ chọn)`. Vùng bấm là `<button class="bow-hit">` trong suốt, >= 44 px, `aria-label="Trò chuyện với Bọ"`, Tab/Enter/Space; thêm `?bodebug=1` vào URL để thấy khung viền.

Hiệu năng (thư viện lớn): lúc tải trang chỉ có widget (~26 KB JS+CSS thô, ~9 KB gzip, ảnh Bọ 10 KB). `bo-matcher.js`, `content-loader.js`, `bo.json`, `bo-replies.json` chỉ được tải khi mở chat lần đầu (có `?v=` chống cache); lỗi mạng thì dùng thư viện nhỏ dự phòng trong widget. Sau khi tải, `BoMatcher.build()` dựng chỉ mục ngược một lần; mỗi câu hỏi tốn O(độ dài câu), không phụ thuộc số mục. Đo trên Chromium (máy dev): 1000 mục = 405 KB thô / 98 KB gzip, dựng chỉ mục ~25 ms, mỗi câu ~0,01 ms; 5000 mục = 2,0 MB / 491 KB gzip, dựng ~100 ms, mỗi câu ~0,02 ms (p99 ~0,13 ms); bộ nhớ thêm ~1,8 MB và ~8 MB. Giới hạn nạp: `content-loader` nhận tối đa 5000 mục (`opts.max`), `admin.html` cho phép tối đa 5000 mục; mỗi mục tối đa 120 từ khóa, khóa <= 80 ký tự.
`bo-matcher.js` còn có `findLinear` (bản cũ để đối chiếu), `clean`, `duplicates`, và `find(q, true)` (kèm khóa khớp/xếp hạng) để sau này gắn AI dự phòng khi `find` trả null.

Chữ của widget sửa ở `assets/content/bo.json` (admin tab "Bọ: lời chào & chữ", mục "Bọ nhỏ ở góc các trang con"): `widgetLabel`, `widgetTitle`, `widgetGreeting`, `widgetSend`, `widgetClose`; dùng chung `placeholder`, `emptyPrompt`, `mapCardLabel`, `fallback` với trang Bọ.

## Dáng tĩnh của Bọ (không dùng mặt ngang)
Nghỉ = chính diện, nhìn về một phía = quay 3/4, thỉnh thoảng có biểu cảm (chớp mắt, cười, ngạc nhiên, ngước lên). Bộ ảnh `assets/bo/pose-*.webp` + `assets/bo/poses.json`, mô-đun `assets/bo-idle.js`. Chi tiết, danh sách sprite dùng/loại và hành vi từng trang: `docs/BO_POSES.md`.
