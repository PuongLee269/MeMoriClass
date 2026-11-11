# Bọ group router (Cloudflare Worker mẫu)

Worker chỉ nhận câu hỏi dài tối đa 200 ký tự và chỉ trả `{ "id": "..." }` hoặc `{ "id": null }`. Nội dung trả lời cố định nằm ở `assets/content/bo-replies.json`; Worker không sinh văn bản trả lời.

## Triển khai

1. Cài Wrangler và đăng nhập Cloudflare: `npx wrangler login`.
2. Kiểm tra `wrangler.toml`; binding AI dùng Cloudflare Workers AI, không cần API key. Nếu thay bằng nhà cung cấp ngoài, chỉ lưu khóa bằng `npx wrangler secret put API_KEY` và gửi request từ Worker; tuyệt đối không đặt khóa trong biến frontend hoặc repo.
3. Triển khai: `npx wrangler deploy` (Durable Object sẽ lưu bộ đếm theo IP, mặc định tối đa 12 câu hỏi/phút).
4. Đặt `assets/content/bo.json` thành `{ "ai": { "enabled": true, "endpoint": "https://<worker-domain>/" } }` khi muốn bật; mặc định đang tắt. Endpoint Worker không lưu câu hỏi.

CORS chỉ cho `https://moriclass.com`. Câu hỏi không có thông tin nhận dạng từ widget; không gửi lịch sử chat. Chỉ bật endpoint sau khi đã cấu hình hạn mức/billing của Workers AI.

## Ghi chú

- Danh sách ID và mô tả nhóm được cố định trong `index.js`, để prompt ổn định và có thể được nhà cung cấp lưu đệm.
- Đầu ra bị kiểm tra với allowlist ID trước khi trả về. Mọi lỗi, JSON sai, ID lạ, quá hạn mức đều trả `id: null`.
- Rate limit là mẫu theo IP bằng Durable Object. Khi triển khai quy mô lớn, cân nhắc Cloudflare rate limiting rules/Turnstile và chính sách lưu log phù hợp.
- Worker dùng `max_tokens: 24`, chế độ JSON schema nếu model binding hỗ trợ; cần thử trên tài khoản/model đã chọn trước khi bật cho người xem.
