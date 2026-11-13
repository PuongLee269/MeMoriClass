# Giao việc cho Codex: triển khai thử Worker Bọ (OpenAI) và hoàn tất test

Repo: https://github.com/PuongLee269/MeMoriClass
Nhánh làm tiếp: https://github.com/PuongLee269/MeMoriClass/tree/codex/bo-ai-openai (commit `f39c499`). Làm tiếp trên chính nhánh này. KHÔNG merge/push `main`. KHÔNG bật AI trên moriclass.com.

## Prompt (dán cho Codex)

```
Repo PuongLee269/MeMoriClass, làm tiếp trên nhánh codex/bo-ai-openai (f39c499). Không push main, không bật AI trên moriclass.com. Tiếng Việt. Báo cáo cuối tối đa 12 dòng. Đọc CLAUDE.md và docs/WORKER_RULES.md trước.

Mục tiêu: hoàn tất các mục còn "chưa kiểm" trong docs/BO_AI_OPENAI_TEST_REPORT.md, rồi mới được báo ĐẠT.

Việc cần làm:
1. Triển khai THỬ Worker worker/bo-router lên Cloudflare bằng wrangler, tên Worker khác production (ví dụ bo-router-test). Có Durable Object thật (RATE_LIMIT) theo wrangler.toml. Khóa OPENAI_API_KEY chỉ nhập bằng `wrangler secret put` (hoặc biến môi trường khi chạy lệnh), KHÔNG ghi vào repo, log, ảnh chụp, báo cáo. Nếu thiếu quyền/đăng nhập Cloudflare thì dừng và báo chủ dự án cần cung cấp gì (CLOUDFLARE_API_TOKEN đặt trong môi trường, không dán vào chat).
2. ALLOWED_ORIGINS của bản thử phải cho phép nguồn dùng để thử (localhost của máy chủ tĩnh, link xem thử); KHÔNG thêm "*".
3. Chạy lại live-test trỏ vào URL Worker thử (LIVE_BASE_URL hoặc cách tương đương), gồm: 20 câu đúng chủ đề (mục tiêu >= 90%), 10 lạc đề (null), 5 chèn lệnh, 3 câu >= 50 chữ (0 lệnh gọi AI), lượt 51 từ cùng IP bị 429 và Bọ vẫn trả lời bằng từ khóa, timeout, cache, CORS (nguồn lạ bị chặn), giới hạn thân 2KB. Đo p50/p95 qua mạng thật, token, chi phí/1.000 lượt (lấy giá hiện hành từ trang giá OpenAI, ghi ngày và nguồn).
4. Hai câu còn sai ("lịch sử thành lập của Me.Mori", "bao giờ thì bắt đầu lớp mới" ra null): chỉ sửa mô tả/từ khóa nhóm trong assets/content/bo-replies.json nếu hợp lý; KHÔNG bịa thông tin thật (học phí, lịch, địa điểm, giảng viên...). Nếu nhóm đó chưa có dữ liệu thì chấp nhận null và ghi rõ trong báo cáo.
5. Mở trang bằng máy chủ tĩnh với ai.enabled=true + endpoint Worker thử, hỏi bằng widget Bọ và chat ở index.html; kiểm không lỗi console trên index, khampha, lopf1, sitemap, method, roadmap, gallery, community, dangky, gioithieu, home-backup. Không thêm chữ hướng dẫn nào lên trang. Trạng thái chờ chỉ là dấu chấm nhấp nháy.
6. Dọn: worker/bo-router/load-private-env.mjs hiện đọc file env/API.env; đổi sang đọc biến môi trường thường (process.env.OPENAI_API_KEY), không đọc file bí mật trong repo. Đảm bảo .gitignore chặn env/, .dev.vars*, live-test-result.json, các file bộ đếm. Chạy `git diff --cached` kiểm không có khóa (mẫu sk-...) trước khi commit.
7. Cuối cùng XÓA/vô hiệu Worker thử nếu chủ dự án không giữ lại, và nhắc chủ dự án đổi (rotate) khóa OpenAI đã dùng để test.
8. Commit và push nhánh codex/bo-ai-openai. Báo cáo: bảng kết quả rút gọn A–H, p50/p95, token, chi phí/1.000 lượt (kèm nguồn giá), URL Worker thử, việc chưa kiểm, kết luận ĐẠT hoặc KHÔNG ĐẠT (không hạ tiêu chuẩn).
```

## Chủ dự án cần chuẩn bị
- Tài khoản Cloudflare (gói miễn phí đủ cho thử) và `CLOUDFLARE_API_TOKEN` (quyền Workers + Durable Objects) đặt trong môi trường của Codex, không dán vào chat.
- Khóa OpenAI mới, đặt hạn mức chi tiêu bên OpenAI. Đổi khóa sau khi test xong.
- Câu hỏi người dùng sẽ gửi sang OpenAI: ghi vào chính sách quyền riêng tư trước khi bật thật.
