# -*- coding: utf-8 -*-
"""
Grounding DINO 自动标注工具 - CPU版本
民族服饰关键区域检测
"""
import sys
import os

# 强制使用CPU
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['TORCH_CUDA_ARCH_LIST'] = ''

# 添加路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'GroundingDINO-main'))

import argparse
import cv2
import numpy as np
import torch
from PIL import Image
from tqdm import tqdm

from groundingdino.models import build_model
from groundingdino.util.slconfig import SLConfig
from groundingdino.util.utils import clean_state_dict, get_phrases_from_posmap
from groundingdino.util.vl_utils import create_positive_map_from_span

# 6个关键区域类别
CLASSES = {
    0: 'neckline',    # 领口
    1: 'embroidery',  # 刺绣
    2: 'silver',      # 银饰
    3: 'pattern',     # 纹样
    4: 'sleeve',      # 袖口
    5: 'waistband'   # 腰带
}

# 每个类别的文本提示
PROMPTS = {
    'neckline': 'neckline or collar of the ethnic clothing',
    'embroidery': 'embroidery pattern on traditional ethnic clothing',
    'silver': 'silver jewelry decoration on ethnic clothing',
    'pattern': 'decorative pattern on ethnic clothing fabric',
    'sleeve': 'sleeve decoration on ethnic clothing',
    'waistband': 'waistband or belt on ethnic clothing'
}


class AutoAnnotator:
    """自动标注器"""
    
    def __init__(self, config_path, weights_path):
        """初始化模型"""
        print(f"加载模型配置: {config_path}")
        self.config = SLConfig.fromfile(config_path)
        self.config.device = "cpu"
        
        print(f"加载模型权重: {weights_path}")
        self.model = build_model(self.config)
        checkpoint = torch.load(weights_path, map_location="cpu")
        self.model.load_state_dict(clean_state_dict(checkpoint["model"]), strict=False)
        self.model.eval()
        
        print("模型加载完成！")
        
    def annotate_image(self, image_path, box_threshold=0.3, text_threshold=0.25):
        """
        标注单张图片
        
        Returns:
            dict: 标注结果 {class_id: [boxes]}
        """
        # 读取图片
        image_pil = Image.open(image_path).convert("RGB")
        
        # 预处理
        from groundingdino.datasets import transforms as T
        transform = T.Compose([
            T.RandomResize([800], max_size=1333),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        image, _ = transform(image_pil, None)
        
        img_w, img_h = image_pil.size
        
        all_boxes = []
        all_labels = []
        
        # 对每个类别进行检测
        for class_id, (class_name, prompt) in enumerate(PROMPTS.items()):
            with torch.no_grad():
                outputs = self.model(image[None], captions=[prompt])
            
            logits = outputs["pred_logits"].sigmoid()[0]
            boxes = outputs["pred_boxes"][0]
            
            # 过滤
            filt_mask = logits.max(dim=1)[0] > box_threshold
            logits_filt = logits[filt_mask]
            boxes_filt = boxes[filt_mask]
            
            # 只保留置信度高的结果
            if len(logits_filt) > 0:
                # 获取文本匹配
                tokenizer = self.model.tokenizer
                tokenized = tokenizer(prompt)
                
                for logit, box in zip(logits_filt, boxes_filt):
                    pred_phrase = get_phrases_from_posmap(logit > text_threshold, tokenized, tokenizer)
                    
                    # 简单的验证：如果文本包含类别名称
                    if class_name.lower() in pred_phrase.lower():
                        all_boxes.append(box.cpu())
                        all_labels.append(class_id)
        
        # 转换为YOLO格式
        annotations = []
        for box, label_id in zip(all_boxes, all_labels):
            # box格式: [cx, cy, w, h] (归一化)
            cx, cy, w, h = box.cpu().numpy()
            
            # 转换为YOLO格式
            annotations.append([label_id, float(cx), float(cy), float(w), float(h)])
        
        return annotations
    
    def annotate_dataset(self, images_dir, labels_dir, box_threshold=0.3, text_threshold=0.25):
        """
        标注整个数据集
        """
        import glob
        
        images_path = os.path.join(images_dir, '*.jpg')
        image_files = glob.glob(images_path)
        
        # 也支持其他格式
        for ext in ['*.jpeg', '*.png', '*.webp']:
            image_files.extend(glob.glob(os.path.join(images_dir, ext)))
        
        print(f"找到 {len(image_files)} 张图片")
        
        # 创建标注目录
        os.makedirs(labels_dir, exist_ok=True)
        
        # 标注每张图片
        results = []
        for image_file in tqdm(image_files, desc="标注进度"):
            try:
                # 标注
                annotations = self.annotate_image(
                    image_file,
                    box_threshold=box_threshold,
                    text_threshold=text_threshold
                )
                
                # 保存标注
                image_name = os.path.splitext(os.path.basename(image_file))[0]
                label_file = os.path.join(labels_dir, f"{image_name}.txt")
                
                with open(label_file, 'w') as f:
                    for ann in annotations:
                        f.write(' '.join(map(str, ann)) + '\n')
                
                results.append({
                    'image': image_file,
                    'label': label_file,
                    'num_boxes': len(annotations)
                })
                
            except Exception as e:
                print(f"  错误 {image_file}: {e}")
        
        print(f"\n标注完成！")
        print(f"  总图片数: {len(image_files)}")
        print(f"  成功标注: {len(results)}")
        
        # 统计
        total_boxes = sum(r['num_boxes'] for r in results)
        print(f"  总标注框数: {total_boxes}")
        print(f"  平均每张: {total_boxes/len(results):.2f} 个标注")
        
        return results


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Grounding DINO 自动标注工具（CPU版）')
    parser.add_argument('--images', type=str, required=True, help='图片目录')
    parser.add_argument('--labels', type=str, required=True, help='标注输出目录')
    parser.add_argument('--config', type=str, default='GroundingDINO-main/groundingdino/config/GroundingDINO_SwinT_OGC.py')
    parser.add_argument('--weights', type=str, default='groundingdino_swint_ogc.pth')
    parser.add_argument('--box-threshold', type=float, default=0.3)
    parser.add_argument('--text-threshold', type=float, default=0.25)
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Grounding DINO 自动标注工具（CPU版）")
    print("=" * 60)
    
    # 检查文件
    if not os.path.exists(args.weights):
        print(f"\n错误: 找不到模型文件: {args.weights}")
        return
    
    # 创建标注器
    annotator = AutoAnnotator(args.config, args.weights)
    
    # 标注数据集
    annotator.annotate_dataset(
        args.images,
        args.labels,
        args.box_threshold,
        args.text_threshold
    )
    
    print("\n标注完成！")


if __name__ == '__main__':
    main()