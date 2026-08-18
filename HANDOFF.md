# DaiMinhChu Effect Lab — HANDOFF

## Mục tiêu

Dựng lại và preview effect gốc của Đại Minh Chủ trên web từ tài nguyên Unity 4.7.2f1 đã export bằng AssetStudio.

## Trạng thái hiện tại — v0.2

Bản v0.1 bị màn hình trống vì danh sách effect được lấy trực tiếp bằng GitHub Contents API ở runtime. Khi request đó lỗi/rate-limit thì catalog = 0 nên không có gì để chọn/load.

v0.2 đã sửa kiến trúc:

- `index.html` ở root repo.
- `effects-manifest.json` tĩnh, không phụ thuộc GitHub API runtime.
- `web/app.js` có fallback manifest nhúng sẵn; manifest lỗi vẫn có effect để test.
- Tự load effect đầu tiên khi mở trang.
- Loader hybrid: ưu tiên FBX trong `Tài Nguyên Giải nén/Animator`, nếu FBX không có renderable mesh hoặc lỗi thì fallback sang OBJ trong `Tài Nguyên Giải nén/Mesh`.
- PNG texture atlas được gắn lại vào mesh bằng `MeshBasicMaterial`.
- Mặc định `AdditiveBlending`, transparent=true, depthWrite=false.
- Có 2 mode: `Composite` ghép toàn bộ `_01..N` và `Sequence` chạy từng layer để kiểm tra.

## Phát hiện quan trọng

`AmNhienTieuHonChuong_01.obj` là quad 4 vertex / 2 triangle và UV chỉ vào một vùng nhỏ của atlas. Các `_01..05` có kích thước và UV khác nhau. Điều này cho thấy nhiều effect của game là kiểu `mesh quad + texture atlas + animation/material`, không đơn thuần là ParticleSystem.

## Effect seed hiện có

### AmNhienTieuHonChuong

- `AmNhienTieuHonChuong_01..05`
- FBX từ `Animator/<name>/<name>.fbx`
- OBJ fallback từ `Mesh/<name>.obj`
- texture `Skills_C12_1.png` / `Skills_C12_2.png`

### Attack

- `Attack_01..06`
- texture `Skills_C34_1.png`

## File web

- `index.html`
- `web/style.css`
- `web/app.js`
- `effects-manifest.json`
- `HANDOFF.md`

## Việc tiếp theo

1. Mở web và xác minh effect đầu tiên render được.
2. Mở rộng manifest cho toàn bộ thư mục Animator/Mesh.
3. Reverse Material/Shader gốc để xác định chính xác blend, render queue, UV scroll và alpha.
4. Tìm timing/transform từ FBX, Animator hoặc MonoBehaviour để phục hồi chuyển động đúng gốc.
5. Xác định `_01..N` của từng skill là layer đồng thời hay frame tuần tự bằng dữ liệu gốc, không đoán.
6. Sau khi một effect match game gốc, chuẩn hóa schema để tái dựng hàng loạt.

## Nguyên tắc

Mục tiêu là **dựng lại effect**. Không quay lại công việc Texture2D -> PNG vì AssetStudio đã xử lý phần đó.
