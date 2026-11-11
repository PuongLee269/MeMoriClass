# Bọ group router (Cloudflare Worker mẫu)

Worker nhận câu hỏi (tối đa 200 ký tự) khi từ khóa của Bọ không khớp, nhờ model Workers AI chọn một nhóm có sẵn, rồi chỉ trả `{ "id": "..." }` hoặc `{ "id": null }`. Mọi phản hồi (kể cả lỗi) chỉ có khóa `id`. Nội dung trả lời cố định nằm ở `assets/content/bo-replies.json`; Worker không sinh văn bản trả lời. Mặc định chức năng này TẮT ở phía trang.

## Dữ liệu nhóm

`groups.js` được sinh từ `assets/content/bo-replies.json` (id + vài từ khóa tiêu biểu làm mô tả). Sau khi thêm/sửa nhóm trong JSON, chạy:

    node worker/bo-router/build-groups.mjs

Kiểm thử (không cần mạng, model giả): `node --test worker/bo-router/test.mjs`. Bài test thất bại nếu `groups.js` lệch `bo-replies.json`, và kiểm tra CORS, body quá lớn, JSON hỏng, giới hạn tốc độ, prompt-injection.

## Biến môi trường (`wrangler.toml`, mục `[vars]`)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_MODEL` | `@cf/meta/llama-3.1-8b-instruct` | Model Workers AI |
| `LIMITER` | `12` | Số câu hỏi/phút cho mỗi IP |
| `DAILY_CAP` | `2000` | Tổng số lần gọi AI/ngày của cả Worker (chặn chi phí khi đổi IP) |
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
- Chi phí: mỗi câu không khớp từ khóa là một lần gọi Workers AI (tối đa 24 token đầu ra, prompt vài trăm token nhờ danh sách nhóm rút gọn). Phía trang giới hạn 3 lần/phiên; Worker giới hạn theo IP và theo ngày. Đặt `DAILY_CAP` theo ngân sách và xem hạn mức/billing của Workers AI trước khi bật.
- Người xem chờ tối đa `timeoutMs` (mặc định 4,5 giây) khi AI đang trả lời; hết hạn thì Bọ trả câu mặc định.
