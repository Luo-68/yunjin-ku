import { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, AtSign } from 'lucide-react';
import clsx from 'clsx';
import { commentApi } from '../../utils/api';
import { getImageUrl } from '../../utils/api';

interface Comment {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  commentCount: number;
  onCommentAdded?: () => void;
}

export default function CommentSheet({
  isOpen,
  onClose,
  postId,
  commentCount,
  onCommentAdded,
}: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 加载评论
  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

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

  // 回复时聚焦输入框
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const loadComments = async () => {
    setLoading(true);
    try {
      // 演示数据使用localStorage
      if (postId.startsWith('demo')) {
        const allComments = JSON.parse(localStorage.getItem('demoComments') || '{}');
        const postComments = allComments[postId] || [];
        setComments(postComments);
        setLoading(false);
        return;
      }

      // 真实数据调用API
      const res = await commentApi.get(postId);
      if (res.success) {
        setComments((res.data as Comment[]) ?? []);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前登录用户信息
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || submitting) return;

    setSubmitting(true);
    try {
      // 演示数据使用localStorage
      if (postId.startsWith('demo')) {
        const user = getCurrentUser();
        const newComment: Comment = {
          _id: `comment-${Date.now()}`,
          author: {
            _id: user?._id || 'anonymous',
            username: user?.username || '匿名用户',
            avatar: user?.avatar,
          },
          content: inputValue.trim(),
          likeCount: 0,
          replyCount: 0,
          createdAt: new Date().toISOString(),
        };

        const allComments = JSON.parse(localStorage.getItem('demoComments') || '{}');
        if (!allComments[postId]) {
          allComments[postId] = [];
        }
        allComments[postId].unshift(newComment);
        localStorage.setItem('demoComments', JSON.stringify(allComments));

        setInputValue('');
        setReplyTo(null);
        setComments(allComments[postId]);
        onCommentAdded?.();
        setSubmitting(false);
        return;
      }

      // 真实数据调用API
      const res = await commentApi.add(postId, {
        content: inputValue.trim(),
        parentId: replyTo?._id,
      });

      if (res.success) {
        setInputValue('');
        setReplyTo(null);
        loadComments();
        onCommentAdded?.();
      }
    } catch (error) {
      console.error('发表评论失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 评论面板 */}
      <div
        ref={sheetRef}
        className={clsx(
          "absolute bottom-0 left-0 right-0 bg-ink-900 rounded-t-3xl transition-transform duration-300 max-h-[70vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-white font-medium">
            {commentCount} 条评论
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-mist-400">
              暂无评论，快来抢沙发吧~
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                {/* 头像 */}
                <img
                  src={getImageUrl(comment.author.avatar)}
                  alt={comment.author.username}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      @{comment.author.username}
                    </span>
                    <span className="text-mist-500 text-xs">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-white/90 text-sm mb-2">{comment.content}</p>

                  {/* 操作栏 */}
                  <div className="flex items-center gap-4 text-mist-400 text-xs">
                    <button className="flex items-center gap-1 hover:text-gold-400 transition-colors">
                      <Heart size={14} />
                      <span>{comment.likeCount || 0}</span>
                    </button>
                    <button
                      className="flex items-center gap-1 hover:text-gold-400 transition-colors"
                      onClick={() => setReplyTo(comment)}
                    >
                      回复
                    </button>
                    {comment.replyCount > 0 && (
                      <button className="text-gold-400">
                        展开{comment.replyCount}条回复
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-white/10 bg-ink-800/50">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-mist-400">
              <AtSign size={14} />
              <span>回复 @{replyTo.author.username}</span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto text-mist-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={replyTo ? `回复 @${replyTo.author.username}` : '说点什么...'}
              className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-white placeholder-mist-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || submitting}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                inputValue.trim()
                  ? "bg-gold-500 text-ink-900"
                  : "bg-white/10 text-mist-500"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
