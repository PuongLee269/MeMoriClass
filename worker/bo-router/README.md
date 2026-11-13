# Bọ group router (Cloudflare Worker + OpenAI API)

Chatbot Bọ định tuyến AI-TRƯỚC: khi `ai.enabled` bật, mọi câu hỏi (ít hơn 50 từ) được gửi tới Worker; Worker gọi OpenAI REST, AI đọc NGỮ CẢNH/Ý ĐỊNH câu hỏi rồi chỉ trả `{ "id": "<nhóm>" }` hoặc `{ "id": null }`. Lý do: bộ từ khóa trả sai khi cùng một từ xuất hiện nhưng khác nghĩa (ví dụ "học phí xong rồi mình có học được gì" khớp "học phí"). Nội dung trả lời cố định nằm ở `assets/content/bo-replies.json`; AI không viết chữ. Mọi phản hồi của Worker (kể cả lỗi) chỉ có khóa `id`. Mặc định chức năng TẮT ở phía trang.

## Luồng ở trang (AI-trước, theo CÂU HỎI CỤ THỂ)
1. `ai.enabled` + `endpoint` bật, câu < 50 từ, còn lượt trong ngày: hiện ba chấm nhấp nháy (không có chữ), gọi Worker, chờ tối đa `timeoutMs` (8000 ms).
2. Worker chạy HAI BƯỚC theo thứ tự ưu tiên (câu có sẵn trước, tự trả lời sau):
   - **Bước 1 (chọn câu hỏi có sẵn):** AI nhận câu hỏi + danh sách FAQ (id, chủ đề, 2 câu hỏi mẫu) + nhóm dẫn đường/xã giao, đọc NGỮ CẢNH/Ý ĐỊNH và trả `{id}` của câu hỏi có sẵn SÁT NGHĨA nhất, hoặc `none`. Có id hợp lệ thì trả đúng câu trả lời có sẵn (trang giữ câu trả lời; Worker chỉ trả id), không gọi bước 2.
   - **Bước 2 (chỉ khi `none`):** AI viết câu trả lời ngắn (<= 60 chữ, giọng Bọ) CHỈ dựa trên bản tóm tắt dữ kiện đã xác nhận trong `knowledge.js`. Đầu ra `{kind: answer|unknown|offtopic, answer}`. `unknown` (trong phạm vi nhưng chưa chốt/không có) -> Worker trả câu có sẵn "Mình chưa muốn thông tin sai cho bạn..." (`meta.unknownReply` trong `bo-faq.json`). `offtopic` (lạc đề/chèn lệnh) -> `{id:null}` không chữ, trang dùng câu dự phòng. `answer` phải qua `checkAnswer()` (độ dài, không URL/email/khóa/"system prompt", không số tiền ngoài 2.400.000đ/1.500.000đ, không ngày/giờ/địa chỉ/"miễn phí"...) nếu không thì thay bằng câu "chưa muốn thông tin sai".
3. Phản hồi Worker: `{ "id": "<faq|nhóm>" }`, hoặc `{ "id": null, "answer": "..." }` (tự trả lời), hoặc `{ "id": null }`. Trang: id hợp lệ -> câu có sẵn; không id nhưng có `answer` -> hiển thị `answer` cùng giao diện; không có gì -> câu dự phòng.
4. AI lỗi / timeout / hết lượt (429) / câu quá dài / tắt: rơi về bộ từ khóa `bo-matcher` HAI TẦNG (tầng 1 = FAQ, mỗi câu hỏi mẫu là một khóa; tầng 2 = nhóm cũ), không khớp thì câu dự phòng. Không hiện lỗi.

## Dữ liệu

