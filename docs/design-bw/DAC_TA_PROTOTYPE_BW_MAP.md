# Đặc tả trang mẫu bản đồ đen trắng: `prototype/bw-map/`

Chủ dự án yêu cầu (2026-11-26): làm trang bản đồ theo phong cách đen trắng của trang mẫu Bọ (`prototype/bw-bo/`). Điểm khác: **rê chuột vào vùng nào thì vùng đó hiện màu**, dùng lại element của trang cũ (`sitemap.html`, `assets/sitemap/`).
Trang mẫu độc lập, KHÔNG sửa `sitemap.html` hay `assets/` dùng chung.

## 1. Nguồn
- Logic, tọa độ, nội dung: chép từ `sitemap.html` (POLYS của 9 viên đá, D0, ICONS, nhãn, gợi ý, cách xoay bố cục khi điện thoại dọc, nạp nội dung qua `MemoriContent.load('sitemap')` và `('site')`, thanh `next-pages`). Giữ nguyên hành vi điều hướng và trợ năng (thẻ `<a>`, aria-label, focus bằng bàn phím).
- Ảnh màu gốc (dùng khi hiện màu): `../../assets/sitemap/map.webp`, `icon0..6.webp`, `leaves.webp`, `mound.webp`, `bg.webp`.
- Cảnh đen trắng: `img/scene-bw.png` (Codex vẽ lại cảnh rừng + lá + gò rêu kiểu manga, cùng bố cục 1670×942) → xuất `img/scene-bw.webp`.
- Bọ: dùng sprite đen trắng của trang mẫu Bọ `../bw-bo/img/bo/*.webp` (idle, wave, point, happy, surprised, think, takeoff, fly, sleep, listen, talk, confused). Không dùng Bọ màu cũ.

## 2. Lớp hình (từ sau ra trước)
1. `scene-bw` phủ kín (cover), như `#bg` cũ.
2. **Đá bản đồ đen trắng vẽ bằng SVG** theo đúng POLYS: mỗi viên đá là `<polygon>` nền giấy `#fbfbfa`, viền mực `#111` 2.5px qua bộ lọc SVG vẽ tay (feTurbulence + feDisplacementMap, scale ~2), khe giữa các viên là nền rừng lộ ra (thu nhỏ mỗi đa giác vào trong ~4px hoặc dùng stroke dày màu giấy tối). Mỗi viên có một lớp tram chấm nhạt riêng (pattern SVG chấm 3–4px, độ đậm khác nhau nhẹ giữa các viên để phân biệt, vẫn chỉ xám).
3. **Lớp màu** của mỗi viên: ảnh `map.webp` gốc cắt theo đa giác (cơ chế `.lit` của trang cũ), mặc định ẩn.
4. Biểu tượng: ảnh icon gốc với `filter: grayscale(1) contrast(1.6) brightness(1.08)` (thành nét mực + mảng xám), chồng thêm bản màu gốc ẩn để hiện khi rê.
5. Nhãn chữ trên đá: màu mực `#111`, phông như trang cũ.
6. Lá, gò rêu tiền cảnh: đã nằm trong `scene-bw`; nếu cần che chân Bọ như trang cũ (`mound2`), cắt vùng gò từ `scene-bw` theo alpha của `mound.webp` gốc.
7. Bọ (sprite đen trắng).

## 3. Hiện màu khi rê / chạm (điểm chính)
- Rê chuột vào viên đá (hoặc focus bàn phím): lớp màu của viên đó mở ra bằng `clip-path: circle()` lan từ vị trí con trỏ (focus: từ tâm viên đá) tới phủ kín đa giác, 380ms ease-out; biểu tượng và nhãn của viên đó chuyển sang màu gốc cùng lúc (icon bản màu mờ dần lên 250ms). Viền mực giữ nguyên trên lớp màu.
- Rời chuột: màu thu lại (mờ dần 260ms) về đen trắng.
- Chỉ một viên có màu tại một thời điểm. Các viên khác giữ đen trắng.
- Điện thoại / cảm ứng: chạm MỘT lần → viên đá hiện màu ngay (lan từ điểm chạm) kèm gợi ý (`tip`), Bọ bay rồi chuyển trang. Không có cơ chế chạm hai lần. Chuột: rê hiện màu, click một lần đi luôn. Bàn phím: focus hiện màu, Enter đi luôn.
- Gợi ý (`tip`) hiện dưới nhãn như trang cũ, chữ mực trên nền giấy.
- `prefers-reduced-motion`: hiện/ẩn màu tức thì (không lan vòng tròn).

## 4. Bọ
Giữ cách Bọ di chuyển/nhìn về viên đá đang được chọn như trang cũ (LADY_RULES, BoIdle), đổi bộ tư thế:
- Nghỉ: `idle`; nhìn viên đá được chọn: `point` (lật ngang bằng `scaleX(-1)` khi viên đá ở phía còn lại); viên đá ở trên: `think`; vừa vào trang: `wave` 1.5s; bấm vào Bọ: `happy`; lâu không tương tác 25s: `sleep`.
- Khi bấm một viên đá để đi: Bọ `takeoff` → `fly` về phía viên đá 600ms rồi chuyển trang (giảm chuyển động: chuyển ngay).
- Bọ luôn đen trắng.

## 5. Liên kết giữa các trang mẫu
- Các viên đá dẫn tới trang thật: `../../<trang>.html`.
- Nút về trang Bọ / "Tôi có phù hợp không" (index.html) trong trang mẫu → `../bw-bo/`.
- Sửa `prototype/bw-bo/`: nút bản đồ, thẻ "Tham quan bản đồ" và nút trang tiếp → `../bw-map/` thay vì `../../sitemap.html`.

## 6. Hệ màu, chữ
Như `prototype/bw-bo/` (token `--ink`, `--paper`, `--tone`; Be Vietnam Pro; logo Oooh Baby). Ngoài lớp màu khi rê, toàn trang chỉ đen/trắng/xám. Không chữ hướng dẫn kiểu "Chạm…", "Rê chuột…".

## 7. Kiểm tra bắt buộc
Playwright (Edge): máy tính 1672×941 và điện thoại 390×844 DPR 2 touch (bố cục xoay như trang cũ). Ảnh: vừa tải; rê vào 3 viên khác nhau (trái-trên, giữa, phải-dưới); đang lan màu (giữa chừng 150ms); điện thoại chạm 1 viên; Bọ bay khi bấm. Kiểm: lớp màu khớp đúng viền đá (không lệch), không cuộn ngang, không lỗi console, chữ tiếng Việt đúng.
