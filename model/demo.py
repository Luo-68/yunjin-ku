"""
民族服饰识别系统 - 示例脚本
演示如何使用系统进行民族识别
"""

import sys
from pathlib import Path

# 添加路径
sys.path.append(str(Path(__file__).parent))

from inference.pipeline import EthnicRecognitionPipeline


def demo_recognition():
    """
    演示民族识别功能
    """
    print("=" * 60)
    print("民族服饰识别系统 - 演示")
    print("=" * 60)

    # 配置参数（请根据实际情况修改）
    YOLOV8_WEIGHTS = "checkpoint/ethnic_region_detector/weights/best.pt"
    QWEN_API_KEY = "your-qwen-api-key-here"  # 请替换为你的API密钥
    TEST_IMAGE = "../56个少数民族图片/苗族.jpg"  # 测试图像路径

    # 检查API密钥
    if QWEN_API_KEY == "your-qwen-api-key-here":
        print("\n错误：请先配置通义千问API密钥！")
        print("请在 demo.py 中将 QWEN_API_KEY 替换为你的实际API密钥")
        return

    # 检查模型权重
    if not Path(YOLOV8_WEIGHTS).exists():
        print(f"\n错误：未找到模型权重文件: {YOLOV8_WEIGHTS}")
        print("请先训练模型或下载预训练权重")
        return

    # 检查测试图像
    if not Path(TEST_IMAGE).exists():
        print(f"\n警告：未找到测试图像: {TEST_IMAGE}")
        print("请修改 TEST_IMAGE 指向实际的图像路径")
        # 尝试查找可用的测试图像
        test_dir = Path("../56个少数民族图片")
        if test_dir.exists():
            images = list(test_dir.glob("*.jpg")) + list(test_dir.glob("*.webp"))
            if images:
                TEST_IMAGE = str(images[0])
                print(f"使用测试图像: {TEST_IMAGE}")
            else:
                return
        else:
            return

    print(f"\n配置:")
    print(f"  YOLOv8权重: {YOLOV8_WEIGHTS}")
    print(f"  测试图像: {TEST_IMAGE}")

    # 创建识别流程
    print("\n初始化识别流程...")
    try:
        pipeline = EthnicRecognitionPipeline(
            yolov8_weights=YOLOV8_WEIGHTS,
            qwen_api_key=QWEN_API_KEY
        )
    except Exception as e:
        print(f"初始化失败: {e}")
        return

    # 执行识别
    print("\n开始识别...")
    try:
        result = pipeline.recognize(
            image=TEST_IMAGE,
            use_details=True,
            save_intermediate=True,
            output_dir="demo_output"
        )

        # 打印结果
        print("\n" + "=" * 60)
        print("识别结果")
        print("=" * 60)

        if result["success"]:
            print(f"✓ 民族: {result['ethnic_group']}")
            print(f"✓ 置信度: {result.get('confidence', 1.0):.2%}")
            print(f"✓ 方法: {result['method']}")
            print(f"✓ 检测区域: {result['cropped_regions']}")

            print("\n检测到的关键区域:")
            for det in result["detections"]:
                print(f"  - {det['class_name']}: {det['conf']:.2%}")

            print("\n生成的细节图像:")
            for detail in result.get("details", []):
                print(f"  - {detail['class_name']} (放大: {detail['zoom_factor']}x)")

            print(f"\n中间结果已保存到: demo_output/")
        else:
            print(f"✗ 识别失败: {result.get('error')}")

    except Exception as e:
        print(f"\n识别失败: {e}")
        import traceback
        traceback.print_exc()


