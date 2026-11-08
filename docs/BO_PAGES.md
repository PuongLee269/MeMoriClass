# Các trang con Bọ có thể mở

Bọ (khung chat trong `index.html`) tra từ khóa trong `assets/bo-replies.js` (`BO_REPLIES`, `BO_FALLBACK`).
Bộ so khớp bỏ dấu, khớp cả từ; khóa dài hơn 4 ký tự khớp cả chuỗi con. Điểm = tổng độ dài khóa khớp, điểm bằng nhau thì mục đứng trước thắng.
Liên kết tới `community.html` và `gallery.html` được hiện thành nút viên thuốc (class `go-community`), và `PaperScene.linkTransitions` phát hiệu ứng giấy trước khi chuyển trang.

| Trang | Đường dẫn | Người xem làm được gì | Id mục | Từ khóa |
|---|---|---|---|---|
| `community.html` | `/community.html` | Vào không gian Cộng đồng ME.MORI, gặp các thành viên (quả cầu) và xem cảnh cộng đồng. Ảnh trong `assets/community/`. | `community` | cộng đồng, cong dong, community, mọi người, moi nguoi, thành viên, thanh vien, kết nối, ket noi, hội nhóm, hoi nhom, bạn bè, ban be, feedback nhóm, group, cộng đồng me.mori |
| `gallery.html` | `/gallery.html` | Kéo ngón tay/chuột qua ba viên đá trên khay gỗ để máy chiếu hiện bức ảnh tương ứng; bọ rùa phản ứng khi rê/chạm. Ảnh trong `assets/gallery/` (ảnh mẫu tạm). | `gallery` | gallery, thư viện ảnh, thu vien anh, ảnh, anh, hình ảnh, hinh anh, tác phẩm, tac pham, triển lãm, trien lam, máy chiếu, may chieu, xem ảnh, xem anh, album, photo, hình, hinh, bức tranh, buc tranh, tranh, viên đá, vien da, đá quý, da quy, bọ rùa, bo rua, ladybug, phòng tranh, phong tranh |

Lưu ý: `gallery` đứng trước `works` nên thắng khi hòa điểm ở "tác phẩm" / "tac pham"; "dự án học viên" và "video mẫu" vẫn về `works`.

## Thêm một trang mới
1. Copy `<trang>.html` vào gốc repo và ảnh vào `assets/<trang>/` (font dùng `assets/fonts/`, không gọi Google).
2. Thêm một mục vào `BO_REPLIES` trong `assets/bo-replies.js`: `id`, `keys` (có dấu và không dấu), `reply` (1-3 câu), `link: { href: '<trang>.html', label: '...' }`. Đặt trước các mục có khóa trùng nếu muốn thắng khi hòa.
3. Thêm tên trang vào regex `(?:community|gallery|sitemap)` ở dòng tạo liên kết trong `index.html` để có nút viên thuốc.
4. Thêm một dòng vào bảng này, rồi thử bằng vài câu hỏi mẫu.

## Cấu trúc trang chủ và quy tắc liên kết
- Trang chủ = `index.html` (trang Bọ). Trang chủ cũ (lớp, workshop, liên hệ) giữ ở `home-backup.html`; `admin.html` vẫn sửa `content.json` cho trang này và nút "Mở trang chính" trỏ tới `home-backup.html`.
- `me-mori-intro.html` chỉ còn là trang chuyển hướng về `index.html` (cho đường dẫn cũ).
- Liên kết tới lớp/workshop/liên hệ dùng `home-backup.html#courses`, `#workshops`, `#contact`...; không dùng `index.html#...`. Trang con quay về Bọ bằng `index.html`.
- Nút bản đồ góc trên phải và gợi ý sau ~14 giây không thao tác đều trỏ tới `sitemap.html`.

| Trang | Đường dẫn | Ghi chú | Id mục |
|---|---|---|---|
| `sitemap.html` | `/sitemap.html` | Bản đồ trang web: 9 viên đá dẫn tới các trang (Đăng ký -> dangky.html, Lộ trình -> roadmap.html, Gallery, Cộng đồng, các mục của home-backup.html, Thử "Tôi có phù hợp không" -> index.html). Ảnh trong `assets/sitemap/`. | `sitemap` |
| `roadmap.html` | `/roadmap.html` | Lộ trình lớp F2: 4 chapter, mỗi chapter có video YouTube nhúng (ID tạm từ playlist KMM FILM, cần thay) và kịch bản. Ảnh trong `assets/roadmap/`. | `roadmap` |
| `dangky.html` | `/dangky.html` | Đăng ký lớp F2 (đóng dấu xác nhận). `submitRegistration()` hiện chỉ là stub demo. Ảnh trong `assets/register/`, font Mali (kèm giấy phép) trong `assets/fonts/`. | `register` |

Từ khóa mới: `roadmap` (lộ trình, chapter, chương, kịch bản, video, lộ trình học); `register` trỏ tới `dangky.html` (đăng ký, lớp f2...).
`assets/preload-pages.js` được nối vào `index.html` (defer) để tải nền ảnh nặng của 3 trang này khi rảnh, bỏ qua khi Tiết kiệm dữ liệu/2g, không tải video.
