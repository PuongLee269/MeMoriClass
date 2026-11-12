# Bọ group router (Cloudflare Worker + OpenAI API)

Chatbot Bọ định tuyến AI-TRƯỚC: khi `ai.enabled` bật, mọi câu hỏi (ít hơn 50 từ) được gửi tới Worker; Worker gọi OpenAI REST, AI đọc NGỮ CẢNH/Ý ĐỊNH câu hỏi rồi chỉ trả `{ "id": "<nhóm>" }` hoặc `{ "id": null }`. Lý do: bộ từ khóa trả sai khi cùng một từ xuất hiện nhưng khác nghĩa (ví dụ "học phí xong rồi mình có học được gì" khớp "học phí"). Nội dung trả lời cố định nằm ở `assets/content/bo-replies.json`; AI không viết chữ. Mọi phản hồi của Worker (kể cả lỗi) chỉ có khóa `id`. Mặc định chức năng TẮT ở phía trang.

## Luồng ở trang
1. `ai.enabled` + `endpoint` bật, câu < 50 từ, còn lượt trong ngày: hiện ba chấm nhấp nháy (không có chữ), gọi Worker, chờ tối đa `timeoutMs` (8000 ms).
2. AI trả id hợp lệ: Bọ dùng câu của nhóm đó. AI trả `null` (lạc đề/không nhóm nào hợp): Bọ dùng câu dự phòng.
3. AI lỗi / timeout / hết lượt (429) / câu quá dài / tắt: rơi về bộ từ khóa `bo-matcher`, không khớp thì câu dự phòng. Không hiện lỗi.

## Dữ liệu nhóm

`groups.js` được sinh từ `assets/content/bo-replies.json` (id + tóm tắt câu trả lời + vài từ khóa tiêu biểu làm mô tả cho AI). Sau khi thêm/sửa nhóm trong JSON, chạy:

    node worker/bo-router/build-groups.mjs

Bài test thất bại nếu `groups.js` lệch `bo-replies.json`.

## Biến môi trường (`wrangler.toml`, mục `[vars]`)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | (secret, bắt buộc) | Khóa OpenAI. CHỈ là Worker secret (`npx wrangler secret put OPENAI_API_KEY`); gửi tới api.openai.com bằng header `Authorization: Bearer`, không nằm trong URL, repo, trang hay log. Thiếu khóa: Worker trả 503 `{ "id": null }` |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model phân loại nhỏ; đổi bằng biến này |
| `OPENAI_TIMEOUT_MS` | `6000` | Worker chờ OpenAI; quá hạn trả 504 |
| `OPENAI_BASE_URL` | `https://api.openai.com` | Chỉ cho đổi sang loopback localhost để test; từ chối host khác |
| `LIMITER` | `12` | Câu hỏi/phút cho mỗi IP |
| `AI_DAILY_PER_IP` | `50` | Lượt gọi AI/ngày UTC cho mỗi IP; lượt 51 trả 429 `{ "id": null }` |
| `DAILY_CAP` | `2000` | Tổng lượt gọi AI/ngày của cả Worker (chặn chi phí khi đổi IP) |
| `ALLOWED_ORIGINS` | `https://moriclass.com,https://www.moriclass.com` | Các Origin được phép |
| `DEV` | không đặt | `1` = cho thêm `http://localhost[:cổng]` (chỉ để thử cục bộ) |
| `DEBUG_USAGE` | không đặt | `1` = thêm header `x-bo-tokens: vào,ra,suy nghĩ` (chỉ khi test) |

Yêu cầu OpenAI: Chat Completions `/v1/chat/completions`, `messages` tách system/user, `temperature:0`, `max_completion_tokens:64`, `response_format` JSON Schema strict enum id + "none". Worker kiểm lại allowlist và chỉ đổi "none" thành null thật. Đầu ra hỏng, id lạ, refusal, finish_reason khác stop là lỗi 502 để trang dùng từ khóa.

Mã trạng thái: 200 `{id}` (id có thể null); 429 hết hạn mức (phút/ngày/toàn cục); 502 OpenAI lỗi; 503 OpenAI 429 hoặc thiếu khóa; 504 timeout; 4xx khác là yêu cầu sai. Trang coi mọi mã khác 200 là "AI không dùng được".

## Cache
Câu lặp được chuẩn hóa (chữ thường, bỏ dấu câu, gộp khoảng trắng, giữ dấu tiếng Việt) và lưu trong bộ nhớ của isolate (tối đa 500 câu, 1 giờ); cache trúng thì không gọi OpenAI và không tính hạn mức ngày (header `x-bo-cache: hit`). Lỗi không bị cache. Trang cũng có cache riêng (100 câu) và không tốn lượt khi trúng.

## Kiểm thử

