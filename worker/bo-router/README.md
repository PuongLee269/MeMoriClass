# Bọ group router (Cloudflare Worker mẫu)

Worker nhận câu hỏi (ít hơn 50 từ; từ 50 từ trở lên trả `{ "id": null }` 200 và không gọi AI) khi AI được bật, nhờ GPT-6 Luna chọn một nhóm có sẵn, rồi chỉ trả `{ "id": "..." }` hoặc `{ "id": null }`. Mọi phản hồi (kể cả lỗi) chỉ có khóa `id`. Nội dung trả lời cố định nằm ở `assets/content/bo-replies.json`; Worker không sinh văn bản trả lời. Mặc định chức năng này TẮT ở phía trang.

## Dữ liệu nhóm

`groups.js` được sinh từ `assets/content/bo-replies.json` (id + từ khóa + nội dung trả lời đã duyệt làm mô tả). Lệnh dưới cũng đồng bộ `cli-schema.json`. Sau khi thêm/sửa nhóm trong JSON, chạy:

    node worker/bo-router/build-groups.mjs

Kiểm thử (không cần mạng, model giả): `node --test worker/bo-router/test.mjs`. Bài test thất bại nếu `groups.js` lệch `bo-replies.json`, và kiểm tra CORS, body quá lớn, JSON hỏng, giới hạn tốc độ, prompt-injection.

## Biến môi trường (`wrangler.toml`, mục `[vars]`)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_MODEL` | `openai/gpt-6-luna` | GPT-6 Luna qua Workers AI binding, không dùng `OPENAI_API_KEY` |
| `LIMITER` | `12` | Số câu hỏi/phút cho mỗi IP |
| `AI_DAILY_PER_IP` | `50` | Số lần gọi AI/ngày UTC cho mỗi IP; lần 51 trả 429 `{ "id": null }` |
| `DAILY_CAP` | `2000` | Tổng số lần gọi AI/ngày của cả Worker (tách riêng với hạn mức theo IP, chặn chi phí khi đổi IP) |
| `ALLOWED_ORIGINS` | `https://moriclass.com,https://www.moriclass.com` | Các Origin được phép, ngăn cách bằng dấu phẩy |
| `DEV` | không đặt | `1` = cho thêm `http://localhost[:cổng]` (chỉ để thử cục bộ, đừng bật khi chạy thật) |

## Triển khai

1. `npx wrangler login`.
2. Binding `AI` dùng Workers AI trên tài khoản Cloudflare; không cấu hình hoặc lưu `OPENAI_API_KEY`.
3. `node worker/bo-router/build-groups.mjs` rồi `npx wrangler deploy` (chạy trong thư mục `worker/bo-router`).
4. Trong `assets/content/bo.json` (hoặc tab "Bọ: lời chào & chữ" ở admin) đặt `ai.endpoint` là địa chỉ Worker và tích `ai.enabled`. Chưa tích thì không có lệnh gọi nào.

## Bảo mật, dữ liệu, chi phí

- CORS/Origin chỉ là rào cản trình duyệt, không phải xác thực: Origin giả được dễ dàng khi gọi bằng công cụ. Yêu cầu không có Origin (curl, máy chủ) bị từ chối `403` vì trình duyệt luôn gửi Origin khi gọi chéo miền. Bảo vệ thật là giới hạn tốc độ và `DAILY_CAP`.
- Body tối đa 2 KB, kiểm tra trước khi parse JSON; quá lớn trả `413`.
- Câu hỏi được truyền ở message `user`, hướng dẫn và danh sách nhóm nằm ở message `system`. Đầu ra model được kiểm với allowlist id phía Worker; id lạ hoặc đầu ra hỏng trả `{ "id": null }` (HTTP 200).
- Worker không lưu và không ghi log câu hỏi. NHƯNG Durable Object lưu bộ đếm theo địa chỉ IP (một object cho mỗi IP và một object `global`); đây là dữ liệu có thể nhận dạng. Mỗi object tự xóa sạch dữ liệu bằng `alarm()` khi hết cửa sổ đếm (60 giây cho IP, 24 giờ cho `global`). Không có IP thì dùng chung bộ đếm `unknown`.
- Chi phí: mỗi câu hợp lệ trong hạn mức là một lần gọi GPT-6 Luna (`max_completion_tokens` 16). Phía trang giới hạn 50 lần/ngày/trình duyệt (`ai.maxPerDay`); Worker giới hạn theo IP và theo ngày. Đặt `DAILY_CAP` theo ngân sách và xem hạn mức/billing Workers AI trước khi bật.
- Người xem chờ tối đa `timeoutMs` (mặc định 4,5 giây) khi AI đang trả lời; hết hạn thì Bọ trả câu mặc định.

