# Bọ FAQ — GPT-6 Luna low (2026-11-14)

Model được chủ dự án xác nhận: OPENAI_MODEL=gpt-6-luna, OPENAI_REASONING_EFFORT=low. “Light” là cách gọi của chủ dự án, không dùng model ID tự đặt gpt-6-luna-light.

## Kết quả kiểm thử

| Hạng mục | Đạt |
|---|---|
| FAQ diễn đạt khác | 30/30 (100%, ngưỡng >=90%) |
| Ca bổ sung trong kiến thức | 5/5 |
| Ngoài FAQ trong phạm vi | 10/10 |
| Lạc đề | 10/10 |
| Chèn lệnh | 5/5 |
| Câu >=50 chữ | 3/3, không token AI; mock xác nhận không gọi provider |
| Cache mạng thật | 1/1 |
| Quota DO thật | 50 lượt 200; lượt 51 429; client ok:false và fallback faq-23 |
| Timeout thật | 504 khi ép provider 1ms |
| CORS/body | Origin lạ 403; >2KB 413 |
| Mock | 47/47 |
| Browser | index và widget gọi Worker thật; 11 trang chưa ghi nhận error khi tải |

p50 2651ms; p95 3965ms; n=60 (chỉ lượt thành công không cache, không gồm quota).
Bước 1: 295885 token vào / 2392 ra, 60 lệnh. Bước 2: 36556 vào / 504 ra, 24 lệnh. Token ra đã gồm reasoning; từng câu trong BO_FAQ_LUNA_NETWORK_RESULTS.json.
Chi phí bảo thủ $0.5782/1.000 lượt theo tỷ lệ hai bước của bộ 60 câu; chưa giảm cached input, chưa gồm Cloudflare/failed retries. Giá Standard: $0.10 vào, $0.50 ra, $0.01 cached vào mỗi triệu token; kiểm 2026-11-14 tại https://developers.openai.com/api/docs/models/gpt-6-luna .

## Đối chiếu nội dung và thay đổi

- Cả hai câu sai ở bản 4o-mini (chuyển khoản vào đâu; link Facebook lớp) đã chọn đúng FAQ trong lượt Luna này; không thay đáp án test hoặc thêm dữ kiện.
- 10 câu nhóm B: 9 câu dùng UNKNOWN_REPLY. Một câu về phần trò chuyện khái niệm buổi đầu trả 30–60 phút; đã đối chiếu trực tiếp knowledge.js có đúng dữ kiện này. Không coi câu trả lời AI là chính sách mới. Các mục needsConfirm vẫn cần chủ lớp duyệt trước bật thật.
- Chat Completions dùng reasoning_effort=low, bỏ temperature cho Luna; max_completion_tokens tối thiểu 1024 dành cả suy luận và JSON. Nội dung hiển thị vẫn bị kiểm <=60 chữ, không đổi hạn mức 50/ngày/IP hay câu <50 chữ.
- Cache identity gồm model + effort để không dùng kết quả model cũ. Không sửa FAQ/knowledge hoặc UI trong lần chuyển model này.
- So với gpt-4o-mini trong báo cáo cũ: FAQ 28/30 -> 30/30; p50 1497 -> 2651ms, p95 2291 -> 3965ms; ước tính $0.8459 -> $0.5782/1000 (bộ đo độc lập, tỷ lệ hai bước có khác).

## Triển khai, bằng chứng và kết luận

- Đã deploy bo-router-eval (200/ngày/IP để đánh giá >60 câu), bo-router-quota-test (50/ngày/IP, nới phút để test nhanh), bo-router-test (timeout1ms). Cả ba có DO thật; không dùng cấu hình đánh giá cho production.
- URL lịch sử: https://bo-router-eval.phuongfilmmaker.workers.dev ; https://bo-router-quota-test.phuongfilmmaker.workers.dev ; https://bo-router-test.phuongfilmmaker.workers.dev .
- Đã xóa lại cả ba theo chỉ đạo giữ dọn sau test: DELETE 200/success, settings 404, không còn namespace DO gắn script thử. Không có endpoint thử hoạt động sau bàn giao.
- Kết quả script live-test vẫn báo CHƯA ĐỦ vì cố ý tách nhóm quota/timeout; báo cáo này tổng hợp bộ chất lượng với network-check qua các Worker riêng. Không hạ ngưỡng hoặc đổi expected.
- Bằng chứng: BO_FAQ_LUNA_NETWORK_RESULTS.json, BO_FAQ_LUNA_CONTROLS.json, bo-luna-console-check.json, bo-luna-proof.png. Dữ liệu nhạy cảm không nằm trong các file này.
- **ĐẠT bộ kiểm thử kỹ thuật chuyển model Luna low**. Chưa phải phê duyệt production: chủ lớp cần duyệt FAQ/chính sách needsConfirm; không cam kết chất lượng mọi câu ngoài bộ test.
- Không đổi main, không bật AI trên moriclass.com. Các Worker thử đã xóa. Nhắc chủ tài khoản rotate OpenAI key và thu hồi token Cloudflare dùng thử; chưa tự đổi/thu hồi credential của tài khoản.
