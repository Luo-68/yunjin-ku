"""
数据加载和预处理模块
用于准备YOLOv8训练数据
"""

import os
import json
import shutil
from pathlib import Path
from typing import List, Tuple, Dict, Optional
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from tqdm import tqdm


class EthnicDatasetPreparer:
    """
    民族服饰数据集准备工具
    """

    def __init__(
        self,
        data_root: str,
        train_ratio: float = 0.8,
        img_size: int = 640
    ):
        """
        初始化数据准备器

        Args:
            data_root: 数据根目录
            train_ratio: 训练集比例
            img_size: 目标图像尺寸
        """
        self.data_root = Path(data_root)
        self.train_ratio = train_ratio
        self.img_size = img_size

        # 目录结构
        self.images_dir = self.data_root / 'images'
        self.labels_dir = self.data_root / 'labels'

        # 类别名称
        self.class_names = {
            0: 'neckline',
            1: 'embroidery',
            2: 'silver',
            3: 'pattern',
            4: 'sleeve',
            5: 'waistband'
        }

    def prepare_from_sources(self, source_dirs: List[str]):
        """
        从源目录准备数据集

        Args:
            source_dirs: 源图片目录列表
        """
        print("开始准备数据集...")

        # 收集所有图片
        all_images = []
        for source_dir in source_dirs:
            source_path = Path(source_dir)
            if source_path.exists():
                for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp', '*.bmp']:
                    all_images.extend(source_path.glob(ext))

        print(f"找到 {len(all_images)} 张图片")

        # 划分训练集和验证集
        train_images, val_images = train_test_split(
            all_images,
            train_size=self.train_ratio,
            random_state=42
        )

        print(f"训练集: {len(train_images)} 张")
        print(f"验证集: {len(val_images)} 张")

        # 复制图片
        self._copy_images(train_images, 'train')
        self._copy_images(val_images, 'val')

        print("数据集准备完成！")

    def _copy_images(self, images: List[Path], split: str):
        """
        复制图片到目标目录

        Args:
            images: 图片路径列表
            split: 数据集划分 ('train' 或 'val')
        """
        target_dir = self.images_dir / split
        target_dir.mkdir(parents=True, exist_ok=True)

        print(f"复制 {len(images)} 张图片到 {split} 集合...")

        for img_path in tqdm(images):
            # 目标文件名：使用民族名称作为前缀
            ethnic_name = img_path.parent.name
            target_name = f"{ethnic_name}_{img_path.name}"
            target_path = target_dir / target_name

            # 复制图片
            shutil.copy2(img_path, target_path)

            # 创建空的标注文件
            label_path = self.labels_dir / split / f"{target_path.stem}.txt"
            label_path.parent.mkdir(parents=True, exist_ok=True)
            # 创建空文件（等待标注）
            label_path.touch()

    def validate_dataset(self) -> Dict:
        """
        验证数据集

        Returns:
            验证结果字典
        """
        print("验证数据集...")

        results = {
            'total_images': 0,
            'total_labels': 0,
            'missing_labels': [],
            'invalid_labels': [],
            'images_without_labels': 0,
            'labels_without_images': 0
        }

        # 检查训练集
        train_images = list((self.images_dir / 'train').glob('*'))
        train_labels = list((self.labels_dir / 'train').glob('*.txt'))

        results['total_images'] += len(train_images)
        results['total_labels'] += len(train_labels)

        # 检查验证集
        val_images = list((self.images_dir / 'val').glob('*'))
        val_labels = list((self.labels_dir / 'val').glob('*.txt'))

        results['total_images'] += len(val_images)
        results['total_labels'] += len(val_labels)

        # 检查图片是否有对应的标注
        for img in train_images + val_images:
            label_path = (self.labels_dir / img.parent.name / f"{img.stem}.txt")
            if not label_path.exists():
                results['missing_labels'].append(str(img))
                results['images_without_labels'] += 1

        # 检查标注是否有对应的图片
        for label in train_labels + val_labels:
            # 检查多种图片格式
            img_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp']
            img_found = False
            for ext in img_extensions:
                img_path = (self.images_dir / label.parent.name / f"{label.stem}{ext}")
                if img_path.exists():
                    img_found = True
                    break
            if not img_found:
                results['invalid_labels'].append(str(label))
                results['labels_without_images'] += 1

        # 打印结果
        print(f"总图片数: {results['total_images']}")
        print(f"总标注数: {results['total_labels']}")
        print(f"缺少标注的图片: {results['images_without_labels']}")
        print(f"缺少图片的标注: {results['labels_without_images']}")

        return results

    def verify_annotation(self, annotation_path: Path) -> bool:
        """
        验证标注文件格式

        Args:
            annotation_path: 标注文件路径

        Returns:
            是否有效
        """
        try:
            with open(annotation_path, 'r') as f:
                lines = f.readlines()

            for line in lines:
                parts = line.strip().split()
                if len(parts) != 5:
                    return False

                class_id = int(parts[0])
                if class_id not in self.class_names:
                    return False

                x_center, y_center, width, height = map(float, parts[1:])
                if not all(0 <= val <= 1 for val in [x_center, y_center, width, height]):
                    return False

            return True

        except Exception as e:
            print(f"验证标注文件失败 {annotation_path}: {e}")
            return False

    def get_statistics(self) -> Dict:
        """
        获取数据集统计信息

        Returns:
            统计信息字典
        """
        stats = {
            'train': {'total': 0, 'annotated': 0, 'class_counts': {}},
            'val': {'total': 0, 'annotated': 0, 'class_counts': {}}
        }

        for split in ['train', 'val']:
            images_dir = self.images_dir / split
            labels_dir = self.labels_dir / split

            images = list(images_dir.glob('*'))
            stats[split]['total'] = len(images)

            # 统计标注
            for label_path in labels_dir.glob('*.txt'):
                if label_path.stat().st_size > 0:  # 非空文件
                    stats[split]['annotated'] += 1

                    with open(label_path, 'r') as f:
                        for line in f:
                            class_id = int(line.strip().split()[0])
                            class_name = self.class_names[class_id]

                            if class_name not in stats[split]['class_counts']:
                                stats[split]['class_counts'][class_name] = 0
                            stats[split]['class_counts'][class_name] += 1

        return stats

    def create_data_yaml(self, output_path: str):
        """
        创建YOLO格式的数据配置文件

        Args:
            output_path: 输出路径
        """
        data_config = {
            'path': str(self.data_root.absolute()),
            'train': 'images/train',
            'val': 'images/val',
            'names': self.class_names,
            'nc': len(self.class_names)
        }

        import yaml
        with open(output_path, 'w', encoding='utf-8') as f:
            yaml.dump(data_config, f, default_flow_style=False, allow_unicode=True)

        print(f"数据配置文件已创建: {output_path}")


