# Bàn giao: tiếp quản làm tiếp website Me.Mori Class

Cập nhật: 14/11/2026. Trạng thái `main` lúc viết: `f6781de`.
Repo: https://github.com/PuongLee269/MeMoriClass (GitHub Pages, tên miền https://moriclass.com, file `CNAME`).

## Prompt (dán cho AI tiếp quản)

```
Bạn tiếp quản dự án website "Me.Mori Class" (repo PuongLee269/MeMoriClass, GitHub Pages, https://moriclass.com). Chủ dự án nói tiếng Việt, xem chủ yếu trên điện thoại. Trả lời tiếng Việt.

ĐỌC TRƯỚC, theo thứ tự: CLAUDE.md, docs/WORKER_RULES.md, docs/HANDOFF_TIEP_QUAN.md (file này), docs/ADMIN.md, docs/BO_PAGES.md, worker/bo-router/README.md, "Tài Liệu Mori Class F2/TOM_TAT_NOI_DUNG.md".

QUY TẮC CỨNG (chủ dự án đã nhắc nhiều lần):
1. Báo cáo cho chủ dự án NGẮN: 5–8 dòng, một ý một dòng, chỉ gồm đã làm gì, link, cần chủ quyết gì. Chi tiết dài ghi vào file rồi gửi file.
2. Chỉ commit/push lên GitHub khi chủ dự án nói rõ "đưa lên" (hoặc "lên main", "up lên đi"). Mặc định làm trên nhánh riêng/local. Không push main nếu chưa được phép. Không force-push.
3. Trang KHÔNG có chữ hướng dẫn người dùng ("Kéo sang trái...", "Chạm để mở", "Nhấn để...", gợi ý tương tác). Chỉ chữ nội dung (tiêu đề, tên, mô tả, chú thích, trạng thái như "Sắp có"). Nhãn aria ẩn thì giữ.
4. Không bịa thông tin thật (học phí, lịch, địa điểm, giảng viên, cọc, hoàn tiền, số chỗ, thành tích). Chưa chốt thì để nguyên hoặc ghi "đang cập nhật". Chính sách giữ chỗ/cọc/hoàn/học thử CHƯA CHỐT.
5. KHÔNG đưa bí mật vào repo/log/ảnh/báo cáo: khóa API, token Cloudflare, file env. Khóa chỉ ở Worker secret hoặc biến môi trường. Repo công khai: không đưa file nội bộ, link Drive nội bộ, thông tin riêng tư học viên.
6. Giao việc nặng cho worker rẻ hơn nếu có thể; báo token thật do hệ thống ghi, không đoán.
7. Mọi thay đổi giao diện phải kiểm bằng Playwright/Chromium trên CẢ điện thoại (390x844, DPR 2, touch) và desktop (1672x941): nhìn ảnh chụp, không lỗi console, không cuộn ngang, chạm >= 44px.
```

## 1. Dự án là gì
Website tĩnh kể chuyện "Me.Mori Class": khu rừng đêm với bọ rùa "Bọ" dẫn đường. Lớp F2: "Khám phá bản thân và thế giới qua nghệ thuật kể chuyện", 4 buổi x 3 giờ, tối đa 6 người, học trực tiếp (nguồn: thư mục `Tài Liệu Mori Class F2/`). Phong cách: tranh minh họa cổ tích, ánh vàng ấm, khung đá/gỗ.

