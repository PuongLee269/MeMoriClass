# Schema nội dung trang "Phương pháp" (assets/content/method.json; trang admin: admin.html, xem docs/ADMIN.md)

Trang tải file này bằng `MemoriContent.prefetch('method')` (assets/content-loader.js: fetch `assets/content/method.json?v=<timestamp>`, `cache:'no-store'`). Thiếu file, sai JSON hay thiếu trường: trang dùng bản mặc định nhúng sẵn trong HTML (`DEFAULT_CONTENT`), từng trường thiếu được lấy từ mặc định. Mọi chữ được gán bằng `textContent` (không HTML); trang admin nên cũng chỉ lưu văn bản thuần. File mẫu đầy đủ: `assets/content/method.json`.

## Cấu trúc
```json
{
  "version": 1,
  "page":   { ... },
  "symbols":{ "spiral":{"label":""}, "eye":{"label":""}, "mountain":{"label":""} },
  "methods":[ {id, symbol, title, text, imageUrl, videoUrl} x3 ],
  "pileOrder": [ 9 id khối đá ],
  "sound":  { "enabled": true, "volume": 0.6 }
}
```

### page (chuỗi, mọi trường tuỳ chọn, để trống = dùng mặc định)
| trường | ý nghĩa | gợi ý giới hạn |
|---|---|---|
| title | tiêu đề trang (cũng là `document.title`) | 40 ký tự |
| subtitle | dòng phụ dưới tiêu đề (mặc định TRỐNG: không hướng dẫn người chơi) | 120 |
| hint | gợi ý hiện sau ~6 giây không thao tác (trạng thái 1) | 100 |
| backLabel / backHref | chữ và đường dẫn nút "Về trang Bọ" | href tương đối hoặc https |
| loaderText | chữ ở màn hình tải | 60 |
| closeLabel | nhãn trợ năng cho nút đóng bảng chữ | 20 |
| videoLabel | chữ nút mở video | 20 |
| resetLabel | chữ nút xếp lại đống đá | 20 |
| wrongText | câu hiện khi thả sai, mặc định TRỐNG (không chữ, chỉ đĩa rung và khối nảy về) | 80 |
| keyboardHelp | hướng dẫn bàn phím (đọc bởi trình đọc màn hình) | 200 |

### symbols
Chỉ 3 khoá cố định: `spiral` (xoắn ốc), `eye` (con mắt), `mountain` (ngọn núi). Mỗi khoá có `label` (tiếng Việt, dùng cho aria-label của khối đá và thông báo). Không thêm khoá mới (chỉ có 3 bộ hình đá).

