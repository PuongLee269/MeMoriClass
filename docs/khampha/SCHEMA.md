# khampha.json (trang "Khám phá tác phẩm", City in the Clouds)

File: `assets/content/khampha.json`. Trang nạp file này, trộn lên giá trị mặc định nhúng sẵn trong `khampha.html` (thiếu file hoặc thiếu trường thì dùng mặc định). Đồng bộ với `MemoriContent` (assets/content-loader.js): mục trong `items` được ghép theo `id`.

```
{
  "version": 1,
  "page":  { title, backLabel, backHref, loaderText, soonText, noLinkText, boLabel,
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
      "labelAnchor": [x, y]                          // điểm neo thẻ chú thích (giữa-đỉnh công trình)
  } ],
  "settings": { "target": "_blank", "showLabels": true, "fadeMs": 450,
                "sparkle": true, "drift": true, "stars": [[x,y],...] }
}
```

Admin chỉ cần sửa `title`, `desc`, `url`, `target` (hotspot / litBox do công cụ tách ảnh sinh ra; sửa tay thì mất khớp ảnh). Không thêm/bớt được công trình bằng JSON (mỗi công trình cần ảnh cắt riêng); muốn thêm công trình thì làm lại ảnh 04/05 rồi chạy lại bước tách.

Hành vi: rê chuột/Tab vào công trình thì ảnh bật đèn hiện dần (opacity), thẻ chú thích hiện; Enter hoặc bấm mở link. Cảm ứng: chạm lần 1 bật đèn và hiện thẻ, chạm lần 2 mở link; chạm ra ngoài thì tắt.
Link chỉ nhận https:// hoặc đường dẫn tương đối trong site (đi qua MemoriContent.url), mọi giá trị khác bị coi là chưa có link.
