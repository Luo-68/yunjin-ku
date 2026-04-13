"""
云矜ku - AI识别服务
基于通义千问3-VL-Plus的民族服饰识别服务
"""

import os
import base64
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = Flask(__name__)
CORS(app)

# 配置
QWEN_API_KEY = os.getenv('QWEN_API_KEY', 'sk-fa366f92ebf647e2856559c4802a83c5')
QWEN_API_URL = os.getenv('QWEN_API_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')
MODEL_NAME = os.getenv('QWEN_MODEL', 'qwen3-vl-plus')

print(f"AI识别服务启动...")
print(f"使用模型: {MODEL_NAME}")


def call_qwen_api(image_base64: str) -> dict:
    """
    调用通义千问API进行民族服饰识别

    Args:
        image_base64: 图片的base64编码

    Returns:
        识别结果字典
    """
    # 构造提示词
    prompt = """请仔细分析这张图片中的民族服饰，并按照以下JSON格式返回识别结果：

{
    "ethnic_group": "民族名称（中文，如：苗族）",
    "confidence": 0.0-1.0之间的置信度数值,
    "era": "服饰可能的朝代或年代（如：清末民初、现代、当代等）",
    "craft": "主要工艺技术（如：刺绣、银饰、蜡染、织锦等）",
    "description": "详细描述该民族服饰的文化背景、图案寓意、传统用途等（50-100字）"
}

注意：
1. 仔细观察服饰的特征（颜色、纹样、配饰等）
2. 如果图片不够清晰或无法识别，置信度可以设置较低
3. 描述要体现民族文化的特色
4. 只返回JSON格式的结果，不要添加其他文字说明"""

    # 构造API请求
    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(QWEN_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()

        # 提取识别结果
        content = result["choices"][0]["message"]["content"]

        # 尝试解析JSON
        try:
            # 清理可能的多余文字
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            parsed_result = json.loads(content)
            return {
                "success": True,
                "data": parsed_result
            }
        except json.JSONDecodeError:
            # 如果JSON解析失败，尝试从文本中提取信息
            return {
                "success": False,
                "error": "无法解析AI返回的JSON格式",
                "raw_content": content
            }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "API请求超时"
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"API请求失败: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"未知错误: {str(e)}"
        }


def image_to_base64(image_bytes: bytes) -> str:
    """
    将图片字节转换为base64编码

    Args:
        image_bytes: 图片字节数据

    Returns:
        base64编码字符串
    """
    return base64.b64encode(image_bytes).decode('utf-8')


@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "service": "AI识别服务",
        "model": MODEL_NAME
    })


@app.route('/api/recognition', methods=['POST'])
def recognition():
    """
    民族服饰识别接口

    请求格式:
    - JSON: {"image": "base64_encoded_image_data"}

    返回格式:
    {
        "success": true/false,
        "data": {
            "ethnic_group": "民族名称",
            "confidence": 0.95,
            "era": "朝代",
            "craft": "工艺",
            "description": "描述"
        }
    }
    """
    try:
        # 获取请求数据
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "缺少image参数"
            }), 400

        image_base64 = data['image']

        # 如果图片包含data URL前缀，需要去除
        if image_base64.startswith('data:image'):
            image_base64 = image_base64.split(',')[1]

        # 调用AI识别
        print(f"开始识别图片，大小: {len(image_base64)} 字符")
        result = call_qwen_api(image_base64)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器错误: {str(e)}"
        }), 500


@app.route('/api/recognition/file', methods=['POST'])
def recognition_file():
    """
    民族服饰识别接口（文件上传）

    请求格式:
    - FormData: {"file": 图片文件}

    返回格式:
    {
        "success": true/false,
        "data": {
            "ethnic_group": "民族名称",
            "confidence": 0.95,
            "era": "朝代",
            "craft": "工艺",
            "description": "描述"
        }
    }
    """
    try:
        # 检查是否有文件上传
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "error": "缺少file参数"
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "未选择文件"
            }), 400

        # 读取文件并转换为base64
        image_bytes = file.read()
        image_base64 = image_to_base64(image_bytes)

        # 调用AI识别
        print(f"开始识别文件: {file.filename}，大小: {len(image_bytes)} 字节")
        result = call_qwen_api(image_base64)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器错误: {str(e)}"
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"AI识别服务启动在端口 {port}")
    print(f"健康检查: http://localhost:{port}/health")
    print(f"识别接口: http://localhost:{port}/api/recognition")
    app.run(host='0.0.0.0', port=port, debug=True)