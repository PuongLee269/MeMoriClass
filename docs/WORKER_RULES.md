# Quy tắc giao việc cho worker (rút ra từ trang Cộng đồng)

Mọi worker phải đọc file này trước khi làm và tuân theo. Mỗi mục dưới đây là một lỗi đã xảy ra thật.

## A. Về ảnh nguồn
1. **Không tin tên file hay mô tả.** Mở từng ảnh (thu nhỏ bằng PIL rồi xem), phóng to x3 vùng quan trọng. Ví dụ đã xảy ra: `background_without_energy.png` vẫn còn dải năng lượng bên trong.
2. **Dùng ảnh thật của người dùng.** Không thay bằng ảnh vẽ bằng code khi ảnh "có vẻ không dùng được". Nếu thấy không dùng được, DỪNG và báo lý do cụ thể, không tự thay thế (nền tím vẽ bằng code đã bị chê là thô).
3. **Các lớp phải lấy từ cùng một điểm ảnh.** Không chồng hai ảnh có cùng nội dung rồi di chuyển lệch nhau (lỗi dải lụa chồng nền). Muốn tách hiệu ứng thì tạo mặt nạ từ chính ảnh nền.
4. **Không có cạnh thẳng bị cắt.** Mọi sprite phải có viền trong suốt rộng hơn vầng sáng; mọi lớp có mép mờ mềm; lớp vẽ lớn hơn màn hình (over-scan) khi bị xoay hoặc phóng to. Nút bấm tròn không được dùng overflow hoặc bo góc để cắt hình.
5. Ảnh nén WebP, giữ kênh trong suốt chất lượng cao (alpha_quality 100). Mỗi ảnh gần 500 KB trở xuống, tổng vài MB.

## B. Về hình ảnh và chữ
6. **Chữ thật phải là chữ bằng code**, không dùng ảnh chữ (bị mờ). Dùng đúng font đã thống nhất: tiêu đề/chữ tay "Oooh Baby", chữ đọc "Be Vietnam Pro". Font nằm trong `assets/fonts/` của repo (tự lưu, không gọi Google).
7. **Không đặt nền, viền, khung hay làm mờ phía sau tên và chữ**, trừ khi người dùng yêu cầu. Chỉ dùng bóng chữ nhẹ để dễ đọc.
8. **Hiệu ứng nhấp nháy/chớp sáng nền phải rất nhẹ**: ít, chậm (chu kỳ 3–6 giây, lên xuống mềm), độ sáng thấp, nằm ẩn sau nền. Không bật chớp.
9. **Vầng sáng/quầng chỉ xuất hiện khi tương tác** (rê chuột, chạm, focus). Trạng thái nghỉ thì tối và không có quầng.
10. Màu đã chốt (ví dụ đường nối chỉ màu vàng) thì không tự thêm màu khác.
11. Đoạn mở đầu: nhanh, ấn tượng; không có hiệu ứng "bắn vào giữa" trừ khi được yêu cầu; thứ tự các lớp xuất hiện theo mô tả của người dùng.

## C. Về thiết bị
12. Chạy tốt trên điện thoại (390×844) lẫn máy tính (1440×810). Điện thoại KHÔNG có rê chuột: mọi hiệu ứng "hover" phải có tương đương khi chạm/giữ/kéo ngón tay. Kiểm tra cả hai.
13. Canvas 2D hoặc transform CSS, DPR tối đa 2, tạm dừng khi tab ẩn, tôn trọng `prefers-reduced-motion`. Mọi phần tử bấm phải bàn phím truy cập được.
14. Có phương án dự phòng nếu một ảnh tải lỗi; không để trang trống.

## D. Về cách làm việc và kiểm chứng
15. **So với ảnh thiết kế đã duyệt** bằng bảng ghép cạnh nhau (PIL contact sheet) ở nhiều mốc thời gian, liệt kê từng chỗ còn kém, sửa, tối đa 2–3 vòng. Phải THỰC SỰ xem ảnh chụp (công cụ Read), không chỉ chạy script.
16. Không tự chấm điểm cho mình: nếu báo "chưa kiểm tra X" thì ghi rõ trong báo cáo. Báo cáo phải nêu: đã xem gì, chưa xem gì.
17. Chỉ đăng bản hoàn chỉnh đúng một lần; không đăng bản trung gian (trừ khi được bảo).
18. Không đụng vào repo ngoài phần được giao. Không ghi đè lịch sử git. Push chỉ khi được bảo rõ.
19. Báo cáo số token ước lượng; điều phối sẽ đối chiếu với số hệ thống ghi nhận (worker thường tự báo thấp khoảng một nửa).
