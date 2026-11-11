# Bọ group router (Cloudflare Worker mẫu)

Worker nhận câu hỏi (ít hơn 50 từ; từ 50 từ trở lên trả `{ "id": null }` 200 và không gọi AI) khi từ khóa của Bọ không khớp, nhờ model Workers AI chọn một nhóm có sẵn, rồi chỉ trả `{ "id": "..." }` hoặc `{ "id": null }`. Mọi phản hồi (kể cả lỗi) chỉ có khóa `id`. Nội dung trả lời cố định nằm ở `assets/content/bo-replies.json`; Worker không sinh văn bản trả lời. Mặc định chức năng này TẮT ở phía trang.

## Dữ liệu nhóm

`groups.js` được sinh từ `assets/content/bo-replies.json` (id + vài từ khóa tiêu biểu làm mô tả). Sau khi thêm/sửa nhóm trong JSON, chạy:

    node worker/bo-router/build-groups.mjs

Kiểm thử (không cần mạng, model giả): `node --test worker/bo-router/test.mjs`. Bài test thất bại nếu `groups.js` lệch `bo-replies.json`, và kiểm tra CORS, body quá lớn, JSON hỏng, giới hạn tốc độ, prompt-injection.

## Biến môi trường (`wrangler.toml`, mục `[vars]`)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_MODEL` | `@cf/meta/llama-3.1-8b-instruct` | Model Workers AI |
| `LIMITER` | `12` | Số câu hỏi/phút cho mỗi IP |
| `AI_DAILY_PER_IP` | `50` | Số lần gọi AI/ngày UTC cho mỗi IP; lần 51 trả 429 `{ "id": null }` |
| `DAILY_CAP` | `2000` | Tổng số lần gọi AI/ngày của cả Worker (tách riêng với hạn mức theo IP, chặn chi phí khi đổi IP) |
| `ALLOWED_ORIGINS` | `https://moriclass.com,https://www.moriclass.com` | Các Origin được phép, ngăn cách bằng dấu phẩy |
| `DEV` | không đặt | `1` = cho thêm `http://localhost[:cổng]` (chỉ để thử cục bộ, đừng bật khi chạy thật) |
| `AI_JSON` | không đặt | `1` = gửi `response_format` kiểu json_schema (chỉ một số model Workers AI hỗ trợ; chưa thử trên tài khoản thật, nếu lỗi hãy bỏ biến này). Không đặt thì Worker vẫn tự trích `{"id":...}` từ đầu ra và kiểm allowlist |

## Triển khai

1. `npx wrangler login`.
2. Xem lại `wrangler.toml` (binding `AI` dùng Workers AI, không cần khóa API; Durable Object `RateLimit` có migration `v1`). Nếu dùng nhà cung cấp ngoài, chỉ lưu khóa bằng `npx wrangler secret put API_KEY`, không đặt khóa trong repo hay trang.
3. `node worker/bo-router/build-groups.mjs` rồi `npx wrangler deploy` (chạy trong thư mục `worker/bo-router`).
4. Trong `assets/content/bo.json` (hoặc tab "Bọ: lời chào & chữ" ở admin) đặt `ai.endpoint` là địa chỉ Worker và tích `ai.enabled`. Chưa tích thì không có lệnh gọi nào.

## Bảo mật, dữ liệu, chi phí

- CORS/Origin chỉ là rào cản trình duyệt, không phải xác thực: Origin giả được dễ dàng khi gọi bằng công cụ. Yêu cầu không có Origin (curl, máy chủ) bị từ chối `403` vì trình duyệt luôn gửi Origin khi gọi chéo miền. Bảo vệ thật là giới hạn tốc độ và `DAILY_CAP`.
- Body tối đa 2 KB, kiểm tra trước khi parse JSON; quá lớn trả `413`.
- Câu hỏi người dùng đặt ở message `user`, chỉ dẫn và danh sách nhóm ở `system`. Đầu ra model được kiểm với allowlist id phía Worker; id lạ hoặc đầu ra hỏng trả `{ "id": null }` (HTTP 200).
- Worker không lưu và không ghi log câu hỏi. NHƯNG Durable Object lưu bộ đếm theo địa chỉ IP (một object cho mỗi IP và một object `global`); đây là dữ liệu có thể nhận dạng. Mỗi object tự xóa sạch dữ liệu bằng `alarm()` khi hết cửa sổ đếm (60 giây cho IP, 24 giờ cho `global`). Không có IP thì dùng chung bộ đếm `unknown`.
- Chi phí: mỗi câu không khớp từ khóa là một lần gọi Workers AI (`max_tokens` 16, prompt vài trăm token nhờ danh sách nhóm rút gọn). Phía trang giới hạn 50 lần/ngày/trình duyệt (`ai.maxPerDay`); Worker giới hạn theo IP và theo ngày. Đặt `DAILY_CAP` theo ngân sách và xem hạn mức/billing của Workers AI trước khi bật.
- Người xem chờ tối đa `timeoutMs` (mặc định 4,5 giây) khi AI đang trả lời; hết hạn thì Bọ trả câu mặc định.

## Giới hạn AI (từ khóa vẫn không giới hạn)

- Từ khóa luôn trả lời trước và không bị giới hạn. Chỉ câu không khớp mới có thể gọi AI.
- Câu hỏi: dưới 50 từ (`ai.maxQuestionWords` = 49, đếm theo khoảng trắng). Câu dài hơn: trang không gọi AI, Worker cũng từ chối.
- Số lần: 50/ngày. Trang đếm theo trình duyệt (localStorage, rơi về sessionStorage), Worker đếm theo IP và ngày UTC. Khi Worker báo 429 trang coi như hết hạn mức đến hết ngày và im lặng dùng từ khóa/câu mặc định, không báo lỗi.
- Câu trả lời: AI không viết chữ, Worker chỉ trả `{ "id": ... }` với `max_tokens` 16. `words.js` có `capWords(text, 29)` (cắt tối đa 29 từ, không tính URL) cho mọi đường sinh chữ sau này; hiện không được dùng.
- Cấu hình trong khối `ai` của `bo.json`: `enabled` (false), `endpoint`, `maxPerDay` (50), `maxQuestionWords` (49), `maxAnswerWords` (29), `timeoutMs` (4500). Trang không cho đặt các số vượt các mức trên.