def main():
    """测试代码"""
    # 示例：准备数据集
    preparer = EthnicDatasetPreparer(
        data_root='E:/开发者/Yun Jin Ku/model/data',
        train_ratio=0.8
    )

    # 从源目录准备数据
    source_dirs = [
        'E:/开发者/Yun Jin Ku/56个少数民族图片',
        'E:/开发者/Yun Jin Ku/6大民族详细图片/白族绕三灵',
        'E:/开发者/Yun Jin Ku/6大民族详细图片/藏族',
        'E:/开发者/Yun Jin Ku/6大民族详细图片/苗族',
        'E:/开发者/Yun Jin Ku/6大民族详细图片/维吾尔族',
        'E:/开发者/Yun Jin Ku/6大民族详细图片/彝族',
        'E:/开发者/Yun Jin Ku/6大民族详细图片/壮族'
    ]

    # 准备数据集
    preparer.prepare_from_sources(source_dirs)

    # 验证数据集
    results = preparer.validate_dataset()

    # 获取统计信息
    stats = preparer.get_statistics()
    print("\n数据集统计:")
    print(json.dumps(stats, indent=2, ensure_ascii=False))

    # 创建数据配置文件
    preparer.create_data_yaml('E:/开发者/Yun Jin Ku/model/detector/data.yaml')


if __name__ == '__main__':
    main()