def demo_batch_recognition():
    """
    演示批量识别功能
    """
    print("\n" + "=" * 60)
    print("批量识别演示")
    print("=" * 60)

    # 配置参数
    YOLOV8_WEIGHTS = "checkpoint/ethnic_region_detector/weights/best.pt"
    QWEN_API_KEY = "your-qwen-api-key-here"
    IMAGES_DIR = "../56个少数民族图片"

    if QWEN_API_KEY == "your-qwen-api-key-here":
        print("\n错误：请先配置通义千问API密钥！")
        return

    # 查找所有图像
    image_dir = Path(IMAGES_DIR)
    if not image_dir.exists():
        print(f"\n错误：图像目录不存在: {IMAGES_DIR}")
        return

    images = list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.webp"))

    if not images:
        print(f"\n错误：未找到图像文件")
        return

    print(f"\n找到 {len(images)} 张图像")

    # 只识别前3张图像作为演示
    test_images = images[:3]
    print(f"识别前 {len(test_images)} 张图像...")

    # 创建识别流程
    try:
        pipeline = EthnicRecognitionPipeline(
            yolov8_weights=YOLOV8_WEIGHTS,
            qwen_api_key=QWEN_API_KEY
        )
    except Exception as e:
        print(f"初始化失败: {e}")
        return

    # 批量识别
    try:
        results = pipeline.recognize_batch(
            test_images,
            use_details=True,
            save_intermediate=True,
            output_dir="demo_batch_output"
        )

        # 统计结果
        print("\n" + "=" * 60)
        print("批量识别结果")
        print("=" * 60)

        success_count = sum(1 for r in results if r["success"])
        print(f"\n成功: {success_count}/{len(results)}")

        print("\n识别结果:")
        for i, (img, result) in enumerate(zip(test_images, results)):
            status = "✓" if result["success"] else "✗"
            ethnic = result.get("ethnic_group", "未知")
            print(f"  {status} {img.name}: {ethnic}")

    except Exception as e:
        print(f"\n识别失败: {e}")
        import traceback
        traceback.print_exc()


def demo_direct_recognition():
    """
    演示直接识别（不使用细节增强）
    """
    print("\n" + "=" * 60)
    print("直接识别演示（不使用细节增强）")
    print("=" * 60)

    # 配置参数
    YOLOV8_WEIGHTS = "checkpoint/ethnic_region_detector/weights/best.pt"
    QWEN_API_KEY = "your-qwen-api-key-here"
    TEST_IMAGE = "../56个少数民族图片/藏族.jpg"

    if QWEN_API_KEY == "your-qwen-api-key-here":
        print("\n错误：请先配置通义千问API密钥！")
        return

    # 检查测试图像
    if not Path(TEST_IMAGE).exists():
        print(f"\n警告：未找到测试图像: {TEST_IMAGE}")
        return

    print(f"\n配置:")
    print(f"  YOLOv8权重: {YOLOV8_WEIGHTS}")
    print(f"  测试图像: {TEST_IMAGE}")
    print(f"  使用细节增强: 否")

    # 创建识别流程
    print("\n初始化识别流程...")
    try:
        pipeline = EthnicRecognitionPipeline(
            yolov8_weights=YOLOV8_WEIGHTS,
            qwen_api_key=QWEN_API_KEY
        )
    except Exception as e:
        print(f"初始化失败: {e}")
        return

    # 执行识别
    print("\n开始识别...")
    try:
        result = pipeline.recognize(
            image=TEST_IMAGE,
            use_details=False,  # 不使用细节增强
            save_intermediate=True,
            output_dir="demo_direct_output"
        )

        # 打印结果
        print("\n" + "=" * 60)
        print("识别结果")
        print("=" * 60)

        if result["success"]:
            print(f"✓ 民族: {result['ethnic_group']}")
            print(f"✓ 方法: {result['method']}")
            print(f"✓ 检测区域: {result['cropped_regions']}")
        else:
            print(f"✗ 识别失败: {result.get('error')}")

    except Exception as e:
        print(f"\n识别失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    print("\n请选择演示模式:")
    print("1. 单张图像识别（使用细节增强）")
    print("2. 批量识别")
    print("3. 直接识别（不使用细节增强）")
    print("0. 退出")

    choice = input("\n请输入选项 (0-3): ").strip()

    if choice == "1":
        demo_recognition()
    elif choice == "2":
        demo_batch_recognition()
    elif choice == "3":
        demo_direct_recognition()
    elif choice == "0":
        print("退出")
    else:
        print("无效选项")