## Giới hạn AI (từ khóa vẫn không giới hạn)

- AI chọn nhóm trước cho mọi câu hợp lệ trong hạn mức. Khi không nhận được id hợp lệ (AI tắt, null, lỗi, timeout, câu dài hoặc hết lượt), trang dùng từ khóa/câu dự phòng; từ khóa không bị giới hạn.
- Câu hỏi: dưới 50 từ (`ai.maxQuestionWords` = 49, đếm theo khoảng trắng). Câu dài hơn: trang không gọi AI, Worker cũng từ chối.
- Số lần: 50/ngày. Trang đếm theo trình duyệt (localStorage, rơi về sessionStorage), Worker đếm theo IP và ngày UTC. Khi Worker báo 429 trang coi như hết hạn mức đến hết ngày và im lặng dùng từ khóa/câu mặc định, không báo lỗi.
- Câu trả lời: AI không viết chữ, Worker chỉ trả `{ "id": ... }`; có thể bật JSON Schema bằng `AI_JSON=1`. `words.js` có `capWords(text, 29)` cho mọi đường sinh chữ sau này; hiện không được dùng.
- Cấu hình trong khối `ai` của `bo.json`: `enabled` (false), `endpoint`, `maxPerDay` (50), `maxQuestionWords` (49), `maxAnswerWords` (29), `timeoutMs` (4500). Trang không cho đặt các số vượt các mức trên.

## Kiểm thử bằng CLI của tài khoản (không dùng API key)
- Chạy `node worker/bo-router/cli-eval.mjs`: 35 lời gọi riêng bằng `codex exec --model gpt-6-luna`, ghi kết quả và usage thật vào `cli-results.json`. CLI phải đăng nhập và có quyền ghi trạng thái trong hồ sơ tài khoản.
- Chạy `node worker/bo-router/cli-local.mjs`: endpoint chỉ nghe `http://127.0.0.1:8788`. Dùng bản cấu hình xem thử với `ai.enabled=true`, endpoint trên; không đổi cấu hình production.
- Endpoint dùng lại validator/CORS/giới hạn Worker, ép IP theo socket (bỏ header IP người gọi gửi), timeout 7,5 giây (bản xem thử đặt ai.timeoutMs=8000). Bộ đếm RAM chỉ phục vụ thử nghiệm và mất khi khởi động lại.
- CLI chạy theo sandbox read-only; đầu ra ngoài JSON/id hợp lệ bị loại. Không mở endpoint thử này ra Internet.
- CLI có chi phí khởi động và ngữ cảnh riêng; token usage bao gồm ngữ cảnh CLI, không tương đương token một request Workers AI. Không quy đổi tiền từ token CLI khi tài khoản không cung cấp đơn giá.
- Cloudflare Worker không chạy được tiến trình CLI. Binding Workers AI trong wrangler.toml là phương án riêng; không coi là đã kiểm thử thật hoặc đã được bật bằng tài khoản CLI.

## Bản xem thử HTTPS đã được chủ dự án cho phép

Chạy `node worker/bo-router/online-preview.mjs`, rồi mở tunnel đến `http://127.0.0.1:8789`. Máy chủ chỉ phục vụ các trang được liệt kê và assets; chặn thư mục Git/Worker, bật AI qua cấu hình JSON động và endpoint cùng origin `bo-ai`. File cấu hình production không đổi.

Bản thử dùng hạn mức chung **50 AI/ngày** cho mọi người, nghiêm hơn 50/IP; bộ đếm lưu tại `.preview-rate-state.json` (gitignore) để không reset khi khởi động lại. Khi đang xử lý một câu, câu đồng thời bị từ chối. Timeout CLI 7,5 giây, trang 8 giây; hết lượt/lỗi dùng từ khóa. Chỉ công khai khi có sự cho phép của chủ tài khoản CLI. Link tạm phụ thuộc máy và tunnel đang chạy.
