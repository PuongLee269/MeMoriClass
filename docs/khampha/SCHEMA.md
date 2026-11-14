# khampha.json (trang "Khám phá tác phẩm", City in the Clouds)

File: `assets/content/khampha.json`. Trang nạp file này, trộn lên giá trị mặc định nhúng sẵn trong `khampha.html` (thiếu file hoặc thiếu trường thì dùng mặc định). Đồng bộ với `MemoriContent` (assets/content-loader.js): mục trong `items` được ghép theo `id`.

```
{
  "version": 1,
  "page":  { title, backLabel, backHref, loaderText, soonText, noLinkText, boLabel, viewText, closeLabel, notFoundText, playLabel, galleryLabel,
             subtitle, subtitleTouch, hint, openText, tapText },   // 5 trường cuối mặc định RỖNG (quy tắc: không chữ hướng dẫn hiển thị); rỗng thì ẩn
  "layers": { sky, far, base, off,            // máy tính: 4 ảnh WebP 1672x941
             bg, bgPhone, offPhone },        // bg = nền gộp (phần mở rộng mép), *Phone = ảnh 1500x844 cho điện thoại
  "items": [ {
      "id":      "kiln|studio|house|stage|class",   // khoá ghép, đừng đổi
      "title":   "Lò gốm",                           // chữ thật trong thẻ chú thích + aria-label
      "desc":    "Mô tả ngắn",
      "url":     "",           // "" hoặc "#" = chưa có link (thẻ hiện "Sắp có", bấm không làm gì).
                               // https://... hoặc đường dẫn trong site (vd lop.html)
      "target":  "",           // "" = theo settings.target | "_blank" (tab mới) | "_self" (cùng tab)
      "hotspot": { "poly": [[x,y],...] },            // đa giác vùng bấm, toạ độ cảnh 1672x941
      "litCropUrl": "assets/khampha/lit_kiln.webp",  // ảnh bật đèn đã cắt riêng công trình (RGBA)
      "litCropUrlPhone": "assets/khampha/lit_m_kiln.webp", // bản nhỏ (0.9x) cho điện thoại, cùng litBox
      "litBox":  [x, y, w, h],                       // vị trí ảnh cắt trong cảnh 1672x941
      "labelAnchor": [x, y],                         // điểm neo thẻ chú thích (giữa-đỉnh công trình)
      "workId":  ""                                  // id trong "works" bên dưới; "" = chưa có tác phẩm ("Sắp có")
  } ],
  "works": [ {                                       // mỗi tác phẩm = một trang tacpham.html?id=<id>
      "id": "mau", "sample": true,                   // id: chữ thường/số/-/_ ; sample: chỉ là đánh dấu mẫu, trang không dùng
      "title": "", "author": "", "date": "",         // author/date tuỳ chọn, hiện ở dòng meta dưới tiêu đề
      "thumb": "", "thumbW": 0, "thumbH": 0,         // ảnh đại diện trên thẻ (thumbW/H giúp giữ chỗ, tuỳ chọn)
      "cardDesc": "",                                // mô tả ngắn trên thẻ (hiện 3-4 dòng)
      "video": "",                                   // link/ID YouTube (hoặc Vimeo); "" = dùng ảnh
      "image": "", "imageW": 0, "imageH": 0, "imageAlt": "",  // khung 16:9 đầu trang (nếu có video thì là ảnh bìa)
      "caption": "",                                 // chú thích dưới khung
      "paragraphs": ["đoạn 1", "đoạn 2"],            // các đoạn chữ giới thiệu
      "gallery": [ { "src": "", "w": 0, "h": 0, "alt": "", "caption": "" } ],   // ảnh phụ (tuỳ chọn, tối đa 12)
      "metaDescription": ""                          // <meta name=description> của trang
  } ],
  "settings": { "target": "_blank", "showLabels": true, "fadeMs": 450,
                "sparkle": true, "drift": true, "stars": [[x,y],...] }
}
```

Admin chỉ cần sửa `title`, `desc`, `url`, `target` (hotspot / litBox do công cụ tách ảnh sinh ra; sửa tay thì mất khớp ảnh). Không thêm/bớt được công trình bằng JSON (mỗi công trình cần ảnh cắt riêng); muốn thêm công trình thì làm lại ảnh 04/05 rồi chạy lại bước tách.

Hành vi: rê chuột/Tab vào công trình thì ảnh bật đèn hiện dần (opacity), thẻ chú thích hiện; Enter hoặc bấm mở link. Cảm ứng: chạm lần 1 bật đèn và hiện thẻ, chạm lần 2 mở link; chạm ra ngoài thì tắt.
Link chỉ nhận https:// hoặc đường dẫn tương đối trong site (đi qua MemoriContent.url), mọi giá trị khác bị coi là chưa có link.

## Thẻ tác phẩm và trang Blog (tacpham.html)

- Nhà có `workId` khớp một mục trong `works`: bấm/chạm một lần mở THẺ nổi (tên nhà, tên tác phẩm, ảnh đại diện, mô tả, nút `page.viewText` = "Vào xem"). Đóng bằng nút ×, bấm ra ngoài hoặc Esc. Nút dẫn tới `tacpham.html?id=<id>` (cùng tab). Nhà không có tác phẩm giữ trạng thái "Sắp có" như cũ.
- `tacpham.html` dùng chung một file, đọc `khampha.json` (`page` + `works`, bản nhúng sẵn làm dự phòng). Khung 16:9: video YouTube/Vimeo (ảnh bìa + nút phát, iframe chỉ nạp khi bấm, qua `assets/yt-fast.js`) hoặc ảnh; tiêu đề, meta, các đoạn chữ, ảnh phụ, cuối trang có gợi ý về Khám phá và trang kế (`assets/next-pages.js`, mục `tacpham` trong `journey.json`). Chữ chỉ gán bằng textContent; `<title>` và meta description theo từng tác phẩm. Id không tồn tại thì hiện `page.notFoundText`.
- Thêm/sửa/xoá tác phẩm trong admin, tab "Khám phá tác phẩm" (mục "Tác phẩm" và ô "Tác phẩm của nơi này" của từng nơi), hoặc sửa thẳng JSON (nhớ giữ `assets/content/defaults/khampha.json` và bản nhúng `CONFIG_DEFAULT` trong `khampha.html` / `DEF` trong `tacpham.html` đồng bộ nếu muốn đổi mặc định).
- Tác phẩm `mau` ("Tác phẩm mẫu", gắn vào Lớp học) chỉ để xem luồng; thay bằng tác phẩm thật: đổi nội dung mục `mau` (hoặc thêm mục mới rồi chọn lại `workId` của nhà), xoá `sample`.
