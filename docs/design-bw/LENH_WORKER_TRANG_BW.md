# Lệnh chung cho worker: chuyển một trang sang trang mẫu đen trắng

Bạn là worker. Làm trong `D:\MeMoriClass\_bw_images` (git worktree). KHÔNG commit/push. KHÔNG sửa trang thật, `assets/` dùng chung, hay thư mục trang mẫu khác. Chỉ tạo/sửa:
- `prototype/bw-<id>/` (toàn bộ)
- `docs/design-bw/DAC_TA_PROTOTYPE_BW_<ID>.md`, `docs/design-bw/PROMPT_BW_<ID>_ART.md`

Các worker khác đang làm song song các trang khác: không đụng thư mục của họ.

## Phong cách đã chốt (đọc trước khi làm)
- Đặc tả mẫu: `docs/design-bw/DAC_TA_PROTOTYPE_BW_ROADMAP.md` (nhất là mục 6) và `DAC_TA_PROTOTYPE_BW_LOPF1.md` (mục 10). Code mẫu: `prototype/bw-roadmap/`, `prototype/bw-lopf1/`, `prototype/bw-bo/` (token, phông, bộ lọc viền vẽ tay `feTurbulence`, remap fetch cho content-loader, Bọ sprite đen trắng `../bw-bo/img/bo/*.webp`).
- Manga Nhật đen trắng, giấy trắng trung tính `--paper #fbfbfa` (không ngả vàng), mực `--ink #111111`, xám `--tone #d8d8d8`, nét vẽ tay phóng khoáng, tram chấm.
- Góp ý chủ dự án phải theo: nền phía sau giảm chi tiết, nhạt, để phần chính nổi bật; nút/nhãn điều hướng là thẻ giấy viền mực dễ đọc, Be Vietnam Pro ≥16px máy tính, ≥14px điện thoại; đường thẳng gọn thay vì trang trí cong rối; mở trang vào mục đầu tiên.
- Ảnh tác phẩm/ảnh nội dung chính (tranh học viên, ảnh thật): mục đang được xem/được chọn giữ màu thật, phần còn lại grayscale + tram nhẹ. Video đang phát giữ màu.
- Không chữ hướng dẫn kiểu "Chạm…", "Nhấn…", "Kéo…", "Vuốt…". Không bịa nội dung (học phí, lịch, …): chữ lấy từ nguồn của trang cũ (`MemoriContent.load(...)`, JSON trong `assets/content/`).
- Giữ đủ hành vi và trợ năng của trang cũ (form, liên kết, bàn phím, aria). Form (nếu có) vẫn gửi đúng như trang cũ; khi tự kiểm KHÔNG bấm gửi form thật.
- Liên kết: `index.html` → `../bw-bo/`, `sitemap.html` → `../bw-map/`, `roadmap.html` → `../bw-roadmap/`, `lopf1.html` → `../bw-lopf1/`, các trang đang được làm song song (`gioithieu, method, khampha, gallery, community, dangky`) → `../bw-<id>/`, còn lại → `../../<trang>.html`.

## Quy trình
1. Đọc trang cũ `<id>.html` và tài nguyên của nó. Chụp trang cũ (Python Playwright `p.chromium.launch(channel="msedge")`, KHÔNG `playwright install`; server `python -m http.server <cổng riêng của bạn> --directory D:\MeMoriClass\_bw_images`, tắt khi xong) vào `prototype/bw-<id>/_ref/`.
2. Viết đặc tả và file prompt ảnh (khuôn như `PROMPT_BW_LOPF1_ART.md`, tối đa 3 ảnh cần vẽ; ảnh thật/tác phẩm thì không vẽ lại). Nếu trang cũ ít ảnh minh họa thì có thể chỉ cần 1 nền.
3. Gọi Codex vẽ ảnh (chạy trong Bash, đợi xong, có thể mất 5–10 phút):
   `codex exec -m gpt-6.1-sol -C D:\MeMoriClass\_bw_images -s workspace-write -i <ảnh bố cục> -i docs/design-bw/phuong-an/pa-15b.jpg -i prototype/bw-roadmap/img/bg-bw.webp -o <báo cáo.txt> - < <file lệnh.txt>`
   File lệnh: "Làm đúng theo file docs/design-bw/PROMPT_BW_<ID>_ART.md … dùng image_generation … chép ảnh từ ~/.codex/generated_images ra prototype/bw-<id>/img/src/ … chỉnh kích thước bằng PIL nếu lệch". Luôn có `-m gpt-6.1-sol`. Nếu lỗi giới hạn tốc độ, đợi 2 phút rồi chạy lại (tối đa 3 lần). Tự xem ảnh ra; nếu có chữ, màu, nhân vật thừa hoặc quá rối thì chạy lại với prompt sửa.
4. Dựng trang `prototype/bw-<id>/` (`index.html`, `style.css`, `app.js`, `tools/prep_assets.py`, `tools/shoot.py`, `img/*.webp`; thêm `<meta name="robots" content="noindex">`). Ảnh nền WebP q≈82; chi tiết cắt nền trong suốt.
5. Tự kiểm Playwright Edge: máy tính 1672×941 và điện thoại 390×844 DPR2 has_touch; các khoảnh khắc chính. Không lỗi console/404 của trang, không cuộn ngang, chữ tiếng Việt đúng dấu, đọc rõ trên điện thoại. Tự xem ảnh và sửa đến khi đạt. Ghép `prototype/bw-<id>/tools/shots/contact.jpg` (≤2400px rộng).

## Báo cáo (≤10 dòng)
File đã tạo, ảnh Codex đã vẽ, kết quả kiểm (console/404/cuộn ngang), đường dẫn contact.jpg, chỗ còn chưa ổn hoặc phần bỏ qua.
