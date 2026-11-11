# Giao việc cho Codex: mảng "Bọ trả lời" (từ khóa + AI chọn nhóm)

Repo: https://github.com/PuongLee269/MeMoriClass  (nhánh gốc: `main`, = trang https://moriclass.com)
Làm trên nhánh riêng, ví dụ `codex/bo-replies`, tạo từ `main`. KHÔNG push vào `main`.

## Prompt ngắn (dán cho Codex)

```
Repo: PuongLee269/MeMoriClass, tạo nhánh codex/bo-replies từ main. Site tĩnh (GitHub Pages), tiếng Việt.
Việc: nâng cấp chatbot "Bọ" theo kiểu từ khóa + AI chỉ chọn nhóm (AI không viết câu trả lời).
1) Mở rộng nhóm từ khóa trong assets/content/bo-replies.json (hiện 38 nhóm: id, keys, reply, link). Thêm nhóm còn thiếu và nhiều cách hỏi (có dấu, không dấu, viết tắt, sai chính tả nhẹ) cho mỗi nhóm. KHÔNG bịa thông tin thật (học phí, lịch, địa điểm, giảng viên...): nhóm nào chưa có dữ liệu thì giữ câu "Bọ chưa có thông tin".
2) Thêm bước dự phòng trong assets/bo-widget.js: nếu assets/bo-matcher.js không khớp, gọi một endpoint cấu hình được (assets/content/bo.json: ai.endpoint, ai.enabled, mặc định tắt) gửi câu hỏi (cắt 200 ký tự) và nhận về chỉ {id} của nhóm hoặc null. Có id thì dùng câu trả lời cố định của nhóm; null/lỗi/quá thời gian thì dùng câu từ chối có sẵn. Giới hạn số lượt gọi mỗi phiên (sessionStorage), không lưu dữ liệu cá nhân.
3) Viết một Cloudflare Worker mẫu (thư mục worker/bo-router/) giữ khóa API trong biến bí mật, nhận câu hỏi, gọi mô hình với danh sách id + mô tả nhóm (cố định, để lưu đệm), max_tokens nhỏ, chỉ trả {id}. Kèm CORS chỉ cho moriclass.com, giới hạn tốc độ, README cách triển khai. Không đặt khóa trong repo.
4) Giữ nguyên hiệu năng: bo-matcher chạy < 0,05 ms/câu, thư viện chat nạp lười, không chặn trang.
Đọc trước: docs/BO_PAGES.md, docs/ADMIN.md, docs/WORKER_RULES.md, CLAUDE.md. Báo cáo cuối tối đa 10 dòng tiếng Việt.
```

## Các file liên quan
- `assets/content/bo-replies.json` — nhóm từ khóa + câu trả lời (admin sửa được)
- `assets/bo-matcher.js` — bộ so khớp từ khóa
- `assets/bo-replies.js` — dữ liệu mặc định nhúng sẵn
- `assets/bo-widget.js`, `assets/bo-widget.css` — khung chat
- `assets/content/bo.json` — cấu hình Bọ
- `admin.html` — tab Bọ, nút "Thử câu hỏi"
- `docs/BO_PAGES.md`, `docs/ADMIN.md` — tài liệu
