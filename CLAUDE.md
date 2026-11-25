# Quy tắc làm việc (Me.Mori Class)

- Báo cáo cho người dùng: TỐI ĐA 10–15 dòng, tiếng Việt, ngắn gọn. Chi tiết dài thì ghi vào file rồi gửi file.
- Chỉ commit/push lên GitHub khi người dùng nói rõ "đưa lên" (hoặc tương đương).
- Worker phải đọc và làm theo `docs/WORKER_RULES.md`.
- Báo token do hệ thống ghi nhận; không tự đoán số thật hay phần trăm giới hạn 5 giờ (người dùng xem ở claude.ai → Settings → Usage).
- Trang mới KHÔNG có chữ hướng dẫn người dùng (kiểu "Kéo sang trái...", "Chạm để mở", gợi ý tương tác, phụ đề hướng dẫn). Chỉ giữ chữ nội dung (tiêu đề, tên, mô tả, chú thích ảnh). Nhãn trợ năng (aria) vẫn giữ, không hiển thị.

## Phân công (phiên chính = quản lý, model Opus)
- Phiên chính lập kế hoạch, giao việc, kiểm tra kết quả, báo cáo. Tự làm việc khó: thiết kế kiến trúc, AI/Worker Bọ, bảo mật, gỡ lỗi nhiều file, quyết định đưa lên `main`.
- Giao Sonnet (Agent, `model: "sonnet"`): sửa trang/HTML/CSS/JS theo mô tả rõ, đồng bộ nội dung 3 nơi, chụp Playwright và sửa lỗi giao diện, viết test.
- Giao Haiku (`model: "haiku"`): tìm kiếm, liệt kê, đếm, trích nội dung, đổi chữ hàng loạt theo danh sách có sẵn, kiểm tra cú pháp JSON.
- Mỗi lần giao: ghi mục tiêu, file cần sửa, việc KHÔNG được làm, cách tự kiểm tra, mẫu báo cáo ≤10 dòng; worker không commit/push.
- Worker làm trong worktree riêng; quản lý xem diff, chạy kiểm tra, rồi mới gộp.
- Tự động compact ở khoảng 250K token (`.claude/settings.json` → `autoCompactWindow`).