## 2. Cấu trúc
- Trang: `index.html` (Bọ + chat), `gioithieu.html`, `method.html` (Phương pháp), `roadmap.html` (Lộ trình 4 buổi), `lopf1.html` (Lớp F1, sách lật, desktop + điện thoại), `khampha.html` (Khám phá tác phẩm) + `tacpham.html?id=` (trang Blog tác phẩm), `gallery.html` (hiển thị tên "Workshop", giữ đường dẫn cũ), `community.html`, `dangky.html`, `sitemap.html`, `admin.html`. Thư mục `preview/`, `backup/`, `prototype/`, `motion/`, `animation-lab/`, `dist/` là cũ/thử nghiệm.
- Nội dung sửa được: `assets/content/*.json`, bản mặc định `assets/content/defaults/*.json`, bản nhúng sẵn trong html/js. `assets/content-loader.js` tải JSON rồi gộp sâu lên bản nhúng, chỉ dùng textContent. Mỗi lần sửa nội dung phải đồng bộ 3 nơi (JSON, defaults, bản nhúng).
- `admin.html`: sửa nội dung qua GitHub Contents API bằng token cá nhân (lưu localStorage), có `?demo=1` để thử. Mỗi trang một tab.
- Điều hướng: `assets/next-pages.js` + `assets/content/journey.json` (nút gợi ý trang kế theo lộ trình: Bọ, Giới thiệu, Phương pháp, Lộ trình, Lớp F1, Khám phá, Workshop, Cộng đồng, Đăng ký).
- YouTube: `assets/yt-fast.js` (facade, nạp iframe khi bấm, preconnect).
- Ảnh: WebP, bản điện thoại hậu tố `_m` hoặc thư mục `m/`. Script `tools/make-mobile-images.py` tạo bản nhỏ cho điện thoại (chạy trên máy, có báo cáo SSIM). Ảnh Workshop ở `assets/workshop/`.

## 3. Bọ (chatbot)
- Giao diện: `assets/bo-widget.js/.css` (khung chat ở trang con), chat riêng trong `index.html`, `assets/bo-idle.js` + `assets/bo/pose-*.webp` (tư thế; trang chủ dùng profile `gentle`, KHÔNG cười), `assets/bo-replies.js` (bản nhúng).
- Dữ liệu: `assets/content/bo-faq.json` (52 FAQ, mỗi mục nhiều câu hỏi mẫu + câu trả lời), `bo-replies.json` (67 nhóm từ khóa, dẫn đường, xã giao), `bo.json` (chữ cố định + khối `ai`). Phiên bản script đặt ở `bo-widget.js?v=...` trên các trang, đổi số khi sửa JS để làm mới bộ nhớ đệm.
- Luồng trả lời (AI-trước): câu hỏi (< 50 chữ) -> Worker -> AI chọn FAQ sát nghĩa nhất (trả {id}); không có thì AI tự trả lời <= 60 chữ dựa trên bản tóm tắt kiến thức an toàn trong `worker/bo-router/knowledge.js`; AI lỗi/timeout/hết lượt -> `assets/bo-matcher.js` từ khóa -> câu dự phòng. Câu trả lời hiện cả câu cùng lúc (không gõ từng chữ).
- Worker: `worker/bo-router/` (Cloudflare Worker + Durable Object `RATE_LIMIT`). Bản chính thức đang chạy tại URL trong `assets/content/bo.json` (`ai.endpoint`), model `gpt-6-luna`, effort `low`, chỉ nhận Origin moriclass.com và www.moriclass.com, 50 lượt AI/ngày/IP, 2000/ngày toàn bộ. Khóa OpenAI là Worker secret `OPENAI_API_KEY` (không nằm trong repo). Test: `node --test worker/bo-router/test.mjs worker/bo-router/client-test.mjs` (47 test, mock). `node worker/bo-router/build-groups.mjs` sinh lại `groups.js` khi đổi nhóm/FAQ. Muốn TẮT AI khẩn cấp: đặt `ai.enabled=false` trong `assets/content/bo.json`, `defaults/bo.json` và `assets/bo-replies.js` (biến `BO_AI` + dòng gộp mặc định).
- Chi phí ước tính khoảng 0,58 USD/1.000 lượt (báo cáo Codex, chưa tự kiểm giá).

