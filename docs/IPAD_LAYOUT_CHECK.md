# Kiểm tra bản sửa iPad — 2026-11-14

Bản sửa áp lên main tại 4c567a8, giữ nguyên những thay đổi mới về Bọ, nội dung và các trang khác.

## Thay đổi

- Scene có height xác định với vh dự phòng trước svh; overflow clip tránh khung cảnh tự cuộn khi focus ô nhập (hidden là dự phòng).
- Tablet dọc 701–1180 px có vị trí chat và ô nhập riêng, ảnh nền căn để Bọ nằm trong màn hình.
- Màn hình ngang thấp có vùng chat rộng hơn, ô nhập ở phía dưới.
- Ô nhập tối thiểu 16 px; tin nhắn tối thiểu 14 px.
- Tin nhắn không bị flex co lại; tin đầu dùng margin-top:auto. Khi hội thoại dài, vùng log có thể cuộn về đầu và cuối.

## Kết quả kiểm tra bằng Browse của Codex

15/15 kích thước đạt: 360×800, 375×667, 390×844, 412×915, 667×375, 844×390, 768×920, 820×1060, 1024×1366, 1024×660, 1180×720, 1366×768, 1440×900, 390×420, 1024×360.

Ở mỗi kích thước đã điền câu tiếng Việt có dấu, đọc lại đúng nguyên văn, đo khung chat và form nằm trong màn hình, font ô nhập >=16 px, scene có chiều cao đúng viewport và scene.scrollTop=0.

Đã gửi câu hỏi bằng nút và Enter, nhận câu trả lời; kiểm tra cuộn hội thoại về đầu sau khi nhận câu trả lời dài. Không ghi nhận console error trong phiên local.

Kiểm tra dự phòng svh ở lượt trước: bản sao loại bỏ hiệu lực svh làm scene trước sửa cao 0; sau thêm height/vh, scene cao đủ 660 px.

## Giới hạn

Các kích thước là viewport mô phỏng trong Browse của Codex. Chưa kiểm tra Safari/iPadOS, Android hay bàn phím ảo trên thiết bị thật; viewport thấp chỉ mô phỏng việc vùng hiển thị bị thu nhỏ. Không coi kết quả này là chứng nhận cho mọi thiết bị hoặc xác nhận nguyên nhân chính xác của ảnh iPad ban đầu.

Ảnh và JSON phép đo được lưu cục bộ trong .codex-attachments/ipad-qa/, không đưa lên GitHub.