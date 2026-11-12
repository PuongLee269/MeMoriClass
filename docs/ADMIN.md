# Trang quản trị (admin.html)

Trang `admin.html` cho chủ web sửa chữ, link video và ảnh của các trang mà không cần viết code. Bấm **Lưu** là trang ghi các file JSON thẳng lên GitHub (GitHub Contents API) bằng một token bạn dán một lần; GitHub Pages cập nhật web sau khoảng 1 phút.

## 1. Tạo token (một lần)
1. Đăng nhập GitHub bằng tài khoản chủ kho, mở https://github.com/settings/personal-access-tokens/new (Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token).
2. Token name: `memori-admin`. Expiration: 30 hoặc 90 ngày (không chọn "No expiration").
3. Repository access: **Only select repositories** rồi chọn duy nhất `MemoriClass`.
4. Repository permissions → **Contents: Read and write** (Metadata: Read-only tự có). Không cấp quyền nào khác.
5. Generate token, chép chuỗi `github_pat_...`, mở `admin.html`, dán vào ô token (mặc định kho `PuongLee269/MeMoriClass`, nhánh `main`), bấm Đăng nhập.

## 2. Dùng
- Mỗi tab là một trang; mở tab thì tải file JSON hiện có từ GitHub. Chỉnh trong form, mục nào sai sẽ hiện lỗi tiếng Việt đỏ ngay dưới ô.
- Góc trên có chấm "● Chưa lưu: n file". **Lưu** lưu mọi tab đã sửa lần lượt, mỗi file một commit `admin: cập nhật <tab>` lên nhánh đã chọn. Xong hiện "Đã lưu, web cập nhật sau ~1 phút" kèm link mở trang.
- **Xem thử (chưa lưu)** mở trang với `?mcpreview=1`, trang đọc bản đang sửa từ trình duyệt của bạn (không ghi gì lên GitHub). Không có cho `home-backup` và `Giới thiệu`.
- **Khôi phục mặc định mục này** nạp lại mục đó từ `assets/content/defaults/<tên>.json` (bản gốc, admin không bao giờ ghi vào thư mục này). Phải bấm Lưu để áp dụng.
- Danh sách thêm/xóa/đổi thứ tự được: trả lời từ khóa của Bọ, ảnh Gallery, dòng phụ đề kịch bản. Các danh sách còn lại có số lượng cố định vì gắn với hình trong ảnh (9 viên đá bản đồ, 4 chương, 6 quả cầu, 3 phương pháp...).
- Ô video: dán link YouTube hoặc Vimeo, admin tự lấy nhà cung cấp và ID. Ô ảnh: dán link `https://...` hoặc bấm **Tải ảnh lên**: ảnh được thu nhỏ còn tối đa 1600 px, đổi sang WebP và đưa ngay lên `assets/uploads/<tên>-<mã>.webp` (commit riêng, tức thì, dù bạn chưa bấm Lưu); sau đó nhớ bấm Lưu để trang dùng ảnh.
- Xung đột: nếu file trên GitHub đã bị sửa từ nơi khác, admin hỏi: OK = ghi đè bản của bạn, Hủy = tải lại bản mới (bỏ bản của bạn cho file đó).

