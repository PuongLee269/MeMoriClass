# Đặc tả trang mẫu Lớp F1 đen trắng: `prototype/bw-lopf1/`

Chủ dự án yêu cầu (2026-11-26): chuyển trang Lớp F1 (`lopf1.html`) sang phong cách đen trắng manga của `prototype/bw-bo/`, `prototype/bw-map/`, `prototype/bw-roadmap/`.
Trang mẫu độc lập, KHÔNG sửa `lopf1.html` hay `assets/` dùng chung. Giữ đủ hành vi trang cũ, chỉ đổi hình ảnh sang đen trắng.
Ảnh chụp trang cũ để đối chiếu: `prototype/bw-lopf1/_ref/old-*.png` (máy tính 1672×941: tải, mục 1, lật giữa chừng, mục 2, mục 4 video, đang phát; điện thoại 390×844 DPR2: tải, mục 1, mục 2, mục 4).

## 1. Trang cũ là gì
Một "cuốn sách phép" ở đáy cảnh đồng cỏ: kéo/bấm sách thì ba ô tranh cong phía trên (trái, giữa lớn, phải) trượt và đổi mục. Ô giữa là mục hiện tại; ô trái = mục trước, ô phải = mục sau. Mục có thể là ảnh hoặc video YouTube (poster + nút phát). Bọ đứng trên gò đá có xoắn ốc phát sáng ở đỉnh, chùm sáng toả xuống ô giữa. Không cuộn trang (`#view` cố định, `overflow:hidden`).

## 2. Nguồn (chép từ `lopf1.html`)
- Chữ và dữ liệu: `MemoriContent.load('lopf1', CONFIG_DEFAULT, {replace:['items','flipNext','flipPrev','open','idle']})` và `('site')` qua `../../assets/content-loader.js` (remap đường dẫn như bw-roadmap, tiền tố `../../`). Không viết chữ mới. Các khoá dùng:
  - `page.title` ("Lớp F1"), `subtitle`, `hint` (rỗng thì ẩn), `loaderText`, `bookLabel`, `prevLabel`, `nextLabel`, `playLabel`, `counterText` ("{n} / {total}"), `announceText`, `videoText` ("Video").
  - `items[]` (8 mục): `type` image|video, `imageUrl`, `videoId` + `provider:'youtube'`, `caption`, `alt`. Mục video không có `videoId` YouTube hợp lệ thì bỏ; thiếu ảnh bìa video thì dùng `i.ytimg.com/vi/<id>/hqdefault.jpg`.
  - `drag` {threshold 56, snap .4, flick .55, inertia, loop, wheel, wheelCooldown 520}; `bookFx` {type frames, fps 14, manifest `assets/lopf1/bookfx/manifest.json`}; `showArrows`; `mobile` {enabled, aspect .9, book{cx 425.5, bottom 1378, baseWidth 351}}.
  - `journey.json` (qua `next-pages`) cho thanh gợi ý: lopf1 → "Khám phá tác phẩm", "Đăng ký".
- Toạ độ, hằng số: chép nguyên `PANELS` (ma trận `matrix3d` 3 ô L/C/R, hộp [73,297,366,380], [442,278,790,410], [1234,300,364,376]), `MG` (toạ độ điện thoại), `layout()`, `layoutM()`, `makeSlot`, `playVideo`, `fillPanels`, `initBookFx`, `go`, `bindBook`, bàn phím/bánh xe. Canvas máy tính 1672×941, canvas điện thoại 852×1846.
- Ảnh nội dung các mục lấy từ JSON, giữ nguyên đường dẫn gốc: `assets/lopf1/img/s_clouds|s_moon|s_sunset|demo1..4.webp`, `assets/gallery/photo.webp` (điều chỉnh tiền tố). Đây là tranh minh hoạ và ảnh chụp thật nên KHÔNG vẽ lại: chỉ CSS `filter: grayscale(1) contrast(1.2)` + lớp tram chấm mờ phủ lên (như poster ở bw-roadmap). Khi video đang phát thì iframe giữ màu thật.
- Hình bookfx (12 khung lật 600×280, `assets/lopf1/bookfx/book_flip_left|right_00x.webp`): giữ nguyên, áp `grayscale(1) contrast(1.15)` lên canvas. Nếu khi đặt lên bệ đá đen trắng thấy lệch, dùng nhánh `codeFx` (lật CSS) trang cũ đã có sẵn làm dự phòng, ghi lại.
- Mặt nạ ô tranh `assets/lopf1/img/maskL|maskC|maskR.webp` (1 KB mỗi cái): dùng lại nguyên (hình dạng ô, không có màu).
- Bọ: sprite đen trắng `../bw-bo/img/bo/*.webp` (dùng: idle, wave, surprised, think, happy, point, listen).

