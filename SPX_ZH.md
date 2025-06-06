# SPX 文件格式说明
`.spx` 是一个被设计为具备灵活性、可扩展性以及支持专属保护的 `3DGS` 模型格式

<br>

- [x] `灵活性` 优化的文件头，有效的压缩率，灵活的数据块
- [x] `扩展性` 已开放的格式，并预留方案方便扩展
- [x] `专属性` 可自定义专属格式，有效保护数据



## 文件头 (128 bytes)

文件头固定长 `128` 字节，固定的前缀用于文件格式识别，文件头包含模型的包围盒数据用来优化排序计算，专属识别号用于提示包含特定的数据块格式

| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~2 | ASCII | `*`固定 | 固定值 `spx` |
| 3 | uint8 | `*`版本号 | 当前只有 `1` |
| 4~7 | uint32 | `*`高斯点数 |  |
| 8~11 | float32 | `*`MinX | 包围盒的minX |
| 12~15 | float32 | `*`MaxX | 包围盒的maxX |
| 16~19 | float32 | `*`MinY | 包围盒的minY |
| 20~23 | float32 | `*`MaxY | 包围盒的maxY |
| 24~27 | float32 | `*`MinZ | 包围盒的minZ |
| 28~31 | float32 | `*`MaxZ | 包围盒的maxZ |
| 32~35 | float32 | MinTopY | 最小中心高度 |
| 36~39 | float32 | MaxTopY | 最大中心高度 |
| 40~43 | uint32 | 创建日期 | YYYYMMDD |
| 44~47 | uint32 | `*`生成器识别号 | 自定义`0(官方)`以外用的唯一值来标识生成器自己 |
| 48~51 | uint32 | `*`专属识别号 | 自定义`0(公开)`以外表示非公开的自定义数据块格式 |
| 52    | uint8 | 球谐系数级别 | `0,1,2,3`其他数值按`0`看待 |
| 53    | uint8 | 标识1 | 用以区分不同形式的模型，默认`0` |
| 54    | uint8 | 标识2 | 是否倒立，默认`0` |
| 55    | uint8 | 标识3 | 预留 |
| 56–63 |  | 预留 |  |
| 64~123 | ASCII | 注释 | 最长60个ASCII字符 |
| 124~127 | uint32 | `*`校验码 | 用于生成器校验是否为自己生成的模型 |


---


## 数据块

数据块通常由多个组成，每个数据块有基本的固定格式，其中数据部分支持自定义格式

### 数据块结构

| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~3 | int32 | `*`数据块的长度 | 长度不包含本字段，负值表示数据块内容是否有gzip压缩 |
| 0~n | bytes | `*`数据块内容 |  |


### 数据块内容

| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~3 | uint32 | `*`数量 | 高斯数量 |
| 4~7 | uint32 | `*`格式识别号 | 用于标识数据格式 |
| 8~n | bytes | `*`数据 |  |


---


## 开放的数据块内容格式

数据块内容的格式包含开放格式和自定义专属格式，预留 `0~255` 用于定义开放格式，自定义专属格式时使用其他数值

<br>


✅  开放格式`20`，基本数据


| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~3 | uint32 | `*`数量 | 高斯数量 |
| 4~7 | uint32 | `*`格式识别号 | `20`基本数据 |
| 8~n | bytes | `*`数据 | x...y...z...sx...sy...sz...r...g...b...a...rw...rx...ry...rz... |

- `x,y,z` 坐标，24位编码
- `sx,sy,sz` 缩放，单字节编码
- `r,g,b,a` 颜色和透明度，单字节编码
- `rw,rx,ry,rz` 旋转，单字节编码

---



✅  开放格式`1`，球谐系数1级数据（仅1级数据）


| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~3 | uint32 | `*`数量 | 高斯数量 |
| 4~7 | uint32 | `*`格式识别号 | `1`球谐系数1级数据 |
| 8~n | bytes | `*`数据 | sh0...sh8,sh0...sh8,... |

- `sh0...sh8` 球谐系数，单字节编码

---


✅  开放格式`2`，球谐系数2级数据（含1级数据）


| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~3 | uint32 | `*`数量 | 高斯数量 |
| 4~7 | uint32 | `*`格式识别号 | `2`球谐系数1级和2级数据 |
| 8~n | bytes | `*`数据 | sh0...sh23,sh0...sh23,... |

- `sh0...sh23` 球谐系数，单字节编码

---


✅  开放格式`3`，球谐系数3级数据（仅3级数据）


| 字节偏移 | 类型 | 名称 | 说明 |
|----------|------|------|------|
| 0~3 | uint32 | `*`数量 | 高斯数量 |
| 4~7 | uint32 | `*`格式识别号 | `3`球谐系数3级数据 |
| 8~n | bytes | `*`数据 | sh24...sh44,sh24...sh44,... |

- `sh24...sh44` 球谐系数，单字节编码

---
