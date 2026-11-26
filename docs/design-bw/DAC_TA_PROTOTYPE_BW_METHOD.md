# Đặc tả trang mẫu Phương pháp đen trắng: `prototype/bw-method/`

Chuyển `method.html` ("Phương pháp", bàn đá thí nghiệm) sang phong cách đen trắng manga như `bw-lopf1`, `bw-roadmap`. Không sửa `method.html` hay `assets/`.

## 1. Trang cũ
Bàn đá tròn, đĩa bên phải, đống 9 khối đá (3 ký hiệu: xoắn ốc, con mắt, ngọn núi; mỗi ký hiệu 3 biến thể). Kéo/thả khối vào đĩa; đủ 3 khối cùng ký hiệu thì hợp nhất, hiện thẻ chữ phương pháp (có thể kèm ảnh/video YouTube). Khác ký hiệu thì trả về; có thể đặt tạm lên bàn. Bàn phím: Tab chọn khối, Enter nhấc, mũi tên, Enter thả, Esc hủy/đóng. Nút "Xếp lại", nút âm thanh (Web Audio tổng hợp). Bố cục máy tính (ngang) và điện thoại (dọc), sân khấu logic scale.

## 2. Nguồn
- Chữ/dữ liệu: `MemoriContent` `method`, `site`, `journey` (remap fetch như bw-lopf1). Logic kéo thả, layout, âm thanh chép nguyên từ `method.html`.
- Ảnh Codex vẽ (`img/src/` rồi `tools/prep_assets.py`): `bg-bw`, `table`, `dish`, `branch` (cành kèm đèn treo), 9 `cube-<ký hiệu>-<A|B|C>`. Prompt: `PROMPT_BW_METHOD_ART.md`.
- Bọ: sprite `../bw-bo/img/bo/*.webp`.

## 3. Phong cách
- Token `--ink #111111`, `--paper #fbfbfa`, `--tone #d8d8d8`. Nền rừng mờ 1.3px, giảm tương phản, phủ giấy 42-78%.
- Bỏ: đom đóm, lấp lánh, ánh đèn, vầng sáng đĩa. Thay bằng: vòng đôi nét mực quanh đĩa (SVG, độ đậm theo số khối), vòng rune nét đứt + hình thoi/chấm mực quay trên canvas, nét tốc độ manga khi hợp nhất, chấm đen/trắng bay lên.
- Thẻ chữ: giấy, viền mực 2.5px qua bộ lọc `#hand` (trên `::before`, không méo chữ), bóng cứng 6px; tiêu đề Be Vietnam Pro 600 (27px/21px), nội dung 17px/16px. Ảnh/poster video trong thẻ grayscale + tram, nút phát tròn viền mực; iframe đang phát giữ màu.
- Nút: thẻ giấy viền mực (xếp lại, âm thanh 48px; thanh gợi ý 16px/14px; bản đồ → `../bw-map/`). Không chữ hướng dẫn.
- Màn tải: giấy trắng, Bọ idle, thanh mực.

## 4. Bọ
Đứng trên mép sau bàn (bên phải đĩa). idle; vào trang wave; đang nhấc khối → point (lật theo hướng đĩa); thả sai → surprised; hợp nhất → happy; mở video → listen; wave/think ngẫu nhiên 5-12s; 25s không tương tác → sleep. Không bấm được.

## 5. Liên kết
Về Bọ `../bw-bo/`; `roadmap` → `../bw-roadmap/`, `lopf1` → `../bw-lopf1/`, trang song song `../bw-<id>/`, còn lại `../../<trang>.html`.

## 6. Bỏ qua / ghi chú
- Không gắn `bo-widget.js` (chat Bọ nổi); thay bằng sprite.
- Đĩa vẽ tỉ lệ 1.62:1, layout ép còn ~2:1 như cũ (co nhẹ). Bàn vẽ lại lần hai (`table-bw`) vì bản đầu quá dẹt; cành và đèn lấy từ cùng bảng chi tiết (đèn rời bị bỏ).
- `?freeze=1` dừng chuyển động. Tắt/bật âm nhớ ở `memori.bw-method.sound`.