## 3. Ảnh đen trắng mới (Codex vẽ, đặt trong `img/`; xem `PROMPT_BW_LOPF1_ART.md`)
Tối đa 3 ảnh:
- `bg-desk-bw.webp` (1672×941): bầu trời, mây khối lớn, vách núi hai bên, đồi xa, đường chân trời đồng cỏ; không bệ, không gò, không đá tiền cảnh. Thay `bg.webp`.
- `bg-phone-bw.webp` (852×1846): cùng ý, dọc. Thay `m/bg.webp`.
- `parts-bw.webp` (bảng chi tiết nền trắng, cắt ra): bệ đá + sách mở (máy tính 657×162, điện thoại 702×272), gò đá của Bọ (246×114; điện thoại 190×136), cụm cỏ + đá tiền cảnh trái và phải (cắt ghép thành dải 1672×237 máy tính và 852×346 điện thoại, đặt hai cụm ở hai rìa, giữa để trắng trong suốt).
Cắt nền trắng tinh bằng script (như `prototype/bw-roadmap/tools`), lưu các mảnh `pedestal-d.webp`, `pedestal-m.webp`, `mound-d.webp`, `mound-m.webp`, `fgL.webp`, `fgR.webp`.
Vẽ bằng CSS/SVG, không cần ảnh: khung ba ô, khung ô điện thoại, chùm sáng, xoắn ốc rune, mũi tên, thẻ nút, màn tải.

## 4. Thay đổi phong cách
- Toàn trang chỉ đen/trắng/xám (token `--ink #111111`, `--paper #fbfbfa`, `--tone #d8d8d8`), trừ video đang phát. Nền `#view` màu giấy.
- Nền (bài học vòng sửa 2 của bw-roadmap): `bg-desk-bw` làm mờ nhẹ (blur ~1.3px, giảm tương phản) + lớp giấy `--paper` phủ 40-70% (đậm nhất quanh ba ô tranh và bệ sách; điện thoại phủ phẳng ~55%). Vẽ nền ít chi tiết để ô tranh nổi. Bỏ sương mù xanh (`.mist`), bỏ `wisp` trôi, bỏ hạt sáng (`.mote`), bỏ `#glint`, bỏ `#bookglow`, bỏ ánh sáng `mix-blend-mode:screen`.
- Khung ba ô: bọc ba ô (đã có mặt nạ) trong một lớp có `filter: drop-shadow` bốn hướng 2px màu mực để ra viền mực đúng hình mặt nạ, cộng bóng cứng lệch 5px/6px màu mực; viền qua bộ lọc vẽ tay (feTurbulence + feDisplacementMap) như bw-roadmap. Không viền vàng phát sáng. Ảnh nằm DƯỚI khung như cũ; khung không bao giờ nhận tương tác.
- Khung ô điện thoại: một khung chữ nhật bo góc 23px, viền mực 3px vẽ tay + bóng cứng 4px (thay ghép ảnh `fr_*_stone`).
- Chùm sáng từ gò xuống ô giữa: hình thang SVG nét mực, vài nét gạch song song mảnh, mờ dần; nhịp `pulse` 5.6s chỉ đổi độ đậm nhạt nhẹ. Rune: xoắn ốc vẽ mực SVG trên mặt gò (không phát sáng).
- Bệ đá + sách: từ `parts-bw`. Rê/lấy nét/kéo sách: thay "ánh sáng" bằng viền elip nét mực đứt quanh sách (`#book:focus-visible` vòng mực 2px, rê chuột chỉ đổi nét đậm lên). Con trỏ `grab/grabbing` giữ.
- Tia lấp lánh khi lật (12 `spk`): thay bằng vài nét tốc độ manga và chấm đen/trắng bay ra 0.8s, rồi tắt.
- Tiêu đề "Lớp F1": Oooh Baby (rõ dấu), màu mực, bỏ `text-shadow` trắng; điện thoại cỡ 36px. Giữ ẩn `subtitle` khi rỗng.
- Phông giao diện: Be Vietnam Pro. Chữ nút/nhãn: máy tính ≥16px, điện thoại ≥14px.
- Chú thích dưới ("Mây trắng trên đồi cỏ   1 / 8"): thẻ giấy (viền mực 2px vẽ tay, bóng cứng 3px, nền `--paper`) đặt đáy giữa; chữ mực Be Vietnam Pro 500, máy tính 17px, điện thoại 15px; số thứ tự đậm nhẹ. Điện thoại đặt dưới ô tranh, không đè lên bệ sách.
- Nút điều hướng: thẻ giấy dễ đọc, không dùng chữ trôi trên nền.
  - Thanh gợi ý trên-trái ("← " về Bọ, "Khám phá tác phẩm →", "Đăng ký →"): thẻ giấy, viền mực, chữ ≥16px (điện thoại ≥14px, dùng `short` "Khám phá"); chạm ≥44px.
  - Mũi tên Hình trước/sau hai bên ô tranh: nút vuông/tròn nền giấy viền mực 2px, tam giác đặc mực, vùng chạm ≥52px (điện thoại ≥96px quy đổi như cũ), rê chuột nhích 2px; mờ 62% lúc nghỉ như cũ nâng thành 100% với nền giấy để đọc rõ.
  - Nút bản đồ góc trên phải → `../bw-map/`, kiểu thẻ giấy với biểu tượng bản đồ nét mực (như bw-roadmap).
