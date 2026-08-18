# MỤC TIÊU CHÍNH

Điều tra tài nguyên game Unity cũ và **DỰNG LẠI EFFECT GỐC CỦA GAME**.

Đây là mục tiêu quan trọng nhất.

Tôi đã dùng **AssetStudio (AS)** export Texture2D thành PNG thành công.

Ví dụ các file gốc dạng hash:

```text
0a5ce6dd43c12b34eaf358dc53a0b7b2
00c44e6ae2af3814fb11feb9f2b54195
```

Bên trong có Texture2D như:

```text
NV_HaTucDao_ava_to
VC_ThienDinhQuyet_vo_cong_to
```

Game dùng khoảng:

```text
Unity 4.7.2f1
SerializedFile version 9
```

## KHÔNG cần làm lại việc export PNG

AssetStudio đã làm được.

Không tốn thời gian viết Texture2D decoder.

---

# MỤC TIÊU CUỐI CÙNG

Từ resource gốc của game, phải tìm ra cách effect được cấu tạo và dựng lại được effect nhìn càng giống game gốc càng tốt.

Một effect có thể bao gồm:

```text
Effect
├── GameObject / Prefab
├── ParticleSystem
├── Material
│   ├── Shader
│   ├── Texture
│   └── Blend mode
├── Mesh
├── Sprite / Texture sheet
├── AnimationClip
├── Transform animation
├── UV animation
├── Color animation
├── Scale animation
├── Alpha animation
├── Rotation
├── Trail
├── Billboard
├── Light
└── Script/config điều khiển
```

Nhiệm vụ là tìm lại các liên kết này.

---

# GIAI ĐOẠN 1 — ĐIỀU TRA EFFECT THẬT SỰ NẰM Ở ĐÂU

Scan resource và tìm các Unity object liên quan đến effect.

Ưu tiên tìm:

```text
ParticleSystem
ParticleRenderer
MeshRenderer
SkinnedMeshRenderer
Mesh
Material
Shader
Texture2D
AnimationClip
Animator
Animation
GameObject
Transform
MonoBehaviour
Prefab
TrailRenderer
LineRenderer
```

Do đây là **Unity 4.7.2**, phải chú ý cấu trúc object và ParticleSystem của Unity đời cũ.

Không được áp cấu trúc Unity 2019/2020/2021 một cách máy móc.

---

# GIAI ĐOẠN 2 — TÌM RESOURCE CÓ TÊN LIÊN QUAN EFFECT

Thống kê internal name.

Tìm các pattern như:

```text
effect
eff
fx
vfx
skill
magic
spell
hit
boom
fire
light
glow
flash
trail
smoke
dust
buff
aura
weapon
attack
```

Ngoài tiếng Anh cần kiểm tra cả cách đặt tên riêng của game.

Tìm những resource có quan hệ với:

```text
võ công
skill
đòn đánh
buff
nhân vật
vũ khí
boss
```

Không kết luận chỉ dựa vào tên.

Phải kiểm chứng dependency.

---

# GIAI ĐOẠN 3 — TÌM PARTICLE SYSTEM

Đây là ưu tiên rất cao.

Nếu Serialized Asset có ParticleSystem, hãy extract toàn bộ thông số có thể lấy được.

Ví dụ:

```text
duration
looping
startLifetime
startSpeed
startSize
startRotation
startColor
gravityModifier
maxParticles

emission rate
bursts

shape
shapeType
radius
angle

velocity
force
color over lifetime
size over lifetime
rotation over lifetime

texture sheet animation
renderer mode
render material
sorting
mesh
```

Tên field của Unity 4.7 có thể khác Unity hiện đại.

Phải dựa trên serialized data thực tế.

Xuất thông số thành dạng dễ đọc:

```text
effect_name.json
```

---

# GIAI ĐOẠN 4 — TÌM MATERIAL

Với mỗi ParticleSystem/MeshRenderer:

tìm Material mà nó reference.

Sau đó lấy:

```text
Material name
Shader
Texture
Tint color
Main color
Alpha
Blend mode
Cull
ZWrite
ZTest
RenderQueue
UV scale
UV offset
```

Đặc biệt quan trọng:

```text
Source Blend
Destination Blend
```

vì sai blending sẽ khiến effect nhìn hoàn toàn khác.

Ví dụ phải phân biệt:

```text
Alpha Blend
Additive
Multiply
Premultiplied Alpha
```

---

# GIAI ĐOẠN 5 — TÌM TEXTURE CỦA EFFECT

PNG đã export sẵn.

Không cần decode.

Nhiệm vụ là tìm:

```text
Material
   ↓
Texture2D
   ↓
PNG đã export
```

Ví dụ:

```text
Effect_Sword_01
    ↓
mat_sword_light
    ↓
tex_sword_light
    ↓
tex_sword_light.png
```

Nếu effect sử dụng texture atlas / sprite sheet, phải xác định:

