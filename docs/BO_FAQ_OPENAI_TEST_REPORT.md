# Bọ FAQ OpenAI — kiểm thử Worker thật

Ngày 2026-11-13. Nhánh codex/bo-faq-openai, nền claude/bo-faq eb61e6a. Model gpt-4o-mini.

## Kết quả

| Hạng mục | Kết quả |
|---|---|
| FAQ diễn đạt khác | 28/30 = 93,3% (ngưỡng 90%) |
| Ca kiến thức bổ sung | 5/5 |
| Ngoài FAQ nhưng thuộc lớp | 10/10 kiểm tự động; cả 10 dùng câu xác nhận lại có sẵn, không thêm dữ kiện |
| Lạc đề | 10/10 null không chữ |
| Chèn lệnh | 5/5 không rò, không bịa |
| Câu dài | 50/51/80 chữ: null, không token; mock xác nhận 0 gọi provider |
| Hạn mức | 50 lượt đầu 200, lượt 51 429 cùng IP qua DO thật |
| Fallback sau quota | bo-ai.js nhận ok:false; matcher tìm faq-23 cho học phí |
| Cache | Cache DO qua mạng hit; mock sống qua clear cache isolate |
| Timeout | Provider 1ms qua mạng trả 504, đã khôi phục 5000ms sau thử |
| CORS / body | Origin lạ 403, thân >2KB 413 |
| Mock | 46/46 |
| Browser | 11 trang không ghi nhận error; index FAQ học phí và widget unknown đã kiểm trực tiếp |

Độ trễ qua HTTPS: p50 1497ms; p95 2291ms; 60 lượt đo (không gồm cache, quota).
Bước 1: 296065 vào / 366 ra, 60 lệnh. Bước 2: 39692 vào / 283 ra, 26 lệnh.
Ước tính bảo thủ $0.8459/1.000 lượt theo tỷ lệ hai bước trong bộ test, chưa giảm cached input; không gồm Cloudflare hoặc request lỗi không có token header.
Giá chính thức ngày 2026-11-13: gpt-4o-mini $0.15 vào/$0.60 ra/$0.075 cached vào mỗi triệu token; https://developers.openai.com/api/docs/pricing . Trang đánh dấu model Deprecated; trước bật thật cần chọn model còn hỗ trợ và đánh giá lại, không tự đổi model giữa bộ đo.

## Triển khai thử và bằng chứng

- https://bo-router-test.ACCOUNT.workers.dev — cấu hình thường 50/ngày/IP, 12/phút; DO SQLite thật; timeout đã khôi phục.
- https://bo-router-eval.ACCOUNT.workers.dev — 200/ngày/IP, 1000/phút và DEBUG_USAGE chỉ cho bộ chất lượng. Không dùng cấu hình eval ở production.
- https://bo-router-quota-test.ACCOUNT.workers.dev — 50/ngày/IP, phút nới 1000 để test 51 nhanh. Không giả header IP client; Cloudflare cấp IP thật.
- ALLOWED_ORIGINS chỉ 127.0.0.1:8766 và localhost:8766. Không moriclass.com, không wildcard; bo.json production vẫn ai.enabled=false.
- Lượt quota đầu in log 10/20/30/40/50 HTTP 200 và 51 HTTP 429; script cũ lỗi import SAU khi gửi đủ 51 nên không giữ file từng request. Đã kiểm lại fallback sau quota thành công. network-check.mjs đã sửa ghi file sau mỗi lượt cho lần chạy sau; không ngụy tạo dòng dữ liệu bị mất.
- Live harness A/S/B/C/D/E/H báo CHƯA ĐỦ do cố ý tách bài quota/timeout; báo cáo này tổng hợp các phase riêng. Kết quả cuối đầy đủ từng câu/token từng bước trong BO_FAQ_OPENAI_NETWORK_RESULTS.json.
- bo-faq-console-check.json ghi 11 trang; bo-faq-worker-proof.png ghi widget. Kiểm lúc tải và sau hỏi hai vị trí, không khẳng định toàn bộ tương tác mọi trang.

## Câu còn sai và kiểm tay

- Chuyển khoản vào đâu: mong faq-51/faq-38, nhận câu xác nhận lại, an toàn nhưng sai FAQ.
- Link Facebook lớp: mong faq-39, nhận contact. Không đổi đáp án hoặc bịa link để đạt.
- Nhóm B: 10 câu hỏi tiện ích/chính sách chưa được dữ kiện xác nhận đều dùng UNKNOWN_REPLY. Em đã đọc từng đầu ra, không có giá/lịch/cọc/địa chỉ mới; chủ lớp vẫn cần duyệt chính sách và các mục needsConfirm trước production.

## Bảo mật và trạng thái

- Token Cloudflare được tạo/roll theo xác nhận của chủ dự án, chỉ Workers Scripts Write, hạn 7 ngày. File bí mật ở env/ bị gitignore; mã loader chỉ nhận biến môi trường. Secret OpenAI được đưa qua stdin vào Worker secret; không đưa vào log/code/ảnh.
- Cần rotate OpenAI key và Cloudflare token sau khi kết thúc test. Không tự thu hồi khóa tài khoản khác của chủ dự án.
- Chủ dự án đã chọn xóa Worker thử sau báo cáo. Đã xóa bo-router-test, bo-router-eval, bo-router-quota-test: API DELETE đều 200/success=true; xác minh settings cả ba trả 404. Danh sách namespace DO không còn mục gắn với ba script thử. Các URL ở trên là lịch sử kiểm thử, hiện không còn endpoint hoạt động.
- Kết luận hiện tại: bộ tiêu chí kỹ thuật thử đã đạt ngưỡng; **CHƯA ĐẠT toàn bộ bàn giao**, đã dọn Worker thử; còn duyệt tay chủ lớp. Không merge main, không bật moriclass.com.
