# 民族服饰识别系统 - Qwen辅助模型方案

## 项目简介

本系统基于 **Qwen辅助模型方案**，通过YOLOv8检测关键区域并放大细节，结合通义千问3-VL-Plus多模态大模型，实现高精度的民族服饰识别。

### 核心思想

```
原图 → YOLOv8检测关键区域 → 裁剪并放大细节 → 通义千问3-VL-Plus识别
```

### 关键区域类型

系统自动检测以下6种关键区域：

| 类别ID | 类别名称 | 说明 |
|--------|---------|------|
| 0 | neckline | 领口 |
| 1 | embroidery | 刺绣 |
| 2 | silver | 银饰 |
| 3 | pattern | 纹样 |
| 4 | sleeve | 袖口 |
| 5 | waistband | 腰带 |

---

## 快速开始

### 1. 安装依赖

```bash
cd model
pip install -r detector/requirements.txt
```

### 2. 准备数据

```bash
# 复制现有图片到数据目录
python detector/data_loader.py
```

### 3. 标注数据

使用LabelImg标注工具标注关键区域：

```bash
pip install labelImg
labelImg data/images/train data/labels/train
```

详见：[标注指南](ANNOTATION_GUIDE.md)

### 4. 训练模型

```bash
cd detector
python train.py --epochs 100
```

### 5. 使用模型

```python
from inference.pipeline import EthnicRecognitionPipeline

pipeline = EthnicRecognitionPipeline(
    yolov8_weights="checkpoint/ethnic_region_detector/weights/best.pt",
    qwen_api_key="your-api-key"
)

result = pipeline.recognize("image.jpg")
print(result)
```

详见：[使用指南](USAGE_GUIDE.md)

---

## 项目结构

```
model/
├── data/                          # 数据目录
│   ├── images/                   # 图像
│   └── labels/                   # 标注
├── detector/                      # YOLOv8检测器
│   ├── yolov8_custom.py         # 定制YOLO模型
│   ├── train.py                 # 训练脚本
│   ├── data_loader.py           # 数据加载工具
│   ├── config.yaml              # 配置文件
│   └── checkpoint/              # 模型检查点
├── inference/                     # 推理模块
│   ├── pipeline.py              # 端到端流程
│   ├── crop_and_zoom.py         # 区域裁剪
│   └── qwen_client.py           # 通义千问客户端
├── ANNOTATION_GUIDE.md           # 标注指南
├── USAGE_GUIDE.md                # 使用指南
├── demo.py                       # 示例脚本
└── README.md                     # 本文件
```

---

## 功能特性

### YOLOv8检测器

- 基于 ultralytics/ultralytics 库
- 支持6种关键区域检测
- 支持断点训练
- 可配置的训练参数

### 区域裁剪器

- 自动裁剪检测到的区域
- 4倍放大细节
- 图像增强（锐化、对比度、亮度）
- 生成拼贴图

### 通义千问客户端

- 支持多图输入
- 支持详细识别模式
- 支持置信度计算
- 自动JSON响应解析

### 端到端流程

- 一键识别
- 支持批量处理
- 自动保存中间结果
- 完整的错误处理

---

## 技术栈

- **检测模型**: YOLOv8 (ultralytics)
- **大模型**: 通义千问3-VL-Plus
- **图像处理**: OpenCV, PIL
- **深度学习**: PyTorch
- **数据格式**: YOLO格式

---

## 配置说明

### YOLOv8配置

配置文件：`detector/config.yaml`

主要参数：
- `model.name`: 模型名称（yolov8n, yolov8s, yolov8m等）
- `train.epochs`: 训练轮数
- `train.batch_size`: 批次大小
- `train.img_size`: 图像尺寸
- `train.lr`: 学习率

### API配置

在 `inference/qwen_client.py` 中配置：
- `api_key`: 通义千问API密钥
- `model`: 模型名称（默认：qwen-vl-plus）

---

## 使用示例

### 示例1：单张图像识别

```bash
python demo.py
# 选择选项 1
```

### 示例2：批量识别

```bash
python demo.py
# 选择选项 2
```

### 示例3：自定义识别

```python
from inference.pipeline import EthnicRecognitionPipeline

pipeline = EthnicRecognitionPipeline(
    yolov8_weights="checkpoint/ethnic_region_detector/weights/best.pt",
    qwen_api_key="your-api-key"
)

result = pipeline.recognize(
    image="image.jpg",
    use_details=True,
    save_intermediate=True,
    output_dir="output"
)

print(f"识别结果: {result['ethnic_group']}")
```

---

## 训练指南

### 基础训练

```bash
cd detector
python train.py --epochs 100 --batch-size 16
```

### 断点训练

```bash
python train.py --resume
```

### 自定义参数

```bash
python train.py \
    --epochs 200 \
    --batch-size 8 \
    --img-size 512 \
    --device 0 \
    --workers 4
```

---

## 性能指标

- **检测速度**: ~10ms/图像（GPU）
- **识别速度**: ~2-3秒/图像（含API调用）
- **模型大小**: ~6MB（yolov8n）
- **支持分辨率**: 最高4K

---

## 常见问题

### Q: 训练时显存不足？

A: 减小 `batch_size` 或 `img_size`

### Q: 检测精度不高？

A: 增加训练数据量，检查标注质量

### Q: API调用失败？

A: 检查API密钥和网络连接

详见：[使用指南](USAGE_GUIDE.md)

---

## 相关文档

- [标注指南](ANNOTATION_GUIDE.md) - 如何标注数据
- [使用指南](USAGE_GUIDE.md) - 详细使用说明
- [方案文档](Qwen辅助模型方案讨论记录.md) - 技术方案说明

---

## 许可证

本项目仅供学习和研究使用。

---

## 联系方式

如有问题或建议，请查看相关文档或提交Issue。