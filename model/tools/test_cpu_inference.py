# -*- coding: utf-8 -*-
import sys
import os

# 设置环境变量强制使用CPU
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['TORCH_CUDA_ARCH_LIST'] = ''

# 添加Grounding DINO路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'GroundingDINO-main'))

import torch
print(f"PyTorch版本: {torch.__version__}")
print(f"CUDA可用: {torch.cuda.is_available()}")
print(f"当前设备: {'cuda' if torch.cuda.is_available() else 'cpu'}")

# 导入Grounding DINO
try:
    from groundingdino.models import build_model
    from groundingdino.util.slconfig import SLConfig
    from groundingdino.util.utils import clean_state_dict
    
    print("\n✅ Grounding DINO导入成功")
    
    # 测试加载模型
    config_path = "GroundingDINO-main/groundingdino/config/GroundingDINO_SwinT_OGC.py"
    weights_path = "groundingdino_swint_ogc.pth"
    
    print(f"\n加载模型配置: {config_path}")
    args = SLConfig.fromfile(config_path)
    args.device = "cpu"  # 强制使用CPU
    print(f"设备设置为: {args.device}")
    
    print(f"\n加载模型权重: {weights_path}")
    model = build_model(args)
    
    checkpoint = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(clean_state_dict(checkpoint["model"]), strict=False)
    model.eval()
    
    print("\n✅ 模型加载成功！")
    print(f"模型类型: {type(model)}")
    
    # 测试推理
    print("\n开始测试推理...")
    from PIL import Image
    import groundingdino.datasets.transforms as T
    
    # 加载测试图片
    test_image = "../data/images/train/壮族.jpg"
    if os.path.exists(test_image):
        print(f"加载测试图片: {test_image}")
        image_pil = Image.open(test_image).convert("RGB")
        
        transform = T.Compose([
            T.RandomResize([800], max_size=1333),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        image, _ = transform(image_pil, None)
        
        # 准备输入
        caption = "ethnic clothing with embroidery"
        image_input = image.unsqueeze(0)
        
        print(f"输入图片shape: {image_input.shape}")
        print(f"文本提示: {caption}")
        
        # 推理
        with torch.no_grad():
            outputs = model(image_input, captions=[caption])
        
        print(f"\n✅ 推理成功！")
        print(f"输出keys: {outputs.keys()}")
        print(f"pred_logits shape: {outputs['pred_logits'].shape}")
        print(f"pred_boxes shape: {outputs['pred_boxes'].shape}")
        
    else:
        print(f"\n⚠️  测试图片不存在: {test_image}")
        print("请在model/data/images/train/目录下放置测试图片")
    
except Exception as e:
    print(f"\n❌ 错误: {e}")
    import traceback
    traceback.print_exc()

print("\n测试完成！")