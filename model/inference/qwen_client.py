"""
通义千问3-VL-Plus API 集成模块
用于民族服饰识别
"""

import base64
import json
from pathlib import Path
from typing import List, Dict, Optional, Union
import requests
from PIL import Image
import numpy as np
import io


class QwenVLClient:
    """
    通义千问3-VL-Plus API 客户端
    """

    def __init__(
        self,
        api_key: str,
        model: str = "qwen-vl-plus",
        base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    ):
        """
        初始化客户端

        Args:
            api_key: API密钥
            model: 模型名称
            base_url: API基础URL
        """
        self.api_key = api_key
        self.model = model
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def _encode_image(
        self,
        image: Union[str, Path, Image.Image, np.ndarray]
    ) -> str:
        """
        将图像编码为base64字符串

        Args:
            image: 图像（路径、PIL图像或numpy数组）

        Returns:
            base64编码的图像
        """
        if isinstance(image, (str, Path)):
            # 从文件路径读取
            img = Image.open(image)
        elif isinstance(image, np.ndarray):
            # 从numpy数组转换
            img = Image.fromarray(image)
        else:
            # 已经是PIL图像
            img = image

        # 转换为RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # 转换为字节
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=95)
        img_bytes = buffered.getvalue()

        # 编码为base64
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')

        return img_base64

    def recognize_ethnic(
        self,
        original_image: Union[str, Path, Image.Image, np.ndarray],
        detail_images: Optional[List[Union[str, Path, Image.Image, np.ndarray]]] = None,
        prompt: Optional[str] = None
    ) -> Dict:
        """
        识别民族

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表（可选）
            prompt: 自定义提示词（可选）

        Returns:
            识别结果字典
        """
        # 编码原始图像
        original_base64 = self._encode_image(original_image)

        # 构建消息内容
        messages = []

        # 添加原始图像
        if prompt is None:
            prompt = """请仔细观察这张民族服饰照片，识别出这是哪个民族的服饰。

请根据以下特征进行判断：
1. 领口设计（立领、圆领、无领等）
2. 刺绣纹样和针法
3. 银饰和其他装饰
4. 整体颜色搭配
5. 图案和纹样特点

请只返回民族名称，例如：苗族、藏族、彝族等。"""

        # 如果有细节图像，添加到提示中
        if detail_images:
            prompt += "\n\n我提供了几个细节放大图像，请仔细观察这些细节特征。"

        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{original_base64}"
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        })

        # 添加细节图像
        if detail_images:
            for i, detail_img in enumerate(detail_images[:8]):  # 最多8张细节图
                detail_base64 = self._encode_image(detail_img)
                messages[0]["content"].insert(
                    i + 1,
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{detail_base64}"
                        }
                    }
                )

        # 发送请求
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,  # 低温度，提高一致性
            "max_tokens": 100,
            "top_p": 0.8
        }

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )

            response.raise_for_status()
            result = response.json()

            # 解析响应
            content = result["choices"][0]["message"]["content"]

            return {
                "success": True,
                "ethnic_group": content.strip(),
                "raw_response": result,
                "model": self.model,
                "num_images": 1 + (len(detail_images) if detail_images else 0)
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "ethnic_group": None
            }

    def recognize_with_confidence(
        self,
        original_image: Union[str, Path, Image.Image, np.ndarray],
        detail_images: Optional[List[Union[str, Path, Image.Image, np.ndarray]]] = None,
        num_samples: int = 3
    ) -> Dict:
        """
        多次识别并计算置信度

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表（可选）
            num_samples: 采样次数

        Returns:
            识别结果和置信度
        """
        results = []

        for _ in range(num_samples):
            result = self.recognize_ethnic(original_image, detail_images)
            if result["success"]:
                results.append(result["ethnic_group"])

        if not results:
            return {
                "success": False,
                "error": "All requests failed",
                "ethnic_group": None,
                "confidence": 0.0
            }

        # 统计结果
        from collections import Counter
        counts = Counter(results)
        most_common = counts.most_common(1)[0]

        return {
            "success": True,
            "ethnic_group": most_common[0],
            "confidence": most_common[1] / num_samples,
            "all_results": results,
            "num_samples": num_samples
        }

    def recognize_detailed(
        self,
        original_image: Union[str, Path, Image.Image, np.ndarray],
        detail_images: Optional[List[Union[str, Path, Image.Image, np.ndarray]]] = None
    ) -> Dict:
        """
        详细识别，返回更多信息

        Args:
            original_image: 原始图像
            detail_images: 细节图像列表（可选）

        Returns:
            详细识别结果
        """
        # 编码原始图像
        original_base64 = self._encode_image(original_image)

        # 构建详细提示
        prompt = """请仔细分析这张民族服饰照片，并提供以下信息：

1. **民族名称**：这是哪个民族的服饰？
2. **识别依据**：请列出支持这个判断的关键特征（至少3个）
3. **特征分析**：详细描述服饰的以下方面：
   - 领口设计
   - 刺绣特点
   - 颜色搭配
   - 特殊装饰
4. **置信度**：你对自己判断的把握程度（高/中/低）

请以JSON格式返回结果：
{
  "ethnic_group": "民族名称",
  "evidence": ["特征1", "特征2", "特征3"],
  "features": {
    "neckline": "领口描述",
    "embroidery": "刺绣描述",
    "colors": "颜色描述",
    "decoration": "装饰描述"
  },
  "confidence": "高/中/低"
}"""

        # 如果有细节图像，添加到提示中
        if detail_images:
            prompt += "\n\n我提供了几个细节放大图像，请仔细观察这些细节特征。"

        # 构建消息
        messages = [{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{original_base64}"
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }]

        # 添加细节图像
        if detail_images:
            for i, detail_img in enumerate(detail_images[:8]):
                detail_base64 = self._encode_image(detail_img)
                messages[0]["content"].insert(
                    i + 1,
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{detail_base64}"
                        }
                    }
                )

        # 发送请求
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 500,
            "top_p": 0.8
        }

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )

            response.raise_for_status()
            result = response.json()

            content = result["choices"][0]["message"]["content"]

            # 尝试解析JSON
            try:
                # 提取JSON部分
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_data = json.loads(json_match.group())
                    json_data["success"] = True
                    json_data["raw_response"] = content
                else:
                    json_data = {
                        "success": True,
                        "ethnic_group": content.strip(),
                        "raw_response": content
                    }
            except:
                json_data = {
                    "success": True,
                    "ethnic_group": content.strip(),
                    "raw_response": content
                }

            json_data["model"] = self.model
            json_data["num_images"] = 1 + (len(detail_images) if detail_images else 0)

            return json_data

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "ethnic_group": None
            }


def main():
    """测试代码"""
    # 示例：创建客户端
    # api_key = "your-api-key-here"
    # client = QwenVLClient(api_key)

    # 示例：识别民族
    # image_path = "path/to/image.jpg"
    # result = client.recognize_ethnic(image_path)
    # print(result)

    # 示例：带细节图像识别
    # detail_images = ["detail1.jpg", "detail2.jpg"]
    # result = client.recognize_ethnic(image_path, detail_images)
    # print(result)

    # 示例：详细识别
    # result = client.recognize_detailed(image_path, detail_images)
    # print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()