# Bộ cube mới cho trang Phương pháp (LƯU ĐỂ SỬA SAU)

Trạng thái: CHỈ lưu trữ + kiểm tra. method.html, method.json, admin.html chưa bị sửa. Ảnh nằm ở `assets/method/next-cubes/` (không trang nào dùng).

## 1. Nguồn
- File gốc: `/root/.claude/uploads/a06d4c8c-eb6c-55cc-9434-eb025661069b/daf829fc-ME_MORI_New_Rune_Cubes.zip`, 10 793 707 byte (10,3 MB, hơn 8 MB nên KHÔNG chép vào repo), sha256 `38c129dc9231e01d57ac753cb1be005e53d563a02a66e8aebd1097fb903917ca`.
- Zip chỉ có 8 PNG RGBA (không README, không manifest). Mỗi ảnh 1254x1254, 1,25 đến 1,6 MB.
- Lời người dùng: bộ mới, không ghép hình giống nhau nữa mà ghép 3 hình khác nhau; sau đó đổi: "có thể khác hoặc giống, sẽ setup sau".

## 2. Kiểm tra (đã xem bảng ghép nền xám và nền magenta, phóng to 2x một mép)
| File | Biểu tượng (đoán từ hình) |
|---|---|
| 01_cube_heart | trái tim |
| 02_cube_book | sách mở |
| 03_cube_skull | đầu lâu |
| 04_cube_leaf | chiếc lá |
| 05_cube_dice | xúc xắc |
| 06_cube_robot | robot |
| 07_cube_masked_person | người mũ trùm đeo khẩu trang |
| 08_cube_spark_lightning | tia chớp có tia tỏa |

- 8 khối khác nhau, mỗi khối 1 biểu tượng duy nhất; KHÔNG có nhóm A/B/C như bộ cũ. Số thứ tự 01 đến 08 trong tên file chưa chắc là nhóm (đoán: chỉ là thứ tự).
- Phong cách: khối đá đục thô, rune cam phát sáng khắc trên mặt trước, ánh sáng từ trên-trái. Cùng phong cách với bộ cũ.
- Không có chữ hay UI in sẵn. Không bóng đổ hay lớp glow tách riêng: vầng sáng cam nằm bên trong khối, nền ngoài trong suốt hoàn toàn (alpha 0). Không thấy viền sáng/halo trên nền magenta, mép mềm, không bị cắt thẳng; chạm mép canvas: không (alpha biên tối đa 1/255, là nhiễu).
- Canvas thống nhất 1254x1254, tỉ lệ khối gần như nhau (rộng khối 880 đến 1060 px; robot/đầu lâu lớn nhất, sách nhỏ nhất, chênh khoảng 15%: đoán là do hình, nên chuẩn hóa kích thước khi dùng).
- Bộ cũ (`assets/method/cube-*.webp`): 9 khối, 3 biểu tượng (xoắn ốc, mắt, núi) x 3 biến thể A/B/C, mỗi cái khoảng 265x265 px, 15 đến 19 KB, đã cắt sát. Bộ mới: 8 khối, 8 biểu tượng, canvas gốc lớn gấp ~4,7 lần, vì vậy phải thu nhỏ.
- Kết luận: DÙNG ĐƯỢC. Lưu ý: 8 khối chứ không phải 9 (không chia hết cho 3 nhóm 3x3 như bộ cũ), cần khối thứ 9 hoặc đổi logic số khối.

## 3. Bản lưu tối ưu
`assets/method/next-cubes/cube-{heart,book,skull,leaf,dice,robot,masked-person,spark-lightning}.webp`: 294x300, WebP có alpha (alpha_quality 100), 18 đến 21 KB mỗi file, cắt theo hộp bao chung nên cùng canvas/tỉ lệ. Danh sách: `assets/method/next-cubes.json`. Tên biểu tượng trong đó là ĐOÁN.

