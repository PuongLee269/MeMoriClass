# ĐƠN ĐẶT HÀNG (bản rút gọn, đợt 2): hiệu ứng lật sách - phần CÒN THIẾU

Đã nhận 2 bảng sprite A/B (6 khung, nền xanh xám đặc) và đã dùng được: A = lật sang PHẢI (trang bên trái nhấc lên rồi qua phải, = mục trước), B = lật sang TRÁI (= mục sau). Code đã tách nền, đăng ký lại, trộn mờ vào cuốn sách của bệ đá. Để thay bản tạm bằng bản chuẩn, cần:

1. **Nền trong suốt thật (PNG/WebP có kênh alpha 8 bit)**, không nền xanh xám. Hiện phải tách bằng khoảng cách màu nên vầng sáng và vệt nhoè bị sẫm/xanh nhẹ ở mép.
2. **Cuốn sách ĐÚNG như sách trên bệ đá** (cùng góc nhìn, cùng độ dẹt, cùng màu bìa; sách trong sprite cao hơn ~20% và cam đậm hơn). Tham chiếu: `ref_for_designers/ref_book_pedestal_registered_1672x941.png`; hộp sách trong canvas 1672x941: x 733, y 760, rộng 204, cao 72; gáy x ≈ 833; đáy bìa y ≈ 830. Khung đầu và khung cuối của mỗi đoạn phải trùng khít sách tĩnh này (hiện phải trộn mờ 0,25 s).
3. **Cùng đăng ký/tỉ lệ mọi khung và cả 2 chuỗi** (hiện chuỗi A lệch tỉ lệ 7% so với B và trôi 1-2 px giữa các khung; code đã bù). Cùng canvas, sách không trôi.
4. **Nhiều khung hơn**: 12-24 khung mỗi lần lật (hiện 6, nên chuyển động hơi giật dù đã nội suy), ít nhoè chuyển động hơn ở khung giữa (hiện nhoè nặng, mất chi tiết trang), 24 fps.
5. **Nội dung trang nhất quán**: khung cuối của lần lật phải là trang mà khung đầu của lần lật kế tiếp bắt đầu (hiện mỗi chuỗi một nội dung khác).
6. **Bổ sung đoạn**: `book_open_###` (mở sách lúc vào trang, 12-24 khung) và `book_idle_###` (thở nhẹ, lặp liền mạch, 24-48 khung); bóng đổ lên mặt đá ở lớp riêng `book_shadow_###`.
7. **Giao ở gấp 3 lần** (hộp 204x72 -> sách ~612 px ngang) và có chừa lề trống >= 18 px quanh mọi thứ bay ra; không cạnh bị cắt, không halo trắng/đen, không chữ.
8. Đặt tên `book_flip_left_000...`, `book_flip_right_000...`, `book_open_000...`, `book_idle_000...` + `manifest.json` (định dạng đã dùng trong `site/assets/lopf1/bookfx/manifest.json`: fps, bbox [x,y,w,h] theo hệ 1672x941, scale, clips{flipNext,flipPrev,open,idle:{count,pattern}}).