- `assets/content/bo-faq.json` (+ `defaults/`): các FAQ. Mỗi mục: `id` (faq-01...), `status` (XAC_NHAN, CHUA_CHOT, ...), `topic`, `needsConfirm`, `questions` (>= 8 cách hỏi), `answer`, `link` (trang có thật trong repo hoặc bỏ trống). Câu trả lời lấy từ kho kiến thức của người tổ chức, giữ đúng nghĩa; mục chưa chốt (cọc, hoàn tiền, học thử, lịch, địa chỉ, link đăng ký, tuổi) trả lời theo mẫu "đang hoàn thiện / nhờ người phụ trách xác nhận", không bịa.
- `assets/content/bo-replies.json`: 67 nhóm cũ (dẫn đường/xã giao...). Nhóm trùng FAQ (giá, ưu đãi, lịch, địa điểm, hoàn tiền, học thử, giới thiệu...) đã được sửa cho khớp FAQ và KHÔNG đưa cho AI chọn (`FAQ_OVERLAP` trong `build-groups.mjs`); bộ từ khóa dự phòng vẫn dùng chúng.
- `faq.js` (cho AI) và khối nhúng `BO_REPLIES`/`BO_FAQ` trong `assets/bo-replies.js` được SINH từ hai file JSON. Sau khi sửa FAQ/nhóm (kể cả bằng admin), chạy:

      node worker/bo-router/build-groups.mjs

  rồi `npx wrangler deploy` để Worker biết FAQ/chủ đề mới (câu trả lời hiển thị lấy từ JSON của trang nên đổi chữ trả lời không cần deploy Worker). Bài test thất bại nếu các file sinh ra lệch nguồn.
- `knowledge.js`: bản tóm tắt kiến thức AN TOÀN cho bước 2. Nằm trong kho công khai nên chỉ có dữ kiện đã xác nhận và quy tắc ứng xử; KHÔNG đưa link nội bộ, ý tưởng chính sách chưa duyệt hay thông tin riêng tư. Khi chính sách được chốt, sửa `knowledge.js` và `bo-faq.json` cùng lúc.
- `provider.js`: MỌI lệnh gọi mô hình đi qua hàm `generate(env, {system,user,schema,maxOutputTokens,timeoutMs})`. Hiện là OpenAI. Đổi sang OpenAI: viết `generateOpenAI` cùng đầu vào/ra rồi đổi một dòng trong `generate()`; `index.js` không biết nhà cung cấp.

## Biến môi trường (`wrangler.toml`, mục `[vars]`)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | (secret, bắt buộc) | Khóa OpenAI. CHỈ là Worker secret (`npx wrangler secret put OPENAI_API_KEY`); gửi tới api.openai.com bằng header Authorization: Bearer, không nằm trong URL, repo, trang hay log. Thiếu khóa: Worker trả 503 `{ "id": null }` |
| `OPENAI_MODEL` | `gpt-6-luna` | Model nhỏ cho hai bước FAQ; đổi bằng biến này |
| `OPENAI_REASONING_EFFORT` | `low` | Mức suy luận Luna theo lựa chọn chủ dự án; nằm trong cache identity |
| `OPENAI_TIMEOUT_MS` | `5000` | Mỗi bước chờ OpenAI; quá hạn trả 504 |
| `AI_TOTAL_TIMEOUT_MS` | `7500` | Tổng thời gian hai bước (trang chờ Worker tối đa 8000 ms) |
| `OPENAI_BASE_URL` | `https://api.openai.com` | Chỉ cho đổi sang localhost/127.0.0.1 để mock, không gửi khóa tới host tùy ý |
| `LIMITER` | `12` | Câu hỏi/phút cho mỗi IP |
| `AI_DAILY_PER_IP` | `50` | Lượt gọi AI/ngày UTC cho mỗi IP; lượt 51 trả 429 `{ "id": null }` |
| `DAILY_CAP` | `2000` | Tổng lượt gọi AI/ngày của cả Worker (chặn chi phí khi đổi IP) |
| `ALLOWED_ORIGINS` | `https://moriclass.com,https://www.moriclass.com` | Các Origin được phép |
| `DEV` | không đặt | `1` = cho thêm `http://localhost[:cổng]` (chỉ để thử cục bộ) |
| `DEBUG_USAGE` | không đặt | `1` = thêm header `x-bo-tokens` (bước 1) và `x-bo-tokens2` (bước 2): `vào,ra,suy nghĩ` (chỉ khi test) |

Yêu cầu OpenAI: Chat Completions, messages tách system/user, Luna dùng reasoning_effort=low, bỏ temperature; max_completion_tokens tối thiểu 1024 gồm token suy luận, không phải giới hạn chữ hiển thị. Model cũ dùng temperature thấp; ngân sách token theo từng bước, response_format JSON Schema strict. Schema bổ sung additionalProperties:false, trường tùy chọn được đổi thành nullable. Bước 1 enum FAQ/navigation/none; bước 2 kind answer/unknown/offtopic và answer nullable. Worker giữ bộ kiểm câu tự trả lời tối đa 60 chữ. Refusal, thiếu nội dung, đầu ra bị cắt và lỗi HTTP được coi là lỗi nhà cung cấp.

