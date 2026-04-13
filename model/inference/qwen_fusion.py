"""
Qwen融合模块
将原图和细节图像融合，发送给通义千问进行民族识别
"""

import sys
from pathlib import Path
from typing import List, Dict, Optional, Union
import numpy as np

# 添加父目录到路径
sys.path.append(str(Path(__file__).parent.parent))

from inference.qwen_client import QwenVLClient


class QwenFusion:
    """
    Qwen融合识别器

    将原图和细节图像一起发送给通义千问，实现高精度民族识别
    """

    def __init__(
        self,
        api_key: str,
        model: str = "qwen-vl-plus"
    ):
        """
        初始化融合识别器

        Args:
            api_key: 通义千问API密钥
            model: 模型名称
        """
        self.client = QwenVLClient(
            api_key=api_key,
            model=model
        )

        self.model = model
        print(f"Qwen融合识别器初始化完成")
        print(f"  模型: {model}")

    def recognize(
        self,
        original_image: Union[str, Path, np.ndarray],
        detail_images: Optional[List[Union[str, Path, np.ndarray]]] = None,
        prompt: Optional[str] = None,
        max_details: int = 8
    ) -> Dict:
        """
        融合识别

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表
            prompt: 自定义提示词
            max_details: 最多使用多少张细节图像

        Returns:
            识别结果字典
        """
        # 限制细节图像数量
        if detail_images:
            detail_images = detail_images[:max_details]

        # 使用自定义提示词或默认提示词
        if prompt is None:
            prompt = self._get_default_prompt(detail_images)

        # 调用通义千问识别
        result = self.client.recognize_ethnic(
            original_image=original_image,
            detail_images=detail_images,
            prompt=prompt
        )

        # 添加融合信息
        result["fusion_mode"] = "multi_image" if detail_images else "single_image"
        result["num_detail_images"] = len(detail_images) if detail_images else 0

        return result

    def recognize_detailed(
        self,
        original_image: Union[str, Path, np.ndarray],
        detail_images: Optional[List[Union[str, Path, np.ndarray]]] = None
    ) -> Dict:
        """
        详细识别，返回更多特征信息

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表

        Returns:
            详细识别结果
        """
        result = self.client.recognize_detailed(
            original_image=original_image,
            detail_images=detail_images
        )

        # 添加融合信息
        result["fusion_mode"] = "multi_image" if detail_images else "single_image"
        result["num_detail_images"] = len(detail_images) if detail_images else 0

        return result

    def recognize_with_confidence(
        self,
        original_image: Union[str, Path, np.ndarray],
        detail_images: Optional[List[Union[str, Path, np.ndarray]]] = None,
        num_samples: int = 3
    ) -> Dict:
        """
        多次识别并计算置信度

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表
            num_samples: 采样次数

        Returns:
            识别结果和置信度
        """
        result = self.client.recognize_with_confidence(
            original_image=original_image,
            detail_images=detail_images,
            num_samples=num_samples
        )

        # 添加融合信息
        result["fusion_mode"] = "multi_image" if detail_images else "single_image"
        result["num_detail_images"] = len(detail_images) if detail_images else 0

        return result

    def _get_default_prompt(self, detail_images: Optional[List]) -> str:
        """
        获取默认提示词

        Args:
            detail_images: 细节图像列表

        Returns:
            提示词字符串
        """
        base_prompt = """请仔细观察这张民族服饰照片，识别出这是哪个民族的服饰。

请根据以下特征进行判断：
1. 领口设计（立领、圆领、无领等）
2. 刺绣纹样和针法
3. 银饰和其他装饰
4. 整体颜色搭配
5. 图案和纹样特点

请只返回民族名称，例如：苗族、藏族、彝族等。"""

        if detail_images:
            return base_prompt + "\n\n我提供了几个细节放大图像，请仔细观察这些细节特征，这有助于更准确地识别民族。"

        return base_prompt

    def compare_recognition(
        self,
        original_image: Union[str, Path, np.ndarray],
        detail_images: Optional[List[Union[str, Path, np.ndarray]]] = None
    ) -> Dict:
        """
        比较直接识别和细节增强识别的结果

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表

        Returns:
            比较结果字典
        """
        print("执行对比识别...")

        # 直接识别（原图）
        print("  1. 直接识别（原图）...")
        result_direct = self.recognize(original_image, detail_images=None)

        # 细节增强识别
        if detail_images:
            print("  2. 细节增强识别（原图+细节）...")
            result_detailed = self.recognize(original_image, detail_images=detail_images)
        else:
            result_detailed = None

        # 比较结果
        comparison = {
            "direct": result_direct,
            "detailed": result_detailed,
            "consistent": None,
            "recommendation": None
        }

        if result_direct["success"] and result_detailed and result_detailed["success"]:
            # 检查结果是否一致
            is_consistent = result_direct["ethnic_group"] == result_detailed["ethnic_group"]
            comparison["consistent"] = is_consistent

            # 给出建议
            if is_consistent:
                comparison["recommendation"] = result_detailed["ethnic_group"]
                comparison["recommendation_reason"] = "两种方法结果一致，建议使用细节增强识别结果"
            else:
                comparison["recommendation"] = result_detailed["ethnic_group"]
                comparison["recommendation_reason"] = "两种方法结果不一致，建议使用细节增强识别结果（基于更多细节信息）"

        elif result_detailed and result_detailed["success"]:
            comparison["recommendation"] = result_detailed["ethnic_group"]
            comparison["recommendation_reason"] = "直接识别失败，使用细节增强识别结果"
        elif result_direct["success"]:
            comparison["recommendation"] = result_direct["ethnic_group"]
            comparison["recommendation_reason"] = "细节增强识别失败，使用直接识别结果"
        else:
            comparison["recommendation"] = None
            comparison["recommendation_reason"] = "两种方法都失败"

        return comparison


def main():
    """测试代码"""
    # 示例：创建融合识别器
    api_key = "your-api-key-here"

    fusion = QwenFusion(api_key=api_key)

    # 示例：融合识别
    # original_image = "path/to/image.jpg"
    # detail_images = ["detail1.jpg", "detail2.jpg"]
    #
    # result = fusion.recognize(original_image, detail_images)
    # print(result)

    # 示例：对比识别
    # comparison = fusion.compare_recognition(original_image, detail_images)
    # print(f"直接识别: {comparison['direct'].get('ethnic_group')}")
    # print(f"细节增强识别: {comparison['detailed'].get('ethnic_group')}")
    # print(f"是否一致: {comparison['consistent']}")
    # print(f"建议: {comparison['recommendation']}")


if __name__ == '__main__':
    main()