## 3. Mỗi tab sửa gì
| Tab | File | Sửa được |
|---|---|---|
| Cả web | `site.json` | chữ + link nút "Về trang Bọ" (mọi trang con), bật/tắt âm mặc định (hiện áp dụng cho Phương pháp), link nhạc nền (để dành, chưa có module phát) |
| Bọ: lời chào | `bo.json` | câu chào đầu, nhãn thẻ bản đồ, câu khi mở chat/ô trống, chữ mờ ô chat, câu "Bọ không hiểu", tiêu đề trang, chữ của Bọ nhỏ ở các trang con (tên nút, tiêu đề, câu chào trong khung, nút Gửi/Đóng) |
| Bọ: từ khóa | `bo-replies.json` | toàn bộ danh sách trả lời (mã, từ khóa, câu trả lời, nút liên kết, cờ exact/card), thêm/xóa/đổi thứ tự; tối đa 5000 mục. Ô "Thử câu hỏi" ở đầu tab: gõ một câu để xem mục nào khớp, điểm, từ khóa khớp, câu trả lời (dùng dữ liệu đang sửa, chưa cần lưu); nút "Kiểm tra từ khóa trùng" cảnh báo hai mục có bộ từ khóa giống hệt |
| Bản đồ | `sitemap.json` | tên, gợi ý, link, chữ trên 9 viên đá (Phương pháp mặc định trỏ `method.html`) |
| Lộ trình | `roadmap.json` | 4 chương: nhãn, tên, ảnh bìa, video YouTube/Vimeo + tỉ lệ khung, cảnh, lời kể VO, phụ đề theo giây |
| Đăng ký lớp F2 | `dangky.json` | số đã đăng ký và tổng số chỗ, nhãn, chữ gợi ý vùng đóng dấu, chữ và lỗi của form, lời cảm ơn, mô tả cho trình đọc màn hình |
| Phương pháp | `method.json` | chữ trang, 3 phương pháp (ký hiệu, tên, mô tả, ảnh, video YouTube), luật chơi, thứ tự đống đá, gợi ý tự động (mặc định tắt), âm thanh theo sự kiện. Chi tiết: `docs/METHOD_SCHEMA.md` |
| Giới thiệu | `gioithieu.json` | tiêu đề, mô tả, video, ảnh bìa, trang chuyển tiếp. Trang chưa có trong web, dữ liệu để sẵn |
| Lớp F1 | `lopf1.json` | chữ trang, danh sách hình/video (ảnh tải lên hoặc link, video YouTube dán link/ID, chú thích, alt), bật/tắt mũi tên trái/phải, thiết lập kéo (ngưỡng, hút, vuốt nhanh, quán tính, lặp, con lăn). Chỉ YouTube, chưa hỗ trợ Vimeo. Chi tiết: `docs/lopf1/SCHEMA.md` |
| Khám phá tác phẩm | `khampha.json` | 5 nơi (Lò gốm, Studio ảnh, Homestay, Sân khấu, Lớp học): tên, mô tả, đường dẫn, cách mở; thiết lập chung (cách mở mặc định, hiện tên nơi). Vị trí và ảnh sáng cố định. Chi tiết: `docs/khampha/SCHEMA.md` |
| Cộng đồng | `community.json` | bài thơ, 6 thành viên (tên, nơi ở, giới thiệu, ảnh, link), chữ nút |
| Gallery | `gallery.json` | danh sách ảnh (thêm/xóa), ảnh nào hiện ra cho từng bộ 3 viên đá, dòng gợi ý |
| Trang chủ cũ | `content.json` | nội dung `home-backup.html` (trước đây sửa ở admin cũ) |

## 4. KHÔNG sửa được ở admin (vì nằm trong ảnh hoặc là hành vi cố định)
- **Đăng ký lớp F2**: tiêu đề lớn "Đăng ký lớp F2", giá 1.500.000đ / 2.400.000đ, dòng "Số lượng có hạn", con dấu, tờ giấy và chữ gạch chéo đều là ẢNH (lớp do người thiết kế đưa). Ô "mô tả cho trình đọc màn hình" chỉ ảnh hưởng người dùng đọc màn hình; nhớ giữ khớp với ảnh. Muốn đổi giá phải thay ảnh lớp.
- Hình, vị trí, màu, hiệu ứng, bọ rùa, tọa độ của mọi trang; hình khắc trên khối đá (admin chỉ đổi khối thuộc ký hiệu nào).
- Chữ nằm trong ảnh nền ở các trang khác (nếu có) và các nhãn nút cố định trong giao diện video (Chuẩn, Tốc độ phát...).
- Việc gửi form đăng ký thật (hiện chỉ là bản demo `MemoriRegister`, chưa có máy chủ).
- Không có chữ "tiêu đề web chung": mỗi trang có tiêu đề (tab trình duyệt) riêng ở tab của nó.

## 5. Khôi phục khi lỡ sửa sai
Mọi lần lưu là một commit Git: vào GitHub → file → History → chọn bản cũ → Revert, hoặc `git revert <commit>`. Admin cũ (mật khẩu + sửa `content.json`) đã được thay thế; bản cũ vẫn nằm trong lịch sử Git.