### methods (đúng 3 phần tử, mỗi `symbol` xuất hiện đúng một lần)
| trường | kiểu | ghi chú |
|---|---|---|
| id | string | định danh ổn định, ví dụ `m-spiral` |
| symbol | `"spiral"` \| `"eye"` \| `"mountain"` | **ánh xạ ký hiệu -> phương pháp**. Người dùng gom 3 khối cùng ký hiệu này để đọc phương pháp |
| title | string | tiêu đề phương pháp, font tay, nên <= 40 ký tự |
| text | string | mô tả 2-3 câu, <= 450 ký tự; xuống dòng thường được gộp |
| imageUrl | string, "" = không ảnh | https hoặc đường dẫn tương đối; hiện ảnh bìa cao <= 150px trong bảng |
| videoUrl | string, "" = không video | Chỉ nhận YouTube (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`). Hiện nút "Xem video"; bấm mới tạo iframe `youtube-nocookie.com` (facade, không có request tới YouTube trước đó). Link không hợp lệ: không hiện nút |

Phương pháp thiếu hoặc trùng ký hiệu bị bỏ, và được thay bằng mặc định cho ký hiệu còn thiếu.

### pileOrder
Mảng đúng 9 id khối, mỗi id một lần: `spiral-A|B|C`, `eye-A|B|C`, `mountain-A|B|C` (A/B/C chỉ là biến thể hình, cùng ký hiệu = cùng loại). Thứ tự = các ô của đống, **từ dưới lên trên**: chỉ số 0-3 là hàng đáy (4 khối, trái sang phải), 4-6 hàng giữa (3 khối), 7-8 hàng trên cùng (2 khối). Khối hàng trên che khối hàng dưới nằm sát bên dưới nên chỉ 2 khối trên cùng kéo được trước. Sai định dạng: dùng thứ tự mặc định.

### sound
`enabled` (bool): mặc định bật/tắt âm khi người dùng chưa chọn. `volume` 0..1. Lựa chọn của người dùng được nhớ trong `localStorage['memori.method.sound']` (`on`/`off`) và ưu tiên hơn `enabled`.

## rules (luật chơi, đều đọc từ file, không còn hằng số trong trang)
| trường | kiểu, mặc định | ý nghĩa |
|---|---|---|
| required | 2 hoặc 3, mặc định 3 | số khối CÙNG ký hiệu cần có trên đĩa để mở phương pháp (đĩa chỉ có 3 chỗ) |
| cubeSymbols | {id khối: ký hiệu} cho đủ 9 khối | khối nào thuộc ký hiệu nào. Hình khắc là ảnh cố định, chỉ luật gom đổi |
| mixedDropReturns | bool, true | thả khối khác ký hiệu vào đĩa thì khối nảy về chỗ cũ. false: đĩa nhận mọi khối (tối đa 3), mở khi đủ `required` khối cùng ký hiệu |
| allowParkOnTable | bool, true | cho để khối tạm trên mặt bàn; false thì khối về đống |
| returnAfterReveal | bool, true | sau khi mở, khối trở về đống; false thì khối nằm lại trên đĩa |
| wrongShake | bool, true | đĩa rung khi thả sai |
Mỗi phương pháp phải có ký hiệu mà số khối mang ký hiệu đó >= `required` (admin báo lỗi nếu không), nếu không phương pháp không bao giờ mở được.

## ghostHint (gợi ý tự động, mặc định TẮT)
`enabled` (bool, false): bật bàn tay ma kéo thử một khối khi người chơi chưa chạm. `delay` (giây, 1..120, mặc định 6): chờ bao lâu không thao tác thì hiện `page.hint` (nếu không trống) và bàn tay ma (nếu bật). Mặc định trang KHÔNG có chữ hướng dẫn nào để người chơi tự khám phá; nhãn cho trình đọc màn hình vẫn có.

## sound.events
Bật/tắt từng âm: `pick, drop, snap, glow, wrong, reveal, whoosh` (bool, mặc định true), cùng `enabled` và `volume`.

## Gợi ý cho trang admin
- Form 3 khối (mỗi khối một ký hiệu cố định, hiện hình đá tương ứng `assets/img/cube-<symbol>-A.webp`); cho phép chọn lại ký hiệu của từng phương pháp bằng hoán đổi (không để 2 phương pháp cùng ký hiệu).
- `pileOrder`: lưới 4-3-2 kéo thả hoán đổi 9 khối; hiển thị đếm mỗi ký hiệu phải đủ 3 (luôn đúng nếu chỉ hoán đổi).
- Kiểm tra: title/text không rỗng, videoUrl khớp regex YouTube, imageUrl bắt đầu `https://` hoặc đường dẫn tương đối.
- Lưu: ghi đè `assets/content/method.json` (UTF-8, `ensure_ascii=false`); trang tự bỏ cache nhờ `?v=` nên không cần bước khác.

## MemoriAudio (cổng nhạc nền toàn trang, chưa phát nhạc)
`window.MemoriAudio`:
- `setBackground(url, opts)`: lưu đường dẫn và phát `CustomEvent('memoriaudio:background', {detail:{url, opts}})` trên `window`. Trang này không phát nhạc; module nhạc nền (làm sau) lắng nghe sự kiện hoặc đọc `getBackground()`.
- `getBackground()`, `clearBackground()`.
- `isMuted()`, `setMuted(bool)` (phát `memoriaudio:mute`), `setVolume(0..1)`: điều khiển cùng bộ tắt/mở âm với hiệu ứng.
- `getContext()`: AudioContext dùng chung (có sau cử chỉ đầu tiên), để nhạc nền nối cùng ngữ cảnh.
Nút loa của trang là công tắc chung; nhạc nền nên tôn trọng `isMuted()`.