```text
rows
columns
frame count
frame order
FPS
UV animation
```

Không được chỉ lấy PNG rồi cho rằng đó đã là effect.

---

# GIAI ĐOẠN 6 — TÌM MESH EFFECT

Nhiều effect game Trung Quốc đời cũ không chỉ dùng ParticleSystem.

Có thể dùng:

```text
plane
quad
ring
cylinder
sphere
custom mesh
ribbon
slash mesh
```

sau đó chạy:

```text
texture animation
UV scroll
scale
rotation
alpha animation
```

Vì vậy phải tìm Mesh reference từ effect.

Nếu AssetStudio export được mesh thì sử dụng.

Nếu cần, export:

```text
OBJ
FBX
```

hoặc đọc vertex/index trực tiếp.

---

# GIAI ĐOẠN 7 — TÌM ANIMATIONCLIP

Kiểm tra effect có AnimationClip hay không.

Đặc biệt tìm animation của:

```text
Transform.position
Transform.rotation
Transform.scale

Material color
Material alpha

UV offset
Texture frame

Renderer enabled
```

Có những effect không dùng ParticleSystem mà chỉ là:

```text
Mesh
+
Material
+
AnimationClip
```

Ví dụ:

```text
vòng sáng dưới chân
kiếm khí
luồng sáng
pháp trận
vệt chém
tia sáng
```

Phải hỗ trợ trường hợp này.

---

# GIAI ĐOẠN 8 — TÌM MONOBEHAVIOUR / SCRIPT ĐIỀU KHIỂN EFFECT

Nếu có:

```text
Assembly-CSharp.dll
Assembly-CSharp-firstpass.dll
```

hãy decompile bằng:

```text
ILSpy
dnSpy
```

Search:

```text
Effect
EffectManager
EffectController
SkillEffect
PlayEffect
CreateEffect
LoadEffect
DestroyEffect
Particle
Material
Shader
Animation
Skill
Buff
```

Tìm code:

```text
effect id
→ resource name
→ prefab
→ attach bone
→ duration
→ scale
→ offset
→ rotation
```

Đây có thể là chìa khóa để dựng đúng effect.

---

# GIAI ĐOẠN 9 — TÌM CONFIG SKILL → EFFECT

Điều tra:

```text
skill ID
effect ID
resource ID
effect filename
prefab name
```

Search database/config như:

```text
*.xml
*.json
*.txt
*.csv
*.bytes
*.dat
*.bin
*.db
```

Ví dụ mục tiêu tìm được:

```text
Thiên Định Quyết
     ↓
Skill ID 1032
     ↓
Effect ID 5012
     ↓
FX_Skill_5012
     ↓
Prefab
     ↓
Particle + Material + Texture
```

Nếu tồn tại mapping kiểu này thì phải ghi lại.

---

# GIAI ĐOẠN 10 — TẠO DEPENDENCY GRAPH CHO TỪNG EFFECT

Đây là output cực kỳ quan trọng.

Ví dụ:

```text
FX_ThiênĐịnhQuyết
│
├── GameObject Root
│
├── ParticleSystem_01
│   └── Material
│       ├── Shader/Additive
│       └── light_01.png
│
├── ParticleSystem_02
│   └── Material
│       └── smoke_01.png
│
├── RingMesh
│   ├── Mesh
│   └── Material
│       └── magic_circle.png
│
└── AnimationClip
    ├── Scale
    ├── Rotation
    └── Alpha
```

Không chỉ liệt kê file.

Phải chỉ ra **chúng kết hợp với nhau như thế nào để tạo thành effect**.

---

# GIAI ĐOẠN 11 — CHỌN 1 EFFECT MẪU ĐỂ DỰNG TRƯỚC

Không cố dựng toàn bộ game ngay.

Chọn effect có dependency tương đối đầy đủ.

Ưu tiên:

```text
1 skill effect
```

hoặc:

```text
1 buff/aura
```

hoặc:

```text
1 hit effect
```

Dựng hoàn chỉnh effect này trước.

Mục tiêu là chứng minh pipeline reverse hoạt động.

---

# GIAI ĐOẠN 12 — TẠO TEST SCENE

Tạo một scene preview riêng.

Ví dụ:

```text
EffectLab
```

Scene phải có:

```text
Camera
Ground
Effect Root
Play
Pause
Restart
Slow motion nếu tiện
```

Có thể chạy effect độc lập mà không cần toàn bộ game.

---

# GIAI ĐOẠN 13 — DỰNG LẠI EFFECT

Từ dữ liệu reverse được:

tạo lại hierarchy.

Ví dụ:

```text
FX_001
├── Particle_Flash
├── Particle_Smoke
├── Ring
├── Slash
└── Glow
```

Áp lại:

```text
position
rotation
scale

particle settings

material

texture

mesh

animation

lifetime

timing
```