## 6. Bảo mật
- `admin.html` công khai nhưng không chứa bí mật; không có token hợp lệ thì không ghi được gì. Có `noindex` và Content-Security-Policy giới hạn `connect-src` chỉ `self` và `api.github.com`.
- Token chỉ lưu ở `localStorage` của trình duyệt bạn đang dùng, gắn vào header của yêu cầu tới `api.github.com`, không đưa vào URL hay log. **Đăng xuất** xóa token (và bản xem thử). Chỉ dùng trên máy/trình duyệt của bạn; không dùng máy công cộng.
- Dùng token fine-grained chỉ một kho, quyền Contents, hạn ngắn. Nghi lộ: Revoke ngay trong GitHub.
- Trang web chỉ gán chữ bằng `textContent` (không HTML) và kiểm tra link (chỉ `https://` hoặc đường dẫn trong web; không `javascript:`), nên nội dung sửa không chèn mã được. Lỗi/thiếu/JSON hỏng thì trang tự dùng bản mặc định nhúng sẵn.
- Ai có token hợp lệ có thể sửa web: coi như mật khẩu. Nút dùng chung `Về trang Bọ`/`ảnh` đều đi qua cùng bộ kiểm tra.

## 7. Dành cho người phát triển
`assets/content-loader.js` (`MemoriContent.load(name, defaults, {replace})` trộn sâu JSON lên mặc định nhúng, chỉ nhận đúng kiểu). Thêm trang mới: đưa mặc định vào trang, gọi `load`, rồi thêm một mục `DOCS` trong `admin.html` (schema form) và file `assets/content/defaults/<tên>.json`.

## AI chọn nhóm trả lời (tab "Bọ: lời chào & chữ", mục cuối)
Mặc định TẮT. Khi bật và có địa chỉ Worker (xem `worker/bo-router/README.md`), câu hỏi không khớp từ khóa sẽ được AI chọn một nhóm trả lời có sẵn; AI không viết chữ. Giới hạn: mỗi trình duyệt tối đa 50 lần/ngày, câu hỏi dưới 50 từ; từ khóa vẫn trả lời không giới hạn, hết hạn mức thì Bọ trả lời bằng từ khóa hoặc câu "Bọ không hiểu" như thường. Các ô số trong mục này nằm trong `ai` của `bo.json` (`maxPerDay`, `maxQuestionWords`, `maxAnswerWords`, `timeoutMs`).

## Tab "Bọ: từ khóa": câu dài và chế độ demo
- Mỗi câu trả lời có bộ đếm chữ (tách theo khoảng trắng, không tính chữ/đường dẫn của nút liên kết). Từ 30 chữ trở lên: số chữ được tô vàng kèm "Dài từ 30 chữ trở lên", mục có vạch vàng và nhãn số chữ ngay trên dòng tóm tắt. Chỉ để dễ tìm, KHÔNG chặn lưu.
- Ô "Chỉ hiện câu dài (>=30 chữ)" ở đầu tab lọc ra các câu dài, kèm tổng số (hiện có 4: method, khampha, gallery, community).
- `admin.html?demo=1` mở bản thử không cần token và không gọi GitHub: đọc các JSON của kho, nút Lưu chỉ báo "Đã lưu (demo, không ghi GitHub)" và giữ trong bộ nhớ trang.

## Bọ nhỏ ở các trang con
Trang đã có sẵn bọ rùa riêng (gallery, lộ trình, bản đồ, đăng ký, giới thiệu) KHÔNG có thêm Bọ nhỏ: bấm/chạm/Enter vào chính con bọ rùa của trang là mở khung chat. Trang chưa có Bọ (cộng đồng, phương pháp, trang chủ cũ) có Bọ nhỏ ở một góc; bấm vào là chat bằng chính thư viện `bo-replies.json`. Thư viện chỉ tải khi người xem mở chat nên thêm hàng trăm mục không làm trang chậm (xem `docs/BO_PAGES.md`). Cả hai kiểu dùng chung bộ chữ và thư viện. Chế độ từng trang (`data-mode`) nằm trong thẻ `<script src="assets/bo-widget.js">` của trang, xem bảng ở `docs/BO_PAGES.md`. Chữ riêng của Bọ nhỏ sửa ở tab "Bọ: lời chào & chữ", mục "Bọ nhỏ ở góc các trang con".
