# ĐƠN ĐẶT HÀNG: sửa các lớp desktop "Lớp F1" (dành cho hoạ sĩ / AI tạo ảnh)

Tài liệu gốc: thư mục Drive "Lớp F1" (ảnh tham chiếu 00_original_reference_desktop_16x9.png, 1672x941, và 10 lớp). Khi dựng trang thật, các lớp KHÔNG khớp ảnh tham chiếu nên đội code phải tự đo, co giãn và xếp lại từng lớp (sai số vài px). Cần bản lớp mới để khỏi phải "đoán":

## Vấn đề đã đo được
1. **Không cùng toạ độ với ảnh tham chiếu.** Chồng 01..10 theo số thứ tự cho sai số trung bình 42/255. Cụ thể (hệ 1672x941): bệ đá 03 to hơn tham chiếu khoảng 25% (rộng 820 px so với 705 px; cuốn sách 248 px so với 190 px); đá chiếu có xoắn ốc 04 to gần gấp đôi tham chiếu (xoắn ốc 120 px so với 75 px), thân đá lùn và rộng hơn; chùm sáng 06 rộng 1160 px so với 755 px; bọ rùa 05 nằm sai chỗ (cạnh đỉnh ô giữa); ba ảnh 08/09/10: 09 rộng 1256x663 và 10 nằm lệch ở x 947-1582, y 218-858, trong khi ô trong khung là (446-1227, 282-683) và (1238-1593, 304-671). Chỉ lớp khung 07 và ảnh trái 08 khớp tham chiếu. Tệp `manifest.json` (toạ độ crop) cũng không khớp tham chiếu (vd ô giữa 1273x682 tại 199,137).
   **Cần:** xuất lại toàn bộ lớp trong ĐÚNG cùng canvas 1672x941 và đúng vị trí/tỉ lệ của ảnh tham chiếu (hoặc chốt 1 ảnh tham chiếu mới rồi xuất lớp từ chính ảnh đó, tách bằng mặt nạ từ cùng điểm ảnh, không vẽ lại riêng từng lớp). Gửi kèm bảng toạ độ bbox từng lớp.
2. **Nền 01 khác tham chiếu.** Tham chiếu có lớp sương dày (nền xám xanh nhạt, độ tương phản thấp) còn 01 không có sương; trang phải vẽ thêm lớp sương bằng code cho gần giống. **Cần:** lớp sương riêng (PNG trong suốt, 1672x941, có thể 2-3 lớp ở các độ cao khác nhau để trôi nhẹ) hoặc nền 01 đã có sương đúng như tham chiếu; nếu cần lớp sương rời thì nền 01 không còn sương.
3. **Bọ rùa 05 bị mờ (phóng to từ ảnh nhỏ) và có quầng sáng vẽ liền vào ảnh (halo).** Trang đang dùng sprite Bọ của trang chủ thay thế. **Cần:** hoặc bỏ lớp này; hoặc xuất lại sắc nét, không quầng sáng, quầng (nếu cần) ở lớp riêng.
4. **Quầng/hào quang vẽ liền trong lớp xoắn ốc (04) và vành tròn quanh sách (03).** Không thể nhấp nháy/tắt/bật độc lập. **Cần:** xuất đá không có quầng + lớp quầng xoắn ốc riêng + lớp vòng phát sáng quanh sách riêng (trong suốt).
5. **Ba ô tranh 08/09/10 bị bẻ phối cảnh và cong ngay trong ảnh** (ô trái/phải hình thang, mép trên dưới cong). Không thể thay ảnh khác vào mà không bị méo. **Cần:** (a) giữ NGUYÊN khung cong (07) nhưng cho 3 mặt nạ ô tranh rõ ràng (3 lớp mặt nạ PNG trắng-đen cùng canvas, khớp mép trong của khung, mở rộng 2-3 px dưới nét khung); (b) ảnh mẫu 08/09/10 xuất dạng PHẲNG chưa bẻ cong (chữ nhật, độ phân giải >= 1280x720) kèm ghi chú góc hình thang nếu muốn bẻ phối cảnh bằng code.
6. **Lớp khung 07: nét khung nửa trong suốt có quầng** (nên rõ hơn nét lõi đặc 100%), và vùng trong khung phải TRONG SUỐT hoàn toàn (đã đúng, giữ nguyên).
7. **Bệ đá 03 chứa sẵn cuốn sách vẽ liền.** Để hiệu ứng lật sách (xem ORDER_BOOK_FX.md) thay được cuốn sách tĩnh, cần thêm bản bệ đá KHÔNG có sách (và không có vòng sáng) cùng canvas/toạ độ, phần bị sách che phải vẽ bổ sung mặt đá.
8. **Cỏ phía trước 02:** bóng đổ và các lá cỏ chồng lên bệ đá ở tham chiếu (cỏ che nhẹ mép dưới bệ) chưa có. Cần thêm 1 lớp cỏ "chồng lên bệ" riêng (1672x941, chỉ gồm cỏ che mép dưới bệ).
9. Chỉ có bản desktop; xem ORDER_MOBILE.md cho bản điện thoại. Chưa có âm thanh (sẽ gửi riêng).

## Quy tắc chung khi xuất
PNG hoặc WebP trong suốt, canvas 1672x941 giữ nguyên cho mọi lớp, mép mờ mềm, cạnh không bị cắt thẳng, không có chữ/UI vẽ liền, màu viền không có halo trắng/đen. Tên file theo tiền tố 01_, 02_ như cũ.
