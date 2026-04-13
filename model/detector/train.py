"""
YOLOv8训练脚本 - 支持断点训练
用于训练民族服饰关键区域检测模型
"""

import argparse
import sys
from pathlib import Path
import yaml

# 添加父目录到路径
sys.path.append(str(Path(__file__).parent.parent))

from detector.yolov8_custom import EthnicRegionDetector


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description='训练YOLOv8民族服饰关键区域检测模型')

    # 基本参数
    parser.add_argument('--config', type=str, default='config.yaml',
                        help='配置文件路径')
    parser.add_argument('--weights', type=str, default=None,
                        help='模型权重路径（用于断点训练）')
    parser.add_argument('--epochs', type=int, default=None,
                        help='训练轮数（覆盖配置文件）')
    parser.add_argument('--batch-size', type=int, default=None,
                        help='批次大小（覆盖配置文件）')
    parser.add_argument('--img-size', type=int, default=None,
                        help='图像尺寸（覆盖配置文件）')
    parser.add_argument('--lr', type=float, default=None,
                        help='学习率（覆盖配置文件）')

    # 训练控制
    parser.add_argument('--resume', action='store_true',
                        help='从断点恢复训练')
    parser.add_argument('--device', type=int, default=None,
                        help='GPU设备ID，-1为CPU')
    parser.add_argument('--workers', type=int, default=None,
                        help='数据加载线程数')

    # 数据集
    parser.add_argument('--data', type=str, default=None,
                        help='数据集配置文件路径')

    # 其他
    parser.add_argument('--project', type=str, default=None,
                        help='项目名称')
    parser.add_argument('--name', type=str, default=None,
                        help='运行名称')
    parser.add_argument('--seed', type=int, default=None,
                        help='随机种子')

    return parser.parse_args()


def main():
    """主函数"""
    args = parse_args()

    print("=" * 60)
    print("YOLOv8 民族服饰关键区域检测模型训练")
    print("=" * 60)

    # 加载配置文件
    print(f"\n加载配置文件: {args.config}")
    detector = EthnicRegionDetector(args.config)

    # 更新配置
    if args.device is not None:
        detector.config['train']['device'] = args.device
        detector.device = args.device

    if args.workers is not None:
        detector.config['train']['workers'] = args.workers

    if args.project is not None:
        detector.config['train']['project'] = args.project

    if args.name is not None:
        detector.config['train']['name'] = args.name

    if args.seed is not None:
        detector.config['train']['seed'] = args.seed
        detector.config['train']['deterministic'] = True

    # 打印训练配置
    print("\n训练配置:")
    train_config = detector.config['train']
    print(f"  Epochs: {args.epochs if args.epochs else train_config['epochs']}")
    print(f"  Batch Size: {args.batch_size if args.batch_size else train_config['batch_size']}")
    print(f"  Image Size: {args.img_size if args.img_size else train_config['img_size']}")
    print(f"  Learning Rate: {args.lr if args.lr else train_config['lr']}")
    print(f"  Device: {detector.device}")
    print(f"  Workers: {train_config['workers']}")
    print(f"  Project: {train_config['project']}")
    print(f"  Name: {train_config['name']}")

    # 加载模型
    print("\n加载模型...")
    if args.resume:
        # 断点训练
        print("从断点恢复训练...")
        resume_path = Path(args.weights) if args.weights else None
        if resume_path and resume_path.exists():
            detector.load_model(str(resume_path))
            print(f"加载断点: {resume_path}")
        else:
            print("未指定断点文件，尝试自动查找...")
            auto_resume = Path(detector.config['output']['checkpoint_dir']) / \
                          detector.config['train']['name'] / \
                          detector.config['output']['last_model']
            if auto_resume.exists():
                detector.load_model(str(auto_resume))
                print(f"自动加载断点: {auto_resume}")
            else:
                print("未找到断点文件，从头开始训练")
                detector.load_model()
    else:
        # 从头训练或加载指定权重
        if args.weights:
            detector.load_model(args.weights)
            print(f"加载权重: {args.weights}")
        else:
            detector.load_model()
            print("加载预训练模型")

    # 更新训练参数
    train_updates = {}
    if args.epochs is not None:
        train_updates['epochs'] = args.epochs
    if args.batch_size is not None:
        train_updates['batch_size'] = args.batch_size
    if args.img_size is not None:
        train_updates['img_size'] = args.img_size
    if args.lr is not None:
        train_updates['lr'] = args.lr

    # 开始训练
    print("\n开始训练...")
    print("=" * 60)

    try:
        results = detector.train(
            resume=args.resume,
            epochs=args.epochs if args.epochs else None
        )

        print("\n" + "=" * 60)
        print("训练完成！")
        print("=" * 60)

        # 打印训练结果
        if hasattr(results, 'results_dict'):
            print("\n训练指标:")
            results_dict = results.results_dict
            print(f"  mAP50: {results_dict.get('metrics/mAP50(B)', 'N/A')}")
            print(f"  mAP50-95: {results_dict.get('metrics/mAP50-95(B)', 'N/A')}")
            print(f"  Precision: {results_dict.get('metrics/precision(B)', 'N/A')}")
            print(f"  Recall: {results_dict.get('metrics/recall(B)', 'N/A')}")

        # 输出模型路径
        best_model_path = Path(detector.config['output']['checkpoint_dir']) / \
                          detector.config['train']['name'] / \
                          'weights' / \
                          detector.config['output']['best_model']
        last_model_path = Path(detector.config['output']['checkpoint_dir']) / \
                          detector.config['train']['name'] / \
                          'weights' / \
                          detector.config['output']['last_model']

        print(f"\n最佳模型: {best_model_path}")
        print(f"最新模型: {last_model_path}")

    except KeyboardInterrupt:
        print("\n\n训练被用户中断")
        print("模型已保存，可以使用 --resume 继续训练")
    except Exception as e:
        print(f"\n\n训练失败: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()