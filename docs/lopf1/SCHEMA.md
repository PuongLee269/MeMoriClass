# Lớp F1 - lược đồ nội dung cho admin (assets/content/lopf1.json)

Trang `lopf1.html` nạp file này bằng `MemoriContent.load('lopf1', mặc định)` (giống method.json, roadmap.json): lỗi mạng, 404 hoặc JSON hỏng thì dùng bản mặc định nhúng trong trang. Chữ chỉ gán bằng textContent; đường dẫn đi qua `MemoriContent.url()`; ID video qua `parseVideo()`. Xem trước từ admin: thêm `?mcpreview=1` (đọc `localStorage['memori.preview.lopf1']`).
File mẫu đầy đủ: `site/assets/content/lopf1.json`.

```json
{
  "version": 1,
  "page": {
    "title": "Lớp F1",
    "subtitle": "Kéo cuốn sách sang trái hoặc phải để đổi hình",
    "hint": "Kéo cuốn sách sang trái hoặc phải",
    "backLabel": "← Về trang Bọ", "backHref": "index.html",
    "loaderText": "Bọ đang mở cuốn sách…",
    "bookLabel": "(nhãn đọc cho người dùng trình đọc màn hình)",
    "prevLabel": "Hình trước", "nextLabel": "Hình sau", "playLabel": "Phát video", "videoText": "Video",
    "counterText": "{n} / {total}", "announceText": "Hình {n} trên {total}: {caption}"
  },
  "items": [
    { "type": "image", "imageUrl": "assets/...webp", "caption": "Chú thích hiện dưới cùng", "alt": "Mô tả ảnh cho trình đọc màn hình" },
    { "type": "video", "provider": "youtube", "videoId": "jNQXAC9IVRw", "imageUrl": "(ảnh bìa, bỏ trống thì lấy từ YouTube)", "caption": "...", "alt": "..." }
  ],
  "drag":   { "threshold": 56, "snap": 0.4, "flick": 0.55, "inertia": true, "loop": true, "wheel": true, "wheelCooldown": 520 },
  "bookFx": { "type": "code", "fps": 24, "manifest": "assets/lopf1/bookfx/manifest.json", "frames": { "flipNext": [], "flipPrev": [], "open": [], "idle": [] } },
  "showArrows": true
}
```

## Trường
- `items` (danh sách thay hoàn toàn, thêm/bớt/đổi thứ tự được; tối thiểu 1; nên 3-9, tối đa 500). Ba ô tranh luôn hiện 3 mục liên tiếp: ô trái = mục trước, ô giữa = mục hiện tại, ô phải = mục sau (đúng với ảnh thiết kế: 3 ô, mỗi ô một tấm). Khi `loop=true` (mặc định) đi vòng tròn.
  - `type`: `"image"` hoặc `"video"`. `imageUrl`: đường dẫn trong site (`assets/...`) hoặc `https://`. Ảnh nên tỉ lệ ngang 16:9 hoặc 3:2, cạnh dài >= 1280 px, WebP/JPG <= 400 KB; ảnh được cắt `cover` theo từng ô.
  - `video`: `provider` chỉ `"youtube"` (hiện nay), `videoId` = 11 ký tự hoặc dán cả link YouTube (bộ nạp tự tách ID). Chỉ khi video đang ở ô GIỮA mới hiện nút Phát; bấm Phát mới tạo iframe `youtube-nocookie.com` (tải lười, không có mạng thừa lúc lướt). Đổi mục thì dừng video.
  - `caption`: chữ hiện ở dưới cùng + đọc bằng aria-live. `alt`: mô tả ảnh ô giữa.
- `drag.threshold`: số px màn hình phải kéo để lật (mặc định 56; tối thiểu 24). `snap`: tỉ lệ của threshold để một cú vuốt nhanh (`flick` px/ms) vẫn tính là lật. `inertia`: vuốt rất nhanh lật 2 mục. `loop`, `wheel` (bánh xe chuột), `wheelCooldown` (ms).
- `bookFx.type`: `"code"` = hiệu ứng lật trang tạm vẽ bằng CSS (không cần ảnh); `"frames"` = chuỗi ảnh trong suốt (xem ORDER_BOOK_FX.md). Với `frames`: hoặc điền `manifest` (khuyên dùng) hoặc điền trực tiếp `frames.flipNext/flipPrev/open/idle` (mảng URL). Lỗi tải khung hình thì tự quay về `code`.
- `showArrows`: hai mũi tên trái/phải ở mép ảnh (có trong ảnh thiết kế) cho người dùng chuột; false thì ẩn (vẫn còn nút ẩn bằng bàn phím).

## Tương tác (cho người viết admin / người kiểm thử)
Kéo CHUỘT/NGÓN TAY trên cuốn sách sang TRÁI = mục SAU; sang PHẢI = mục TRƯỚC. Phím mũi tên trái/phải (= trước/sau), bánh xe chuột, hai mũi tên ở mép, nút ẩn "Hình trước/Hình sau" (focus được, bằng Tab). Cuốn sách là một `<button>` focus được (Enter/Space = sau), vùng `aria-live` đọc "Hình n trên N: chú thích". Khung cong KHÔNG di chuyển; chỉ ảnh bên trong đổi.

## Sự kiện âm thanh (để gắn tiếng sau)
Mỗi lần lật: `document.dispatchEvent(new CustomEvent('memori:sound',{detail:{page:'lopf1',name:'flip',dir:+1|-1}}))`. Hiện không có âm thanh.

## Hình học ba ô tranh (đo từ lớp khung 07, trong hệ 1672x941)
Mặt nạ lấy từ vùng trong suốt của chính lớp khung (`assets/lopf1/img/mask{L,C,R}.webp`), ảnh đặt DƯỚI khung và được bẻ phối cảnh (matrix3d) theo 4 góc từng ô: trái (80,368)(434,299)(433,674)(75,629); giữa (446,298)(1226,300)(1228,673)(444,674); phải (1237,302)(1592,371)(1595,625)(1238,672).
