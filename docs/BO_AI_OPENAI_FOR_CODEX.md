# Giao việc cho Codex: chuyển AI của Bọ sang API OpenAI

Repo: https://github.com/PuongLee269/MeMoriClass
Link nhánh:
- Nhánh gốc để làm (AI-trước Gemini): https://github.com/PuongLee269/MeMoriClass/tree/claude/bo-ai-gemini (CHƯA có trên GitHub, sẽ có sau khi chủ dự án nói "đưa lên")
- Nhánh dự phòng đã có sẵn trên GitHub (từ khóa trước, AI sau): https://github.com/PuongLee269/MeMoriClass/tree/claude/bo-replies-fixes
- Nhánh Codex làm tiếp (tạo mới): https://github.com/PuongLee269/MeMoriClass/tree/codex/bo-ai-openai

Nhánh gốc để làm: `claude/bo-ai-gemini` (AI-trước bằng Gemini, đã có sẵn khung, mock test 30/30). Nhánh này hiện CHỈ nằm local ở phiên Claude; cần chủ dự án nói "đưa lên" thì mới có trên GitHub. Nếu chưa có, lấy `claude/bo-replies-fixes` rồi tự làm theo mô tả dưới.
Tạo nhánh `codex/bo-ai-openai` từ đó. KHÔNG push vào `main`.

## Prompt (dán cho Codex)

```
Repo PuongLee269/MeMoriClass. Tạo nhánh codex/bo-ai-openai từ claude/bo-ai-gemini (nếu nhánh chưa có trên remote thì báo chủ dự án đẩy lên). Không push vào main. Tiếng Việt. Báo cáo cuối tối đa 12 dòng.

Mục tiêu: đổi nhà cung cấp AI của chatbot Bọ từ Google Gemini sang API OpenAI (mô hình nhỏ, rẻ, nhanh; tên mô hình đặt qua biến OPENAI_MODEL, chủ dự án chọn). GIỮ NGUYÊN thiết kế:
- AI-TRƯỚC: AI đọc ngữ cảnh/ý định câu hỏi rồi chọn nhóm trả lời; AI KHÔNG viết câu trả lời. Chỉ trả {id} (id nằm trong allowlist) hoặc {id:null}. Câu trả lời lấy từ assets/content/bo-replies.json.
- AI lỗi/timeout/hết lượt (429/5xx) -> client rơi về bo-matcher từ khóa, rồi câu dự phòng. AI trả null thật (lạc đề) -> câu dự phòng. Không hiện lỗi, không thêm chữ hướng dẫn lên trang.
- Giới hạn: 50 lượt AI/ngày/IP (Durable Object), câu hỏi <50 chữ (từ 50 chữ trở lên không gọi AI), cache câu lặp, timeout.
- Khóa API CHỈ là Worker secret (OPENAI_API_KEY), không vào repo/log/ảnh/báo cáo. Câu hỏi người dùng chỉ là dữ liệu, chống chèn lệnh.

Việc cần làm:
1. worker/bo-router/index.js: thay askGemini bằng gọi OpenAI (Responses hoặc Chat Completions, tự chọn cái ổn định), structured output/JSON schema với enum id + "none" (none -> null), temperature thấp, max tokens nhỏ, kiểm allowlist lần nữa ở Worker. Lỗi nhà cung cấp trả 502/503/504 (khác với null thật 200) để client rơi về từ khóa. Đổi tên biến/README/wrangler.toml/docs/ADMIN.md.
2. Giữ prompt hệ thống (đọc ngữ cảnh, ví dụ "giá trị của việc kể chuyện" không phải học phí) và groups.js (id + mô tả).
3. Mock test: node --test worker/bo-router/ phải pass (sửa mock giả OpenAI). Live-test: worker/bo-router/live-test.mjs (>=40 câu, 51 lượt, p50/p95, token, chi phí/1.000 lượt) chạy được khi có OPENAI_API_KEY. Chạy thật, dùng LIVE_DELAY_MS nếu bị giới hạn tốc độ.
4. Chỉ báo ĐẠT khi: nhóm A >= 90%, lạc đề 10/10 null, chèn lệnh 5/5 an toàn, 3 câu >=50 chữ 0 lệnh gọi AI, lượt 51 bị 429 mà Bọ vẫn trả lời bằng từ khóa, cache hoạt động, không lỗi console trên các trang. Mục nào không đạt thì sửa mô tả nhóm trong bo-replies.json (không bịa thông tin thật) và test lại.
5. Commit trên codex/bo-ai-openai, push nhánh đó. Báo cáo: bảng kết quả rút gọn, p50/p95, token và chi phí/1.000 lượt (giá lấy từ trang giá OpenAI hiện hành), việc chưa kiểm, kết luận ĐẠT/KHÔNG ĐẠT.
```

## Kết quả đã có với Gemini (để so sánh)
- Mô hình `gemini-3.5-flash-lite`: p50 0,9 s, p95 2,1 s; ~2.970 token vào, 10 ra mỗi lượt (prompt nhóm khá dài, cần lưu đệm prompt nếu nhà cung cấp hỗ trợ).
- Nhóm A đúng chủ đề: 17/20. Sai: "lịch sử điện ảnh có được dạy không" (null), "cho mình xin lịch sử thành lập của Me.Mori" (null), "mấy giờ thì có thể gọi điện hỏi được" (ra schedule, mong contact). Ca cùng từ khóa khác nghĩa ("học phí xong rồi mình có học được gì", "giá trị của việc kể chuyện") đúng.
- Nhiều lượt bị nhà cung cấp từ chối do giới hạn tốc độ gói miễn phí nên nhóm lạc đề/51 lượt chưa kiểm hết.
- Lưu ý chạy test trong môi trường Claude cloud: Node không tự đi qua proxy; cần `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`. Khóa được proxy gắn theo host nên với OpenAI host là `api.openai.com`.