Mã trạng thái: 200 `{id}` (id có thể null); 429 hết hạn mức (phút/ngày/toàn cục); 502 OpenAI lỗi; 503 OpenAI 429 hoặc thiếu khóa; 504 timeout; 4xx khác là yêu cầu sai. Trang coi mọi mã khác 200 là "AI không dùng được".

## Cache
Câu lặp được chuẩn hóa (chữ thường, bỏ dấu câu, gộp khoảng trắng, giữ dấu tiếng Việt), cache nóng trong isolate (500 câu) và cache bền trong Durable Object (1 giờ, alarm dọn dữ liệu); cache trúng thì không gọi OpenAI và không tính hạn mức ngày (header `x-bo-cache: hit`). Lỗi không bị cache. Trang cũng có cache riêng (100 câu) và không tốn lượt khi trúng.

## Kiểm thử

- Mock (không cần mạng, không cần khóa): `npm test --prefix worker/bo-router` (hoặc `npm test` trong thư mục này). Máy chủ OpenAI GIẢ kiểm: allowlist, hạn mức 50/ngày, 429, câu >= 50 từ không gọi, timeout, lỗi OpenAI, cache, header khóa, prompt, logic client và đường rơi về từ khóa.
- Thật (cần khóa): `OPENAI_API_KEY=... LIVE_DELAY_MS=3000 node worker/bo-router/live-test.mjs`. 30 câu diễn đạt khác câu có sẵn (>= 90% đúng FAQ) + 5 ca trong kho kiến thức, 10 câu trong phạm vi nhưng ngoài danh sách (tự trả lời, kiểm tay nội dung), 10 lạc đề, 5 chèn lệnh, 3 câu dài, 51 lượt (+ từ khóa dự phòng sau 429), timeout, cache; in tỉ lệ đúng từng nhóm, p50/p95, token từng bước. `LIVE_SKIP51=1` bỏ phần 51 lượt. Đặt thêm `PRICE_IN_PER_M`/`PRICE_OUT_PER_M` (USD/1 triệu token, theo bảng giá OpenAI hiện hành) để ra ước tính chi phí/1.000 lượt; `LIVE_DELAY_MS` để nghỉ giữa lượt nếu gói miễn phí giới hạn RPM. Khóa không bao giờ được in hay ghi vào file kết quả (`live-test-result.json`, đã gitignore).

## Triển khai

1. `npx wrangler login`.
2. Xem `wrangler.toml` (Durable Object `RateLimit` có migration `v1`). Đặt khóa: `npx wrangler secret put OPENAI_API_KEY`. Không đặt khóa trong repo hay trang.
3. `node worker/bo-router/build-groups.mjs` rồi `npx wrangler deploy` (chạy trong thư mục `worker/bo-router`).
4. Trong `assets/content/bo.json` (hoặc tab "Bọ: lời chào & chữ" ở admin) đặt `ai.endpoint` là địa chỉ Worker và tích `ai.enabled`. Chưa tích thì không có lệnh gọi nào.

## Bảo mật, dữ liệu, chi phí

- CORS/Origin chỉ là rào cản trình duyệt, không phải xác thực. Yêu cầu không có Origin bị từ chối `403`. Bảo vệ thật là giới hạn tốc độ và `DAILY_CAP`.
- Body tối đa 2 KB, kiểm tra trước khi parse JSON; quá lớn trả `413`.
- Câu hỏi chỉ là dữ liệu (role `user`), prompt hệ thống yêu cầu bỏ qua mọi mệnh lệnh nằm trong câu hỏi; đầu ra qua schema enum và allowlist phía Worker nên không thể trả id ngoài danh sách hay văn bản tự do.
- Câu hỏi được gửi tới OpenAI API để phân loại: cần nêu điều này trong chính sách quyền riêng tư và kiểm tra điều khoản dữ liệu của gói OpenAI API đang dùng (gói miễn phí và gói trả phí khác nhau về việc dùng dữ liệu để cải thiện sản phẩm).
- Worker không ghi log câu hỏi. Cache DO lưu kết quả dưới khóa SHA-256 gồm model/prompt/câu chuẩn hóa; không lưu câu hỏi thô. Kết quả cache tự xóa sau 1 giờ. Hash câu dễ đoán có thể dò từ điển, không coi là ẩn danh tuyệt đối. Durable Object lưu bộ đếm theo IP (dữ liệu có thể nhận dạng), tự xóa bằng `alarm()` khi hết cửa sổ (60 giây cho phút, 24 giờ cho ngày/toàn cục).
- Chi phí: mỗi câu chưa cache tính một lượt hạn mức nhưng có thể gọi OpenAI hai lần; token từng bước đo trong báo cáo mạng thật. Số thật đo bằng `live-test.mjs`. Đặt `DAILY_CAP` theo ngân sách.

