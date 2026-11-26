# Đặc tả trang mẫu Khám phá tác phẩm đen trắng: `prototype/bw-khampha/`

Chuyển `khampha.html` sang phong cách đen trắng manga (như `bw-roadmap`, `bw-lopf1`). Trang mẫu độc lập, không sửa trang thật hay `assets/`. Ảnh chụp trang cũ: `prototype/bw-khampha/_ref/old-*.png`.

## 1. Trang cũ
Cảnh đêm mây (1672x941) với 5 công trình trên các đảo mây nối bằng dải mây: Lò gốm (kiln), Studio ảnh (studio), Homestay (house), Sân khấu (stage), Lớp học (class). Rê/lấy nét/chạm công trình: bật đèn + thẻ chú thích; công trình có `workId` (Lớp học) mở thẻ tác phẩm (ảnh, tên, mô tả, "Vào xem" -> `tacpham.html?id=`). Điện thoại dọc: cảnh phủ kín chiều cao, kéo ngang. Bọ nghỉ dưới trái (bấm mở khung chat).

## 2. Nguồn chữ và dữ liệu
`MemoriContent.load('khampha', ...)` (page, items, works, settings), `site`, `journey` (khampha -> "Workshop", "Đăng ký"), qua `../../assets/content-loader.js` (remap fetch như bw-lopf1). Không viết chữ mới. Ảnh thumb tác phẩm từ `works[].thumb` (giữ màu thật vì đang được chọn).

## 3. Ảnh đen trắng (Codex vẽ, `PROMPT_BW_KHAMPHA_ART.md`)
- `bg-bw.png` -> `img/bg-bw.webp` (1672x941, q82): đảo mây + dải mây, thưa chi tiết.
- `buildings-bw.png` (5 công trình trên nền trắng) -> `tools/prep_assets.py` tách theo thành phần liên thông, nền trắng ngoài rìa thành trong suốt: `img/b-<id>.webp` + `img/layout.json` (hộp và đa giác bấm = bao lồi của hình mới). Không vẽ lớp "bật đèn" riêng.
- Điện thoại dùng cùng cảnh (như trang cũ: phủ chiều cao, kéo ngang), không cần ảnh dọc.

## 4. Phong cách
- Token `--ink #111`, `--paper #fbfbfa`, `--tone #d8d8d8`. Nền: blur 1.1px + giảm tương phản + giấy phủ 50%, rìa mờ về giấy. Bỏ sao lấp lánh, mây trôi, ánh sáng.
- Công trình luôn hiện bản vẽ; "bật đèn" = lớp cùng hình có viền mực dày 2px + bóng cứng 7/8px, mờ vào 260ms.
- Chú thích và thẻ tác phẩm: thẻ giấy viền mực, bóng cứng, Be Vietnam Pro (tiêu đề 17px/20px, nội dung 15px, nhãn 14px+). Nút "Vào xem": pill mực chữ giấy 16px (15px điện thoại), cao 44px. Nút đóng 44px.
- Thanh gợi ý (nút về Bọ, "Workshop", "Đăng ký"): thẻ giấy 16px máy tính, 14px điện thoại (dùng `short`), cao 44px. Nút bản đồ -> `../bw-map/`.
- Tiêu đề Oooh Baby màu mực (36px điện thoại). Màn tải: giấy trắng, Bọ idle, thanh mực.
- Không chữ hướng dẫn ("Chạm...", ...). Mở trang là cảnh đầy đủ (không có mục chọn sẵn).

## 5. Hành vi giữ nguyên
Rê, Tab (lấy nét hiện chú thích + Bọ nhìn), Enter/click mở thẻ (nhà có tác phẩm), Escape đóng thẻ và trả lấy nét, chạm 1 lần (nhà có tác phẩm: mở thẻ; nhà khác: hiện chú thích, chạm lần 2 mở link hoặc "Sắp có"), kéo ngang cuộn cảnh không bị nhầm thành chạm, `aria-live` đọc tên + mô tả, `?freeze=1` dừng chuyển động. Công trình chưa có link: "Sắp có" (từ `soonText`).

## 6. Bọ
Sprite `../bw-bo/img/bo/*.webp` (112px, [68,668]): idle; wave khi vào trang; wave/think ngẫu nhiên 5-12s; point nhìn về phía công trình đang rê; happy khi mở thẻ hoặc rê vào Bọ; sleep sau 25s. Bấm Bọ -> `../bw-bo/` (thay khung chat nổi `bo-widget.js` bằng liên kết sang trang Bọ).

## 7. Liên kết
`index.html` -> `../bw-bo/`, `sitemap.html` -> `../bw-map/`, `roadmap`, `lopf1`, `gioithieu`, `method`, `khampha`, `gallery`, `community`, `dangky` -> `../bw-<id>/`; còn lại (`tacpham.html?id=`) -> `../../tacpham.html`. (Việc sửa `fixHref` ở trang khác để trỏ vào `../bw-khampha/` thuộc quản lý, worker không đụng.)

## 8. Đã kiểm
Edge 1672x941 và 390x844 DPR2: không lỗi console/404, không cuộn ngang, chữ nút >=16/14px, vùng chạm >=44px, thẻ mở/đóng, Bọ ngủ. Ảnh: `tools/shots/` (contact.jpg).
Bỏ qua: `bo-widget.js` (chat nổi), `tacpham.html` chưa làm bản đen trắng, hiệu ứng sao/mây trôi.