## 4. Kiểm thử và môi trường
- Playwright/Chromium có sẵn. Máy chủ tĩnh: `python3 -m http.server`. Trong môi trường Claude cloud, Node không đi qua proxy: dùng `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.
- Preview Artifact (claude.ai) bị chặn CORS (mask-image, font, JSON): font/JSON phải nhúng sẵn nếu xem bằng Artifact.
- Kiểm tay trên điện thoại thật là bước chủ dự án tự làm sau khi lên `main`.
- Quy trình đã dùng: làm trong git worktree + nhánh local `claude/<việc>`, kiểm, rồi chỉ khi được phép mới fast-forward lên `main` (`git push origin HEAD:main`) sau `git fetch` và kiểm `merge-base --is-ancestor`.

## 5. Việc còn dang dở / chờ chủ dự án
1. **Khám phá tác phẩm**: 5 link tác phẩm thật chưa có. Hiện có 1 "Tác phẩm mẫu" (id `mau`) gắn nhà Lớp học, 4 nhà còn lại "Sắp có". Thay bằng thật chỉ cần sửa `assets/content/khampha.json` hoặc Admin, tab Khám phá, mục "Tác phẩm".
2. **Workshop**: 7 ảnh thật (có học viên): chủ dự án chưa xác nhận quyền công khai và ảnh nào thuộc workshop nào (worker mới gán chắc 2 ảnh). Chưa có ngày tổ chức.
3. **Bọ còn nhắc "Gallery/thư viện ảnh"**: `bo-replies.json` (mục id `gallery`), `bo-replies.js`, `bo-widget.js`: cần đổi thành "Workshop" khi chủ đồng ý.
4. **Bọ còn cười ở trang khác**: Khám phá, Lộ trình, Workshop, Bản đồ vẫn gọi `react('laugh')` khi bấm vào Bọ. Chủ dự án mới yêu cầu trang chủ không cười; hỏi chủ có muốn áp dụng cho các trang còn lại.
5. **Trang Đăng ký**: sẽ nối với một app đăng ký riêng; hiện còn "12/20 chỗ" và nhãn "Đã hết chỗ" không khớp F2 (tối đa 6 người). Chưa đổi, chờ dữ liệu/app.
6. **Video**: video giới thiệu/lộ trình vẫn là video thử, không khớp nội dung F2; chờ video thật, để nguyên.
7. **FAQ về giá, cọc, giữ chỗ, hoàn tiền, học thử**: chủ lớp chưa duyệt (đánh dấu cần xác nhận trong `bo-faq.json`). Số liệu đã xác nhận: 2.400.000đ/khóa 4 buổi, ưu đãi 1.500.000đ cho đăng ký sớm (điều kiện, số suất, hạn CHƯA chốt).
8. **Dữ liệu thật cho Bọ**: lịch khai giảng, địa chỉ, giảng viên, thiết bị, độ tuổi tối thiểu, link đăng ký, hotline, quyền riêng tư nhóm.
9. **Chính sách quyền riêng tư**: cần ghi câu hỏi người dùng gửi sang OpenAI. Chủ dự án cần đặt hạn mức chi tiêu bên OpenAI, và đổi (rotate) khóa/token đã dùng khi test.
10. **Tối ưu tiếp**: chưa làm AVIF/srcset đầy đủ, nạp lười hiệu ứng sách (bookfx), nhãn chạm < 44px ở vài trang; mới nén lại 8/182 ảnh vì ảnh gốc đã nén sát. Chưa kiểm Safari iOS/điện thoại thật cho YouTube nhanh, Admin lưu thật bằng token, tab Admin "Lộ trình gợi ý"/"Workshop"/"Tác phẩm".
11. **Nhạc nền, nhập liệu Cộng đồng** (hiện 6 thành viên mẫu), ảnh Gallery cũ: chờ chủ dự án.
12. **Dọn kho**: thư mục `backup/`, `preview/`, `prototype/`, `motion/`, `animation-lab/`, `dist/` nặng và công khai; cân nhắc dọn khi chủ đồng ý. `.openai/`, `todo-list/` kiểm tra có nên giữ.

## 6. Cách làm một thay đổi (khuyến nghị)
1. `git fetch origin main`, tạo worktree: `git worktree add -b claude/<việc> <thư-mục-tạm> origin/main`.
2. Sửa; nếu là nội dung thì sửa đủ JSON, defaults, bản nhúng; nếu sửa JS dùng chung thì đổi `?v=` của script.
3. Chạy test Worker nếu đụng Bọ; chụp Playwright desktop + điện thoại; nhìn ảnh.
4. Báo chủ dự án ngắn, chờ "đưa lên", rồi fast-forward vào `main`.
5. Sau khi lên, nhắc chủ mở moriclass.com trên điện thoại kiểm (GitHub Pages cập nhật sau 1–2 phút, có thể cần tải lại cứng).

## 7. Liên hệ giữa các AI
- Claude làm điều phối và giao worker; Codex (OpenAI) đã làm phần Worker OpenAI và deploy Cloudflare (có token riêng của chủ, đã thu hồi/đổi). Mọi bàn giao ghi trong `docs/*FOR_CODEX.md` và báo cáo kiểm thử `docs/BO_FAQ_*`.
