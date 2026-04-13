"""
区域裁剪和放大模块
根据YOLOv8检测结果裁剪关键区域并放大细节
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Union
from PIL import Image, ImageEnhance


class RegionCropper:
    """
    区域裁剪和放大工具
    """

    def __init__(
        self,
        zoom_factor: float = 4.0,
        padding: int = 10,
        min_size: int = 100,
        max_size: int = 500
    ):
        """
        初始化裁剪器

        Args:
            zoom_factor: 放大倍数
            padding: 边界框周围的填充像素
            min_size: 裁剪区域的最小尺寸
            max_size: 裁剪区域的最大尺寸
        """
        self.zoom_factor = zoom_factor
        self.padding = padding
        self.min_size = min_size
        self.max_size = max_size

    def crop_regions(
        self,
        image: Union[str, np.ndarray, Image.Image],
        detections: List[Dict],
        enhance: bool = True
    ) -> List[Dict]:
        """
        裁剪检测到的区域

        Args:
            image: 输入图像
            detections: 检测结果列表
            enhance: 是否增强图像

        Returns:
            裁剪结果列表，每个元素包含：
            - cropped_image: 裁剪后的图像
            - bbox: 原始边界框
            - class_name: 类别名称
            - zoom_factor: 实际使用的放大倍数
        """
        # 读取图像
        if isinstance(image, str):
            img = cv2.imread(image)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        elif isinstance(image, Image.Image):
            img = np.array(image)
        else:
            img = image.copy()

        height, width = img.shape[:2]

        cropped_results = []

        for det in detections:
            x1, y1, x2, y2 = det['bbox']

            # 添加填充
            x1 = max(0, x1 - self.padding)
            y1 = max(0, y1 - self.padding)
            x2 = min(width, x2 + self.padding)
            y2 = min(height, y2 + self.padding)

            # 裁剪区域
            cropped = img[y1:y2, x1:x2]

            # 检查裁剪区域大小
            crop_h, crop_w = cropped.shape[:2]

            # 如果区域太小，跳过
            if crop_h < self.min_size or crop_w < self.min_size:
                print(f"跳过过小的区域: {det['class_name']} ({crop_w}x{crop_h})")
                continue

            # 计算合适的放大倍数
            actual_zoom = self._calculate_zoom_factor(crop_w, crop_h)

            # 放大图像
            if actual_zoom > 1.0:
                cropped = self._zoom_image(cropped, actual_zoom)

            # 图像增强
            if enhance:
                cropped = self._enhance_image(cropped)

            cropped_results.append({
                'cropped_image': cropped,
                'bbox': [x1, y1, x2, y2],
                'class_name': det['class_name'],
                'class_id': det['class_id'],
                'zoom_factor': actual_zoom,
                'confidence': det['conf']
            })

        return cropped_results

    def _calculate_zoom_factor(self, width: int, height: int) -> float:
        """
        计算合适的放大倍数

        Args:
            width: 区域宽度
            height: 区域高度

        Returns:
            放大倍数
        """
        # 使用较小的维度计算放大倍数
        min_dim = min(width, height)

        # 目标尺寸：放大后至少达到目标大小
        target_size = self.min_size * self.zoom_factor

        # 计算需要的放大倍数
        calculated_zoom = target_size / min_dim

        # 限制放大倍数范围
        calculated_zoom = max(1.0, min(calculated_zoom, 8.0))

        return calculated_zoom

    def _zoom_image(self, image: np.ndarray, zoom_factor: float) -> np.ndarray:
        """
        放大图像

        Args:
            image: 输入图像
            zoom_factor: 放大倍数

        Returns:
            放大后的图像
        """
        # 使用双三次插值进行高质量放大
        new_size = (
            int(image.shape[1] * zoom_factor),
            int(image.shape[0] * zoom_factor)
        )

        # 如果超过最大尺寸，按比例缩小
        if max(new_size) > self.max_size:
            scale = self.max_size / max(new_size)
            new_size = (
                int(new_size[0] * scale),
                int(new_size[1] * scale)
            )

        # 使用高质量插值
        zoomed = cv2.resize(image, new_size, interpolation=cv2.INTER_CUBIC)

        return zoomed

    def _enhance_image(self, image: np.ndarray) -> np.ndarray:
        """
        增强图像质量

        Args:
            image: 输入图像

        Returns:
            增强后的图像
        """
        # 转换为PIL图像
        pil_img = Image.fromarray(image)

        # 锐化
        enhancer = ImageEnhance.Sharpness(pil_img)
        pil_img = enhancer.enhance(1.3)

        # 对比度
        enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = enhancer.enhance(1.2)

        # 亮度（略微提升）
        enhancer = ImageEnhance.Brightness(pil_img)
        pil_img = enhancer.enhance(1.05)

        # 转回numpy数组
        enhanced = np.array(pil_img)

        return enhanced

    def save_crops(
        self,
        cropped_results: List[Dict],
        output_dir: str,
        prefix: str = "crop"
    ):
        """
        保存裁剪结果

        Args:
            cropped_results: 裁剪结果列表
            output_dir: 输出目录
            prefix: 文件名前缀
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        for i, result in enumerate(cropped_results):
            # 生成文件名
            class_name = result['class_name']
            filename = f"{prefix}_{class_name}_{i:02d}.png"
            filepath = output_path / filename

            # 保存图像
            img_to_save = cv2.cvtColor(result['cropped_image'], cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(filepath), img_to_save)

        print(f"已保存 {len(cropped_results)} 张裁剪图像到 {output_dir}")

    def create_collage(
        self,
        original_image: np.ndarray,
        cropped_results: List[Dict],
        save_path: Optional[str] = None
    ) -> np.ndarray:
        """
        创建拼贴图：原图 + 裁剪区域

        Args:
            original_image: 原始图像
            cropped_results: 裁剪结果列表
            save_path: 保存路径（可选）

        Returns:
            拼贴图
        """
        # 原始图像（调整为统一大小）
        orig_h, orig_w = original_image.shape[:2]
        if orig_w > 600:
            scale = 600 / orig_w
            orig_w = 600
            orig_h = int(orig_h * scale)
        original_resized = cv2.resize(original_image, (orig_w, orig_h))

        # 如果没有裁剪结果，直接返回原图
        if not cropped_results:
            return original_resized

        # 排序裁剪结果（按置信度）
        sorted_crops = sorted(
            cropped_results,
            key=lambda x: x['confidence'],
            reverse=True
        )

        # 取前8个结果
        sorted_crops = sorted_crops[:8]

        # 计算网格布局
        n_crops = len(sorted_crops)
        cols = min(4, n_crops)
        rows = (n_crops + cols - 1) // cols

        # 统一裁剪图像大小
        crop_size = 200
        crop_images = []

        for result in sorted_crops:
            crop = result['cropped_image']
            crop = cv2.resize(crop, (crop_size, crop_size))
            crop_images.append(crop)

        # 创建拼贴
        collage_width = orig_w
        collage_height = orig_h + rows * crop_size + 20

        collage = np.ones((collage_height, collage_width, 3), dtype=np.uint8) * 255

        # 放置原图
        collage[0:orig_h, 0:orig_w] = original_resized

        # 放置裁剪图像
        start_y = orig_h + 10
        for i, crop in enumerate(crop_images):
            row = i // cols
            col = i % cols

            x = col * crop_size + 10
            y = start_y + row * (crop_size + 10)

            # 确保不超出边界
            if x + crop_size <= collage_width and y + crop_size <= collage_height:
                collage[y:y+crop_size, x:x+crop_size] = crop

        # 添加类别标签
        font = cv2.FONT_HERSHEY_SIMPLEX
        for i, result in enumerate(sorted_crops):
            row = i // cols
            col = i % cols

            x = col * crop_size + 10
            y = start_y + row * (crop_size + 10)

            # 绘制标签
            label = f"{result['class_name']}"
            (label_w, label_h), _ = cv2.getTextSize(label, font, 0.5, 2)

            cv2.rectangle(collage, (x, y), (x + label_w + 10, y + 20), (0, 0, 255), -1)
            cv2.putText(collage, label, (x + 5, y + 15), font, 0.5, (255, 255, 255), 2)

        # 保存拼贴图
        if save_path:
            cv2.imwrite(save_path, cv2.cvtColor(collage, cv2.COLOR_RGB2BGR))
            print(f"拼贴图已保存到: {save_path}")

        return collage


def main():
    """测试代码"""
    # 示例：创建裁剪器
    cropper = RegionCropper(
        zoom_factor=4.0,
        padding=15,
        min_size=100,
        max_size=500
    )

    # 示例：模拟检测结果
    detections = [
        {'bbox': [100, 50, 200, 150], 'class_name': 'embroidery', 'class_id': 1, 'conf': 0.95},
        {'bbox': [300, 200, 400, 300], 'class_name': 'silver', 'class_id': 2, 'conf': 0.88},
    ]

    # 示例：裁剪区域
    # image_path = 'path/to/image.jpg'
    # cropped_results = cropper.crop_regions(image_path, detections)
    #
    # # 保存裁剪结果
    # cropper.save_crops(cropped_results, 'output/crops')
    #
    # # 创建拼贴图
    # original = cv2.imread(image_path)
    # original = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
    # collage = cropper.create_collage(original, cropped_results, 'output/collage.jpg')


if __name__ == '__main__':
    main()