- Nút phát video: tròn nền giấy viền mực 2.5px, tam giác mực đặc (84px máy tính; 132px ở ô điện thoại), bóng cứng; nhãn "Video" ở ô bên: thẻ nhỏ nền giấy viền mực ≥14px. Vòng quay chờ: nét mực.
- Màn tải: nền giấy trắng, Bọ `idle` nhỏ (thay đom đóm), chữ `loaderText` màu mực, thanh tiến trình mực đen mảnh.
- Hiệu ứng nền còn giữ, rất nhẹ: `fgwind` (cỏ tiền cảnh lắc 13s). Tôn trọng `prefers-reduced-motion`. `?freeze=1` dừng chuyển động để chụp.

## 5. Hành vi giữ nguyên
- Mở trang vào mục 1 (`idx=0`). Nạp trước ảnh mục hiện tại + hai mục kề; mục còn lại nạp nền sau.
- Đổi mục (`go(dir,steps)`): ba ô trượt + mờ 520ms (trượt nhỏ hơn ở điện thoại), chú thích đổi (mờ 180ms), `aria-live` đọc "Hình n trên N: chú thích", phát sự kiện `memori:sound` {page:'lopf1', name:'flip'}.
- Đổi mục bằng: kéo/vuốt ngang trên vùng sách (ngưỡng 56px; quán tính, kéo mạnh nhảy 2 mục; vòng lặp), phím ← →, phím Space/Enter khi sách lấy nét (sang phải), bánh xe chuột (cooldown 520ms), hai nút mũi tên, bấm vào sách không kéo thì không đổi. Điện thoại có thêm vùng kéo `#mhit` rộng quanh ô tranh. Đang kéo: ba ô dịch theo ngón tay và lật nửa trang, thả dưới ngưỡng thì trả về.
- Video: bấm nút phát ở ô giữa → thay bằng iframe `youtube-nocookie` (autoplay, `enablejsapi`); poster + vòng quay giữ đến khi player báo đang chạy (hoặc 8s); đổi mục thì tắt video (`stopVideo`). Giữ `YTFast` (`../../assets/yt-fast.js`) nếu dễ gắn, nếu không bỏ và ghi lại.
- Chặn cuộn/zoom trang như cũ (`touch-action:none`).
- Bố cục: ngưỡng rộng/cao < 0.9 → bố cục điện thoại (canvas 852×1846, một ô duy nhất `M`, ô bo góc, không mặt nạ); còn lại → máy tính (canvas 1672×941 neo đáy, vừa khung). Dải thừa khi tỉ lệ khác 16:9: phủ màu giấy, bg-desk-bw mờ dần ra rìa (không cần bản lật gương như cũ, nếu lật gương thì vẫn phải phủ giấy 50%).
- Mục `showArrows=false` thì ẩn mũi tên.

## 6. Bọ
Sprite `../bw-bo/img/bo/*.webp`, đứng trên gò (desktop vị trí cũ [810,131] 51×61; điện thoại [405,353] 62×74, tăng nhẹ nếu thấy nhỏ). Dáng: nghỉ `idle`; mỗi 5-12s đổi nhẹ (wave/think) rồi về idle; đổi mục → `surprised` 0.9s; đang kéo sách → nhìn theo hướng kéo (lật `scaleX(-1)` khi kéo sang phải); vào trang → `wave` 1.5s; 25s không tương tác → `sleep`. Bọ không bấm được (như cũ, `pointer-events:none`). Nếu `assets/bo-idle.js` ghép được (đã có `BoIdle.create/mount/react/look`), có thể dùng thẳng nhưng phải trỏ sang bộ sprite đen trắng; nếu không, viết bộ điều khiển nhỏ như bw-roadmap.