## 4. Quy tắc ghép phải CẤU HÌNH ĐƯỢC (việc sau này)
Hiện tại (method.html + method.json `rules`): `required:3`, mỗi phương pháp gắn 1 `symbol`, `cubeSymbols` ánh xạ cube-id sang symbol, ghép đúng khi 3 khối cùng symbol. Admin kiểm tra: mỗi symbol chỉ 1 phương pháp, mỗi symbol cần >= `required` khối.

Đề xuất thêm vào `rules` (đây là đoán thiết kế, chưa chốt):
- `matchMode`: `"identical"` (3 khối cùng symbol, hành vi cũ, mặc định để không vỡ trang cũ) | `"distinct"` (3 khối symbol khác nhau) | `"custom"` (danh sách bộ ba hợp lệ).
- `orderSensitive`: boolean. Nếu true thì A-B-C khác C-B-A (thứ tự thả vào đĩa), nếu false thì coi là tập hợp.
- `combos`: mảng `{ "id", "cubes": ["heart","book","leaf"], "methodId": "m-..." }`, dùng khi `custom`. Với `identical`/`distinct`, ánh xạ phương pháp suy ra từ symbol đầu hoặc từ bảng `methodBySymbolSet`.
- `wrongBehaviour`: `"return"` (trả về, hiện là `mixedDropReturns`) | `"shake"` (hiện là `wrongShake`) | `"both"`; giữ `mixedDropReturns`, `wrongShake` để tương thích ngược, và thêm `wrongText` đã có ở `page`.
- `cubeSymbols` đổi nghĩa thành `cubes`: `{ id, image, label, symbol? }`, vì bộ mới mỗi khối là một symbol riêng; `symbols` (nhãn) vẫn giữ.
- `pileOrder`: đủ 8 id mới (hoặc 9 nếu thêm khối).
- `required` giữ 3 (số khối cần thả vào đĩa).

Thay đổi admin.html (tab `method`, khoảng dòng 432 đến 480):
- Thêm các trường trên (select matchMode, checkbox orderSensitive, danh sách combos có ô chọn 3 khối + chọn phương pháp, select wrongBehaviour).
- Viết lại hàm kiểm tra hiện có (dòng 465 đến 476): với `identical` giữ như cũ; với `distinct` cần >= 3 symbol khác nhau và mỗi phương pháp phải có ít nhất 1 bộ ba hợp lệ; với `custom` kiểm bộ ba hợp lệ (3 id tồn tại, không trùng bộ, mọi phương pháp có ít nhất một bộ ba, cảnh báo nếu 2 phương pháp cùng một bộ ba); báo "sẽ không bao giờ mở được" như hiện nay.
- Thêm `assets/content/defaults/method.json` tương ứng nếu có file mặc định (chưa kiểm tra file này).

## 5. Câu hỏi mở (tối đa 6)
1. Luật mặc định của bộ mới là 3 khác nhau hay 3 giống nhau? Hay cả hai cùng bật (đoán: để admin chọn)?
2. Với 8 khối: ba phương pháp thì mỗi phương pháp ứng với những bộ ba nào? (Với `distinct`, C(8,3)=56 bộ ba, cần quy tắc gán, ví dụ theo tập hợp biểu tượng hay theo "loại"). Cần thêm khối thứ 9 không?
3. Thứ tự thả có quan trọng không (đoán: không)?
4. Ghép sai thì làm gì: trả khối về đống, rung, hiện chữ gợi ý? Có thể khối bất kỳ vào đĩa nhưng chỉ bộ hợp lệ mới mở?
5. Số phương pháp có tăng quá 3 không, và 8 biểu tượng (tim, sách, đầu lâu, lá, xúc xắc, robot, người che mặt, tia chớp) có tên/ý nghĩa gắn vào phương pháp nào không?
6. Kích thước hiển thị và việc chuẩn hóa tỉ lệ (bản lưu 294x300; cần bản lớn hơn cho màn 2x không?).
