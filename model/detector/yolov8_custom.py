"""
YOLOv8 定制模型 - 民族服饰关键区域检测
基于 ultralytics/ultralytics 库实现
"""

import os
import yaml
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union
import cv2
import numpy as np
import torch
from PIL import Image

try:
    from ultralytics import YOLO
except ImportError:
    raise ImportError(
        "请先安装 ultralytics 库：pip install ultralytics"
    )


class EthnicRegionDetector:
    """
    民族服饰关键区域检测器

    使用YOLOv8检测以下关键区域：
    - 0: neckline（领口）
    - 1: embroidery（刺绣）
    - 2: silver（银饰）
    - 3: pattern（纹样）
    - 4: sleeve（袖口）
    - 5: waistband（腰带）
    """

    def __init__(self, config_path: str = "config.yaml"):
        """
        初始化检测器

        Args:
            config_path: 配置文件路径
        """
        self.config = self._load_config(config_path)
        self.model = None
        self.device = self.config['train'].get('device', 0)
        self.class_names = self.config['data']['names']

    def _load_config(self, config_path: str) -> Dict:
        """加载配置文件"""
        config_file = Path(__file__).parent / config_path
        with open(config_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def load_model(self, weights_path: Optional[str] = None):
        """
        加载模型

        Args:
            weights_path: 模型权重路径，如果为None则加载预训练模型
        """
        model_name = self.config['model']['name']
        if weights_path:
            self.model = YOLO(weights_path)
            print(f"加载模型权重: {weights_path}")
        else:
            self.model = YOLO(f"{model_name}.pt")
            print(f"加载预训练模型: {model_name}.pt")

        # 设置设备
        self.model.to(self.device)

    def train(self, resume: bool = False, epochs: Optional[int] = None):
        """
        训练模型

        Args:
            resume: 是否从断点恢复训练
            epochs: 训练轮数，如果为None则使用配置文件中的值
        """
        if self.model is None:
            self.load_model()

        # 准备训练参数
        train_config = self.config['train'].copy()

        # 更新epoch
        if epochs is not None:
            train_config['epochs'] = epochs

        # 更新resume参数
        if resume:
            resume_path = Path(self.config['output']['checkpoint_dir']) / \
                          self.config['train']['name'] / \
                          self.config['output']['last_model']
            if resume_path.exists():
                train_config['resume'] = str(resume_path)
                print(f"从断点恢复训练: {resume_path}")
            else:
                print("未找到断点文件，从头开始训练")
                resume = False

        # 训练模型
        results = self.model.train(
            data=self._prepare_data_yaml(),
            **train_config
        )

        return results

    def _prepare_data_yaml(self) -> str:
        """准备YOLO格式的数据配置文件"""
        data_config = {
            'path': str(Path(__file__).parent.parent / 'data'),
            'train': 'images/train',
            'val': 'images/val',
            'names': self.class_names,
            'nc': len(self.class_names)
        }

        # 保存临时配置文件
        yaml_path = Path(__file__).parent / 'data.yaml'
        with open(yaml_path, 'w', encoding='utf-8') as f:
            yaml.dump(data_config, f, default_flow_style=False, allow_unicode=True)

        return str(yaml_path)

    def predict(
        self,
        image: Union[str, np.ndarray, Image.Image, torch.Tensor],
        conf: Optional[float] = None,
        iou: Optional[float] = None,
        max_det: Optional[int] = None
    ) -> List[Dict]:
        """
        预测图像中的关键区域

        Args:
            image: 输入图像（路径、numpy数组、PIL图像或tensor）
            conf: 置信度阈值
            iou: IOU阈值
            max_det: 最大检测数

        Returns:
            检测结果列表，每个元素包含：
            - bbox: [x1, y1, x2, y2] (像素坐标)
            - conf: 置信度
            - class_id: 类别ID
            - class_name: 类别名称
        """
        if self.model is None:
            raise ValueError("模型未加载，请先调用 load_model()")

        # 设置推理参数
        infer_config = self.config['inference'].copy()
        if conf is not None:
            infer_config['conf_thres'] = conf
        if iou is not None:
            infer_config['iou_thres'] = iou
        if max_det is not None:
            infer_config['max_det'] = max_det

        # 执行推理
        results = self.model.predict(
            image,
            conf=infer_config['conf_thres'],
            iou=infer_config['iou_thres'],
            max_det=infer_config['max_det'],
            device=self.device,
            verbose=False
        )

        # 解析结果
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    xyxy = box.xyxy[0].cpu().numpy()  # [x1, y1, x2, y2]
                    conf_val = box.conf[0].cpu().numpy()
                    cls_id = int(box.cls[0].cpu().numpy())

                    detections.append({
                        'bbox': xyxy.astype(int).tolist(),
                        'conf': float(conf_val),
                        'class_id': cls_id,
                        'class_name': self.class_names[cls_id]
                    })

        return detections

    def predict_batch(
        self,
        images: List[Union[str, np.ndarray, Image.Image]],
        **kwargs
    ) -> List[List[Dict]]:
        """
        批量预测

        Args:
            images: 图像列表
            **kwargs: 传递给predict的参数

        Returns:
            检测结果列表（每张图像的结果）
        """
        return [self.predict(img, **kwargs) for img in images]

    def export(self, format: str = 'onnx', **kwargs):
        """
        导出模型

        Args:
            format: 导出格式 (onnx, torchscript, etc.)
        """
        if self.model is None:
            raise ValueError("模型未加载")

        export_path = self.model.export(format=format, **kwargs)
        print(f"模型已导出到: {export_path}")
        return export_path

    def get_model_info(self) -> Dict:
        """获取模型信息"""
        if self.model is None:
            return {}

        info = {
            'model_name': self.config['model']['name'],
            'num_classes': len(self.class_names),
            'class_names': self.class_names,
            'device': self.device
        }

        return info

    def visualize(
        self,
        image: Union[str, np.ndarray, Image.Image],
        detections: List[Dict],
        save_path: Optional[str] = None
    ) -> np.ndarray:
        """
        可视化检测结果

        Args:
            image: 输入图像
            detections: 检测结果
            save_path: 保存路径，如果为None则不保存

        Returns:
            可视化后的图像
        """
        # 读取图像
        if isinstance(image, str):
            img = cv2.imread(image)
        elif isinstance(image, Image.Image):
            img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        else:
            img = image.copy()

        # 为每个类别定义颜色
        colors = [
            (255, 0, 0),    # neckline - 红色
            (0, 255, 0),    # embroidery - 绿色
            (0, 0, 255),    # silver - 蓝色
            (255, 255, 0),  # pattern - 黄色
            (255, 0, 255),  # sleeve - 紫色
            (0, 255, 255)   # waistband - 青色
        ]

        # 绘制检测框
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            conf = det['conf']
            class_id = det['class_id']
            class_name = det['class_name']

            # 选择颜色
            color = colors[class_id % len(colors)]

            # 绘制矩形
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            # 绘制标签
            label = f"{class_name}: {conf:.2f}"
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(img, (x1, y1 - label_size[1] - 10),
                         (x1 + label_size[0], y1), color, -1)
            cv2.putText(img, label, (x1, y1 - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # 保存图像
        if save_path:
            cv2.imwrite(save_path, img)
            print(f"可视化结果已保存到: {save_path}")

        return img


def main():
    """测试代码"""
    detector = EthnicRegionDetector()

    # 示例：训练模型
    # detector.load_model()
    # detector.train(epochs=100)

    # 示例：加载已训练的模型
    # detector.load_model('checkpoint/ethnic_region_detector/weights/best.pt')

    # 示例：预测
    # detections = detector.predict('path/to/image.jpg')
    # print(detections)

    # 示例：可视化
    # img = detector.visualize('path/to/image.jpg', detections, 'output.jpg')


if __name__ == '__main__':
    main()
