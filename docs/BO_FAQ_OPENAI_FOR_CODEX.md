# Giao việc cho Codex: gộp Bọ "chọn câu hỏi có sẵn" với OpenAI và deploy thử

Repo: https://github.com/PuongLee269/MeMoriClass
- Gốc để làm: https://github.com/PuongLee269/MeMoriClass/tree/claude/bo-faq (commit `eb61e6a`) — hệ FAQ-first, đang dùng Gemini.
- Việc cũ của Codex để lấy lại: https://github.com/PuongLee269/MeMoriClass/tree/codex/bo-ai-openai (`f39c499`).
- KHÔNG tạo nhánh mới: làm và push THẲNG trên `claude/bo-faq` (một nhánh duy nhất cho Bọ). KHÔNG push `main`, KHÔNG bật AI trên moriclass.com.

## Prompt (dán cho Codex)

```
Repo PuongLee269/MeMoriClass. Checkout claude/bo-faq (eb61e6a) và làm tiếp THẲNG trên nhánh này, không tạo nhánh mới. Không push main, không bật AI trên moriclass.com. Tiếng Việt. Báo cáo cuối tối đa 12 dòng. Đọc CLAUDE.md, docs/WORKER_RULES.md và bo-faq-REPORT (docs hoặc báo cáo kèm nhánh) trước.

Hiểu thiết kế mới (đã xong trong claude/bo-faq, dùng Gemini): 52 FAQ trong assets/content/bo-faq.json (câu hỏi mẫu + câu trả lời có sẵn). AI chọn CÂU HỎI CÓ SẴN sát nghĩa nhất với câu người dùng; chỉ khi không câu nào sát mới tự trả lời <= 60 chữ dựa trên bản tóm tắt kiến thức an toàn trong prompt Worker. AI lỗi/hết lượt -> từ khóa -> câu dự phòng. 50 lượt AI/ngày/IP, câu hỏi < 50 chữ, cache câu lặp.

Việc cần làm:
1. Chuyển lớp gọi nhà cung cấp (worker/bo-router/provider.js) từ Gemini sang OpenAI, tận dụng phần OpenAI bạn đã làm ở codex/bo-ai-openai (f39c499: Chat Completions, OPENAI_MODEL, phân biệt null thật với lỗi 502/503/504). Hai bước giữ nguyên: bước 1 chọn id FAQ hoặc "none" (structured output, enum id), bước 2 tự trả lời có kiểm đầu ra. Đổi tên biến, README, wrangler.toml, docs/ADMIN.md. Cherry-pick hoặc viết lại phần cần, đừng kéo lại các thay đổi nhóm cũ xung đột với FAQ.
2. load-private-env.mjs chỉ đọc biến môi trường (OPENAI_API_KEY), không đọc/dò khóa trong file. Giữ .gitignore chặn env/, .dev.vars*, bộ đếm. Chạy kiểm không lọt khóa (sk-...) trước mỗi commit. Không commit docs/cf-token-review.png nếu không cần.
3. Mock test: node --test worker/bo-router/ phải pass. Cập nhật live-test cho OpenAI.
4. Deploy THỬ Worker lên Cloudflare tên khác production (ví dụ bo-router-test), có Durable Object RATE_LIMIT thật. Khóa chỉ qua `wrangler secret put OPENAI_API_KEY` / biến môi trường, KHÔNG vào repo/log/ảnh/báo cáo. ALLOWED_ORIGINS chỉ cho nguồn thử, không dùng "*". Nếu thiếu CLOUDFLARE_API_TOKEN/CLOUDFLARE_ACCOUNT_ID thì dừng và báo chủ dự án (token quyền Workers Scripts: Edit đủ để thử, hết hạn ngắn).
5. Live-test trỏ vào Worker thử, ít nhất 60 câu: 30 câu diễn đạt khác câu có sẵn (lóng, không dấu, hỏi vòng, hai ý) -> đúng FAQ >= 90%; 10 câu ngoài danh sách nhưng thuộc phạm vi -> tự trả lời đúng quy tắc (không bịa giá/lịch/địa chỉ/cọc, <= 60 chữ; ghi lại để chủ dự án kiểm tay); 10 lạc đề; 5 chèn lệnh (không rò prompt/khóa); 3-5 câu >= 50 chữ không gọi AI; lượt 51 cùng IP bị 429 mà Bọ vẫn trả lời bằng từ khóa; timeout; cache; CORS nguồn lạ bị chặn; thân >2KB bị chặn. Ghi p50/p95 qua mạng thật, token vào/ra từng bước, chi phí/1.000 lượt (giá lấy từ trang giá OpenAI hiện hành, ghi ngày và nguồn).
6. Mở trang bằng máy chủ tĩnh với endpoint Worker thử, hỏi bằng widget Bọ ở index.html; kiểm không lỗi console trên các trang chính. Không thêm chữ hướng dẫn lên trang.
7. Cuối cùng xóa Worker thử nếu chủ dự án không giữ, nhắc đổi (rotate) khóa OpenAI và token Cloudflare đã dùng.
8. Commit + push lên claude/bo-faq (không force). Báo cáo: bảng kết quả rút gọn, p50/p95, token, chi phí/1.000 lượt (kèm nguồn giá), URL Worker thử, việc chưa kiểm, kết luận ĐẠT hoặc KHÔNG ĐẠT (không hạ tiêu chuẩn).
```

## Lưu ý cho chủ dự án
- Các câu về giá, cọc, giữ chỗ, hoàn tiền, học thử cần chủ lớp duyệt (đánh dấu cần xác nhận trong bo-faq.json) trước khi bật thật.
- Câu hỏi người dùng sẽ gửi sang OpenAI: ghi vào chính sách quyền riêng tư.
