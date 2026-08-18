# DaiMinhChu Effect Lab — HANDOFF

## Mục tiêu

Dựng lại và preview effect gốc của Đại Minh Chủ trên web từ tài nguyên Unity 4.7.2f1 đã export bằng AssetStudio.

## Trạng thái hiện tại — v0.3

v0.1/v0.2 dùng Three.js/FBXLoader và phụ thuộc CDN/runtime network nên có trường hợp mở web chỉ thấy UI nhưng effect không hiện.

v0.3 đổi milestone đầu sang renderer tối giản và chắc chắn hơn:

- `index.html` ở root repo.
- `effects-manifest.json` tĩnh, không phụ thuộc GitHub API runtime.
- `web/app.js` hiện dùng **Canvas2D thuần**, không cần Three.js/CDN.
- Mở web tự load effect đầu tiên.
- Đọc trực tiếp OBJ đã export, gồm vertex + UV + face.
- Texture được map **theo từng triangle của OBJ**, giữ đúng quan hệ vertex↔UV, bao gồm trường hợp UV bị xoay/đảo; không còn crop bằng UV min/max.
- Đọc PNG atlas gốc và texture-map từng tam giác lên Canvas2D.
- Có fallback URL: ưu tiên đường dẫn relative khi chạy GitHub Pages, fallback `raw.githubusercontent.com` nếu cần.
- Nếu lỗi JavaScript/network/asset sẽ hiện lỗi màu đỏ ngay trên UI thay vì im lặng.
- Có `Composite` và `Sequence` để xem ghép layer hoặc từng layer.
- Có Additive / Normal / Multiply blending, zoom, pan, restart, speed, grid.
- `.nojekyll` đã thêm để Pages phục vụ static file trực tiếp.
- `.github/workflows/pages.yml` đã thêm để deploy một artifact tối thiểu chỉ gồm web + OBJ/PNG đang dùng, tránh upload toàn bộ APK/repo nặng.

## Phát hiện quan trọng

`AmNhienTieuHonChuong_01.obj` là quad 4 vertex / 2 triangle và UV chỉ vào một vùng nhỏ của atlas. Các `_01..05` có kích thước và UV khác nhau.

Quan trọng hơn: một số layer như `_02`, `_03` có aspect của UV crop khác aspect mesh theo kiểu hoán đổi chiều, cho thấy texture mapping có xoay/orientation riêng. Vì vậy renderer phải dùng đúng face + vertex/UV index thay vì chỉ lấy UV bounding-box.

Điều này củng cố rằng nhiều effect của game là kiểu `mesh quad + texture atlas + animation/material`, không đơn thuần là ParticleSystem.

Milestone v0.3 cố tình chưa phục hồi animation gốc. Mục tiêu là **bắt buộc phải nhìn thấy đúng mảnh texture/mesh của effect trước**, sau đó mới reverse timing/transform/material/shader.

## Effect seed hiện có

### AmNhienTieuHonChuong

- `AmNhienTieuHonChuong_01..05`
- OBJ từ `Tài Nguyên Giải nén/Mesh/<name>.obj`
- texture `Skills_C12_1.png` / `Skills_C12_2.png`

### Attack

- `Attack_01..06`
- OBJ từ `Tài Nguyên Giải nén/Mesh/<name>.obj`
- texture `Skills_C34_1.png`

## File web

- `index.html`
- `web/style.css`
- `web/app.js`
- `effects-manifest.json`
- `.nojekyll`
- `.github/workflows/pages.yml`
- `HANDOFF.md`

## Cách xác nhận đang xem đúng v0.3

Trên sidebar phải thấy dòng:

`Canvas2D · manifest tĩnh · ... nhóm`

Nếu vẫn thấy giao diện cũ/Three.js thì Pages hoặc browser đang cache bản cũ.

## Việc tiếp theo

1. Xác minh Pages đã deploy commit v0.3 và effect đầu tiên thực sự render.
2. Nếu layer hiện nhưng màu/alpha sai, đối chiếu shader/material gốc để xác định blend/tint.
3. Reverse Material/Shader gốc để xác định chính xác blend, render queue, tint, UV scroll và alpha.
4. Tìm timing/transform từ FBX, Animator hoặc MonoBehaviour để phục hồi chuyển động đúng gốc.
5. Xác định `_01..N` của từng skill là layer đồng thời hay frame tuần tự bằng dữ liệu gốc, không đoán.
6. Sau khi một effect match game gốc, chuẩn hóa schema để tái dựng hàng loạt.

## Nguyên tắc

Mục tiêu là **dựng lại effect**. Không quay lại công việc Texture2D -> PNG vì AssetStudio đã xử lý phần đó.
