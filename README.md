# ME.MORI Class

Website tĩnh giới thiệu lớp học ME.MORI Class, deploy bằng GitHub Pages (`.github/workflows/pages.yml`).

## Cấu trúc
- `index.html`: trang chủ, đọc `content.json` rồi vẽ nội dung. Nếu không tải được thì dùng `fallbackContent` trong chính file này.
- `content.json`: toàn bộ nội dung hiển thị.
- `admin.html`: trang sửa nội dung và lưu `content.json` lên GitHub (cần token).
- `scripts/check-content.js`: kiểm tra `content.json` parse được và khớp `fallbackContent` (chạy `node scripts/check-content.js`; CI cũng chạy).
- `dist/`, `prototype/`: không phải bản build của `index.html`, chưa dùng cho trang chính.

## Mục mở rộng (tùy chọn)
Thêm vào `content.json` các khóa dưới đây thì trang tự hiện mục tương ứng; để trống thì ẩn. Mỗi khóa có dạng `{ "title": "", "text": "", "items": [ ... ] }`:

| Khóa | Mỗi phần tử trong `items` |
|---|---|
| `pricing` | `name`, `price`, `note` |
| `schedule` | `name`, `date`, `note` |
| `instructors` | `name`, `role`, `bio`, `photo` (URL ảnh) |
| `testimonials` | `name`, `role`, `quote` |
| `faq` | `q`, `a` |

Có thể nhập qua tab "Mục mở rộng" trong `admin.html`.

## Lưu ý khi sửa nội dung
Khi đổi `steps`, `method`, `features`, `courses`, `cta` hoặc `footer` trong `content.json`, cập nhật `fallbackContent` trong `index.html` cho khớp, nếu không CI sẽ báo lỗi.
