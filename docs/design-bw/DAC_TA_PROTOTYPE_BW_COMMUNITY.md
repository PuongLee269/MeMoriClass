# Đặc tả trang mẫu Cộng đồng đen trắng: `prototype/bw-community/`

Chuyển `community.html` ("Cộng Đồng Me.Mori") sang phong cách manga đen trắng như `bw-lopf1/`, `bw-roadmap/`. Trang mẫu độc lập, KHÔNG sửa `community.html` hay `assets/` dùng chung. Ảnh trang cũ để đối chiếu: `_ref/old-*.png`.

## 1. Trang cũ và nguồn
Canvas nền vũ trụ tối + dải lụa màu, 6 quả cầu vàng nối bằng MỘT sợi dây (0-1-2-3-4-5), bài thơ dưới đáy, bấm quả cầu mở thẻ hồ sơ (ảnh + tên + chú thích, liên kết ngoài), nút "↻ Phát lại", thanh gợi ý ("Đăng ký →"), nút bản đồ, Bọ ở góc dưới trái (widget chat).
- Chữ và dữ liệu: `MemoriContent.load('community', …)`, `('site')`, `('journey')` qua `../../assets/content-loader.js` (remap fetch như bw-lopf1). Khoá: `pageTitle, srTitle, replayLabel, poem[], members[]{id,name,place,avatar,href,caption}`. Không viết chữ mới (màn tải dùng `srTitle`).
- Chép nguyên: toạ độ neo 6 quả cầu (`ANCH`, canvas 1672×941, `S` cover/contain), cung dây `EDGES` (bow .1,-.09,.08,-.1,.09), bố cục điện thoại (zigzag x .3/.72, orb đường kính ≤112), thuật toán đặt thẻ (4 vị trí, chấm điểm tránh va chạm), Esc/click ngoài để đóng, bấm lại quả cầu để đóng, `aria-expanded`, nhịp dựng (quả cầu hiện lần lượt → dây vẽ dần → thơ hiện).
- Ảnh hồ sơ `assets/community/avatar.webp` là ảnh nội dung: KHÔNG vẽ lại, thẻ đang mở giữ MÀU THẬT (cắt viền vàng của ảnh bằng phóng 124%).

## 2. Ảnh đen trắng (Codex vẽ, `PROMPT_BW_COMMUNITY_ART.md`)
- `img/bg-desk-bw.webp` (1672×941), `img/bg-phone-bw.webp` (852×1846): giấy trắng, dải lụa gió nét mực + tram nhẹ ở rìa, vài sao bốn cánh; giữa gần trống. Làm mờ 1.2px, giảm tương phản, phủ giấy 40-78% (radial, điện thoại phẳng 50%).
- `img/orb-1..6.webp` (320×320, nền trong suốt, ruột đục): cắt từ bảng `orbs-bw.png` (6 quả cầu mực, mỗi quả một hoạ tiết: xoắn, sao, lá, trăng, hoa, xoáy) bằng `tools/prep_assets.py`.
- Bỏ: hạt bokeh, sao lấp lánh động, sóng sáng trên lụa, quầng sáng, mọi ánh sáng `lighter`. Không còn canvas, dựng bằng DOM + SVG.

## 3. Phong cách
- Token `--ink #111111`, `--paper #fbfbfa`, `--tone #d8d8d8`. Mọi nút/thẻ: giấy, viền mực 2-2.5px, bóng cứng 2-4px, Be Vietnam Pro (máy tính ≥16px, điện thoại ≥14px, chạm ≥44px).
- Sợi dây: SVG, cung nét mực đôi (nét đậm 3.4px + nét mảnh 1.5px bẻ ngược, như hai tao xoắn), qua bộ lọc vẽ tay `#hand` (feTurbulence), vẽ dần bằng `stroke-dashoffset`. Đầu dây chui vào tâm quả cầu (ruột quả cầu đục nên che đầu dây).
- Quả cầu: ảnh mực, bóng cứng lệch 3/4px; rê/lấy nét: bóng 5/6px; đang chọn: vòng đứt nét mực quanh quả cầu; các quả khác chỉ giảm bóng (không giảm độ đục để không lộ dây). Nổi nhẹ 5px / 6s. Hiện lần lượt (pop 0.6s, trễ .3+.12i s).
- Thẻ hồ sơ: thẻ giấy viền mực 2.5px, bóng cứng 4px, ảnh khung mực 2px, tên 18px/600 (điện thoại 17px), nơi ở + chú thích 16px (điện thoại 14px); nối với quả cầu bằng dây ngắn mực. Nằm ngay sau quả cầu trong DOM nên Tab đi quả cầu → thẻ (liên kết `target=_blank rel=noopener`).
- Thơ: thẻ giấy giữa đáy, Oooh Baby 32px (điện thoại 20-21px, 3 dòng vừa khung) màu mực.
- Thanh gợi ý trên-trái: nút tròn "←" về `../bw-bo/` + thẻ "Đăng ký →" (từ `journey.json`, `fixHref` → `../bw-dangky/`); nút bản đồ góc trên phải → `../bw-map/`; nút "↻ Phát lại" ngay dưới nút bản đồ (thay vị trí góc phải cũ để khỏi đè lên bản đồ).
- Màn tải: giấy, Bọ `idle`, `srTitle`, thanh tiến trình mực.
- `prefers-reduced-motion`: hiện ngay trạng thái cuối. `?freeze=1`: dừng mọi chuyển động (kiểm: 0 animation vô hạn).

## 4. Bọ
Sprite đen trắng `../bw-bo/img/bo/*.webp` (idle, wave, happy, surprised, think, sleep), góc dưới trái (điện thoại: ngay trên thẻ thơ). Vào trang `wave` 1.5s; mở hồ sơ `happy` 1.3s; Phát lại `surprised` 0.9s; wave/think ngẫu nhiên 5-12s; 25s không tương tác `sleep`. KHÔNG ghép `bo-widget.js` (chat) vì Bọ ở các trang mẫu là sprite không bấm được; ghi nhận: trang thật vẫn có chat, trang mẫu bỏ.

## 5. Bỏ so với trang cũ
- Xung ánh sáng chạy dọc dây (pulse), hiệu ứng lụa lộ dần theo mặt nạ (`mask.webp`, `field.webp`), bokeh/sao nhấp nháy, quầng sáng quả cầu.
- Chat Bọ (`bo-widget.js`).

## 6. Kiểm tra (Edge, `tools/shoot.py`, cổng 8775)
Máy tính 1672×941 và điện thoại 390×844 DPR2 touch: tải, giữa nhịp dựng, hoàn tất, rê, mở hồ sơ (bấm/chạm và bàn phím), Esc đóng, Phát lại, ngủ. Không cuộn ngang, không lỗi console/404. `tools/shots/contact.jpg`.