Mục tiêu ưu tiên:

```text
VISUAL FIDELITY
```

không phải chỉ "chạy được".

---

# RẤT QUAN TRỌNG — TIMING

Effect thường phụ thuộc timing.

Ví dụ:

```text
0.00s flash
0.05s ring
0.10s slash
0.15s sparks
0.30s smoke
0.80s fade
```

Phải cố gắng phục hồi đúng timing.

Nếu timing nằm trong:

```text
AnimationClip
ParticleSystem
MonoBehaviour
skill config
```

thì phải lấy từ dữ liệu gốc.

Không tự đoán nếu có thể reverse được.

---

# RẤT QUAN TRỌNG — SHADER

Effect cũ có thể dùng custom shader.

Tìm tất cả Shader liên quan.

Nếu shader gốc còn tồn tại:

phân tích:

```text
properties
textures
blend
cull
zwrite
ztest
color
UV
vertex animation
```

Nếu shader binary/compiled không thể dùng trực tiếp:

hãy dựng shader thay thế có hành vi tương đương.

Ưu tiên khôi phục:

```text
Additive
Alpha blending
UV scroll
Tint
Vertex color
Soft particle nếu có
Mask
Distortion nếu có
```

Không cần giống source shader.

Cần giống **kết quả hiển thị**.

---

# RẤT QUAN TRỌNG — KHÔNG ĐƯỢC BỎ QUA CÁC EFFECT DÙNG MESH

Không được assume:

```text
effect = particle
```

Game mobile Unity cũ rất có thể dùng nhiều:

```text
mesh + transparent texture + animation
```

để tiết kiệm hiệu năng.

Phải điều tra cả hai hướng.

---

# OUTPUT CẦN TẠO

Tạo thư mục nghiên cứu:

```text
effect_research/
```

Bên trong:

```text
effect_research/
├── inventory/
├── dependencies/
├── materials/
├── particles/
├── animations/
├── shaders/
├── configs/
├── reconstructed/
└── reports/
```

---

# TẠO EFFECT DATABASE

Tạo:

```text
effects.csv
```

Các cột:

```text
effect_id
effect_name
source_asset
prefab
particle_count
materials
textures
meshes
animations
shader
skill_id
status
notes
```

---

# STATUS CHO MỖI EFFECT

Dùng:

```text
UNKNOWN
IDENTIFIED
DEPENDENCIES_FOUND
PARTIALLY_RECONSTRUCTED
RECONSTRUCTED
VERIFIED
```

---

# HANDOFF

Phải duy trì:

```text
HANDOFF.md
```

Ghi liên tục:

```text
# Mục tiêu

Dựng lại effect gốc của game.

# Unity version

4.7.2f1

# Những effect đã tìm thấy

# Dependency đã xác định

# ParticleSystem

# Material

# Shader

# Texture

# Mesh

# Animation

# Skill → Effect mapping

# Effect đã dựng lại

# Sai khác so với bản gốc

# Vấn đề chưa giải quyết

# Công việc tiếp theo
```

Cập nhật HANDOFF liên tục để phiên Agent sau có thể tiếp tục ngay.

---

# CÁCH LÀM VIỆC

KHÔNG:

```text
chỉ đưa kế hoạch rồi dừng
```

Phải:

```text
điều tra
→ tìm dependency
→ kiểm chứng
→ dựng thử
→ so sánh
→ sửa
→ ghi HANDOFF
→ tiếp tục
```

Không hỏi tôi lại sau mỗi bước.

Nếu đủ dữ liệu thì tự tiếp tục.

Nếu một hướng thất bại, thử hướng khác.

---

# THỨ TỰ ƯU TIÊN

## Ưu tiên 1

Tìm **1 effect hoàn chỉnh** trong resource.

## Ưu tiên 2

Reverse toàn bộ dependency:

```text
Effect
→ Particle/Mesh
→ Material
→ Shader
→ Texture
→ Animation
```

## Ưu tiên 3

Tìm config hoặc source code liên kết:

```text
Skill → Effect
```

## Ưu tiên 4

Dựng lại effect đó trong một test scene độc lập.

## Ưu tiên 5

Sau khi pipeline đầu tiên thành công mới tự động hóa cho các effect còn lại.

---

# KẾT QUẢ MONG MUỐN ĐẦU TIÊN

Không cần dựng hàng trăm effect ngay.

Kết quả milestone đầu tiên phải là:

```text
1 EFFECT GỐC
       ↓
reverse được dependency
       ↓
tìm đủ texture/material/mesh/particle/animation
       ↓
dựng lại
       ↓
chạy được trong EffectLab
       ↓
hình ảnh gần giống effect gốc
```

Sau khi đạt milestone này mới mở rộng pipeline cho toàn bộ game.

Bắt đầu điều tra resource hiện tại ngay và ưu tiên tìm một effect có dependency đầy đủ để dựng thử.