## 7. Liên kết
- Nút bản đồ → `../bw-map/`. "← về Bọ" → `../bw-bo/`. "Khám phá tác phẩm", "Đăng ký" → `../../khampha.html`, `../../dangky.html` (trang thật, qua `journey.json`; `fixHref`: `index.html` → `../bw-bo/`, `roadmap.html` → `../bw-roadmap/`, còn lại `../../<trang>.html`).
- SỬA `prototype/bw-roadmap/app.js`: trong `fixHref` của thanh gợi ý (dòng ~472) thêm `h==='lopf1.html'?'../bw-lopf1/'` để nút "Lớp F1 →" dẫn sang `../bw-lopf1/` (hiện đang là `../../lopf1.html`).
- SỬA `prototype/bw-map/app.js`: trong `fixHref` (dòng ~25) thêm `h==='lopf1.html'?'../bw-lopf1/'` cho viên đá "Lớp F1" (id 5, `href:'lopf1.html'`) và dòng `next-pages` ở khoảng dòng 335 nếu có dùng cùng hàm.
- Trang Bọ `prototype/bw-bo/` nếu có liên kết đến `lopf1.html`: đổi tương tự (kiểm tra bằng grep).

## 8. Kiểm tra bắt buộc
Playwright (Edge, `channel="msedge"`): máy tính 1672×941 và điện thoại 390×844 DPR 2 touch. Ảnh: màn tải, mục 1, lật giữa chừng, mục 4 (video poster), bấm phát (iframe hiện), ngủ (Bọ `sleep`). Kiểm: không cuộn ngang, không lỗi console/404 (lưu ý: trang cũ có 1 lỗi 404 tài nguyên ở máy tính, chưa rõ nguồn: kiểm tra xem trang mẫu có lặp lại không), chữ tiếng Việt đúng dấu, chữ nút ≥16px máy tính và ≥14px điện thoại, vùng chạm ≥44px, kéo/bàn phím/bánh xe/mũi tên đều đổi mục, `?freeze=1` không còn chuyển động. Không chữ hướng dẫn kiểu "Chạm…", "Nhấn…".

## 9. Điểm khó cần lưu ý
- Ba ô tranh dùng `matrix3d` + mặt nạ bitmap: phải giữ đúng thứ tự lớp (ảnh dưới, khung trên) và gom viền mực bằng `drop-shadow` chồng; thử hiệu năng trên điện thoại.
- Sách trên bệ vẽ lại phải khớp vị trí sách của khung lật `bookfx` (neo đáy sách cx 835, bottom 829, rộng 204 máy tính; điện thoại cx 425.5, bottom 1378, rộng 351), nếu không hiệu ứng lật lệch.
- Ảnh nội dung của mục (ảnh chụp người, tranh màu) phải đọc được khi chuyển xám: tăng tương phản nhẹ, tram chấm không quá dày.
- Ô điện thoại mượt khi kéo: lớp `shift` dịch rất nhỏ (1.8%), không dịch cả khung.

## 10. Đã dựng (cập nhật cho khớp trang mẫu) và quyết định của quản lý
- Tệp: `prototype/bw-lopf1/{index.html,style.css,app.js}`, `tools/prep_assets.py` (xuất WebP và cắt 6 vật từ `parts-bw.png`: `pedestal-d|m`, `mound-d|m`, `fgL`, `fgR`; nền q82), `tools/shoot.py` (chụp kiểm, cổng 8767), `tools/shots/`.
- Ô giữa (mục đang xem, và ô điện thoại) giữ ảnh MÀU; hai ô bên grayscale + tram chấm nhẹ. Đổi mục: ô mới vào giữa chuyển xám sang màu trong 300ms. Video đang phát giữ màu.
- Khung ô: ba lớp theo đúng mặt nạ (bóng mực lệch 6/7px, viền mực +7px, nền giấy +4px) qua bộ lọc `#hand` (feTurbulence). Không viền phát sáng. Chùm sáng: 10 nét mực mảnh (SVG), nhịp đậm nhạt 5.6s.
- Sách: 12 khung `bookfx` KHÔNG dùng (sách vẽ lại to hơn, khác góc nhìn); thay bằng trang lật SVG nét mực trên sách mới (gáy x=836 máy tính, x=426 điện thoại), neo theo `BOOKS` trong `app.js`.
- Nút trước/sau và chú thích: thẻ giấy viền mực, Be Vietnam Pro; chú thích 17px máy tính, 15px điện thoại; nút gợi ý 16px/14px. Không có chữ hướng dẫn. Mở trang vào mục 1.
- Bọ: tự viết bộ điều khiển (idle, wave khi vào trang, surprised khi đổi mục, point khi kéo, listen khi phát video, wave/think ngẫu nhiên 5-12s, sleep sau 25s); không dùng `bo-idle.js`.
- Liên kết: đã sửa `fixHref` trong `bw-roadmap/app.js` và `bw-map/app.js` (`lopf1.html` → `../bw-lopf1/`).
- Bỏ so với đặc tả ban đầu: không có bản lật gương (`ext`), dải thừa phủ giấy; không dùng `YTFast` ngoài việc gọi nếu có.
