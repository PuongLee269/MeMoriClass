# Các trang con Bọ có thể mở

Bọ (khung chat trong `me-mori-intro.html`) tra từ khóa trong `assets/bo-replies.js` (`BO_REPLIES`, `BO_FALLBACK`).
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
3. Thêm tên trang vào regex `(?:community|gallery)` ở dòng tạo liên kết trong `me-mori-intro.html` để có nút viên thuốc.
4. Thêm một dòng vào bảng này, rồi thử bằng vài câu hỏi mẫu.
