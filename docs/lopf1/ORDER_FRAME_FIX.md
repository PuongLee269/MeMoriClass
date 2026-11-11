# ORDER_FRAME_FIX - bộ khung ảnh responsive (ME_MORI_Frame) cần sửa để lên production
Hiện trạng: bản nháp đã ghép được bằng code (xem artifact), nhưng chỉ dùng được vì tôi phải tự xử lý ở bước build. Cần designer giao lại:
1. Đồng nhất phong cách: 4 góc và 4 cạnh đang là 3 kiểu khác nhau (góc top_left có 2 đường vàng + glow cam; bottom_left/right chỉ 1 đường vàng + dây leo; cạnh left/right chỉ là sợi vàng mảnh có đầu cong). Tôi chỉ dùng top_left rồi lật gương cho cả 4 góc và 4 cạnh, nên mất dây leo của các góc khác.
2. Độ dày không đều (đo bằng px nguồn): góc 95-120, cạnh top 83, bottom 78, left 50, right 43. Cần cùng một độ dày cho mọi mảnh (đề nghị 120px tại nguồn).
3. Mỗi cạnh phải lặp liền mạch (seamless tile) ở 2 đầu; hiện tôi phải dùng đoạn thẳng của cánh tay góc, lát lật gương (ping-pong) nên mẫu đá bị phản chiếu, thấy hoa văn kim cương ở giữa cạnh.
4. Cánh tay góc quá dài (~1100px) và cắt ngang không có chỗ nối; cần góc ngắn (chỉ khuỷu + ~1x độ dày) có mép cắt vuông, cùng mặt cắt với đầu cạnh để nối không lộ vạch (hiện còn vạch mờ 1px ở chỗ nối).
5. Bottom_left có ô vuông sương mù xám (bbox 0,0,1240,1254) trong nền alpha: cần xóa; các góc khác kiểm lại pixel alpha thấp thừa.
6. Glow cam ngoài viền: giao thành layer riêng (có thể tắt/bật), hiện nằm trong alpha của cánh tay nên viền ngoài hơi bẩn trên nền trời.
7. Tọa độ khoảng mở bên trong (inner opening): hãy ghi sẵn trong manifest (x,y,w,h và bán kính góc trong tính theo ảnh nguồn). Tôi đang đo bằng mắt: mép trong của đường vàng trong cách mép ngoài khung 112px nguồn; bán kính góc trong ~23px stage (852px).
8. Nền 01 (background_restored) còn tàn dư dây leo của khung cũ quanh khung mới (lá ở 2 góc trên, dây dưới đáy): cần vẽ lại nền sạch, vì khung vàng mới không có dây leo.
9. Giao bản export đúng kích thước dùng: khung 852x1846 không cần ảnh 1254px; đề nghị góc 330x300px, cạnh 780x120px.
