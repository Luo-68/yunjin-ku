# 民族服饰识别系统 - 使用指南

## 系统概述

本系统采用**Qwen辅助模型方案**，通过以下流程提升大模型的民族识别精度：

```
原图 → YOLOv8检测关键区域 → 裁剪并放大细节 → 通义千问3-VL-Plus识别
```

### 核心组件

1. **YOLOv8检测器** - 检测6种关键区域：领口、刺绣、银饰、纹样、袖口、腰带
2. **区域裁剪器** - 裁剪并放大检测到的关键区域（4倍放大）
3. **通义千问客户端** - 使用多模态大模型进行民族识别

---

## 快速开始

### 1. 环境安装

```bash
# 进入项目目录
cd E:\开发者\Yun Jin Ku\model

# 安装依赖
pip install -r detector/requirements.txt
```

### 2. 准备数据

#### 方式1：使用现有图片（需要标注）

```bash
# 准备数据集（将图片复制到数据目录）
python detector/data_loader.py
```

#### 方式2：手动组织数据

```
model/data/
├── images/
│   ├── train/
│   │   ├── 白族_image1.jpg
│   │   ├── 藏族_image1.jpg
│   │   └── ...
│   └── val/
│       └── ...
└── labels/
    ├── train/
    │   ├── 白族_image1.txt
    │   ├── 藏族_image1.txt
    │   └── ...
    └── val/
        └── ...
```

### 3. 标注数据

使用 **LabelImg** 标注工具：

```bash
# 安装LabelImg
pip install labelImg

# 启动标注工具
labelImg model/data/images/train model/data/labels/train -classes "neckline embroidery silver pattern sleeve waistband"
```

标注格式（YOLO格式）：
```
<class_id> <x_center> <y_center> <width> <height>
```

详见：`model/ANNOTATION_GUIDE.md`

### 4. 训练模型

```bash
# 进入detector目录
cd model/detector

# 从头训练
python train.py --epochs 100 --batch-size 16

# 从断点恢复训练
python train.py --resume
```

### 5. 使用模型识别

```python
from inference.pipeline import EthnicRecognitionPipeline

# 创建识别流程
pipeline = EthnicRecognitionPipeline(
    yolov8_weights="checkpoint/ethnic_region_detector/weights/best.pt",
    qwen_api_key="your-qwen-api-key"
)

# 识别单张图像
result = pipeline.recognize(
    image="path/to/image.jpg",
    use_details=True,
    save_intermediate=True,
    output_dir="output"
)

print(result)
```

---

## 详细使用说明

### A. 数据准备

#### 自动准备数据集

```bash
python detector/data_loader.py
```

这将自动：
- 从源目录复制图片
- 划分训练集（80%）和验证集（20%）
- 创建空的标注文件

#### 手动标注

1. 安装LabelImg：
   ```bash
   pip install labelImg
   ```

2. 启动标注：
   ```bash
   labelImg images/train labels/train
   ```

3. 标注规则：
   - 至少标注3个区域
   - 最多标注8个区域
   - 框住关键特征区域

4. 保存格式：
   ```
   1 0.5 0.3 0.2 0.15  # class_id x_center y_center width height
   ```

### B. 模型训练

#### 基础训练

```bash
cd model/detector

# 使用默认配置训练
python train.py

# 自定义参数训练
python train.py --epochs 200 --batch-size 8 --device 0
```

#### 断点训练

```bash
# 训练中断后，使用以下命令继续
python train.py --resume

# 或指定断点文件
python train.py --resume --weights checkpoint/ethnic_region_detector/weights/last.pt
```

#### 训练参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--epochs` | 训练轮数 | 100 |
| `--batch-size` | 批次大小 | 16 |
| `--img-size` | 图像尺寸 | 640 |
| `--lr` | 学习率 | 0.01 |
| `--device` | GPU设备ID | 0 |
| `--workers` | 数据加载线程数 | 8 |
| `--resume` | 从断点恢复 | False |

### C. 模型推理

#### Python API

```python
from inference.pipeline import EthnicRecognitionPipeline

# 初始化
pipeline = EthnicRecognitionPipeline(
    yolov8_weights="checkpoint/ethnic_region_detector/weights/best.pt",
    qwen_api_key="your-api-key"
)

# 识别单张图像
result = pipeline.recognize(
    image="image.jpg",
    use_details=True,
    save_intermediate=True,
    output_dir="output"
)

# 批量识别
images = ["img1.jpg", "img2.jpg", "img3.jpg"]
results = pipeline.recognize_batch(images, output_dir="output")
```

