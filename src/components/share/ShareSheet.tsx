import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Download, Flag, QrCode } from 'lucide-react';
import clsx from 'clsx';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onShareSuccess?: () => void;
}

export default function ShareSheet({
  isOpen,
  onClose,
  postId,
  onShareSuccess,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const shareUrl = `${window.location.origin}/share/${postId}`;

  const shareOptions = [
    {
      id: 'wechat',
      name: '微信',
      icon: '💬',
      bgColor: 'bg-green-500',
      action: () => {
        // 微信分享逻辑
        alert('请截图分享到微信');
      },
    },
    {
      id: 'weibo',
      name: '微博',
      icon: '📢',
      bgColor: 'bg-red-500',
      action: () => {
        window.open(
          `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
      },
    },
    {
      id: 'qq',
      name: 'QQ',
      icon: '🐧',
      bgColor: 'bg-blue-500',
      action: () => {
        window.open(
          `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
      },
    },
    {
      id: 'link',
      name: '复制链接',
      icon: '🔗',
      bgColor: 'bg-purple-500',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onShareSuccess?.();
      },
    },
  ];

  const moreOptions = [
    {
      id: 'message',
      name: '私信',
      icon: MessageCircle,
      action: () => {
        alert('私信功能开发中');
      },
    },
    {
      id: 'download',
      name: '保存本地',
      icon: Download,
      action: () => {
        alert('保存功能开发中');
      },
    },
    {
      id: 'qrcode',
      name: '二维码',
      icon: QrCode,
      action: () => {
        alert('二维码功能开发中');
      },
    },
    {
      id: 'report',
      name: '举报',
      icon: Flag,
      action: () => {
        alert('举报功能开发中');
      },
    },
  ];

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 分享面板 */}
      <div
        ref={sheetRef}
        className={clsx(
          "absolute bottom-0 left-0 right-0 bg-ink-900 rounded-t-3xl transition-transform duration-300",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-white font-medium">分享至</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* 分享选项 */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={clsx(
                    "w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-110",
                    option.bgColor
                  )}
                >
                  {option.icon}
                </div>
                <span className="text-white text-xs">
                  {option.id === 'link' && copied ? '已复制' : option.name}
                </span>
              </button>
            ))}
          </div>

          {/* 更多选项 */}
          <div className="border-t border-white/10 pt-4">
            <div className="grid grid-cols-4 gap-4">
              {moreOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-all group-hover:bg-white/20">
                    <option.icon size={20} className="text-white" />
                  </div>
                  <span className="text-mist-400 text-xs">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 取消按钮 */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 rounded-full text-white font-medium hover:bg-white/20 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
