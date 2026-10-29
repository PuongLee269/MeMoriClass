# Me.Mori — tuyến câu chuyện `/preview/`

## Nguồn và phạm vi

Mã nguồn nền: nhánh `main`, commit `17ca9291535d5767534014ae95adae4a7a1d3787`.
Cây repository qua GitHub API không có AGENTS.md, package.json hay workflow Pages đang được lưu trong mã nguồn.
Workspace ban đầu trống; Git clone không hoạt động do proxy:8080 không kết nối được. Các tệp liên quan được đọc qua kết nối GitHub; không có checkout cũ hay thay đổi chưa commit để ghi đè. Không sửa index.html gốc, preview/f2, preview/next hay assets. Không tạo workflow/đổi hosting.

## Sơ đồ màn hình

Chọn Lá ma thuật → chào mừng → kết nối sáu tinh linh → lửa / vách đá / vũ trụ → Hero → chọn bốn ảnh → Câu chuyện 1 → bọ dẫn đường → thông tin F2 → workshop trước đây → bản dựng / bài giảng → lựa chọn cuối.

- Giữ phần mở đầu và các tương tác hiện có.
- Hero: kéo ảnh bằng pointer, hoặc chọn ảnh rồi chọn ô bằng chuột/chạm/bàn phím. Đủ bốn ảnh mới mở câu chuyện; gỡ/thay ảnh khi quay lại. Hiển thị sáu ảnh trên điện thoại để có lựa chọn thay thế.
- Câu chuyện dùng đúng bốn ảnh theo thứ tự ô; không suy đoán nội dung ảnh hay danh tính người trong ảnh.
- Có thể quay lại bộ ảnh từ thanh điều hướng ở các chặng sau. Focus và inert giới hạn bàn phím vào cảnh hiện hành.
- Không ghi dữ liệu câu hỏi hoặc bộ ảnh vào localStorage. Giữ nguyên cờ đã xem intro của website cũ.

## Bảng kịch bản bọ cánh cứng

Nguồn thông tin khóa học: yêu cầu đã chốt trong phiên làm việc. Văn bản đầy đủ và từ khóa nằm trong `guideScripts` tại `preview/story-journey.js`.

| Ý định | Ví dụ từ khóa | Nội dung trả lời | Đích |
| --- | --- | --- | --- |
| Thanh toán | học phí, buổi đầu, không phù hợp | 2.400.000 VNĐ/toàn khóa; trải nghiệm trước; dừng không đóng tiền; học tiếp đóng sau buổi đầu | classInfo |
| Lịch / quy mô | lịch, mấy buổi, sĩ số, ở đâu | 6 học viên; 4 × 3 giờ; lịch linh hoạt; chi tiết hỏi trực tiếp | classInfo |
| Hỗ trợ | khó khăn, cộng đồng, sau khóa | hỗ trợ cá nhân; cộng đồng Mori | classInfo |
| Workshop | workshop, footage, không khí | tư liệu cũ; không phải F2 hiện tại hoặc feedback | workshopFilm |
| Thư viện | tác phẩm, bài giảng, mẫu, đánh cờ | các bản dựng do giảng viên dựng lại, bài giảng đã công bố | exploreContent |
| Giảng viên | Lê Hồng Phương, người dạy | tên người hướng dẫn, kênh bài giảng | exploreContent |
| Liên hệ | đăng ký, liên hệ, Facebook | kênh Facebook hiện có; không xác nhận chỗ tự động | journeyEnd |
| Nội dung | F2, học gì, kể chuyện, công cụ | thực hành kể chuyện từ đời sống; học viên quyết định câu chuyện/cá tính | classInfo |
| Không khớp / mơ hồ | chuỗi lạ, câu ngoài phạm vi | thừa nhận chưa có thông tin; gợi ý hỏi rõ hoặc liên hệ | journeyEnd |

Chuẩn hóa chữ hoa/thường, dấu tiếng Việt và khoảng trắng; khớp cụm từ theo ranh giới từ. Câu nhiều ý có thể nhận nhiều phần trả lời. Không gọi AI API; không tuyên bố hiểu ngôn ngữ tổng quát. Câu hỏi được chèn bằng textContent để tránh thực thi HTML.

## Nội dung tái sử dụng

- Sáu URL ảnh Drive từ Hero hiện có, không thay bằng tranh hoặc stock.
- Workshop duy nhất: https://www.youtube.com/shorts/dzLtrYGiey8 (tải khi bấm; đường dẫn dự phòng luôn hiện).
- Bốn file Drive cảnh đánh cờ từ `preview/f2/index.html`, ghi rõ do giảng viên dựng lại để phân tích; không dùng lời chứng thực/tuyên bố kết quả.
- Kênh bài giảng `https://www.youtube.com/@anhcuabum/shorts`.
- Người hướng dẫn Lê Hồng Phương; cộng đồng Mori.
- Facebook đăng ký `https://www.facebook.com/phuonglhdp/`.
- Không tái sử dụng địa điểm Hà Nội, mô tả giải thưởng hoặc cam kết đầu ra từ bản cũ vì ngoài thông tin đã chốt. Không thêm ưu đãi hay chế độ chat có thời hạn.

Quyền chia sẻ của các file Drive không được kiểm chứng độc lập trong môi trường này; giữ đúng các liên kết thư viện người dùng chỉ định. Không thêm tư liệu mới.

## Kiểm tra

- `node --check preview/story-journey.js`: PASS.
- `node tests/check_journey_logic.cjs`: PASS (14 câu hỏi khớp; 7 fallback; câu nhiều ý; cú pháp hai script inline; ID/đích liên kết; thông tin lớp; không gọi API/ưu đãi chưa duyệt).
- `python tests/check_journey.py`: chưa chạy được trình duyệt. Sandbox chặn socket khi Chromium khởi động; các yêu cầu chạy có quyền bổ sung bị ngắt. Không coi đây là kết quả PASS giao diện.
- Bài kiểm tra Playwright đã chuẩn bị ba kích thước 1440×900, 390×844, 320×568, toàn tuyến, thứ tự ảnh, quay lại thay ảnh, câu hỏi, HTML an toàn, điều hướng, embed, tràn ngang và lỗi JavaScript. Chạy từ thư mục repository; cần Python Playwright và Chromium tại /usr/bin/chromium.
- Kiểm tra trình duyệt tắt yêu cầu mạng ngoài để tách logic giao diện khỏi Drive/YouTube; cần kiểm tra thêm tải media thật online.
- Chưa xuất bản hoặc xác nhận GitHub Pages. Không suy đoán URL chính thức khi chưa kiểm tra cấu hình Pages/deploy.