## Giới hạn AI

- Câu hỏi: dưới 50 từ (`ai.maxQuestionWords` = 49). Câu dài hơn: trang không gọi AI (rơi về từ khóa), Worker cũng từ chối `{ "id": null }` 200 và không tính hạn mức.
- Số lượt: 50/ngày. Trang đếm theo trình duyệt, Worker đếm theo IP và ngày UTC. Worker báo 429 thì trang coi như hết hạn mức đến hết ngày và dùng từ khóa/câu dự phòng, không báo lỗi.
- Câu trả lời: câu có sẵn do trang hiển thị (Worker chỉ trả id). Chỉ khi không câu nào sát, AI tự viết <= 60 chữ (`maxAnswerWords` = 60), qua `checkAnswer()` ở Worker và `cleanAnswer()` ở trang (chuỗi thuần, hiển thị bằng `textContent`).
- Cấu hình ở khối `ai` của `bo.json`: `enabled` (false), `endpoint`, `maxPerDay` (50), `maxQuestionWords` (49), `maxAnswerWords` (60), `timeoutMs` (8000).

## Kiểm thử Cloudflare thật

- Worker chính để thử: bo-router-test, 50/ngày/IP và 12/phút; không cho origin moriclass.com.
- wrangler.eval.toml: bo-router-eval, 200/ngày/IP và 1000/phút, DEBUG_USAGE=1 chỉ để đánh giá 60+ câu chất lượng. Không dùng cấu hình này cho production.
- wrangler.quota.toml: bo-router-quota-test, đúng 50/ngày/IP, nới phút để kiểm 51 lượt trên một IP thật. Cần namespace mới khi chạy lại trong cùng ngày, không giả CF-Connecting-IP từ client.
- wrangler.timeout.toml: bo-router-test với timeout provider 1ms; chạy bài timeout rồi deploy lại cấu hình chính để khôi phục.
- LIVE_WORKER_URL trỏ tới HTTPS Worker; LIVE_ORIGIN phải thuộc ALLOWED_ORIGINS. Ví dụ: cấp LIVE_WORKER_URL, LIVE_ORIGIN=http://127.0.0.1:8766, LIVE_GROUPS=A,S,B,C,D,E,H, LIVE_SKIP51=1 qua môi trường rồi chạy node worker/bo-router/live-test.mjs. Cờ chọn nhóm làm script báo CHƯA ĐỦ tổng thể; kết luận tổng hợp chỉ trong báo cáo khi đã chạy riêng quota/timeout/boundary/browser.
- Script đánh giá qua mạng không thể đếm lệnh gọi OpenAI ở server từ client. Token header và cache hit là bằng chứng; câu dài còn được kiểm mock đảm bảo 0 lời gọi provider.
- Nạp OPENAI_API_KEY qua môi trường trước khi chạy local; load-private-env.mjs không tự đọc khóa từ file. Các wrapper vận hành do chủ dự án cấp file khóa nằm riêng env/ bị gitignore, không nằm trong source hay kết quả.
- Chủ dự án đã chọn GPT-6 Luna mức suy luận low (không có model ID riêng Luna Light): OPENAI_MODEL=gpt-6-luna, OPENAI_REASONING_EFFORT=low. Cache phân biệt cả model và effort. Kết quả gpt-4o-mini trong báo cáo cũ chỉ là lịch sử, không đại diện bản Luna. Tài liệu: https://developers.openai.com/api/docs/models/gpt-6-luna .
- Xem docs/BO_FAQ_OPENAI_TEST_REPORT.md cho số liệu thật, giới hạn và trạng thái dọn Worker. Nhắc rotate khóa OpenAI và token Cloudflare sau khi kết thúc test.
