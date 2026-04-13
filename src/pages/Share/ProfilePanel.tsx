import { useState, useEffect } from 'react';
import { X, Grid3X3, Bookmark, Heart, Settings, Edit3, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, userApi, postApi, likeApi, collectionApi, authApi } from '../../utils/api';

interface UserPost {
  _id: string;
  mediaType: 'image' | 'video';
  mediaUrls: string[];
  coverUrl?: string;
  stats: {
    likeCount: number;
    commentCount: number;
  };
}

interface UserData {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  stats?: {
    postCount: number;
    followingCount: number;
    followerCount: number;
    likeCount: number;
  };
}

interface ProfilePanelProps {
  onClose: () => void;
  onPostDeleted?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export default function ProfilePanel({ onClose, onPostDeleted, onPostClick }: ProfilePanelProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'works' | 'favorites' | 'likes'>('works');
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; postId: string | null }>({ show: false, postId: null });
  const [deleting, setDeleting] = useState(false);

  // 获取当前用户ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await authApi.getMe() as { success: boolean; data: { userId?: string; _id?: string } };
        if (res.success && res.data) {
          setCurrentUserId(res.data.userId || res.data._id || null);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await userApi.getProfile() as { success: boolean; data: UserData };
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 根据tab加载数据
  useEffect(() => {
    const loadTabData = async () => {
      if (!currentUserId) return;

      setPosts([]);
      setLoading(true);

      try {
        if (activeTab === 'works') {
          // 获取用户发布的帖子
          const res = await postApi.userPosts(currentUserId, 1, 50) as { success: boolean; data: UserPost[] };
          if (res.success && res.data) {
            setPosts(res.data);
          }
        } else if (activeTab === 'favorites') {
          // 获取用户收藏
          const res = await collectionApi.list(currentUserId, 1, 50) as { success: boolean; data: { post: UserPost }[] };
          if (res.success && res.data) {
            setPosts(res.data.map((item: { post: UserPost }) => item.post).filter(Boolean));
          }
        } else {
          // 获取用户点赞
          const res = await likeApi.userLikes(currentUserId, 1, 50) as { success: boolean; data: { post: UserPost }[] };
          if (res.success && res.data) {
            setPosts(res.data.map((item: { post: UserPost }) => item.post).filter(Boolean));
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, currentUserId]);

  const handleEditProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    onClose();
    navigate('/profile');
  };

  // 删除帖子
  const handleDeletePost = async () => {
    if (!deleteConfirm.postId) return;
    
    try {
      setDeleting(true);
      const res = await postApi.delete(deleteConfirm.postId) as { success: boolean };
      if (res.success) {
        // 从列表中移除
        setPosts(prev => prev.filter(p => p._id !== deleteConfirm.postId));
        // 更新用户统计
        if (user?.stats) {
          setUser({
            ...user,
            stats: {
              ...user.stats,
              postCount: Math.max(0, user.stats.postCount - 1)
            }
          });
        }
        // 通知父组件更新全局列表
        onPostDeleted?.(deleteConfirm.postId);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
      setDeleteConfirm({ show: false, postId: null });
    }
  };

  if (loading && !user) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-[90vh] bg-ink-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">我</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSettings}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Settings size={20} className="text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="p-6 text-center border-b border-white/10">
          {/* 头像 */}
          <div className="relative inline-block">
            <img
              src={getImageUrl(user?.avatar)}
              alt={user?.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-gold-500/30"
            />
            <button
              onClick={handleEditProfile}
              className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Edit3 size={14} className="text-ink-900" />
            </button>
          </div>

          {/* 用户名 */}
          <h3 className="text-xl font-bold text-white mt-4">{user?.username}</h3>

          {/* 简介 */}
          {user?.bio && (
            <p className="text-white/60 text-sm mt-2 px-8">{user.bio}</p>
          )}

          {/* 统计数据 */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user?.stats?.followingCount || 0}</p>
              <p className="text-white/40 text-sm">关注</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user?.stats?.followerCount || 0}</p>
              <p className="text-white/40 text-sm">粉丝</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user?.stats?.likeCount || 0}</p>
              <p className="text-white/40 text-sm">获赞</p>
            </div>
          </div>

          {/* 编辑按钮 */}
          <button
            onClick={handleEditProfile}
            className="mt-6 px-8 py-2 bg-gold-500 text-ink-900 font-medium rounded-full hover:bg-gold-400 transition-colors"
          >
            编辑资料
          </button>
        </div>

        {/* 标签栏 */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('works')}
            className={clsx(
              "flex-1 py-3 flex items-center justify-center gap-2 transition-colors",
              activeTab === 'works' ? "text-gold-500 border-b-2 border-gold-500" : "text-white/60 hover:text-white"
            )}
          >
            <Grid3X3 size={18} />
            作品
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={clsx(
              "flex-1 py-3 flex items-center justify-center gap-2 transition-colors",
              activeTab === 'favorites' ? "text-gold-500 border-b-2 border-gold-500" : "text-white/60 hover:text-white"
            )}
          >
            <Bookmark size={18} />
            收藏
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={clsx(
              "flex-1 py-3 flex items-center justify-center gap-2 transition-colors",
              activeTab === 'likes' ? "text-gold-500 border-b-2 border-gold-500" : "text-white/60 hover:text-white"
            )}
          >
            <Heart size={18} />
            喜欢
          </button>
        </div>

        {/* 内容网格 */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => {
                    onClose();
                    onPostClick?.(post._id);
                  }}
                  className="aspect-[3/4] relative group cursor-pointer overflow-hidden rounded-lg"
                >
                  <img
                    src={getImageUrl(post.coverUrl || post.mediaUrls?.[0])}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* 视频标识 */}
                  {post.mediaType === 'video' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}

                  {/* 统计信息 */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 text-white">
                      <Heart size={16} className="fill-white" />
                      <span className="text-sm font-medium">{formatNumber(post.stats?.likeCount || 0)}</span>
                    </div>
                  </div>

                  {/* 删除按钮 - 仅作品标签页显示 */}
                  {activeTab === 'works' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ show: true, postId: post._id });
                      }}
                      className="absolute top-2 left-2 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              {activeTab === 'works' && (
                <>
                  <Grid3X3 size={48} className="mb-4" />
                  <p>还没有发布作品</p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/create');
                    }}
                    className="mt-4 px-6 py-2 bg-gold-500 text-ink-900 font-medium rounded-full hover:bg-gold-400 transition-colors"
                  >
                    去发布
                  </button>
                </>
              )}
              {activeTab === 'favorites' && (
                <>
                  <Bookmark size={48} className="mb-4" />
                  <p>还没有收藏内容</p>
                </>
              )}
              {activeTab === 'likes' && (
                <>
                  <Heart size={48} className="mb-4" />
                  <p>还没有点赞内容</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 删除确认对话框 */}
        {deleteConfirm.show && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="bg-ink-700 rounded-2xl p-6 mx-4 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
              <p className="text-white/60 mb-6">删除后将无法恢复，确定要删除这个作品吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, postId: null })}
                  className="flex-1 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                  disabled={deleting}
                >
                  取消
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex-1 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
