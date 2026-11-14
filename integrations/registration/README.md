# Form đăng ký F2 → Google Trang tính và email

## Hợp đồng dữ liệu

Chủ site xác nhận form này dành riêng cho lớp F2, không dùng ba mã workshop trong prompt ban đầu. Website gửi `workshop: "F2"`; Apps Script chỉ chấp nhận giá trị này. Cột vẫn tên `workshop`, không đổi cấu trúc của app quản lý.

Tab `DangKy`, hàng 1 đúng thứ tự:

`id | createdAt | name | phone | email | workshop | preferredContact | message | status | note | contactLog | confirmedAt | updatedAt`

Website ghi A–H, trạng thái I là `new`, J–M để trống. Chỉ thêm dòng mới; không sửa dữ liệu cũ. Cột D được định dạng văn bản thuần, phone là chuỗi. ID và kiểm tra trùng nằm trong Script Lock. Lọc trùng cùng phone + F2 trong 10 phút; honeypot bị bỏ qua; đầu vào công thức được thêm dấu nháy đơn trước khi ghi ô.

Form hiện có họ tên, điện thoại, email tùy chọn và lớp F2 cố định. `preferredContact` mặc định `zalo`; `message` trống vì giao diện chưa có ô lời nhắn. Không thêm Google Form riêng.

## Mã nguồn

- `Code.gs`: Apps Script gắn vào Trang tính, nhận POST, ghi dòng và gửi email văn bản thuần.
- `assets/registration.js`: kiểm tra và chuẩn hóa dữ liệu, POST `no-cors` bằng `text/plain;charset=utf-8`, không ghi dữ liệu cá nhân vào console.
- `assets/content/registration.json`: endpoint `/exec` công khai và email liên hệ dự phòng được chủ site chấp thuận công bố. Chủ site đã đồng ý dùng email Workspace đang mở làm liên hệ dự phòng; endpoint vẫn để trống khi chưa triển khai, nên form từ chối gửi thay vì báo thành công giả khi chưa nối.

Đã đối chiếu README và `docs/PROMPT-CODEX.md` của repo MORI Admin do chủ site cung cấp: giữ đúng 13 cột và các trạng thái `new`, `contacted`, `confirmed`, `cancelled`. Phần nhận đăng ký chỉ khởi tạo `new`; app quản lý tự cập nhật các trạng thái còn lại. Không chỉnh giao diện hay xây backend quản lý trong phạm vi này. MORI Admin hiện là giao diện mẫu, chưa có URL app chạy thật, nên email tạm mở Trang tính cho tới khi có `APP_URL`.

## Triển khai ngắn gọn

1. Trong Trang tính, tạo tab `DangKy` với hàng tiêu đề trên. Chọn cả cột D → Định dạng → Số → Văn bản thuần túy.
2. Tiện ích → Apps Script. Dán `Code.gs`, lưu dự án.
3. Cài đặt dự án → Thuộc tính tập lệnh: `SPREADSHEET_ID` là ID bảng; `EMAIL_CHU_SITE` là email nhận báo. `APP_URL` là URL app quản lý nếu đã có. Email và URL app chỉ đặt ở đây, không ghi vào repo. Nếu chưa có APP_URL, email mở Trang tính; khi app có URL, đặt thuộc tính này để dùng `#dang-ky/<id>`.
4. Triển khai → Tùy chọn triển khai mới → Ứng dụng web; thực thi bằng Tôi, quyền Bất kỳ ai. Chủ tài khoản duyệt quyền đọc/ghi Trang tính và gửi email của script. Sao chép URL kết thúc `/exec`.
5. Điền endpoint vào cấu hình website. Email dự phòng phải là địa chỉ được phép hiển thị công khai; không đưa email cá nhân vào repo nếu chưa được chủ site đồng ý. Chỉ đẩy website sau khi chủ site đồng ý.
6. Khi đổi mã script: Quản lý tùy chọn triển khai → Sửa → Phiên bản mới → Triển khai; URL `/exec` cũ giữ nguyên.

## Kiểm thử

`node --test --test-isolation=none integrations/registration/test.mjs`

9 kiểm thử local đạt: header/13 cột, ID tăng, múi giờ +07, chuỗi điện thoại giữ số 0, giữ nguyên dòng/cột app quản lý, chống trùng, bot/đầu vào sai, chống công thức, email lỗi vẫn giữ dòng, giới hạn cấu hình và gửi no-cors. Đây là mô phỏng dịch vụ Google; không thay thế kiểm tra trên Trang tính thật.

Trình duyệt không đọc được phản hồi Apps Script trong chế độ no-cors. Thông báo “Đã gửi” chỉ xác nhận request đã được gửi mà không có lỗi mạng, không bảo đảm Apps Script đã ghi dòng hoặc email đã tới. Phải kiểm tra Trang tính và hộp thư sau khi triển khai thật. Không tự retry POST vì có thể đã lưu dù mất phản hồi.

## Các bước kiểm tra thật sau cấp quyền

- Gửi 2–3 đăng ký thử đánh dấu rõ dữ liệu kiểm tra, kiểm tra ID khác nhau và hàng 1 không thay đổi.
- Kiểm tra phone cả giá trị và hiển thị vẫn là chuỗi có số 0 đầu; cột I=`new`, J–M trống.
- Gửi lại cùng số/F2 trong 10 phút: không thêm dòng, không gửi email thứ hai.
- Kiểm tra email thông báo trong hộp thư, đường dẫn Trang tính hoặc app quản lý, không khẳng định đã nhận email chỉ từ kết quả MailApp.
- Không xóa dòng thử hoặc sửa dữ liệu cũ nếu chưa có yêu cầu riêng.
