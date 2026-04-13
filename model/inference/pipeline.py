"""
端到端推理流程
整合YOLOv8检测器、区域裁剪和通义千问识别
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional, Union
import json
import cv2
import numpy as np
from PIL import Image

# 添加父目录到路径
sys.path.append(str(Path(__file__).parent.parent))

from detector.yolov8_custom import EthnicRegionDetector
from inference.crop_and_zoom import RegionCropper
from inference.qwen_client import QwenVLClient


class EthnicRecognitionPipeline:
    """
    民族服饰识别端到端流程
    """

    def __init__(
        self,
        yolov8_weights: str,
        qwen_api_key: str,
        yolov8_config: str = "config.yaml",
        qwen_model: str = "qwen-vl-plus"
    ):
        """
        初始化识别流程

        Args:
            yolov8_weights: YOLOv8模型权重路径
            qwen_api_key: 通义千问API密钥
            yolov8_config: YOLOv8配置文件路径
            qwen_model: 通义千问模型名称
        """
        print("初始化民族服饰识别流程...")

        # 初始化YOLOv8检测器
        print("加载YOLOv8检测器...")
        self.detector = EthnicRegionDetector(yolov8_config)
        self.detector.load_model(yolov8_weights)

        # 初始化区域裁剪器
        print("初始化区域裁剪器...")
        self.cropper = RegionCropper(
            zoom_factor=4.0,
            padding=15,
            min_size=100,
            max_size=500
        )

        # 初始化通义千问客户端
        print("初始化通义千问客户端...")
        self.qwen_client = QwenVLClient(
            api_key=qwen_api_key,
            model=qwen_model
        )

        print("识别流程初始化完成！")

    def recognize(
        self,
        image: Union[str, Path, np.ndarray, Image.Image],
        use_details: bool = True,
        save_intermediate: bool = False,
        output_dir: Optional[str] = None
    ) -> Dict:
        """
        端到端识别

        Args:
            image: 输入图像
            use_details: 是否使用细节图像
            save_intermediate: 是否保存中间结果
            output_dir: 输出目录

        Returns:
            识别结果字典
        """
        print(f"\n开始识别图像...")

        # 读取图像
        if isinstance(image, (str, Path)):
            img_path = str(image)
            img = cv2.imread(img_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        elif isinstance(image, Image.Image):
            img = np.array(image)
            img_path = None
        else:
            img = image.copy()
            img_path = None

        # 步骤1：YOLOv8检测关键区域
        print("步骤1：检测关键区域...")
        detections = self.detector.predict(img)

        if not detections:
            print("警告：未检测到任何关键区域，直接识别原图")
            result = self.qwen_client.recognize_ethnic(img)
            return {
                "success": result["success"],
                "ethnic_group": result.get("ethnic_group"),
                "error": result.get("error"),
                "method": "direct",
                "detections": []
            }

        print(f"检测到 {len(detections)} 个关键区域")
        for det in detections:
            print(f"  - {det['class_name']}: {det['conf']:.2f}")

        # 保存检测结果可视化
        if save_intermediate and output_dir:
            output_path = Path(output_dir) / "detections.jpg"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            vis_img = self.detector.visualize(img, detections, str(output_path))
            print(f"检测结果已保存: {output_path}")

        # 步骤2：裁剪和放大关键区域
        if use_details:
            print("步骤2：裁剪和放大关键区域...")
            cropped_results = self.cropper.crop_regions(img, detections, enhance=True)
            print(f"生成 {len(cropped_results)} 张细节图像")

            # 保存裁剪结果
            if save_intermediate and output_dir:
                crops_dir = Path(output_dir) / "crops"
                self.cropper.save_crops(cropped_results, str(crops_dir))

            # 创建拼贴图
            if save_intermediate and output_dir:
                collage_path = Path(output_dir) / "collage.jpg"
                self.cropper.create_collage(img, cropped_results, str(collage_path))
                print(f"拼贴图已保存: {collage_path}")

            # 提取细节图像
            detail_images = [result['cropped_image'] for result in cropped_results]
        else:
            detail_images = None
            cropped_results = []

        # 步骤3：使用通义千问识别
        print("步骤3：使用通义千问识别...")
        if use_details and detail_images:
            recognition_result = self.qwen_client.recognize_ethnic(img, detail_images)
        else:
            recognition_result = self.qwen_client.recognize_ethnic(img)

        # 整合结果
        result = {
            "success": recognition_result.get("success", False),
            "ethnic_group": recognition_result.get("ethnic_group"),
            "confidence": recognition_result.get("confidence", 1.0),
            "method": "detailed" if use_details and detail_images else "direct",
            "error": recognition_result.get("error"),
            "detections": detections,
            "cropped_regions": len(cropped_results),
            "details": [
                {
                    "class_name": r["class_name"],
                    "zoom_factor": r["zoom_factor"],
                    "confidence": r["confidence"]
                }
                for r in cropped_results
            ]
        }

        # 保存结果
        if save_intermediate and output_dir:
            result_path = Path(output_dir) / "result.json"
            with open(result_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"识别结果已保存: {result_path}")

        # 打印结果
        if result["success"]:
            print(f"\n✓ 识别成功！")
            print(f"  民族: {result['ethnic_group']}")
            print(f"  置信度: {result.get('confidence', 1.0):.2f}")
            print(f"  方法: {result['method']}")
        else:
            print(f"\n✗ 识别失败: {result.get('error')}")

        return result

    def recognize_batch(
        self,
        images: List[Union[str, Path, np.ndarray, Image.Image]],
        **kwargs
    ) -> List[Dict]:
        """
        批量识别

        Args:
            images: 图像列表
            **kwargs: 传递给recognize的参数

        Returns:
            识别结果列表
        """
        results = []
        for i, img in enumerate(images):
            print(f"\n{'='*50}")
            print(f"处理图像 {i+1}/{len(images)}")
            print(f"{'='*50}")

            result = self.recognize(img, **kwargs)
            results.append(result)

        # 统计结果
        if results:
            success_count = sum(1 for r in results if r["success"])
            print(f"\n批量识别完成: {success_count}/{len(results)} 成功")

        return results

    def recognize_with_retry(
        self,
        image: Union[str, Path, np.ndarray, Image.Image],
        max_retries: int = 3,
        **kwargs
    ) -> Dict:
        """
        带重试的识别

        Args:
            image: 输入图像
            max_retries: 最大重试次数
            **kwargs: 传递给recognize的参数

        Returns:
            识别结果
        """
        for attempt in range(max_retries):
            try:
                result = self.recognize(image, **kwargs)
                if result["success"]:
                    return result
                else:
                    print(f"尝试 {attempt + 1}/{max_retries} 失败: {result.get('error')}")
            except Exception as e:
                print(f"尝试 {attempt + 1}/{max_retries} 出错: {str(e)}")

        return {
            "success": False,
            "ethnic_group": None,
            "error": f"Failed after {max_retries} retries"
        }


def main():
    """测试代码"""
    # 示例：创建识别流程
    pipeline = EthnicRecognitionPipeline(
        yolov8_weights="checkpoint/ethnic_region_detector/weights/best.pt",
        qwen_api_key="your-api-key-here"
    )

    # 示例：识别单张图像
    # result = pipeline.recognize(
    #     image="path/to/image.jpg",
    #     use_details=True,
    #     save_intermediate=True,
    #     output_dir="output"
    # )
    # print(json.dumps(result, indent=2, ensure_ascii=False))

    # 示例：批量识别
    # image_list = ["image1.jpg", "image2.jpg", "image3.jpg"]
    # results = pipeline.recognize_batch(image_list, save_intermediate=True)

    # 示例：带重试的识别
    # result = pipeline.recognize_with_retry(
    #     image="path/to/image.jpg",
    #     max_retries=3
    # )


if __name__ == '__main__':
    main()