- Mock (không cần mạng, không cần khóa): `npm test --prefix worker/bo-routertest.mjs worker/bo-router/client-test.mjs` (hoặc `npm test` trong thư mục này). Máy chủ OpenAI GIẢ kiểm: allowlist, hạn mức 50/ngày, 429, câu >= 50 từ không gọi, timeout, lỗi OpenAI, cache, header khóa, prompt, logic client và đường rơi về từ khóa.
- Thật (cần khóa, chưa chạy được nếu không có khóa): `node worker/bo-router/run-live-private.mjs` (nạp file riêng, không đặt khóa trong dòng lệnh). 20 câu đúng chủ đề (nhiều ca cùng từ khóa khác nghĩa), 10 lạc đề, 5 chèn lệnh, 3 câu dài, 51 lượt, timeout, cache; in tỉ lệ đúng từng nhóm, p50/p95, token. Đặt thêm `PRICE_IN_PER_M`/`PRICE_OUT_PER_M` (USD/1 triệu token, theo bảng giá OpenAI hiện hành) để ra ước tính chi phí/1.000 lượt; `LIVE_DELAY_MS` để nghỉ giữa lượt nếu gói miễn phí giới hạn RPM. Khóa không bao giờ được in hay ghi vào file kết quả (`live-test-result.json`, đã gitignore).

## Triển khai

1. `npx wrangler login`.
2. Xem `wrangler.toml` (Durable Object `RateLimit` có migration `v1`). Đặt khóa: `npx wrangler secret put OPENAI_API_KEY`. Không đặt khóa trong repo hay trang.
3. `node worker/bo-router/build-groups.mjs` rồi `npx wrangler deploy` (chạy trong thư mục `worker/bo-router`).
4. Trong `assets/content/bo.json` (hoặc tab "Bọ: lời chào & chữ" ở admin) đặt `ai.endpoint` là địa chỉ Worker và tích `ai.enabled`. Chưa tích thì không có lệnh gọi nào.

## Bảo mật, dữ liệu, chi phí

- CORS/Origin chỉ là rào cản trình duyệt, không phải xác thực. Yêu cầu không có Origin bị từ chối `403`. Bảo vệ thật là giới hạn tốc độ và `DAILY_CAP`.
- Body tối đa 2 KB, kiểm tra trước khi parse JSON; quá lớn trả `413`.
- Câu hỏi chỉ là dữ liệu (role `user`), prompt hệ thống yêu cầu bỏ qua mọi mệnh lệnh nằm trong câu hỏi; đầu ra qua schema enum và allowlist phía Worker nên không thể trả id ngoài danh sách hay văn bản tự do.
- Câu hỏi được gửi tới OpenAI API để phân loại; không gửi thông tin định danh hoặc khóa trong nội dung câu hỏi. Kiểm tra chính sách dữ liệu của tài khoản trước khi triển khai công khai.
- Worker không lưu và không ghi log câu hỏi (cache chỉ ở bộ nhớ tạm của isolate). Durable Object lưu bộ đếm theo IP (dữ liệu có thể nhận dạng), tự xóa bằng `alarm()` khi hết cửa sổ (60 giây cho phút, 24 giờ cho ngày/toàn cục).
- Chi phí: mỗi câu chưa cache là một lượt OpenAI; prompt khoảng 1.500-2.000 token vào (danh sách nhóm), ra vài token. Số thật đo bằng `live-test.mjs`. Đặt `DAILY_CAP` theo ngân sách.

## Giới hạn AI

- Câu hỏi: dưới 50 từ (`ai.maxQuestionWords` = 49). Câu dài hơn: trang không gọi AI (rơi về từ khóa), Worker cũng từ chối `{ "id": null }` 200 và không tính hạn mức.
- Số lượt: 50/ngày. Trang đếm theo trình duyệt, Worker đếm theo IP và ngày UTC. Worker báo 429 thì trang coi như hết hạn mức đến hết ngày và dùng từ khóa/câu dự phòng, không báo lỗi.
- Câu trả lời: AI không viết chữ, chỉ trả id (`maxOutputTokens` 32). `words.js` có `capWords(text, 29)` cho mọi đường sinh chữ sau này; hiện không dùng.
- Cấu hình ở khối `ai` của `bo.json`: `enabled` (false), `endpoint`, `maxPerDay` (50), `maxQuestionWords` (49), `maxAnswerWords` (29), `timeoutMs` (8000).

## Nạp khóa riêng trên máy chủ dự án

`node worker/bo-router/run-live-private.mjs` để tiến trình tự nạp `env/API.env`; không dùng Get-Content/cat/in biến để xem khóa. File env, .dev.vars và bộ đếm preview bị gitignore. Chưa deploy secret lên Cloudflare; khi triển khai nhập khóa trực tiếp bằng `wrangler secret put OPENAI_API_KEY`, không để khóa trong câu lệnh/chat/log.
