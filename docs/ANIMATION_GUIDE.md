# Hướng dẫn hệ thống animation Me.Mori

## 1. Xem bản demo

Repo hiện là website tĩnh HTML/CSS/JavaScript, không có `package.json`, React hay bundler. Demo ở `animation-lab/` và không chèn script vào các trang hiện tại.

Chạy từ thư mục gốc repo:

```powershell
py -m http.server 8000
```

Mở `http://localhost:8000/animation-lab/`. Nếu máy dùng lệnh Python khác, có thể chạy `python -m http.server 8000`. Dừng server bằng `Ctrl+C`.

Trong demo, bọ bay đến cành khi tải trang, nhìn theo chuột, mở lời thoại khi bấm, phản ứng khi chọn câu trả lời và đổi vị trí khi cuộn. Nút cuối trang cho phép tạm dừng/tiếp tục. Có thể đặt `prefers-reduced-motion` trong DevTools để kiểm tra chế độ giảm chuyển động.

## 2. Thay hình nhân vật

Hiện chưa có file `.riv` hoặc SVG bọ trong repo. Demo dùng SVG thử nghiệm viết trực tiếp trong `animation-lab/index.html`; đây là hình tĩnh được CSS/JavaScript tạo dáng, **không phải** State Machine của Rive.

- Thay nội dung SVG bên trong nút `[data-beetle]` bằng SVG mới có `viewBox` ổn định và nền trong suốt.
- Giữ lớp vỏ, cánh, mắt trong các lớp riêng nếu muốn điều khiển chúng độc lập.
- Nếu có thiết kế Rive, trước hết tạo file `.riv` và đặt tên state machine, input, trigger rõ ràng. Sau đó thay adapter `js/character.js` bằng adapter Rive; các phần môi trường và hội thoại vẫn gọi cùng API.

Rive React là wrapper cho ứng dụng React. Vì website hiện không chạy React nên không cài gói đó vào repo tĩnh. Khi có quyết định chuyển một khu vực sang React, dùng hướng dẫn cài đặt từ [rive-react chính thức](https://github.com/rive-app/rive-react) và [tài liệu State Machines của Rive](https://rive.app/docs/runtimes/state-machines).

## 3. Thêm hành động cho bọ

API hiện có trên trang demo:

```js
window.MeMoriMotionLab.beetle.setState("happy");
window.MeMoriMotionLab.beetle.pause();
window.MeMoriMotionLab.beetle.resume();
window.MeMoriMotionLab.environment.flyTo({ x: 70, y: 30, duration: 1000 });
```

Trạng thái cho phép: `idle`, `fly`, `land`, `talk`, `happy`. Thêm trạng thái vào `STATES` trong `js/character.js`, sau đó tạo kiểu tương ứng bằng `[data-state="tên-trạng-thái"]` trong `styles.css`. Nếu dùng Rive sau này, ánh xạ các lệnh này sang input của state machine trong cùng adapter, không đổi logic hội thoại.

## 4. Chỉnh lời thoại và lựa chọn

- Cấu trúc hộp thoại nằm ở `index.html` với thuộc tính `data-dialogue`.
- Nội dung lựa chọn và câu trả lời nằm trong `js/conversation.js` ở đối tượng `replies`.
- `createConversation()` quản lý mở/đóng, Escape, trạng thái nói và phản ứng vui.
- Thêm lựa chọn bằng nút `data-reply="mã-mới"` và thêm cùng mã vào `replies`.

## 5. Thêm tinh linh và hiệu ứng

`js/spirits.js` tạo các hạt sáng nhẹ theo CSS; sprite tinh linh đang dùng PNG/WebP sẵn trong `assets/magic-leaf/`. Điều chỉnh số hạt tại `count`, vị trí trong vòng lặp, hoặc thêm ảnh trang trí vào section `chapter--scroll`. Chuyển động của cành và lá ở `styles.css` dùng `transform`, còn hạt chỉ được tạo khi trang vào lab.

PixiJS phù hợp khi cần nhiều sprite, particle, filter hoặc render canvas/WebGL. Demo hiện chỉ có một số hạt CSS nên PixiJS sẽ làm tăng tải không cần thiết. Pixi React chỉ cần khi ứng dụng đã dùng React; xem [PixiJS](https://github.com/pixijs/pixijs) và [Pixi React](https://github.com/pixijs/pixi-react).

## 6. Bay giữa các section

`js/environment.js` là nơi duy nhất điều khiển vị trí của bọ trên trang. Thay các cặp tọa độ trong mảng `route` theo dạng `[x%, y%]`. `flyTo()` nhận tọa độ và thời lượng; phần cuộn cập nhật vị trí bằng một frame `requestAnimationFrame` và trạng thái `fly`/`land`.

## 7. Tốc độ và thời gian

- Thời gian bay tự động đầu trang: `duration: 1450` trong `js/main.js`.
- Bay đến cành từ nút: `duration: 1250` trong `js/main.js`.
- Tốc độ cành và lá: các biến thời gian `7s`, `3.4s` trong `styles.css`.
- Nhịp hạt: `--duration` trong `js/spirits.js`.

Giảm số hạt/ảnh và ưu tiên `transform`/`opacity`. Tránh animate `top`, `left`, `width` liên tục. Mỗi phần tử chỉ nên có một bộ điều khiển vị trí; hiện `environment.js` sở hữu transform vị trí của bọ, còn `character.js` chỉ chọn trạng thái.

GSAP + ScrollTrigger hữu ích cho timeline dài, nhiều nhãn cuộn, pin/scrub và cleanup phức tạp. Lab hiện có một đường bay ngắn nên dùng Web Animations API gốc, chưa cài GSAP. Nếu dự án lớn dần, theo [tài liệu GSAP](https://gsap.com/docs/v3/) và [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

Motion có bản React và JavaScript thuần; hiệu ứng giao diện của demo còn ít nên CSS/native transitions phù hợp hơn lúc này. Nếu cần gesture, spring hoặc animation đồng bộ cho nhiều phần tử, xem [Motion docs](https://motion.dev/docs) trước khi thêm package.

## 8. Kiểm tra hiệu suất và truy cập

1. Kiểm tra console DevTools để tìm lỗi JavaScript và asset 404.
2. Trong Performance, ghi lại thao tác cuộn; giữ animation chủ yếu trên `transform` và `opacity`.
3. Trong Rendering, bật FPS meter; kiểm tra desktop và mobile.
4. Bật `prefers-reduced-motion: reduce`; hoạt ảnh trang trí sẽ dừng và bọ ở trạng thái tĩnh.
5. Thử bằng bàn phím: Tab tới bọ/nút, Enter để mở/chọn, Escape để đóng thoại.

Lab không tải font, thư viện, ảnh hay API từ bên ngoài. Các ảnh nền và tinh linh được dùng từ thư mục `assets/` cục bộ.