#### 返回结果格式

```json
{
  "success": true,
  "ethnic_group": "苗族",
  "confidence": 0.95,
  "method": "detailed",
  "detections": [
    {
      "bbox": [100, 50, 200, 150],
      "conf": 0.95,
      "class_id": 1,
      "class_name": "embroidery"
    }
  ],
  "cropped_regions": 6,
  "details": [
    {
      "class_name": "embroidery",
      "zoom_factor": 4.0,
      "confidence": 0.95
    }
  ]
}
```

### D. 调试和优化

#### 查看检测结果

```python
from detector.yolov8_custom import EthnicRegionDetector

detector = EthnicRegionDetector()
detector.load_model("checkpoint/ethnic_region_detector/weights/best.pt")

detections = detector.predict("image.jpg")

# 可视化
detector.visualize("image.jpg", detections, "output.jpg")
```

#### 调整裁剪参数

```python
from inference.crop_and_zoom import RegionCropper

cropper = RegionCropper(
    zoom_factor=4.0,    # 放大倍数
    padding=15,         # 边界框填充
    min_size=100,       # 最小尺寸
    max_size=500        # 最大尺寸
)
```

---

## 项目结构

```
model/
├── data/                      # 数据目录
│   ├── images/               # 图像
│   │   ├── train/
│   │   └── val/
│   └── labels/               # 标注
│       ├── train/
│       └── val/
├── detector/                  # YOLOv8检测器
│   ├── yolov8_custom.py      # 定制YOLO模型
│   ├── train.py              # 训练脚本
│   ├── data_loader.py        # 数据加载工具
│   ├── config.yaml           # 配置文件
│   ├── requirements.txt      # 依赖包
│   └── checkpoint/           # 模型检查点
│       └── ethnic_region_detector/
│           └── weights/
│               ├── best.pt
│               └── last.pt
├── inference/                 # 推理模块
│   ├── pipeline.py           # 端到端流程
│   ├── crop_and_zoom.py      # 区域裁剪
│   └── qwen_client.py        # 通义千问客户端
├── ANNOTATION_GUIDE.md       # 标注指南
└── USAGE_GUIDE.md            # 使用指南
```

---

## 常见问题

### Q1: 训练时显存不足

**解决方法**：
- 减小 `batch_size`：`python train.py --batch-size 8`
- 减小 `img_size`：`python train.py --img-size 512`
- 使用多GPU训练

### Q2: 检测精度不高

**解决方法**：
- 增加训练数据量
- 检查标注质量
- 增加训练轮数：`python train.py --epochs 200`
- 使用更大的模型：修改 `config.yaml` 中的 `model.name` 为 `yolov8s` 或 `yolov8m`

### Q3: 识别结果不准确

**解决方法**：
- 检查检测到的区域是否准确
- 调整裁剪参数（zoom_factor, padding）
- 增加细节图像数量
- 使用通义千问的详细识别模式

### Q4: API调用失败

**解决方法**：
- 检查API密钥是否正确
- 检查网络连接
- 检查API额度是否充足
- 查看错误日志

---

## 性能优化建议

### 训练优化

1. **数据增强**：在 `config.yaml` 中调整增强参数
2. **学习率调度**：使用余弦退火学习率
3. **混合精度训练**：设置 `amp: true`

### 推理优化

1. **模型量化**：导出为ONNX格式
   ```python
   detector.export(format='onnx')
   ```
2. **批量推理**：使用 `recognize_batch` 方法
3. **缓存模型**：避免重复加载模型

---

## 后续扩展

### 1. 添加新的关键区域类型

1. 在 `config.yaml` 中添加新类别
2. 更新 `class_names` 字典
3. 重新标注数据
4. 重新训练模型

### 2. 集成其他大模型

修改 `inference/qwen_client.py`，添加其他模型的API支持。

### 3. Web界面

使用Flask或FastAPI创建Web服务，提供HTTP接口。

---

## 联系和支持

如有问题，请查看：
- 标注指南：`model/ANNOTATION_GUIDE.md`
- 配置文件：`model/detector/config.yaml`
- 方案文档：`model/Qwen辅助模型方案讨论记录.md`