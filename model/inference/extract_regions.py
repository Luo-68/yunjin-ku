"""
关键区域提取模块
使用YOLOv8检测器提取民族服饰的关键区域
"""

import sys
from pathlib import Path
from typing import List, Dict, Optional, Union
import cv2
import numpy as np

# 添加父目录到路径
sys.path.append(str(Path(__file__).parent.parent))

from detector.yolov8_custom import EthnicRegionDetector


class RegionExtractor:
    """
    关键区域提取器

    使用YOLOv8检测器提取以下关键区域：
    - 0: neckline（领口）
    - 1: embroidery（刺绣）
    - 2: silver（银饰）
    - 3: pattern（纹样）
    - 4: sleeve（袖口）
    - 5: waistband（腰带）
    """

    def __init__(
        self,
        weights_path: str,
        config_path: str = "config.yaml",
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ):
        """
        初始化区域提取器

        Args:
            weights_path: YOLOv8模型权重路径
            config_path: 配置文件路径
            conf_threshold: 置信度阈值
            iou_threshold: IOU阈值
        """
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold

        # 初始化检测器
        self.detector = EthnicRegionDetector(config_path)
        self.detector.load_model(weights_path)

        print(f"区域提取器初始化完成")
        print(f"  模型权重: {weights_path}")
        print(f"  置信度阈值: {conf_threshold}")
        print(f"  IOU阈值: {iou_threshold}")

    def extract(
        self,
        image: Union[str, np.ndarray],
        visualize: bool = False,
        output_path: Optional[str] = None
    ) -> Dict:
        """
        提取关键区域

        Args:
            image: 输入图像（路径或numpy数组）
            visualize: 是否可视化检测结果
            output_path: 可视化结果保存路径

        Returns:
            提取结果字典，包含：
            - success: 是否成功
            - regions: 检测到的区域列表
            - count: 区域数量
            - original_image: 原始图像
        """
        # 读取图像
        if isinstance(image, str):
            img = cv2.imread(image)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img_path = image
        else:
            img = image.copy()
            img_path = None

        if img is None:
            return {
                "success": False,
                "error": "无法读取图像",
                "regions": [],
                "count": 0
            }

        # 执行检测
        try:
            detections = self.detector.predict(
                img,
                conf=self.conf_threshold,
                iou=self.iou_threshold
            )

            # 可视化
            if visualize:
                vis_img = self.detector.visualize(img, detections)
                if output_path:
                    cv2.imwrite(output_path, cv2.cvtColor(vis_img, cv2.COLOR_RGB2BGR))
                    print(f"可视化结果已保存: {output_path}")

            # 格式化结果
            regions = []
            for det in detections:
                regions.append({
                    "bbox": det["bbox"],
                    "class_id": det["class_id"],
                    "class_name": det["class_name"],
                    "confidence": det["conf"]
                })

            return {
                "success": True,
                "regions": regions,
                "count": len(regions),
                "original_image": img,
                "image_path": img_path
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "regions": [],
                "count": 0
            }

    def extract_batch(
        self,
        images: List[Union[str, np.ndarray]],
        **kwargs
    ) -> List[Dict]:
        """
        批量提取关键区域

        Args:
            images: 图像列表
            **kwargs: 传递给extract的参数

        Returns:
            提取结果列表
        """
        return [self.extract(img, **kwargs) for img in images]

    def get_class_statistics(self, regions: List[Dict]) -> Dict:
        """
        获取区域类别统计

        Args:
            regions: 区域列表

        Returns:
            类别统计字典
        """
        class_names = self.detector.class_names
        stats = {name: 0 for name in class_names.values()}

        for region in regions:
            class_name = region["class_name"]
            stats[class_name] += 1

        return stats

    def filter_by_classes(
        self,
        regions: List[Dict],
        class_ids: List[int]
    ) -> List[Dict]:
        """
        按类别ID筛选区域

        Args:
            regions: 区域列表
            class_ids: 类别ID列表

        Returns:
            筛选后的区域列表
        """
        return [r for r in regions if r["class_id"] in class_ids]

    def filter_by_confidence(
        self,
        regions: List[Dict],
        min_confidence: float
    ) -> List[Dict]:
        """
        按置信度筛选区域

        Args:
            regions: 区域列表
            min_confidence: 最小置信度

        Returns:
            筛选后的区域列表
        """
        return [r for r in regions if r["confidence"] >= min_confidence]


def main():
    """测试代码"""
    # 示例：创建区域提取器
    weights_path = "checkpoint/ethnic_region_detector/weights/best.pt"

    extractor = RegionExtractor(
        weights_path=weights_path,
        conf_threshold=0.25,
        iou_threshold=0.45
    )

    # 示例：提取区域
    # image_path = "path/to/image.jpg"
    # result = extractor.extract(
    #     image_path,
    #     visualize=True,
    #     output_path="output.jpg"
    # )
    #
    # if result["success"]:
    #     print(f"检测到 {result['count']} 个区域")
    #     for region in result["regions"]:
    #         print(f"  - {region['class_name']}: {region['confidence']:.2f}")
    # else:
    #     print(f"提取失败: {result.get('error')}")


if __name__ == '__main__':
    main()